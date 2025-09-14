from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import json
import re
import asyncio
import threading
import base64
import binascii
import tempfile
import time
import hashlib
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app, origins=["http://localhost:3000"])
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")


class StreamingDiagramService:
    def __init__(self):
        self.model = None
        self.conversation_history = []  # Store previous messages for context
        self.uploaded_files = {}  # Store Gemini file URIs by content hash
        
    def initialize(self, api_key):
        """Initialize the Gemini API"""
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            print("Gemini API service initialized")
            return True
        except Exception as e:
            print(f"Failed to initialize Gemini API: {e}")
            return False
    
    def add_to_history(self, user_message, ai_response):
        """Add a message exchange to conversation history"""
        self.conversation_history.append({
            'user': user_message,
            'ai': ai_response,
            'timestamp': time.time()
        })
        # Keep only last 10 exchanges to prevent context from getting too long
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def clear_uploaded_files(self):
        """Clear uploaded files cache"""
        self.uploaded_files = {}
        print("Uploaded files cache cleared")
    
    def get_media_hash(self, data):
        """Generate hash for media data to use as cache key"""
        return hashlib.md5(data.encode() if isinstance(data, str) else data).hexdigest()
    
    def get_or_upload_to_gemini(self, media_data, media_type, mime_type):
        """Get cached Gemini file URI or upload new media to Gemini and store the URI"""
        if not media_data:
            return None
            
        # Generate hash for content-based caching
        media_hash = self.get_media_hash(media_data)
        
        # Check if we already have this file uploaded to Gemini
        if media_hash in self.uploaded_files:
            gemini_uri = self.uploaded_files[media_hash]
            print(f"Using existing Gemini {media_type} URI: {gemini_uri}")
            # Return the Gemini file object using the stored URI
            try:
                return genai.get_file(gemini_uri)
            except Exception as e:
                print(f"Error retrieving cached file {gemini_uri}: {e}")
                # If retrieval fails, remove from cache and re-upload
                del self.uploaded_files[media_hash]
        
        # Upload new media to Gemini
        try:
            if media_type == 'audio':
                # Decode base64 audio data
                audio_data_clean = media_data
                missing_padding = len(audio_data_clean) % 4
                if missing_padding:
                    audio_data_clean += '=' * (4 - missing_padding)
                
                audio_bytes = base64.b64decode(audio_data_clean)
                
                # Create temporary file for audio
                with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_audio:
                    temp_audio.write(audio_bytes)
                    temp_audio_path = temp_audio.name
                
                # Upload audio file to Gemini
                audio_file = genai.upload_file(temp_audio_path, mime_type=mime_type)
                
                # Clean up temp file
                os.unlink(temp_audio_path)
                
                # Store the Gemini URI for future use
                self.uploaded_files[media_hash] = audio_file.uri
                
                print(f"Uploaded new {media_type} to Gemini with URI: {audio_file.uri}")
                return audio_file
                
            elif media_type == 'image':
                # For images, create temporary file and upload to Gemini
                image_bytes = base64.b64decode(media_data)
                
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_image:
                    temp_image.write(image_bytes)
                    temp_image_path = temp_image.name
                
                # Upload image file to Gemini
                image_file = genai.upload_file(temp_image_path, mime_type=mime_type)
                
                # Clean up temp file
                os.unlink(temp_image_path)
                
                # Store the Gemini URI for future use
                self.uploaded_files[media_hash] = image_file.uri
                
                print(f"Uploaded new {media_type} to Gemini with URI: {image_file.uri}")
                return image_file
                
        except Exception as e:
            print(f"Error uploading {media_type} to Gemini: {e}")
            return None
    
    def get_context_string(self):
        """Get formatted conversation history for context"""
        if not self.conversation_history:
            return ""
        
        context_parts = []
        for exchange in self.conversation_history[-5:]:  # Use last 5 exchanges
            context_parts.append(f"User: {exchange['user']}")
            context_parts.append(f"AI: {exchange['ai']}")
        
        return "Previous conversation context:\n" + "\n".join(context_parts) + "\n\n"
    
    def stream_diagram_edits(self, prompt, existing_diagram, image_data=None, audio_data=None):
        """Stream diagram edits from Gemini AI"""
        if not self.model:
            socketio.emit('error', {'message': 'Gemini API not initialized'})
            return
        
        try:
            # Send initial status
            if audio_data:
                socketio.emit('command', {
                    'type': 'status',
                    'data': {'message': 'Processing voice command...'}
                })
            else:
                socketio.emit('command', {
                    'type': 'status',
                    'data': {'message': 'Analyzing your diagram...'}
                })
            
            # Handle audio input using cached URIs
            audio_file = None
            if audio_data:
                try:
                    print("Audio data received, checking cache...")
                    
                    socketio.emit('command', {
                        'type': 'status',
                        'data': {'message': 'Processing voice command...'}
                    })
                    
                    # Use cached audio or upload new one to Gemini
                    audio_file = self.get_or_upload_to_gemini(audio_data, 'audio', 'audio/webm')
                    
                    if not audio_file:
                        raise Exception("Failed to process audio data")
                    
                    # Set prompt to None for audio-only requests
                    prompt = None
                    
                except Exception as audio_error:
                    print(f"Audio processing error: {audio_error}")
                    socketio.emit('error', {'message': f'Audio processing failed: {str(audio_error)}'})
                    return
            
            # Get conversation context
            context = self.get_context_string()
            
            # Handle image data using Gemini URIs
            image_file_obj = None
            if image_data:
                image_file_obj = self.get_or_upload_to_gemini(image_data, 'image', 'image/png')
            
            # Prepare content for the API
            if audio_data and audio_file:
                # For audio requests - send audio directly to Gemini
                content = [
                    f"""{context}Listen to this audio command and respond with a series of commands to modify a ReactFlow diagram.
You must respond ONLY with a series of JSON commands, one per line, no other text.

Current diagram: {json.dumps(existing_diagram)}

Available commands:
1. {{"type": "status", "data": {{"message": "Description of current step"}}}}
2. {{"type": "add_node", "data": {{"id": "unique_id", "nodeType": "process|input|output|decision|database|cloud|group|default", "position": {{"x": 100, "y": 200}}, "label": "Node Label"}}}}
3. {{"type": "update_node", "data": {{"id": "existing_id", "changes": {{"position": {{"x": 100, "y": 200}}, "label": "New Label", "nodeType": "new_type"}}}}}}
4. {{"type": "delete_node", "data": {{"id": "node_to_delete"}}}}
5. {{"type": "add_edge", "data": {{"id": "edge_id", "source": "source_node_id", "target": "target_node_id", "edgeType": "default|straight|step|smoothstep|bezier|simplebezier"}}}}
6. {{"type": "update_edge", "data": {{"id": "existing_edge_id", "changes": {{"edgeType": "new_type"}}}}}}
7. {{"type": "delete_edge", "data": {{"id": "edge_to_delete"}}}}
8. {{"type": "complete", "data": {{"message": "Edit completed successfully"}}}}

Guidelines:
- Start with a status message describing what you'll do
- Make changes step by step with status updates
- Use appropriate node types (input=start, output=end, process=action, decision=condition, etc.)
- Position new nodes logically (spread them out, avoid overlaps)
- Always end with a "complete" command
- Only modify what's requested, preserve other elements

Respond with commands only, one JSON object per line:""",
                    audio_file
                ]
            elif image_data and image_file_obj:
                # For vision requests with image
                content = [
                    f"""{context}{prompt}

You are a diagram editing AI that responds with a series of commands to modify a ReactFlow diagram.
You must respond ONLY with a series of JSON commands, one per line, no other text.

Current diagram: {json.dumps(existing_diagram)}

Available commands:
1. {{"type": "status", "data": {{"message": "Description of current step"}}}}
2. {{"type": "add_node", "data": {{"id": "unique_id", "nodeType": "process|input|output|decision|database|cloud|group|default", "position": {{"x": 100, "y": 200}}, "label": "Node Label"}}}}
3. {{"type": "update_node", "data": {{"id": "existing_id", "changes": {{"position": {{"x": 100, "y": 200}}, "label": "New Label", "nodeType": "new_type"}}}}}}
4. {{"type": "delete_node", "data": {{"id": "node_to_delete"}}}}
5. {{"type": "add_edge", "data": {{"id": "edge_id", "source": "source_node_id", "target": "target_node_id", "edgeType": "default|straight|step|smoothstep|bezier|simplebezier"}}}}
6. {{"type": "update_edge", "data": {{"id": "existing_edge_id", "changes": {{"edgeType": "new_type"}}}}}}
7. {{"type": "delete_edge", "data": {{"id": "edge_to_delete"}}}}
8. {{"type": "complete", "data": {{"message": "Edit completed successfully"}}}}

Guidelines:
- Start with a status message describing what you'll do
- Make changes step by step with status updates
- Use appropriate node types (input=start, output=end, process=action, decision=condition, etc.)
- Position new nodes logically (spread them out, avoid overlaps)
- Always end with a "complete" command
- Only modify what's requested, preserve other elements

Respond with commands only, one JSON object per line:""",
                    image_file_obj
                ]
            else:
                # For text-only requests
                content = f"""{context}
You are a diagram editing AI that responds with a series of commands to modify a ReactFlow diagram.
You must respond ONLY with a series of JSON commands, one per line, no other text.

Current diagram: {json.dumps(existing_diagram)}

Available commands:
1. {{"type": "status", "data": {{"message": "Description of current step"}}}}
2. {{"type": "add_node", "data": {{"id": "unique_id", "nodeType": "process|input|output|decision|database|cloud|group|default", "position": {{"x": 100, "y": 200}}, "label": "Node Label"}}}}
3. {{"type": "update_node", "data": {{"id": "existing_id", "changes": {{"position": {{"x": 100, "y": 200}}, "label": "New Label", "nodeType": "new_type"}}}}}}
4. {{"type": "delete_node", "data": {{"id": "node_to_delete"}}}}
5. {{"type": "add_edge", "data": {{"id": "edge_id", "source": "source_node_id", "target": "target_node_id", "edgeType": "default|straight|step|smoothstep|bezier|simplebezier"}}}}
6. {{"type": "update_edge", "data": {{"id": "existing_edge_id", "changes": {{"edgeType": "new_type"}}}}}}
7. {{"type": "delete_edge", "data": {{"id": "edge_to_delete"}}}}
8. {{"type": "complete", "data": {{"message": "Edit completed successfully"}}}}

Guidelines:
- Start with a status message describing what you'll do
- Make changes step by step with status updates
- Use appropriate node types (input=start, output=end, process=action, decision=condition, etc.)
- Position new nodes logically (spread them out, avoid overlaps)
- Always end with a "complete" command
- Only modify what's requested, preserve other elements

User request: {prompt}

Respond with commands only, one JSON object per line:"""
            
            # Generate streaming response
            response = self.model.generate_content(
                content,
                stream=True,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=2048,
                )
            )
            
            buffer = ""
            full_response = ""  # Capture full AI response for history
            
            for chunk in response:
                if chunk.text:
                    buffer += chunk.text
                    full_response += chunk.text
                    
                    # Process complete lines as they arrive
                    lines = buffer.split('\n')
                    
                    # Keep the last incomplete line in buffer
                    buffer = lines.pop() if lines else ""
                    
                    # Process complete lines immediately
                    for line in lines:
                        self.process_streaming_line(line.strip())
            
            # Process any remaining content in buffer
            if buffer.strip():
                self.process_streaming_line(buffer.strip())
            
            # Send completion
            socketio.emit('command', {
                'type': 'complete',
                'data': {'message': 'All changes applied successfully!'}
            })
            
            # Store conversation in history
            user_input = prompt if prompt else "[Audio command]"
            self.add_to_history(user_input, full_response.strip())
            
        except Exception as e:
            print(f"Error streaming diagram edits: {e}")
            socketio.emit('error', {'message': str(e)})
    
    def process_streaming_line(self, line):
        """Process a single line from the AI stream"""
        # Skip empty lines or comments
        if not line or line.startswith('//') or line.startswith('#'):
            return
        
        # Remove markdown code blocks if present
        clean_line = re.sub(r'^```json\s*', '', line)
        clean_line = re.sub(r'^```\s*', '', clean_line)
        clean_line = re.sub(r'```$', '', clean_line)
        clean_line = clean_line.strip()
        
        # Skip if line is still empty after cleaning
        if not clean_line:
            return
        
        try:
            # Additional validation - must start with { and end with }
            if not clean_line.startswith('{') or not clean_line.endswith('}'):
                print(f"Skipping invalid JSON format: {clean_line}")
                return
            
            command = json.loads(clean_line)
            
            # Validate command structure
            if 'type' not in command:
                print(f"Skipping command without type: {clean_line}")
                return
            
            print(f"Streaming live command: {command['type']}")
            socketio.emit('command', command)
            
        except json.JSONDecodeError as e:
            print(f"Error parsing streaming line: {clean_line} - {e}")


# Initialize the service
diagram_service = StreamingDiagramService()

# Initialize the service with API key from environment
gemini_api_key = os.getenv('GEMINI_API_KEY')
if gemini_api_key:
    success = diagram_service.initialize(gemini_api_key)
    if not success:
        print("Failed to initialize Gemini API service")
else:
    print("GEMINI_API_KEY environment variable not found")


@app.route('/')
def index():
    return {'message': 'Diagram Editor Backend API'}


@app.route('/health')
def health():
    return {'status': 'healthy', 'gemini_initialized': diagram_service.model is not None}


@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')


@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')


@socketio.on('stream_diagram_edit')
def handle_stream_diagram_edit(data):
    """Handle streaming diagram edit requests"""
    try:
        prompt = data.get('prompt', '')
        existing_diagram = data.get('existingDiagram', {})
        image_data = data.get('imageData', None)
        audio_data = data.get('audioData', None)
        
        # Run the streaming in a separate thread to avoid blocking
        def stream_worker():
            diagram_service.stream_diagram_edits(prompt, existing_diagram, image_data, audio_data)
        
        thread = threading.Thread(target=stream_worker)
        thread.daemon = True
        thread.start()
        
    except Exception as e:
        print(f"Error handling stream_diagram_edit: {e}")
        emit('error', {'message': str(e)})


@socketio.on('clear_history')
def handle_clear_history():
    """Clear conversation history and uploaded files cache"""
    try:
        diagram_service.clear_history()
        diagram_service.clear_uploaded_files()
        emit('history_cleared', {'message': 'Conversation history and uploaded files cache cleared'})
        print("Conversation history and uploaded files cache cleared")
    except Exception as e:
        print(f"Error clearing history: {e}")
        emit('error', {'message': str(e)})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    print(f"Starting Flask server on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
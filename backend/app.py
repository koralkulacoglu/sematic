from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import json
import re
import asyncio
import threading
import base64
import tempfile
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
    
    def stream_diagram_edits(self, prompt, existing_diagram, image_data=None):
        """Stream diagram edits from Gemini AI"""
        if not self.model:
            socketio.emit('error', {'message': 'Gemini API not initialized'})
            return
        
        try:
            # Send initial status
            socketio.emit('command', {
                'type': 'status',
                'data': {'message': 'Analyzing your diagram...'}
            })
            
            # Prepare content for the API
            if image_data:
                # For vision requests with image
                content = [
                    f"""{prompt}

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
                    {
                        "mime_type": "image/png",
                        "data": image_data
                    }
                ]
            else:
                # For text-only requests
                content = f"""
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
            for chunk in response:
                if chunk.text:
                    buffer += chunk.text
                    
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
        
        # Run the streaming in a separate thread to avoid blocking
        def stream_worker():
            diagram_service.stream_diagram_edits(prompt, existing_diagram, image_data)
        
        thread = threading.Thread(target=stream_worker)
        thread.daemon = True
        thread.start()
        
    except Exception as e:
        print(f"Error handling stream_diagram_edit: {e}")
        emit('error', {'message': str(e)})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    print(f"Starting Flask server on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
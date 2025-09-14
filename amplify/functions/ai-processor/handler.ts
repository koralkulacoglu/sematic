import type { APIGatewayProxyHandler } from 'aws-lambda';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('AI Processor Lambda received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      prompt, 
      audioData, 
      imageData, 
      existingDiagram, 
      whiteboardId, 
      userId,
      userEmail 
    } = body;

    // Validate required fields
    if (!whiteboardId || !userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Missing required fields: whiteboardId, userId'
        }),
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    let actualPrompt = prompt;
    
    // Handle audio input (voice commands) with proper transcription
    if (audioData && !prompt) {
      console.log('🎤 Processing voice command with real transcription...');
      
      try {
        // Create a temporary file for the audio data
        const audioBuffer = Buffer.from(audioData, 'base64');
        const tempFilePath = path.join(os.tmpdir(), `voice_${Date.now()}.webm`);
        fs.writeFileSync(tempFilePath, audioBuffer);
        
        console.log('📁 Saved audio to temp file');
        
        // Upload the file to Gemini
        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
        
        console.log('⬆️  Uploading audio file to Gemini...');
        const uploadResult = await fileManager.uploadFile(tempFilePath, {
          mimeType: 'audio/webm',
          displayName: 'voice_command',
        });
        
        console.log('✅ Upload complete');
        
        // Wait for the file to be processed
        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === 'PROCESSING') {
          console.log('⏳ Processing audio file...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          file = await fileManager.getFile(uploadResult.file.name);
        }
        
        if (file.state === 'FAILED') {
          throw new Error('Audio file processing failed');
        }
        
        console.log('🎯 Audio file ready, transcribing...');
        
        // Transcribe the audio
        const transcriptionResult = await model.generateContent([
          'Listen to this audio and transcribe exactly what the user said. Return only the transcribed text with no additional commentary or formatting.',
          {
            fileData: {
              mimeType: file.mimeType,
              fileUri: file.uri,
            },
          },
        ]);
        
        actualPrompt = transcriptionResult.response.text().trim();
        console.log('📝 Transcribed text:', actualPrompt);
        
        // Clean up
        await fileManager.deleteFile(uploadResult.file.name);
        fs.unlinkSync(tempFilePath);
        console.log('🧹 Cleaned up temporary files');
        
      } catch (transcriptionError) {
        console.error('❌ Voice transcription failed:', transcriptionError);
        console.log('🔄 Falling back to intelligent processing...');
        actualPrompt = "create a simple workflow diagram";
      }
    }
    
    // Now process the prompt (either text or transcribed from audio)
    if (!actualPrompt) {
      actualPrompt = "Create a simple workflow diagram";
    }

    const systemPrompt = `You are a diagram editing AI that responds with a series of commands to modify a ReactFlow diagram.
You must respond ONLY with a series of JSON commands, one per line, no other text.

Current diagram: ${JSON.stringify(existingDiagram)}

Available commands:
1. {"type": "status", "data": {"message": "Description of current step"}}
2. {"type": "add_node", "data": {"id": "unique_id", "nodeType": "process|input|output|decision|database|cloud|group|default", "position": {"x": 100, "y": 200}, "label": "Node Label"}}
3. {"type": "update_node", "data": {"id": "existing_id", "changes": {"position": {"x": 100, "y": 200}, "label": "New Label", "nodeType": "new_type"}}}
4. {"type": "delete_node", "data": {"id": "node_to_delete"}}
5. {"type": "add_edge", "data": {"id": "edge_id", "source": "source_node_id", "target": "target_node_id", "edgeType": "default|straight|step|smoothstep|bezier|simplebezier"}}
6. {"type": "update_edge", "data": {"id": "existing_edge_id", "changes": {"edgeType": "new_type"}}}
7. {"type": "delete_edge", "data": {"id": "edge_to_delete"}}
8. {"type": "complete", "data": {"message": "Edit completed successfully"}}

Guidelines:
- Start with a status message describing what you'll do
- Make changes step by step with status updates
- Use appropriate node types (input=start, output=end, process=action, decision=condition, etc.)
- Position new nodes logically (spread them out, avoid overlaps)
- Always end with a "complete" command
- Only modify what's requested, preserve other elements

IMPORTANT: If the user says "delete all nodes" or "clear everything", delete ALL nodes and edges from the diagram.

User request: ${actualPrompt}

Respond with commands only, one JSON object per line:`;

    // Generate response from AI
    console.log('📡 Sending request to Gemini AI...');
    const result = await model.generateContent(systemPrompt);
    
    const response = result.response;
    const text = response.text();

    console.log('✅ AI Response received');
    
    // Parse the response into commands
    const commands = parseAIResponse(text);
    console.log('🎯 Parsed', commands.length, 'valid commands');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
      },
      body: JSON.stringify({
        commands,
        rawResponse: text,
        whiteboardId,
        userId,
        userEmail,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Error in AI processor:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};


function parseAIResponse(response: string): any[] {
  try {
    const commands: any[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const cleanLine = line.trim();
      
      // Skip empty lines, comments, or markdown
      if (!cleanLine || cleanLine.startsWith('//') || cleanLine.startsWith('#')) {
        continue;
      }
      
      // Remove markdown code blocks if present
      let processedLine = cleanLine.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
      
      // Skip if line is still empty after cleaning
      if (!processedLine) {
        continue;
      }
      
      // Additional validation - must start with { and end with }
      if (!processedLine.startsWith('{') || !processedLine.endsWith('}')) {
        console.log(`Skipping invalid JSON format: ${processedLine}`);
        continue;
      }
      
      try {
        const command = JSON.parse(processedLine);
        
        // Validate command structure
        if ('type' in command) {
          commands.push(command);
        } else {
          console.log(`Skipping command without type: ${processedLine}`);
        }
      } catch (parseError) {
        console.log(`Error parsing line: ${processedLine} - ${parseError}`);
      }
    }
    
    // If no valid commands found, return fallback
    if (commands.length === 0) {
      return [{
        type: 'status',
        data: { message: 'Processing your request...' }
      }];
    }
    
    return commands;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Raw response:', response);
    
    // Return a fallback command if parsing fails
    return [{
      type: 'status',
      data: { message: 'Error processing AI response' }
    }];
  }
}
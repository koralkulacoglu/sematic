import { getCurrentUser } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';
import { isLocal } from '../amplify-config';
import whiteboardService from './whiteboardService';

// Mock data for development when Amplify isn't configured
const MOCK_USER = {
  userId: 'dev-user-123',
  signInDetails: { loginId: 'dev@example.com' }
};

class AIService {
  constructor() {
    this.useLocalStorage = isLocal;
    console.log('AIService - Using local storage:', this.useLocalStorage);
    console.log('AIService - Will use Amplify Lambda function for AI processing');
  }

  // Helper method to get current user (mock or real)
  async getCurrentUserSafe() {
    if (this.useLocalStorage) {
      return MOCK_USER;
    }
    try {
      return await getCurrentUser();
    } catch (error) {
      console.log('Using mock user for AI service');
      return MOCK_USER;
    }
  }


  async processAIRequest(
    whiteboardId,
    prompt,
    audioData,
    imageData,
    existingDiagram,
    callbacks
  ) {
    try {
      // Check if user can use AI for this whiteboard
      const canUseAI = await whiteboardService.canUserUseAI(whiteboardId);
      if (!canUseAI) {
        const error = new Error('Only the whiteboard owner can use AI features');
        callbacks?.onError?.(error);
        return;
      }

      // Get current user for Lambda function
      const user = await this.getCurrentUserSafe();
      const userEmail = user.signInDetails?.loginId || '';

      console.log('AIService - About to call Amplify Lambda function');
      console.log('AIService - Request data:', { prompt, hasAudio: !!audioData, hasImage: !!imageData });
      
      if (this.useLocalStorage) {
        // In local development mode, use simulation
        console.log('AIService - Using simulation mode for local development');
        return this.simulateAIProcessing(prompt, existingDiagram, callbacks);
      }

      try {
        // Call the Amplify-generated API endpoint
        console.log('AIService - Calling ai-processor via Amplify API...');
        const apiResponse = await post({
          apiName: 'default',
          path: '/ai-processor',
          options: {
            body: {
              prompt,
              audioData,
              imageData,
              existingDiagram,
              whiteboardId,
              userId: user.userId,
              userEmail
            }
          }
        });

        const result = await apiResponse.response.json();
        console.log('AIService - Lambda response:', result);
        
        if (result.commands && Array.isArray(result.commands)) {
          console.log('AIService - Processing', result.commands.length, 'commands');
          for (const command of result.commands) {
            console.log('AIService - Executing command:', command);
            callbacks?.onCommand?.(command);
            // Add small delay to simulate streaming effect
            await new Promise(resolve => setTimeout(resolve, 150));
          }
        } else {
          console.error('AIService - Invalid response format:', result);
        }

        callbacks?.onComplete?.();
      } catch (lambdaError) {
        console.error('AIService - Lambda function failed:', lambdaError);
        console.log('AIService - Falling back to simulation mode...');
        return this.simulateAIProcessing(prompt, existingDiagram, callbacks);
      }
    } catch (error) {
      console.error('Error processing AI request:', error);
      callbacks?.onError?.(error);
    }
  }

  async simulateAIProcessing(
    prompt,
    existingDiagram,
    callbacks
  ) {
    try {
      // Simple simulation of AI processing
      console.log('Simulating AI processing for prompt:', prompt);
      
      const commands = this.generateSimulatedCommands(prompt, existingDiagram);
      
      for (const command of commands) {
        callbacks?.onCommand?.(command);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      callbacks?.onComplete?.();
    } catch (error) {
      callbacks?.onError?.(error);
    }
  }

  generateSimulatedCommands(prompt, existingDiagram) {
    const lowerPrompt = (prompt || '').toLowerCase();
    const commands = [];
    
    // Start with status message
    const isVoiceCommand = !prompt && arguments.length > 0; // Voice command if prompt is null/empty
    commands.push({
      type: 'status',
      data: { message: isVoiceCommand ? 'Processing voice command...' : 'Creating diagram based on your request...' }
    });
    
    // Simple pattern matching for common requests
    if (lowerPrompt.includes('clear') || lowerPrompt.includes('delete all')) {
      // Clear all nodes and edges
      if (existingDiagram?.nodes) {
        existingDiagram.nodes.forEach(node => {
          commands.push({
            type: 'delete_node',
            data: { id: node.id }
          });
        });
      }
      if (existingDiagram?.edges) {
        existingDiagram.edges.forEach(edge => {
          commands.push({
            type: 'delete_edge',
            data: { id: edge.id }
          });
        });
      }
    } else if (lowerPrompt.includes('workflow') || lowerPrompt.includes('process') || lowerPrompt.includes('registration')) {
      // Create a simple workflow
      const startId = 'start-' + Date.now();
      const processId = 'process-' + Date.now();
      const endId = 'end-' + Date.now();
      
      commands.push({
        type: 'add_node',
        data: {
          id: startId,
          nodeType: 'input',
          label: 'Start Registration',
          position: { x: 100, y: 100 }
        }
      });
      
      commands.push({
        type: 'add_node',
        data: {
          id: processId,
          nodeType: 'process',
          label: 'Validate User Data',
          position: { x: 100, y: 200 }
        }
      });
      
      commands.push({
        type: 'add_node',
        data: {
          id: endId,
          nodeType: 'output',
          label: 'Registration Complete',
          position: { x: 100, y: 300 }
        }
      });
      
      // Add edges
      commands.push({
        type: 'add_edge',
        data: {
          id: 'edge-1-' + Date.now(),
          source: startId,
          target: processId,
          edgeType: 'default'
        }
      });
      
      commands.push({
        type: 'add_edge',
        data: {
          id: 'edge-2-' + Date.now(),
          source: processId,
          target: endId,
          edgeType: 'default'
        }
      });
    } else if (lowerPrompt.includes('add') && lowerPrompt.includes('node')) {
      // Add a simple node
      commands.push({
        type: 'add_node',
        data: {
          id: 'node-' + Date.now(),
          nodeType: 'default',
          label: 'New Node',
          position: { x: 200, y: 150 }
        }
      });
    } else if (!prompt || prompt.trim() === '') {
      // Voice command with no text - create a sample workflow
      const startId = 'voice-start-' + Date.now();
      const processId = 'voice-process-' + Date.now();
      const endId = 'voice-end-' + Date.now();
      
      commands.push({
        type: 'add_node',
        data: {
          id: startId,
          nodeType: 'input',
          label: 'Voice Command Start',
          position: { x: 100, y: 100 }
        }
      });
      
      commands.push({
        type: 'add_node',
        data: {
          id: processId,
          nodeType: 'process',
          label: 'Process Voice Input',
          position: { x: 100, y: 200 }
        }
      });
      
      commands.push({
        type: 'add_node',
        data: {
          id: endId,
          nodeType: 'output',
          label: 'Voice Command Complete',
          position: { x: 100, y: 300 }
        }
      });
      
      // Add edges
      commands.push({
        type: 'add_edge',
        data: {
          id: 'voice-edge-1-' + Date.now(),
          source: startId,
          target: processId,
          edgeType: 'default'
        }
      });
      
      commands.push({
        type: 'add_edge',
        data: {
          id: 'voice-edge-2-' + Date.now(),
          source: processId,
          target: endId,
          edgeType: 'default'
        }
      });
    } else {
      // Default: add a node based on the prompt
      commands.push({
        type: 'add_node',
        data: {
          id: 'node-' + Date.now(),
          nodeType: 'default',
          label: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''),
          position: { x: 150, y: 150 }
        }
      });
    }
    
    // End with complete message
    commands.push({
      type: 'complete',
      data: { message: isVoiceCommand ? 'Voice command processed successfully!' : 'Diagram created successfully!' }
    });
    
    return commands;
  }

  // Method to send whiteboard events for real-time collaboration
  async sendWhiteboardEvent(whiteboardId, eventType, eventData) {
    try {
      await whiteboardService.sendWhiteboardEvent(whiteboardId, eventType, eventData);
    } catch (error) {
      console.error('Error sending whiteboard event:', error);
    }
  }
}

export const aiService = new AIService();
export default aiService;
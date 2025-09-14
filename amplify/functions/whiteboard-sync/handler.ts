import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Whiteboard Sync Lambda received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      whiteboardId, 
      userId,
      userEmail,
      eventType,
      eventData,
      timestamp 
    } = body;

    // Validate required fields
    if (!whiteboardId || !userId || !eventType) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Missing required fields: whiteboardId, userId, eventType'
        }),
      };
    }

    // Process different event types
    let response;
    switch (eventType) {
      case 'user_join':
        response = await handleUserJoin(whiteboardId, userId, userEmail);
        break;
      case 'user_leave':
        response = await handleUserLeave(whiteboardId, userId);
        break;
      case 'cursor_move':
        response = await handleCursorMove(whiteboardId, userId, eventData);
        break;
      case 'node_add':
      case 'node_update':
      case 'node_delete':
      case 'edge_add':
      case 'edge_update':
      case 'edge_delete':
        response = await handleDiagramChange(whiteboardId, userId, eventType, eventData);
        break;
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
      },
      body: JSON.stringify({
        success: true,
        whiteboardId,
        userId,
        eventType,
        timestamp: timestamp || new Date().toISOString(),
        response,
      }),
    };
  } catch (error) {
    console.error('Error in whiteboard sync:', error);
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

async function handleUserJoin(whiteboardId: string, userId: string, userEmail?: string) {
  console.log(`User ${userId} (${userEmail}) joined whiteboard ${whiteboardId}`);
  
  // In a real implementation, you would:
  // 1. Update active users list in DynamoDB
  // 2. Broadcast to other connected users
  // 3. Send current whiteboard state to joining user
  
  return {
    type: 'user_joined',
    userId,
    userEmail,
    message: `User ${userEmail || userId} joined the whiteboard`
  };
}

async function handleUserLeave(whiteboardId: string, userId: string) {
  console.log(`User ${userId} left whiteboard ${whiteboardId}`);
  
  // In a real implementation, you would:
  // 1. Remove user from active users list
  // 2. Broadcast to other connected users
  // 3. Clean up any user-specific data
  
  return {
    type: 'user_left',
    userId,
    message: `User left the whiteboard`
  };
}

async function handleCursorMove(whiteboardId: string, userId: string, eventData: any) {
  // Handle real-time cursor position updates
  // This would typically be broadcast to other users via WebSocket/AppSync subscriptions
  
  return {
    type: 'cursor_updated',
    userId,
    position: eventData.position,
    timestamp: new Date().toISOString()
  };
}

async function handleDiagramChange(
  whiteboardId: string, 
  userId: string, 
  eventType: string, 
  eventData: any
) {
  console.log(`Diagram change: ${eventType} by user ${userId} on whiteboard ${whiteboardId}`);
  
  // In a real implementation, you would:
  // 1. Validate the change
  // 2. Update the whiteboard data in DynamoDB
  // 3. Broadcast the change to other connected users
  // 4. Handle conflict resolution if needed
  
  return {
    type: 'diagram_updated',
    eventType,
    userId,
    eventData,
    timestamp: new Date().toISOString()
  };
}
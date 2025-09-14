import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // User profile model - extends Cognito user attributes
  UserProfile: a
    .model({
      userId: a.id().required(), // Cognito user ID
      email: a.email().required(),
      name: a.string().required(),
      profilePicture: a.url(),
      whiteboardIds: a.string().array(), // Array of whiteboard IDs the user owns
      editorWhiteboardIds: a.string().array(), // Array of whiteboard IDs the user can edit
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read'])
    ]),

  // Whiteboard model
  Whiteboard: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      data: a.json(), // The diagram data as JSON
      ownerId: a.id().required(), // User ID of the owner
      ownerEmail: a.email().required(),
      editors: a.string().array().default([]), // Array of user emails/IDs with edit access
      isPublic: a.boolean().default(false),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      lastModifiedBy: a.string(), // Email/ID of last user who modified
    })
    .authorization((allow) => [
      allow.owner('ownerId').to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read']).where((whiteboard) => whiteboard.isPublic.eq(true)),
      // Custom authorization for editors will be handled in resolvers
    ]),

  // Real-time collaboration events
  WhiteboardEvent: a
    .model({
      whiteboardId: a.id().required(),
      userId: a.id().required(),
      userEmail: a.email().required(),
      eventType: a.enum(['cursor_move', 'node_add', 'node_update', 'node_delete', 'edge_add', 'edge_update', 'edge_delete', 'user_join', 'user_leave']),
      eventData: a.json(), // The event data
      timestamp: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read'])
    ]),

  // AI generation requests (for tracking and permissions)
  AIRequest: a
    .model({
      whiteboardId: a.id().required(),
      requesterId: a.id().required(),
      requesterEmail: a.email().required(),
      prompt: a.string().required(),
      audioData: a.string(), // Base64 audio data if voice request
      imageData: a.string(), // Base64 image data for context
      status: a.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
      response: a.json(), // AI response data
      createdAt: a.datetime(),
      completedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner('requesterId').to(['create', 'read']),
      allow.authenticated().to(['read'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    identityPoolAuthorizationMode: 'identityPool',
  },
});

// Export the schema type for use in frontend components
// Usage in frontend:
// import { generateClient } from 'aws-amplify/data';
// import type { Schema } from '@/amplify/data/resource';
// const client = generateClient<Schema>();

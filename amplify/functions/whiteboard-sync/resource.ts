import { defineFunction } from '@aws-amplify/backend';

export const whiteboardSync = defineFunction({
  name: 'whiteboard-sync',
  entry: './handler.ts',
  runtime: 18,
  timeoutSeconds: 30,
});
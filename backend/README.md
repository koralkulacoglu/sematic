# Diagram Editor Backend

This backend server provides real-time streaming AI editing capabilities for the diagram editor.

## Setup

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

3. **Add your Gemini API key to `.env`:**

   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

The server will run on http://localhost:3001

## How it Works

1. **WebSocket Connection**: Frontend connects via Socket.IO
2. **Streaming Commands**: AI generates commands that are streamed in real-time
3. **Command Processing**: Frontend processes each command to update the diagram

## Command Types

- `status` - Progress updates
- `add_node` - Add new node
- `update_node` - Modify existing node
- `delete_node` - Remove node
- `add_edge` - Add connection
- `update_edge` - Modify edge
- `delete_edge` - Remove connection
- `complete` - Editing finished

## Architecture

```
Frontend (React) ←→ WebSocket ←→ Backend (Node.js) ←→ Gemini AI
```

The AI generates a series of JSON commands that are parsed and streamed to the frontend for real-time diagram updates.

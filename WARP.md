# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an AI-powered interactive diagram editor built for Hack the North 2025. The application enables users to create and edit flowcharts, process diagrams, and other visual representations through natural language commands powered by Google's Gemini AI.

### Architecture

The system follows a full-stack architecture with real-time streaming AI capabilities:


```
Frontend (React + ReactFlow) ←→ WebSocket (Flask-SocketIO) ←→ Backend (Flask + Python) ←→ Gemini AI API
```

**Key Components:**
- **Frontend**: React application using ReactFlow for interactive diagram rendering
- **Backend**: Flask server with Flask-SocketIO for real-time streaming of AI-generated commands
- **AI Integration**: Google Gemini 2.0 Flash Experimental model for processing diagram edit requests
- **Real-time Communication**: WebSocket-based streaming for live diagram updates

### Project Structure

- `frontend/` - React application with ReactFlow-based diagram editor
  - `src/components/` - Reusable UI components (DiagramCanvas, CustomNodes, PromptInput)
  - `src/services/` - Client-side services (streamingService, commandProcessor, geminiService)
- `backend/` - Flask server handling AI streaming and WebSocket connections
  - `app.py` - Main Flask server with SocketIO setup and Gemini integration
  - `run_dev.py` - Development server with hot reload capabilities

## Development Commands

### Backend Development

```bash
# Install Python dependencies
cd backend && pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start development server (with hot reload)
python run_dev.py

# Or start directly
python app.py

# For production (with gunicorn)
pip install gunicorn
gunicorn --worker-class eventlet -w 1 app:app --bind 0.0.0.0:3001
```

### Frontend Development

```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Full Development Setup

```bash
# Start both backend and frontend simultaneously (run in separate terminals)
# Terminal 1:
cd backend && python run_dev.py

# Terminal 2:
cd frontend && npm start
```

The backend runs on `http://localhost:3001` and frontend on `http://localhost:3000`.

## AI Command System

The application uses a structured command system for AI-driven diagram editing:

### Command Types
- `status` - Progress updates and user feedback
- `add_node` - Create new diagram nodes with specific types (input, output, process, decision, database, cloud, group)
- `update_node` - Modify existing nodes (position, label, type)
- `delete_node` - Remove nodes from diagram
- `add_edge` - Create connections between nodes with various edge styles
- `update_edge` - Modify existing connections
- `delete_edge` - Remove connections
- `complete` - Signal completion of AI editing session

### AI Processing Flow
1. User submits natural language prompt
2. Current diagram state is captured (nodes, edges, optional visual minimap)
3. Backend streams individual commands from Gemini AI in real-time
4. Frontend processes each command immediately, updating the diagram live
5. Commands are executed sequentially with visual feedback

## Key Technical Details

### Node Types and Visual Styling
- **Input nodes** (blue): Entry points, start of processes
- **Output nodes** (red): Exit points, end of processes  
- **Process nodes** (purple): Actions, operations, transformations
- **Decision nodes** (orange): Conditional logic, branching points
- **Database nodes** (green): Data storage, persistence layers
- **Cloud nodes** (light blue): External services, APIs
- **Default nodes** (gray): General purpose, miscellaneous

### WebSocket Communication
- Real-time streaming prevents blocking UI during AI generation
- Commands are processed as they arrive for immediate visual feedback
- Error handling and connection management built into streaming service

### Image Context for AI
- When existing diagrams are present, a minimap snapshot is captured and sent to Gemini
- Visual context helps AI understand current diagram layout and make appropriate modifications
- Color legend is provided to AI for node type recognition

## Environment Configuration

Required environment variables in `backend/.env`:
```
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

## Testing and Debugging

### Backend Testing
- Use tools like Postman or curl to test WebSocket connections
- Server logs show command processing and AI streaming status
- Monitor `console.log` output for connection status and errors

### Frontend Testing
- React Testing Library setup included for component testing
- Browser DevTools Network tab shows WebSocket messages
- React Flow provides built-in debugging for diagram state

### Common Issues
- Ensure Gemini API key is valid and has sufficient quota
- Check CORS configuration if frontend cannot connect to backend
- ResizeObserver errors are suppressed (common ReactFlow issue, non-blocking)

## Development Notes

### Working with ReactFlow
- Node positions are managed through React state and synchronized between parent/child components
- Custom node types are defined in `CustomNodes.js` with specific styling for each diagram element type
- Edge connections use ReactFlow's built-in connection system with custom styling

### AI Prompt Engineering
- The system includes detailed prompt engineering in the backend to ensure consistent JSON command output
- Prompts include current diagram state, available commands, and specific formatting requirements
- Vision API integration allows AI to understand visual diagram context

### State Management
- Frontend uses React hooks for local state management
- Real-time updates flow: AI command → Backend processing → WebSocket → Frontend state update → UI re-render
- Command processing is handled by `DiagramCommandProcessor` class for consistent state updates
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Gemini AI service
class StreamingDiagramService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initialize(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async streamDiagramEdits(prompt, existingDiagram, socket) {
    if (!this.model) {
      socket.emit("error", { message: "Gemini API not initialized" });
      return;
    }

    try {
      socket.emit("command", {
        type: "status",
        data: { message: "Analyzing your diagram..." },
      });

      const enhancedPrompt = `
You are a diagram editing AI that responds with a series of commands to modify a ReactFlow diagram.
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

User request: ${prompt}

Respond with commands only, one JSON object per line:`;

      const result = await this.model.generateContentStream(enhancedPrompt);

      let buffer = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        buffer += chunkText;

        // Process complete lines as they arrive
        const lines = buffer.split("\n");

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || "";

        // Process complete lines immediately
        for (const line of lines) {
          this.processStreamingLine(line.trim(), socket);
        }
      }

      // Process any remaining content in buffer
      if (buffer.trim()) {
        this.processStreamingLine(buffer.trim(), socket);
      }

      // Send completion
      socket.emit("command", {
        type: "complete",
        data: { message: "All changes applied successfully!" },
      });
    } catch (error) {
      console.error("Error streaming diagram edits:", error);
      socket.emit("error", { message: error.message });
    }
  }

  processStreamingLine(line, socket) {
    // Skip empty lines or comments
    if (!line || line.startsWith("//") || line.startsWith("#")) {
      return;
    }

    // Remove markdown code blocks if present
    const cleanLine = line
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/```$/, "")
      .trim();

    // Skip if line is still empty after cleaning
    if (!cleanLine) {
      return;
    }

    try {
      // Additional validation - must start with { and end with }
      if (!cleanLine.startsWith("{") || !cleanLine.endsWith("}")) {
        console.log("Skipping invalid JSON format:", cleanLine);
        return;
      }

      const command = JSON.parse(cleanLine);

      // Validate command structure
      if (!command.type) {
        console.log("Skipping command without type:", cleanLine);
        return;
      }

      console.log("Streaming live command:", command.type);
      socket.emit("command", command);
    } catch (parseError) {
      console.error(
        "Error parsing streaming line:",
        cleanLine,
        parseError.message
      );
    }
  }

  parseAndStreamCommands(text, socket) {
    const lines = text
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 && !line.startsWith("//") && !line.startsWith("#")
      );

    let commandIndex = 0;

    const sendNextCommand = () => {
      if (commandIndex >= lines.length) {
        socket.emit("command", {
          type: "complete",
          data: { message: "All changes applied successfully!" },
        });
        return;
      }

      const line = lines[commandIndex].trim();

      // Skip empty lines or comments
      if (!line || line.startsWith("//") || line.startsWith("#")) {
        commandIndex++;
        setTimeout(sendNextCommand, 100);
        return;
      }

      // Remove markdown code blocks if present
      const cleanLine = line
        .replace(/^```json\s*/, "")
        .replace(/^```\s*/, "")
        .replace(/```$/, "")
        .trim();

      // Skip if line is still empty after cleaning
      if (!cleanLine) {
        commandIndex++;
        setTimeout(sendNextCommand, 100);
        return;
      }

      try {
        // Additional validation - must start with { and end with }
        if (!cleanLine.startsWith("{") || !cleanLine.endsWith("}")) {
          console.log("Skipping invalid JSON format:", cleanLine);
          commandIndex++;
          setTimeout(sendNextCommand, 100);
          return;
        }

        const command = JSON.parse(cleanLine);

        // Validate command structure
        if (!command.type) {
          console.log("Skipping command without type:", cleanLine);
          commandIndex++;
          setTimeout(sendNextCommand, 100);
          return;
        }

        console.log("Sending command:", command.type);
        socket.emit("command", command);
        commandIndex++;

        // Stream with slight delay for better UX
        setTimeout(sendNextCommand, 300);
      } catch (parseError) {
        console.error("Error parsing command:", cleanLine, parseError.message);
        commandIndex++;
        setTimeout(sendNextCommand, 100); // Skip bad commands quickly
      }
    };

    sendNextCommand();
  }
}

const diagramService = new StreamingDiagramService();

// Initialize the service with API key from environment
if (process.env.GEMINI_API_KEY) {
  diagramService.initialize(process.env.GEMINI_API_KEY);
  console.log("Gemini API service initialized");
} else {
  console.error("GEMINI_API_KEY environment variable not found");
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("stream_diagram_edit", async (data) => {
    const { prompt, existingDiagram } = data;

    try {
      await diagramService.streamDiagramEdits(prompt, existingDiagram, socket);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

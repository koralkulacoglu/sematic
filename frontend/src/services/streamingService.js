import { io } from "socket.io-client";

class StreamingDiagramService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(serverUrl = "http://localhost:3001") {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(serverUrl);

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("🔌 Connected to streaming server");
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("🔌 Disconnected from streaming server");
    });

    // Log all incoming messages from Flask server
    this.socket.onAny((eventName, ...args) => {
      console.log(`📨 [FLASK SERVER] Event: ${eventName}`, args);
    });

    return this.socket;
  }

  streamDiagramEdit(prompt, apiKey, existingDiagram, audioData = null, callbacks = {}) {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    // Check if apiKey is actually image data (base64 string)
    let imageData = null;
    let actualApiKey = apiKey;
    
    if (typeof apiKey === 'string' && apiKey.length > 100 && !apiKey.startsWith('AIza')) {
      // This looks like base64 image data, not an API key
      imageData = apiKey;
      actualApiKey = null; // Will use server's API key
    }

    // Set up event listeners
    const handleCommand = (command) => {
      console.log("🤖 [GEMINI EDIT ACTION]", command);
      if (callbacks.onCommand) {
        callbacks.onCommand(command);
      }
    };

    const handleError = (error) => {
      console.error("❌ [FLASK SERVER ERROR]", error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    };

    const handleComplete = () => {
      console.log("✅ [GEMINI COMPLETE]");
      if (callbacks.onComplete) {
        callbacks.onComplete();
      }
      // Clean up listeners
      this.socket.off("command", handleCommand);
      this.socket.off("error", handleError);
    };

    // Listen for commands
    this.socket.on("command", (command) => {
      if (command.type === "complete") {
        handleComplete();
      } else {
        handleCommand(command);
      }
    });

    this.socket.on("error", handleError);

    // Send the edit request
    const requestData = {
      prompt,
      apiKey: actualApiKey,
      existingDiagram,
      imageData, // Add image data for vision requests
      audioData, // Add audio data for voice requests
    };
    
    console.log("📤 [SENDING TO FLASK SERVER]", {
      prompt: prompt || "[Audio Command]",
      hasImageData: !!imageData,
      hasAudioData: !!audioData,
      diagramNodes: existingDiagram?.nodes?.length || 0,
      diagramEdges: existingDiagram?.edges?.length || 0
    });
    
    this.socket.emit("stream_diagram_edit", requestData);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default new StreamingDiagramService();

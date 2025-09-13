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
      console.log("Connected to streaming server");
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("Disconnected from streaming server");
    });

    return this.socket;
  }

  streamDiagramEdit(prompt, apiKey, existingDiagram, callbacks = {}) {
    if (!this.socket || !this.isConnected) {
      console.error("Socket not connected");
      return;
    }

    // Set up event listeners
    const handleCommand = (command) => {
      if (callbacks.onCommand) {
        callbacks.onCommand(command);
      }
    };

    const handleError = (error) => {
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    };

    const handleComplete = () => {
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
    this.socket.emit("stream_diagram_edit", {
      prompt,
      apiKey,
      existingDiagram,
    });
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

import React, { useState, useEffect } from "react";
import PromptInput from "./components/PromptInput";
import DiagramCanvas from "./components/DiagramCanvas";
import streamingService from "./services/streamingService";
import { DiagramCommandProcessor } from "./services/commandProcessor";

function DiagramApp() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [streamingStatus, setStreamingStatus] = useState(null);
  const [commandProcessor, setCommandProcessor] = useState(null);
  const [mediaCache, setMediaCache] = useState(new Map()); // Cache for media URIs

  // Initialize streaming service and command processor
  useEffect(() => {
    streamingService.connect();

    const processor = new DiagramCommandProcessor(
      setNodes,
      setEdges,
      setStreamingStatus
    );
    setCommandProcessor(processor);

    return () => {
      streamingService.disconnect();
    };
  }, []);

  // Helper function to generate hash for media data
  const generateMediaHash = (data) => {
    // Simple hash function for client-side caching
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const handleGenerate = async (prompt, audioData = null) => {
    if (!commandProcessor) {
      setError("System not ready. Please try again.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setLastPrompt(audioData ? "[Voice Command]" : prompt);
    setStreamingStatus(audioData ? "Processing voice command..." : "Connecting to AI...");

    try {
      const existingDiagram = { nodes, edges };
      let imageData = null;

      // If there are nodes, try to capture the minimap
      if (nodes.length > 0 && window.captureDiagramMinimap) {
        try {
          setStreamingStatus("Capturing diagram...");
          const { blob, colorContext } = await window.captureDiagramMinimap();
          
          // Convert blob to base64
          const reader = new FileReader();
          imageData = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          // Check if we've seen this image before
          const imageHash = generateMediaHash(imageData);
          if (mediaCache.has(`image_${imageHash}`)) {
            console.log("Using cached image data");
            // Backend will handle caching, just send the same data
          } else {
            // Store in frontend cache for reference
            setMediaCache(prev => new Map(prev).set(`image_${imageHash}`, true));
          }

          // Add color context to the prompt
          prompt = `${colorContext}\n\nUser request: ${prompt}`;
        } catch (captureError) {
          console.log("Could not capture minimap, proceeding without image:", captureError);
        }
      }

      // Handle audio data caching
      if (audioData) {
        const audioHash = generateMediaHash(audioData);
        if (mediaCache.has(`audio_${audioHash}`)) {
          console.log("Using cached audio data");
          // Backend will handle caching, just send the same data
        } else {
          // Store in frontend cache for reference
          setMediaCache(prev => new Map(prev).set(`audio_${audioHash}`, true));
        }
      }

      setStreamingStatus("Analyzing with AI...");

      streamingService.streamDiagramEdit(prompt, imageData, existingDiagram, audioData, {
        onCommand: (command) => {
          commandProcessor.processCommand(command);
        },
        onError: (error) => {
          setError(
            error.message || "Failed to update diagram. Please try again."
          );
          setIsGenerating(false);
          setStreamingStatus(null);
        },
        onComplete: () => {
          setIsGenerating(false);
          setTimeout(() => {
            setStreamingStatus(null);
          }, 2000);
        },
      });
    } catch (err) {
      setError(err.message || "Failed to update diagram. Please try again.");
      setIsGenerating(false);
      setStreamingStatus(null);
    }
  };

  const handleNodesChange = (updatedNodes) => {
    setNodes(updatedNodes);
  };

  const handleEdgesChange = (updatedEdges) => {
    setEdges(updatedEdges);
  };

  const clearDiagram = () => {
    setNodes([]);
    setEdges([]);
    setLastPrompt("");
    setError("");
    // Clear media cache when clearing diagram
    setMediaCache(new Map());
  };

  const exportDiagram = () => {
    const diagramData = { nodes, edges };
    const dataStr = JSON.stringify(diagramData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diagram.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header with Tools */}
      <div
        style={{
          height: "60px",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          position: "relative",
          zIndex: 1000,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "20px", color: "#333" }}>
          Diagram Builder
        </h1>
        
        {/* Streaming Status */}
        {streamingStatus && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(227, 242, 253, 0.9)",
              color: "#1976d2",
              padding: "6px 12px",
              borderRadius: "4px",
              border: "1px solid #bbdefb",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                border: "2px solid #1976d2",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <span>{streamingStatus}</span>
          </div>
        )}

        {/* Top Right Tools */}
        <div style={{ display: "flex", gap: "8px" }}>
          {nodes.length > 0 && (
            <>
              <button
                onClick={exportDiagram}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Export JSON
              </button>
              <button
                onClick={clearDiagram}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* Left Sidebar - Chat */}
        <div
          style={{
            width: "350px",
            backgroundColor: "#ffffff",
            borderRight: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px",
              flex: 1,
              overflowY: "auto",
            }}
          >
            <PromptInput
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              hasExistingDiagram={nodes.length > 0}
            />

            {error && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  padding: "10px",
                  borderRadius: "4px",
                  marginTop: "10px",
                  border: "1px solid #f5c6cb",
                  fontSize: "12px",
                }}
              >
                <strong>Error:</strong> {error}
              </div>
            )}

            {lastPrompt && (
              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #c3e6cb",
                    fontSize: "12px",
                  }}
                >
                  <strong>Last edit:</strong> "{lastPrompt}"
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Full Screen Diagram */}
        <div style={{ flex: 1, position: "relative" }}>
          <DiagramCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
          />
        </div>
      </div>
    </div>
  );
}

export default DiagramApp;

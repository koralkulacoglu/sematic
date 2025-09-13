import React, { useState, useEffect } from "react";
import "./App.css";
import PromptInput from "./components/PromptInput";
import DiagramCanvas from "./components/DiagramCanvas";
import streamingService from "./services/streamingService";
import { DiagramCommandProcessor } from "./services/commandProcessor";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [streamingStatus, setStreamingStatus] = useState(null);
  const [commandProcessor, setCommandProcessor] = useState(null);

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

  const handleGenerate = async (prompt) => {
    if (!commandProcessor) {
      setError("System not ready. Please try again.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setLastPrompt(prompt);
    setStreamingStatus("Connecting to AI...");

    try {
      const existingDiagram = { nodes, edges };

      streamingService.streamDiagramEdit(prompt, null, existingDiagram, {
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
    <div className="App">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ marginBottom: "10px", textAlign: "center" }}>
            Diagram Builder
          </h1>
          <p
            style={{ color: "#666", textAlign: "center", marginBottom: "20px" }}
          >
            Create diagrams using the tools on the right. Add AI editing once
            you have some nodes.
          </p>
        </div>

        {/* Main Canvas - Always visible */}
        <div style={{ marginBottom: "20px" }}>
          {/* Streaming Status */}
          {streamingStatus && (
            <div
              style={{
                backgroundColor: "rgba(227, 242, 253, 0.9)",
                color: "#1976d2",
                padding: "8px 12px",
                borderRadius: "4px",
                marginBottom: "8px",
                border: "1px solid #bbdefb",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                position: "relative",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #1976d2",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <span>{streamingStatus}</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>Your Diagram</h3>
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
                    }}
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          <DiagramCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
          />
        </div>

        {/* AI Editing Panel - Only show when there are nodes */}
        {(nodes.length > 0 || edges.length > 0) && (
          <div style={{ marginBottom: "20px" }}>
            <PromptInput
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              hasExistingDiagram={true}
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
                  }}
                >
                  <strong>Last AI edit:</strong> "{lastPrompt}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginTop: "20px" }}>
          <h3>How to Use:</h3>
          <ul style={{ textAlign: "left", color: "#666" }}>
            <li>
              <strong>Add nodes:</strong> Use the "Add Node" dropdown in the
              diagram tools (top-right)
            </li>
            <li>
              <strong>Connect nodes:</strong> Drag from a node's handle to
              another node
            </li>
            <li>
              <strong>Change edge style:</strong> Select an edge type before
              connecting nodes
            </li>
            <li>
              <strong>Move nodes:</strong> Click and drag nodes to reposition
              them
            </li>
            <li>
              <strong>Delete:</strong> Select nodes/edges and click "Delete
              Selected"
            </li>
            <li>
              <strong>AI editing:</strong> Once you have nodes, use the AI
              editor below to modify your diagram
            </li>
            <li>
              <strong>Navigate:</strong> Use the minimap and zoom controls for
              large diagrams
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;

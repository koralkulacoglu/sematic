import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PromptInput from "./PromptInput";
import DiagramCanvas from "./DiagramCanvas";
import streamingService from "../services/streamingService";
import { DiagramCommandProcessor } from "../services/commandProcessor";

function WhiteboardEditor() {
  const { whiteboardId } = useParams();
  const navigate = useNavigate();
  const [whiteboard, setWhiteboard] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [streamingStatus, setStreamingStatus] = useState(null);
  const [commandProcessor, setCommandProcessor] = useState(null);

  // Load whiteboard data
  useEffect(() => {
    const savedWhiteboards = localStorage.getItem('whiteboards');
    if (savedWhiteboards) {
      const whiteboards = JSON.parse(savedWhiteboards);
      const currentWhiteboard = whiteboards.find(wb => wb.id === whiteboardId);
      
      if (currentWhiteboard) {
        setWhiteboard(currentWhiteboard);
        setNodes(currentWhiteboard.data.nodes || []);
        setEdges(currentWhiteboard.data.edges || []);
      } else {
        // Whiteboard not found, redirect to dashboard
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [whiteboardId, navigate]);

  // Save whiteboard data whenever nodes or edges change
  useEffect(() => {
    if (whiteboard && whiteboardId) {
      const savedWhiteboards = localStorage.getItem('whiteboards');
      if (savedWhiteboards) {
        const whiteboards = JSON.parse(savedWhiteboards);
        const updatedWhiteboards = whiteboards.map(wb => {
          if (wb.id === whiteboardId) {
            return {
              ...wb,
              data: { nodes, edges },
              nodeCount: nodes.length,
              updatedAt: new Date().toISOString()
            };
          }
          return wb;
        });
        localStorage.setItem('whiteboards', JSON.stringify(updatedWhiteboards));
      }
    }
  }, [nodes, edges, whiteboardId]);

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

          // Add color context to the prompt
          prompt = `${colorContext}\n\nUser request: ${prompt}`;
        } catch (captureError) {
          console.log("Could not capture minimap, proceeding without image:", captureError);
        }
      }

      setStreamingStatus("Analyzing with AI...");

      streamingService.streamDiagramEdit(prompt, imageData, existingDiagram, {
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
    link.download = `${whiteboard?.name || 'diagram'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!whiteboard) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f8f9fa"
      }}>
        <div>Loading whiteboard...</div>
      </div>
    );
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={handleBackToDashboard}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
              e.target.style.color = "#374151";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#6b7280";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <h1 style={{ margin: 0, fontSize: "20px", color: "#333" }}>
            {whiteboard.name}
          </h1>
        </div>
        
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

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default WhiteboardEditor;

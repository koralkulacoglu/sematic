import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Snackbar } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  const handleSave = () => {
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
        setSnackbarOpen(true);
      }
    }
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
      <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 1000 }}>
        <Toolbar>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToDashboard} sx={{ mr: 2 }}>
            Dashboard
          </Button>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {whiteboard.name}
          </Typography>

          {streamingStatus && (
            <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(227, 242, 253, 0.9)', p: '6px 12px', borderRadius: 1, border: '1px solid #bbdefb' }}>
              <div style={{ width: '12px', height: '12px', border: '2px solid #1976d2', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <Typography variant="caption" color="primary">{streamingStatus}</Typography>
            </Box>
          )}

          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
          {nodes.length > 0 && (
            <>
              <Button startIcon={<DownloadIcon />} onClick={exportDiagram} sx={{ ml: 2 }}>
                Export
              </Button>
              <Button startIcon={<DeleteIcon />} onClick={clearDiagram} color="warning" sx={{ ml: 1 }}>
                Clear
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Whiteboard saved successfully!"
      />
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

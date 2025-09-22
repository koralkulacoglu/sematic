import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import PromptInput from "./components/PromptInput";
import DiagramCanvas from "./components/DiagramCanvas";
import aiService from "./services/aiService";
import whiteboardService from "./services/whiteboardService";
import { DiagramCommandProcessor } from "./services/commandProcessor";

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function DiagramApp({ 
  whiteboardId, 
  initialData, 
  canEdit = true, 
  canUseAI = true, 
  onSave 
}) {
  const [nodes, setNodes] = useState(initialData?.nodes || []);
  const [edges, setEdges] = useState(initialData?.edges || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [streamingStatus, setStreamingStatus] = useState(null);
  const [commandProcessor, setCommandProcessor] = useState(null);
  const [mediaCache, setMediaCache] = useState(new Map());
  const [connectedUsers, setConnectedUsers] = useState([]);

  // Initialize command processor
  useEffect(() => {
    const processor = new DiagramCommandProcessor(
      setNodes,
      setEdges,
      setStreamingStatus
    );
    setCommandProcessor(processor);
  }, []);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes || []);
      setEdges(initialData.edges || []);
    }
  }, [initialData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!whiteboardId) return;

    // Subscribe to whiteboard changes
    const whiteboardSub = whiteboardService.subscribeToWhiteboardChanges(
      whiteboardId,
      (data) => {
        console.log('Received whiteboard update:', data);
        if (data && data.data) {
          setNodes(data.data.nodes || []);
          setEdges(data.data.edges || []);
        }
      }
    );

    // Subscribe to real-time collaboration events
    const eventSub = whiteboardService.subscribeToWhiteboardEvents(
      whiteboardId,
      (event) => {
        console.log('Received collaboration event:', event);
        handleCollaborationEvent(event);
      }
    );


    // Send user join event
    whiteboardService.sendWhiteboardEvent(whiteboardId, 'user_join', {
      timestamp: new Date().toISOString()
    });

    return () => {
      // Send user leave event
      whiteboardService.sendWhiteboardEvent(whiteboardId, 'user_leave', {
        timestamp: new Date().toISOString()
      });
      
      // Clean up subscriptions
      if (whiteboardSub && typeof whiteboardSub.unsubscribe === 'function') {
        whiteboardSub.unsubscribe();
      }
      if (eventSub && typeof eventSub.unsubscribe === 'function') {
        eventSub.unsubscribe();
      }
    };
  }, [whiteboardId]);

  // Auto-save changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((diagramData) => {
      if (onSave && canEdit) {
        onSave(diagramData);
      }
    }, 2000),
    [onSave, canEdit]
  );

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      debouncedSave({ nodes, edges });
    }
  }, [nodes, edges, debouncedSave]);

  const handleCollaborationEvent = (event) => {
    switch (event.eventType) {
      case 'user_join':
        setConnectedUsers(prev => {
          const existing = prev.find(u => u.userId === event.userId);
          if (!existing) {
            return [...prev, { userId: event.userId, userEmail: event.userEmail }];
          }
          return prev;
        });
        break;
      case 'user_leave':
        setConnectedUsers(prev => prev.filter(u => u.userId !== event.userId));
        break;
      case 'cursor_move':
        // Handle cursor updates for collaborative editing
        break;
      default:
        console.log('Unhandled collaboration event:', event.eventType);
    }
  };

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

    if (!canUseAI) {
      setError("Only the whiteboard owner can use AI features.");
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
      let colorContext = "";
      if (nodes.length > 0 && window.captureDiagramMinimap) {
        try {
          setStreamingStatus("Capturing diagram...");
          const result = await window.captureDiagramMinimap();
          
          // Handle case where minimap capture returns null
          if (result && result.blob) {
            const { blob, colorContext: capturedColorContext } = result;
            colorContext = capturedColorContext || "";
            
            // Convert blob to base64
            const reader = new FileReader();
            imageData = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result.split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } else {
            console.log("Minimap not available, proceeding without image");
          }

          // Check if we've seen this image before (only if we have imageData)
          if (imageData) {
            const imageHash = generateMediaHash(imageData);
            if (mediaCache.has(`image_${imageHash}`)) {
              console.log("Using cached image data");
            } else {
              setMediaCache(prev => new Map(prev).set(`image_${imageHash}`, true));
            }
          }

          // Add color context to the prompt if available
          if (colorContext) {
            prompt = `${colorContext}\n\nUser request: ${prompt}`;
          }
        } catch (captureError) {
          console.log("Could not capture minimap, proceeding without image:", captureError);
        }
      }

      // Handle audio data caching
      if (audioData) {
        const audioHash = generateMediaHash(audioData);
        if (mediaCache.has(`audio_${audioHash}`)) {
          console.log("Using cached audio data");
        } else {
          setMediaCache(prev => new Map(prev).set(`audio_${audioHash}`, true));
        }
      }

      setStreamingStatus("Analyzing with AI...");

      // Use the new AI service
      await aiService.processAIRequest(
        whiteboardId,
        prompt,
        audioData,
        imageData,
        existingDiagram,
        {
          onCommand: (command) => {
            commandProcessor.processCommand(command);
            // Send real-time event for collaboration
            if (whiteboardId) {
              aiService.sendWhiteboardEvent(whiteboardId, 'ai_command', {
                command,
                timestamp: new Date().toISOString()
              });
            }
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
        }
      );
    } catch (err) {
      setError(err.message || "Failed to update diagram. Please try again.");
      setIsGenerating(false);
      setStreamingStatus(null);
    }
  };

  const handleNodesChange = (updatedNodes) => {
    if (!canEdit) return; // Prevent editing if user doesn't have permission
    
    setNodes(updatedNodes);
    
    // Send collaboration event for real-time updates
    if (whiteboardId) {
      whiteboardService.sendWhiteboardEvent(whiteboardId, 'node_update', {
        nodes: updatedNodes,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleEdgesChange = (updatedEdges) => {
    if (!canEdit) return; // Prevent editing if user doesn't have permission
    
    setEdges(updatedEdges);
    
    // Send collaboration event for real-time updates
    if (whiteboardId) {
      whiteboardService.sendWhiteboardEvent(whiteboardId, 'edge_update', {
        edges: updatedEdges,
        timestamp: new Date().toISOString()
      });
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: "20px", color: "#333" }}>
            Diagram Builder
          </h1>
          {connectedUsers.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#e3f2fd',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: '#1976d2'
            }}>
              <span>👥</span>
              <span>{connectedUsers.length + 1} online</span>
            </div>
          )}
          {!canUseAI && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              border: '1px solid #ffeaa7'
            }}>
              {canEdit ? '✏️ Editor Mode' : '👀 View Only'}
            </div>
          )}
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
              disabled={!canUseAI}
              disabledMessage={!canUseAI ? "Only the whiteboard owner can use AI features" : undefined}
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
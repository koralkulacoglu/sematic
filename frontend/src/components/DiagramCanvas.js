import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "./CustomNodes";
import NodeTypeSelector from "./NodeTypeSelector";
import EdgeTypeSelector from "./EdgeTypeSelector";

// Better ResizeObserver error handling
const suppressResizeObserverErrors = () => {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes(
        "ResizeObserver loop completed with undelivered notifications"
      ) ||
        args[0].includes("ResizeObserver loop limit exceeded"))
    ) {
      return;
    }
    originalError(...args);
  };

  // Also suppress the actual ResizeObserver errors by catching them
  window.addEventListener("error", (e) => {
    if (e.message && e.message.includes("ResizeObserver")) {
      e.preventDefault();
      return false;
    }
  });
};

// Initialize error suppression
if (typeof window !== "undefined") {
  suppressResizeObserverErrors();
}

const DiagramCanvas = ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: onExternalNodesChange,
  onEdgesChange: onExternalEdgesChange,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);
  const [selectedNodeType, setSelectedNodeType] = useState("default");
  const [selectedEdgeType, setSelectedEdgeType] = useState("default");

  // Use refs to track previous values to prevent unnecessary updates
  const prevNodesRef = useRef();
  const prevEdgesRef = useRef();
  const timeoutRefs = useRef([]); // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Update internal state when external props change
  useEffect(() => {
    if (initialNodes && initialNodes !== prevNodesRef.current) {
      const nodesChanged =
        JSON.stringify(initialNodes) !== JSON.stringify(prevNodesRef.current);
      if (nodesChanged) {
        setNodes(initialNodes);
        prevNodesRef.current = initialNodes;
      }
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges && initialEdges !== prevEdgesRef.current) {
      const edgesChanged =
        JSON.stringify(initialEdges) !== JSON.stringify(prevEdgesRef.current);
      if (edgesChanged) {
        setEdges(initialEdges);
        prevEdgesRef.current = initialEdges;
      }
    }
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: selectedEdgeType,
        animated: selectedEdgeType === "default",
        style: { strokeWidth: 2 },
      };

      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);

        // Notify parent component of changes
        if (onExternalEdgesChange) {
          // Use setTimeout to avoid state update conflicts
          const timeout = setTimeout(() => {
            onExternalEdgesChange(updatedEdges);
          }, 0);
          timeoutRefs.current.push(timeout);
        }

        return updatedEdges;
      });
    },
    [onExternalEdgesChange, setEdges, selectedEdgeType]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Notify parent component of changes with debouncing
      if (onExternalNodesChange) {
        const timeout = setTimeout(() => {
          setNodes((currentNodes) => {
            const updatedNodes = currentNodes.map((node) => {
              const change = changes.find((c) => c.id === node.id);
              if (change && change.type === "position" && change.position) {
                return { ...node, position: change.position };
              }
              return node;
            });
            onExternalNodesChange(updatedNodes);
            return currentNodes; // Don't change the actual state here
          });
        }, 0);
        timeoutRefs.current.push(timeout);
      }
    },
    [onNodesChange, onExternalNodesChange, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);

      // Notify parent component of changes with debouncing
      if (onExternalEdgesChange) {
        const timeout = setTimeout(() => {
          setEdges((currentEdges) => {
            const updatedEdges = currentEdges.filter(
              (edge) =>
                !changes.some(
                  (change) => change.id === edge.id && change.type === "remove"
                )
            );
            onExternalEdgesChange(updatedEdges);
            return currentEdges; // Don't change the actual state here
          });
        }, 0);
        timeoutRefs.current.push(timeout);
      }
    },
    [onEdgesChange, onExternalEdgesChange, setEdges]
  );

  const addNode = useCallback(
    (nodeType = selectedNodeType) => {
      setNodes((nds) => {
        const typeLabels = {
          default: "Node",
          input: "Start",
          output: "End",
          process: "Process",
          decision: "Decision",
          database: "Database",
          cloud: "Cloud Service",
        };

        const newNode = {
          id: `node-${Date.now()}`, // Use timestamp for unique IDs
          type: nodeType,
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          data: {
            label: `${typeLabels[nodeType] || "Node"} ${nds.length + 1}`,
          },
        };
        const updatedNodes = [...nds, newNode];

        // Notify parent component
        if (onExternalNodesChange) {
          const timeout = setTimeout(
            () => onExternalNodesChange(updatedNodes),
            0
          );
          timeoutRefs.current.push(timeout);
        }

        return updatedNodes;
      });
    },
    [onExternalNodesChange, setNodes, selectedNodeType]
  );

  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => {
      const selectedNodeIds = nds
        .filter((node) => node.selected)
        .map((node) => node.id);
      const updatedNodes = nds.filter((node) => !node.selected);

      // Also remove edges connected to deleted nodes
      setEdges((eds) => {
        const updatedEdges = eds.filter(
          (edge) =>
            !selectedNodeIds.includes(edge.source) &&
            !selectedNodeIds.includes(edge.target)
        );

        // Notify parent components
        if (onExternalEdgesChange) {
          const timeout = setTimeout(
            () => onExternalEdgesChange(updatedEdges),
            0
          );
          timeoutRefs.current.push(timeout);
        }

        return updatedEdges;
      });

      // Notify parent component
      if (onExternalNodesChange) {
        const timeout = setTimeout(
          () => onExternalNodesChange(updatedNodes),
          0
        );
        timeoutRefs.current.push(timeout);
      }

      return updatedNodes;
    });
  }, [onExternalNodesChange, onExternalEdgesChange, setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <DiagramFlowInner
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          addNode={addNode}
          deleteSelectedNodes={deleteSelectedNodes}
          selectedNodeType={selectedNodeType}
          setSelectedNodeType={setSelectedNodeType}
          selectedEdgeType={selectedEdgeType}
          setSelectedEdgeType={setSelectedEdgeType}
        />
      </div>
    </ReactFlowProvider>
  );
};

// Inner component that can use React Flow hooks
const DiagramFlowInner = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  addNode,
  deleteSelectedNodes,
  selectedNodeType,
  setSelectedNodeType,
  selectedEdgeType,
  setSelectedEdgeType,
}) => {
  const { fitView } = useReactFlow();

  // Export function to capture minimap for external use
  window.captureDiagramMinimap = () => {
    return new Promise((resolve, reject) => {
      try {
        // First, fit the view to show all nodes
        fitView({ padding: 0.2, duration: 0 }); // No animation for immediate effect
        
        // Wait a short moment for the view to update and minimap to re-render
        setTimeout(() => {
          const minimapCanvas = document.querySelector('.react-flow__minimap canvas');
          if (!minimapCanvas) {
            reject(new Error('Could not find minimap canvas'));
            return;
          }

          minimapCanvas.toBlob((blob) => {
            if (blob) {
              const colorContext = `
Here's a minimap view of the current React Flow diagram. 

Color Legend:
- Blue: Input/Start nodes (entry points) 
- Red: Output/End nodes (exit points)
- Purple: Process nodes (actions/operations)
- Orange: Decision nodes (conditions/branching) 
- Green: Database nodes (data storage)
- Light blue: Cloud Service nodes (external systems)
- Gray: Default/General purpose nodes

Current diagram contains ${nodes.length} nodes and ${edges.length} connections.`.trim();

              resolve({ blob, colorContext });
            } else {
              reject(new Error('Failed to capture minimap'));
            }
          }, 'image/png');
        }, 100); // Small delay to ensure minimap updates
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      connectionMode="loose"
      fitView
      fitViewOptions={{ padding: 0.2 }}
      attributionPosition="bottom-left"
    >
      {/* Empty state overlay */}
      {nodes.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#666",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
            Start Building Your Diagram
          </h3>
          <p style={{ margin: "0", fontSize: "14px" }}>
            Use the "Add Node" button in the top-right corner to get started
          </p>
        </div>
      )}
      <Panel position="top-right">
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexDirection: "column",
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#333",
            }}
          >
            Diagram Tools
          </div>

          <NodeTypeSelector
            onAddNode={addNode}
            selectedNodeType={selectedNodeType}
            onNodeTypeChange={setSelectedNodeType}
          />

          <EdgeTypeSelector
            selectedEdgeType={selectedEdgeType}
            onEdgeTypeChange={setSelectedEdgeType}
          />

          <button
            onClick={deleteSelectedNodes}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🗑️</span>
            <span>Delete Selected</span>
          </button>

          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid #eee",
            }}
          >
            💡 Tip: Drag to connect nodes with the selected edge style
          </div>
        </div>
      </Panel>
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          switch (node.type) {
            case "input":
              return "#2196f3";
            case "output":
              return "#e91e63";
            case "process":
              return "#9c27b0";
            case "decision":
              return "#ff9800";
            case "database":
              return "#4caf50";
            case "cloud":
              return "#03a9f4";
            default:
              return "#ccc";
          }
        }}
        maskColor="rgba(240, 240, 240, 0.6)"
      />
      <Background variant="dots" gap={12} size={1} />
    </ReactFlow>
  );
};

DiagramCanvas.displayName = "DiagramCanvas";

export default DiagramCanvas;

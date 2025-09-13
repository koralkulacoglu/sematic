import React, { useState } from "react";

const NodeTypeSelector = ({
  onAddNode,
  selectedNodeType,
  onNodeTypeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const nodeTypes = [
    {
      type: "default",
      label: "Default",
      icon: "🔲",
      description: "Basic rectangular node",
      style: { backgroundColor: "#f0f0f0", border: "1px solid #ccc" },
    },
    {
      type: "input",
      label: "Input",
      icon: "🔵",
      description: "Start/input node",
      style: {
        backgroundColor: "#e3f2fd",
        border: "1px solid #2196f3",
        borderRadius: "50%",
      },
    },
    {
      type: "output",
      label: "Output",
      icon: "🔴",
      description: "End/output node",
      style: {
        backgroundColor: "#fce4ec",
        border: "1px solid #e91e63",
        borderRadius: "50%",
      },
    },
    {
      type: "process",
      label: "Process",
      icon: "⚙️",
      description: "Process/action node",
      style: { backgroundColor: "#f3e5f5", border: "1px solid #9c27b0" },
    },
    {
      type: "decision",
      label: "Decision",
      icon: "💎",
      description: "Decision/condition node",
      style: {
        backgroundColor: "#fff3e0",
        border: "1px solid #ff9800",
        transform: "rotate(45deg)",
      },
    },
    {
      type: "database",
      label: "Database",
      icon: "🗄️",
      description: "Database/storage node",
      style: {
        backgroundColor: "#e8f5e8",
        border: "1px solid #4caf50",
        borderRadius: "10px 10px 0 0",
      },
    },
    {
      type: "cloud",
      label: "Cloud",
      icon: "☁️",
      description: "Cloud/service node",
      style: {
        backgroundColor: "#e1f5fe",
        border: "1px solid #03a9f4",
        borderRadius: "20px",
      },
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: "120px",
        }}
      >
        <span>
          {nodeTypes.find((nt) => nt.type === selectedNodeType)?.icon || "🔲"}
        </span>
        <span>Add Node</span>
        <span
          style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
            minWidth: "250px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {nodeTypes.map((nodeType) => (
            <div
              key={nodeType.type}
              onClick={() => {
                onNodeTypeChange(nodeType.type);
                onAddNode(nodeType.type);
                setIsExpanded(false);
              }}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  ...nodeType.style,
                  transform:
                    nodeType.type === "decision" ? "rotate(45deg)" : "none",
                  minWidth: "24px",
                }}
              >
                {nodeType.type === "decision" ? "?" : nodeType.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {nodeType.label}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {nodeType.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NodeTypeSelector;

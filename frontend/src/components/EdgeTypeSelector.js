import React, { useState } from "react";

const EdgeTypeSelector = ({ selectedEdgeType, onEdgeTypeChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const edgeTypes = [
    {
      type: "default",
      label: "Default",
      icon: "→",
      description: "Basic straight edge",
      style: { stroke: "#b1b1b7", strokeWidth: 2 },
    },
    {
      type: "straight",
      label: "Straight",
      icon: "→",
      description: "Straight line connection",
      style: { stroke: "#333", strokeWidth: 2 },
    },
    {
      type: "step",
      label: "Step",
      icon: "⟞",
      description: "Step-wise connection",
      style: { stroke: "#007bff", strokeWidth: 2 },
    },
    {
      type: "smoothstep",
      label: "Smooth Step",
      icon: "⟜",
      description: "Smooth step connection",
      style: { stroke: "#28a745", strokeWidth: 2 },
    },
    {
      type: "bezier",
      label: "Bezier",
      icon: "⟝",
      description: "Curved bezier connection",
      style: { stroke: "#dc3545", strokeWidth: 2 },
    },
    {
      type: "simplebezier",
      label: "Simple Bezier",
      icon: "⟞",
      description: "Simple curved connection",
      style: { stroke: "#fd7e14", strokeWidth: 2 },
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#6c757d",
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
          {edgeTypes.find((et) => et.type === selectedEdgeType)?.icon || "→"}
        </span>
        <span>Edge Style</span>
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
            minWidth: "200px",
          }}
        >
          {edgeTypes.map((edgeType) => (
            <div
              key={edgeType.type}
              onClick={() => {
                onEdgeTypeChange(edgeType.type);
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
                backgroundColor:
                  selectedEdgeType === edgeType.type ? "#e3f2fd" : "white",
              }}
              onMouseEnter={(e) => {
                if (selectedEdgeType !== edgeType.type) {
                  e.target.style.backgroundColor = "#f8f9fa";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor =
                  selectedEdgeType === edgeType.type ? "#e3f2fd" : "white";
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  color: edgeType.style.stroke,
                  minWidth: "24px",
                }}
              >
                {edgeType.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {edgeType.label}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {edgeType.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EdgeTypeSelector;

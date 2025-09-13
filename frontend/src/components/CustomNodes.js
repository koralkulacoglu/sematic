import React from "react";
import { Handle, Position } from "reactflow";

// Custom node components
export const ProcessNode = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: "12px 20px",
        backgroundColor: "#f3e5f5",
        border: `2px solid ${selected ? "#9c27b0" : "#e1bee7"}`,
        borderRadius: "8px",
        minWidth: "100px",
        textAlign: "center",
        position: "relative",
        boxShadow: selected ? "0 0 0 2px rgba(156, 39, 176, 0.3)" : "none",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: "bold", fontSize: "12px", color: "black" }}>
        ⚙️ {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const DecisionNode = ({ data, selected }) => {
  return (
    <div
      style={{
        width: "100px",
        height: "100px",
        backgroundColor: "#fff3e0",
        border: `2px solid ${selected ? "#ff9800" : "#ffcc02"}`,
        transform: "rotate(45deg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: selected ? "0 0 0 2px rgba(255, 152, 0, 0.3)" : "none",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ transform: "rotate(-45deg)", top: "-8px" }}
      />
      <div
        style={{
          transform: "rotate(-45deg)",
          fontWeight: "bold",
          fontSize: "12px",
          textAlign: "center",
          maxWidth: "60px",
          color: "black",
        }}
      >
        💎 {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ transform: "rotate(-45deg)", bottom: "-8px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "rotate(-45deg)", right: "-8px" }}
      />
    </div>
  );
};

export const DatabaseNode = ({ data, selected }) => {
  const borderColor = selected ? "#4caf50" : "#a5d6a7";
  const fillColor = selected ? "#e8f5e8" : "#f1f8e9";
  
  return (
    <div
      style={{
        position: "relative",
        width: "100px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: selected ? "0 0 0 2px rgba(76, 175, 80, 0.3)" : "none",
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      {/* Main cylinder body */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "0",
          right: "0",
          height: "56px",
          backgroundColor: fillColor,
          border: `2px solid ${borderColor}`,
          borderTop: "none",
          borderBottom: "none",
        }}
      />
      
      {/* Top ellipse */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "24px",
          backgroundColor: fillColor,
          border: `2px solid ${borderColor}`,
          borderRadius: "50px 50px 50px 50px / 12px 12px 12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      
      {/* Bottom ellipse */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "24px",
          backgroundColor: fillColor,
          border: `2px solid ${borderColor}`,
          borderRadius: "50px 50px 50px 50px / 12px 12px 12px 12px",
        }}
      />
      
      {/* Text content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          fontWeight: "bold",
          fontSize: "12px",
          textAlign: "center",
          color: "black",
          padding: "2px 6px",
          borderRadius: "4px",
        }}
      >
        🗄️ {data.label}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const CloudNode = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: "12px 24px",
        backgroundColor: "#e1f5fe",
        border: `2px solid ${selected ? "#03a9f4" : "#81d4fa"}`,
        borderRadius: "25px",
        minWidth: "120px",
        textAlign: "center",
        position: "relative",
        boxShadow: selected ? "0 0 0 2px rgba(3, 169, 244, 0.3)" : "none",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: "bold", fontSize: "12px", color: "black" }}>
        ☁️ {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const InputNode = ({ data, selected }) => {
  return (
    <div
      style={{
        width: "80px",
        height: "80px",
        backgroundColor: selected ? "#e3f2fd" : "#f3f9ff",
        border: `3px solid ${selected ? "#2196f3" : "#64b5f6"}`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: selected ? "0 0 0 2px rgba(33, 150, 243, 0.3)" : "none",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          fontSize: "12px",
          textAlign: "center",
          maxWidth: "60px",
          color: "black",
        }}
      >
        🔵 {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const OutputNode = ({ data, selected }) => {
  return (
    <div
      style={{
        width: "80px",
        height: "80px",
        backgroundColor: selected ? "#fce4ec" : "#fff0f5",
        border: `3px solid ${selected ? "#e91e63" : "#f48fb1"}`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: selected ? "0 0 0 2px rgba(233, 30, 99, 0.3)" : "none",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          fontWeight: "bold",
          fontSize: "12px",
          textAlign: "center",
          maxWidth: "60px",
          color: "black",
        }}
      >
        🔴 {data.label}
      </div>
    </div>
  );
};

export const GroupNode = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f9f9f9",
        border: `2px dashed ${selected ? "#666" : "#999"}`,
        borderRadius: "8px",
        minWidth: "150px",
        minHeight: "100px",
        textAlign: "center",
        position: "relative",
        boxShadow: selected ? "0 0 0 2px rgba(102, 102, 102, 0.3)" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "12px",
          fontWeight: "bold",
          fontSize: "12px",
          color: "black",
        }}
      >
        📦 {data.label}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

// Node type mapping
export const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  database: DatabaseNode,
  cloud: CloudNode,
  input: InputNode,
  output: OutputNode,
  group: GroupNode,
};

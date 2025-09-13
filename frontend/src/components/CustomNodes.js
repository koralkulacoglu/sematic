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
      <div style={{ fontWeight: "bold", fontSize: "14px" }}>
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
  return (
    <div
      style={{
        padding: "12px 20px",
        backgroundColor: "#e8f5e8",
        border: `2px solid ${selected ? "#4caf50" : "#a5d6a7"}`,
        borderRadius: "8px 8px 0 0",
        minWidth: "100px",
        textAlign: "center",
        position: "relative",
        boxShadow: selected ? "0 0 0 2px rgba(76, 175, 80, 0.3)" : "none",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: "bold", fontSize: "14px" }}>
        🗄️ {data.label}
      </div>
      {/* Database bottom part */}
      <div
        style={{
          position: "absolute",
          bottom: "-8px",
          left: "0",
          right: "0",
          height: "8px",
          backgroundColor: "#e8f5e8",
          border: `2px solid ${selected ? "#4caf50" : "#a5d6a7"}`,
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
        }}
      />
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
      <div style={{ fontWeight: "bold", fontSize: "14px" }}>
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
        backgroundColor: "#e3f2fd",
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
        backgroundColor: "#fce4ec",
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
          color: "#666",
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

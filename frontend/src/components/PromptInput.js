import React, { useState } from "react";

const PromptInput = ({
  onGenerate,
  isGenerating,
  hasExistingDiagram = false,
}) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const generateExamples = [
    "Create a simple workflow for processing user registration",
    "Design a database schema for an e-commerce system",
    "Show the process of making a coffee from beans to cup",
    "Diagram the components of a web application architecture",
    "Create a decision tree for customer support escalation",
  ];

  const editExamples = [
    "Add error handling steps to this workflow",
    "Include security validation nodes",
    "Add a payment processing branch",
    "Expand this with detailed sub-processes",
    "Add feedback loops and retry mechanisms",
  ];

  const examplePrompts = hasExistingDiagram ? editExamples : generateExamples;

  const selectExamplePrompt = (example) => {
    setPrompt(example);
  };

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ marginBottom: "8px", fontSize: "16px", color: "#333" }}>
          {hasExistingDiagram ? "🤖 AI Editor" : "🤖 AI Generator"}
        </h3>

        {/* Prompt Input */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                hasExistingDiagram
                  ? "Describe your changes..."
                  : "Describe your diagram..."
              }
              rows={3}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "12px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            style={{
              backgroundColor:
                !prompt.trim() || isGenerating ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor:
                !prompt.trim() || isGenerating ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            {isGenerating
              ? hasExistingDiagram
                ? "Updating..."
                : "Generating..."
              : hasExistingDiagram
              ? "Update Diagram"
              : "Generate Diagram"}
          </button>
        </form>
      </div>

      {/* Example Prompts */}
      <div>
        <h4 style={{ fontSize: "12px", marginBottom: "8px", color: "#666" }}>
          Examples:
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {examplePrompts.slice(0, 3).map((example, index) => (
            <button
              key={index}
              onClick={() => selectExamplePrompt(example)}
              style={{
                padding: "6px 8px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
                textAlign: "left",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e9ecef")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptInput;

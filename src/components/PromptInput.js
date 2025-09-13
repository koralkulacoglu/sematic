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
    <div
      style={{
        marginBottom: "20px",
        ...(hasExistingDiagram && {
          backgroundColor: "#f8f9fa",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
        }),
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "10px" }}>
          {hasExistingDiagram ? "🤖 AI Diagram Editor" : "AI Diagram Generator"}
        </h2>
        <p style={{ color: "#666", marginBottom: "15px" }}>
          {hasExistingDiagram
            ? "Describe how you want to modify your existing diagram, and AI will update it for you."
            : "Enter a description and let AI generate a diagram for you. You can then edit it manually."}
        </p>

        {/* Prompt Input */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {hasExistingDiagram
                ? "Describe your changes:"
                : "Describe your diagram:"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                hasExistingDiagram
                  ? "e.g., Add error handling steps, include security validation, add payment processing..."
                  : "e.g., Create a flowchart for user authentication process..."
              }
              rows={4}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
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
              padding: "10px 20px",
              borderRadius: "4px",
              cursor:
                !prompt.trim() || isGenerating ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "bold",
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
        <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>
          {hasExistingDiagram ? "Example Edits:" : "Example Prompts:"}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => selectExamplePrompt(example)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
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

import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initialize(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generateDiagram(prompt, existingDiagram = null) {
    if (!this.model) {
      throw new Error("Gemini API not initialized. Please provide an API key.");
    }

    try {
      let enhancedPrompt;

      if (
        existingDiagram &&
        existingDiagram.nodes &&
        existingDiagram.nodes.length > 0
      ) {
        // Edit existing diagram
        enhancedPrompt = `
        You are editing an existing diagram. Here is the current diagram data:
        ${JSON.stringify(existingDiagram, null, 2)}
        
        Based on the following modification request, update the diagram and return the COMPLETE modified diagram data.
        Return ONLY valid JSON without any markdown formatting or code blocks.
        The JSON should maintain this structure:
        {
          "nodes": [
            {
              "id": "unique_id",
              "type": "default",
              "position": { "x": number, "y": number },
              "data": { "label": "Node Label" }
            }
          ],
          "edges": [
            {
              "id": "edge_id",
              "source": "source_node_id",
              "target": "target_node_id"
            }
          ]
        }
        
        Guidelines:
        - Preserve existing nodes that are not being modified
        - Add, modify, or remove nodes/edges as requested
        - Create meaningful node IDs for new nodes
        - Position new nodes in a logical layout
        - Keep labels concise but descriptive
        - Use appropriate node types:
          * "input" for start/entry points (circular blue nodes)
          * "output" for end/exit points (circular red nodes)
          * "process" for actions/operations (purple rectangular nodes)
          * "decision" for conditions/branching (orange diamond nodes)
          * "database" for data storage (green database-style nodes)
          * "cloud" for cloud services/external systems (blue cloud nodes)
          * "group" for containers/groupings (dashed border nodes)
          * "default" for general purpose nodes
        - Use appropriate edge types: "default", "straight", "step", "smoothstep", "bezier", "simplebezier"
        
        Modification request: ${prompt}
        `;
      } else {
        // Generate new diagram
        enhancedPrompt = `
        Convert the following description into a diagram data structure that can be used with React Flow.
        Return ONLY valid JSON without any markdown formatting or code blocks.
        The JSON should have this structure:
        {
          "nodes": [
            {
              "id": "unique_id",
              "type": "default",
              "position": { "x": number, "y": number },
              "data": { "label": "Node Label" }
            }
          ],
          "edges": [
            {
              "id": "edge_id",
              "source": "source_node_id",
              "target": "target_node_id"
            }
          ]
        }
        
        Guidelines:
        - Create meaningful node IDs
        - Position nodes in a logical layout (spread them out nicely)
        - Include relevant connections between nodes
        - Keep labels concise but descriptive
        - Use appropriate node types:
          * "input" for start/entry points (circular blue nodes)
          * "output" for end/exit points (circular red nodes)
          * "process" for actions/operations (purple rectangular nodes)
          * "decision" for conditions/branching (orange diamond nodes)
          * "database" for data storage (green database-style nodes)
          * "cloud" for cloud services/external systems (blue cloud nodes)
          * "group" for containers/groupings (dashed border nodes)
          * "default" for general purpose nodes
        - Use appropriate edge types: "default", "straight", "step", "smoothstep", "bezier", "simplebezier"
        
        Description: ${prompt}
        `;
      }

      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the response to extract JSON
      let cleanedText = text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText
          .replace(/```json\n?/, "")
          .replace(/\n?```$/, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/```\n?/, "").replace(/\n?```$/, "");
      }

      try {
        const diagramData = JSON.parse(cleanedText);

        // Validate the structure
        if (!diagramData.nodes || !diagramData.edges) {
          throw new Error("Invalid diagram structure");
        }

        // Ensure all nodes have required properties
        diagramData.nodes = diagramData.nodes.map((node, index) => ({
          id: node.id || `node-${index}`,
          type: node.type || "default",
          position: node.position || { x: index * 250, y: index * 100 },
          data: node.data || { label: `Node ${index + 1}` },
        }));

        // Ensure all edges have required properties
        diagramData.edges = diagramData.edges.map((edge, index) => ({
          id: edge.id || `edge-${index}`,
          source: edge.source,
          target: edge.target,
          type: edge.type || "default",
        }));

        return diagramData;
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", cleanedText);
        throw new Error("Failed to parse diagram data from Gemini response");
      }
    } catch (error) {
      console.error("Error generating diagram:", error);
      throw error;
    }
  }
}

export default new GeminiService();

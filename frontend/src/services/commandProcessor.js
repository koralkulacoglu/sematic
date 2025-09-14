export class DiagramCommandProcessor {
  constructor(setNodes, setEdges, setStatus) {
    this.setNodes = setNodes;
    this.setEdges = setEdges;
    this.setStatus = setStatus;
  }

  processCommand(command) {
    console.log("⚙️ [PROCESSING COMMAND]", command);
    
    switch (command.type) {
      case "status":
        this.handleStatus(command.data);
        break;
      case "add_node":
        this.handleAddNode(command.data);
        break;
      case "update_node":
        this.handleUpdateNode(command.data);
        break;
      case "delete_node":
        this.handleDeleteNode(command.data);
        break;
      case "add_edge":
        this.handleAddEdge(command.data);
        break;
      case "update_edge":
        this.handleUpdateEdge(command.data);
        break;
      case "delete_edge":
        this.handleDeleteEdge(command.data);
        break;
      case "complete":
        this.handleComplete(command.data);
        break;
      default:
        console.warn("❓ [UNKNOWN COMMAND]", command.type, command);
    }
  }

  handleStatus(data) {
    console.log("📊 [STATUS UPDATE]", data.message);
    this.setStatus(data.message);
  }

  handleAddNode(data) {
    console.log("➕ [ADD NODE]", data);
    const newNode = {
      id: data.id,
      type: data.nodeType || "default",
      position: data.position,
      data: { label: data.label },
    };

    this.setNodes((prevNodes) => [...prevNodes, newNode]);
    this.setStatus(`Added node: ${data.label}`);
  }

  handleUpdateNode(data) {
    console.log("✏️ [UPDATE NODE]", data);
    this.setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === data.id) {
          const updates = {};
          if (data.changes.position) updates.position = data.changes.position;
          if (data.changes.nodeType) updates.type = data.changes.nodeType;
          if (data.changes.label)
            updates.data = { ...node.data, label: data.changes.label };

          return { ...node, ...updates };
        }
        return node;
      })
    );
    this.setStatus(`Updated node: ${data.id}`);
  }

  handleDeleteNode(data) {
    console.log("🗑️ [DELETE NODE]", data);
    this.setNodes((prevNodes) =>
      prevNodes.filter((node) => node.id !== data.id)
    );

    // Also remove connected edges
    this.setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) => edge.source !== data.id && edge.target !== data.id
      )
    );

    this.setStatus(`Deleted node: ${data.id}`);
  }

  handleAddEdge(data) {
    console.log("🔗 [ADD EDGE]", data);
    const newEdge = {
      id: data.id,
      source: data.source,
      target: data.target,
      type: data.edgeType || "default",
      animated: data.edgeType === "default",
      style: { strokeWidth: 2 },
    };

    this.setEdges((prevEdges) => [...prevEdges, newEdge]);
    this.setStatus(`Connected ${data.source} to ${data.target}`);
  }

  handleUpdateEdge(data) {
    console.log("🔄 [UPDATE EDGE]", data);
    this.setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (edge.id === data.id) {
          const updates = {};
          if (data.changes.edgeType) {
            updates.type = data.changes.edgeType;
            updates.animated = data.changes.edgeType === "default";
          }
          return { ...edge, ...updates };
        }
        return edge;
      })
    );
    this.setStatus(`Updated edge: ${data.id}`);
  }

  handleDeleteEdge(data) {
    console.log("❌ [DELETE EDGE]", data);
    this.setEdges((prevEdges) =>
      prevEdges.filter((edge) => edge.id !== data.id)
    );
    this.setStatus(`Deleted edge: ${data.id}`);
  }

  handleComplete(data) {
    console.log("🎉 [COMPLETE]", data);
    this.setStatus(data.message);
    setTimeout(() => {
      this.setStatus(null);
    }, 3000);
  }
}

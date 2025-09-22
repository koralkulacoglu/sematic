import React, { useState, useEffect, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  Handle,
  Position,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

const nodeTypes = {
  service: ({ data }) => (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-md ${data.className} min-w-[100px] text-center`}>
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold text-sm">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  ),
};

const scenarios = [
  {
    text: "Building microservice architecture with API gateway authentication database load balancer and monitoring",
    nodes: [
      { id: "1", type: "service", position: { x: 200, y: 50 }, data: { label: "Gateway", className: "bg-blue-100 border-blue-300 text-blue-800" } },
      { id: "2", type: "service", position: { x: 80, y: 180 }, data: { label: "Auth", className: "bg-green-100 border-green-300 text-green-800" } },
      { id: "3", type: "service", position: { x: 200, y: 180 }, data: { label: "Users", className: "bg-purple-100 border-purple-300 text-purple-800" } },
      { id: "4", type: "service", position: { x: 320, y: 180 }, data: { label: "LoadBalancer", className: "bg-orange-100 border-orange-300 text-orange-800" } },
      { id: "5", type: "service", position: { x: 80, y: 310 }, data: { label: "Database", className: "bg-yellow-100 border-yellow-300 text-yellow-800" } },
      { id: "6", type: "service", position: { x: 200, y: 310 }, data: { label: "Cache", className: "bg-red-100 border-red-300 text-red-800" } },
      { id: "7", type: "service", position: { x: 320, y: 310 }, data: { label: "Monitoring", className: "bg-teal-100 border-teal-300 text-teal-800" } },
    ],
    edges: [
      { id: "e1", source: "1", target: "2", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e2", source: "1", target: "3", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e3", source: "1", target: "4", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e4", source: "2", target: "5", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e5", source: "3", target: "5", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e6", source: "3", target: "6", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e7", source: "4", target: "7", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    ],
  },
  {
    text: "E-commerce platform with payment processing inventory management order tracking notifications and analytics",
    nodes: [
      { id: "1", type: "service", position: { x: 250, y: 50 }, data: { label: "Frontend", className: "bg-indigo-100 border-indigo-300 text-indigo-800" } },
      { id: "2", type: "service", position: { x: 250, y: 150 }, data: { label: "Orders", className: "bg-green-100 border-green-300 text-green-800" } },
      { id: "3", type: "service", position: { x: 50, y: 280 }, data: { label: "Payment", className: "bg-red-100 border-red-300 text-red-800" } },
      { id: "4", type: "service", position: { x: 180, y: 280 }, data: { label: "Inventory", className: "bg-blue-100 border-blue-300 text-blue-800" } },
      { id: "5", type: "service", position: { x: 320, y: 280 }, data: { label: "Tracking", className: "bg-yellow-100 border-yellow-300 text-yellow-800" } },
      { id: "6", type: "service", position: { x: 450, y: 280 }, data: { label: "Notifications", className: "bg-purple-100 border-purple-300 text-purple-800" } },
      { id: "7", type: "service", position: { x: 100, y: 410 }, data: { label: "Analytics", className: "bg-teal-100 border-teal-300 text-teal-800" } },
      { id: "8", type: "service", position: { x: 400, y: 410 }, data: { label: "Reviews", className: "bg-orange-100 border-orange-300 text-orange-800" } },
    ],
    edges: [
      { id: "e1", source: "1", target: "2", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e2", source: "2", target: "3", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e3", source: "2", target: "4", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e4", source: "2", target: "5", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e5", source: "2", target: "6", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e6", source: "2", target: "7", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e7", source: "1", target: "8", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    ],
  },
  {
    text: "Social media platform with content delivery user profiles messaging system search engine and recommendation AI",
    nodes: [
      { id: "1", type: "service", position: { x: 250, y: 50 }, data: { label: "CDN", className: "bg-cyan-100 border-cyan-300 text-cyan-800" } },
      { id: "2", type: "service", position: { x: 250, y: 150 }, data: { label: "Feed", className: "bg-green-100 border-green-300 text-green-800" } },
      { id: "3", type: "service", position: { x: 50, y: 280 }, data: { label: "Profiles", className: "bg-blue-100 border-blue-300 text-blue-800" } },
      { id: "4", type: "service", position: { x: 180, y: 280 }, data: { label: "Messages", className: "bg-purple-100 border-purple-300 text-purple-800" } },
      { id: "5", type: "service", position: { x: 320, y: 280 }, data: { label: "Search", className: "bg-red-100 border-red-300 text-red-800" } },
      { id: "6", type: "service", position: { x: 450, y: 280 }, data: { label: "Recommendations", className: "bg-orange-100 border-orange-300 text-orange-800" } },
      { id: "7", type: "service", position: { x: 80, y: 410 }, data: { label: "Storage", className: "bg-yellow-100 border-yellow-300 text-yellow-800" } },
      { id: "8", type: "service", position: { x: 250, y: 410 }, data: { label: "Analytics", className: "bg-teal-100 border-teal-300 text-teal-800" } },
      { id: "9", type: "service", position: { x: 420, y: 410 }, data: { label: "Moderation", className: "bg-pink-100 border-pink-300 text-pink-800" } },
    ],
    edges: [
      { id: "e1", source: "1", target: "2", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e2", source: "2", target: "3", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e3", source: "2", target: "4", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e4", source: "2", target: "5", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e5", source: "2", target: "6", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e6", source: "3", target: "7", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e7", source: "4", target: "7", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e8", source: "2", target: "8", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: "e9", source: "2", target: "9", animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    ],
  },
];

function DiagramContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const { fitView } = useReactFlow();
  const textContainerRef = useRef(null);
  const measureRef = useRef(null);

  const scenario = scenarios[currentScenario];
  const words = scenario.text.split(" ");
  
  // Calculate sliding window based on actual text width
  const getDisplayText = () => {
    if (!textContainerRef.current || !measureRef.current) {
      // Fallback to word count if refs not available
      const maxWords = 12;
      const startIndex = Math.max(0, wordIndex + 1 - maxWords);
      return words.slice(startIndex, wordIndex + 1).join(" ");
    }

    const containerWidth = textContainerRef.current.offsetWidth;
    let startIndex = 0;
    
    // Find the longest text that fits, starting from the current word and going backwards
    for (let i = wordIndex; i >= 0; i--) {
      const testText = words.slice(i, wordIndex + 1).join(" ");
      measureRef.current.textContent = testText;
      const textWidth = measureRef.current.offsetWidth;
      
      if (textWidth <= containerWidth) {
        startIndex = i;
      } else {
        break;
      }
    }
    
    return words.slice(startIndex, wordIndex + 1).join(" ");
  };

  const displayText = getDisplayText();

  // Single effect to handle everything
  useEffect(() => {
    // Clear everything first
    setNodes([]);
    setEdges([]);
    setWordIndex(0);

    const currentScenarioData = scenarios[currentScenario];
    const currentWords = currentScenarioData.text.split(" ");
    const timeouts = [];
    
    // Add words (faster)
    currentWords.forEach((word, index) => {
      timeouts.push(setTimeout(() => {
        setWordIndex(index + 1);
      }, index * 200));
    });

    // Add nodes (faster)
    currentScenarioData.nodes.forEach((node, index) => {
      timeouts.push(setTimeout(() => {
        setNodes(prev => [...prev, node]);
        // Rescale after adding each node
        setTimeout(() => {
          fitView({ duration: 200, padding: 0.2 });
        }, 50);
      }, (index + 1) * 600 + 300));
    });

    // Add edges ONLY after ALL nodes are added (faster)
    const allNodesAddedTime = currentScenarioData.nodes.length * 600 + 800;
    currentScenarioData.edges.forEach((edge, index) => {
      timeouts.push(setTimeout(() => {
        setEdges(prev => [...prev, edge]);
      }, allNodesAddedTime + index * 300));
    });

    // Cleanup function
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [currentScenario, setNodes, setEdges, fitView]);

  // Cycle through scenarios
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % scenarios.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-card border border-border rounded-lg overflow-hidden mb-4">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant="dots" gap={16} size={1} />
        </ReactFlow>
      </div>

      <div className="h-10 sm:h-12 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 sm:p-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-xs font-medium mr-2">Listening:</span>
          <div 
            ref={textContainerRef}
            className="text-xs sm:text-sm overflow-hidden whitespace-nowrap flex-1"
          >
            {displayText}
          </div>
          {/* Hidden measuring element */}
          <div 
            ref={measureRef}
            className="absolute -left-[9999px] text-xs sm:text-sm whitespace-nowrap"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

export function DiagramAnimation() {
  return (
    <ReactFlowProvider>
      <DiagramContent />
    </ReactFlowProvider>
  );
}
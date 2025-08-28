// BranchingVisualizationRF.js
import React, { useMemo, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

const layouts = ["tree", "network", "force"];

// Placeholder datasets
const placeholders = {
  tree: {
    nodes: [
      { id: "1", label: "Root", x: 250, y: 20, color: "#fca5a5" },
      { id: "2", label: "Branch A", x: 150, y: 120, color: "#93c5fd" },
      { id: "3", label: "Branch B", x: 350, y: 120, color: "#93c5fd" },
      { id: "4", label: "Leaf A1", x: 100, y: 220, color: "#86efac" },
      { id: "5", label: "Leaf B1", x: 400, y: 220, color: "#86efac" },
    ],
    edges: [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "2", target: "4" },
      { source: "3", target: "5" },
    ],
  },

  network: {
    nodes: [
      { id: "1", label: "Hub", x: 250, y: 150, color: "#fca5a5" },
      { id: "2", label: "Node A", x: 100, y: 50, color: "#93c5fd" },
      { id: "3", label: "Node B", x: 400, y: 50, color: "#93c5fd" },
      { id: "4", label: "Node C", x: 100, y: 250, color: "#86efac" },
      { id: "5", label: "Node D", x: 400, y: 250, color: "#fcd34d" },
    ],
    edges: [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "1", target: "4" },
      { source: "1", target: "5" },
      { source: "2", target: "3" },
      { source: "4", target: "5" },
    ],
  },

  force: {
    nodes: [
      { id: "1", label: "Center", x: 250, y: 150, color: "#fca5a5" },
      { id: "2", label: "Orbit 1", x: 100, y: 100, color: "#93c5fd" },
      { id: "3", label: "Orbit 2", x: 400, y: 100, color: "#86efac" },
      { id: "4", label: "Orbit 3", x: 100, y: 250, color: "#fcd34d" },
      { id: "5", label: "Orbit 4", x: 400, y: 250, color: "#a78bfa" },
    ],
    edges: [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "1", target: "4" },
      { source: "1", target: "5" },
    ],
  },
};

export default function BranchingVisualizationRF({ data, defaultLayout = "tree" }) {
  const [activeLayout, setActiveLayout] = useState(defaultLayout);

  // Choose backend data if available, else placeholder
  const graphData =
    data && data.nodes?.length ? data : placeholders[activeLayout];

  const nodes = useMemo(() => {
    return graphData.nodes.map((n, idx) => ({
      id: String(n.id || idx),
      position: { x: n.x || Math.random() * 400, y: n.y || Math.random() * 400 },
      data: { label: n.label || `Node ${idx}` },
      style: {
        backgroundColor: n.color || "#93c5fd",
        borderRadius: "8px",
        padding: "6px 8px",
        fontSize: "0.8rem",
        minWidth: "60px",
        textAlign: "center",
      },
    }));
  }, [graphData]);

  const edges = useMemo(() => {
    return graphData.edges.map((e, idx) => ({
      id: `e-${idx}`,
      source: String(e.source),
      target: String(e.target),
      type: "smoothstep",
      animated: true,
      style: { stroke: e.color || "#6366f1" },
    }));
  }, [graphData]);

  return (
    <div className="p-2 sm:p-4 w-full h-[80vh] flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {layouts.map((layout) => (
          <button
            key={layout}
            onClick={() => setActiveLayout(layout)}
            className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activeLayout === layout
                ? "bg-indigo-500 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {layout.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-2 text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-300 rounded-full" /> Root / Hub / Center
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-300 rounded-full" /> Branch / Node
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-300 rounded-full" /> Leaf / Orbit
        </div>
      </div>

      {/* Graph View */}
      <div className="flex-1 border rounded-2xl overflow-hidden shadow min-h-[60vh] sm:min-h-[70vh]">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={true}
            elementsSelectable={true}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap zoomable pannable />
            <Controls showInteractive />
            <Background gap={12} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

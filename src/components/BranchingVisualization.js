import * as d3 from "d3";
import React, { useState, useEffect, useRef } from "react";


export default function BranchingVisualization({ branchingData }) {
  const [activeTab, setActiveTab] = useState("tree");
  const [isExpanded, setIsExpanded] = useState(false);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  

  // Fallback sample data
  const defaultData = {
    summary: "Start",
    recommended: true,
    anomaly: false,
    children: [
      {
        summary: "Path A",
        recommended: true,
        anomaly: false,
        children: [
          {
            summary: "Outcome A1",
            recommended: true,
            anomaly: false,
          },
          {
            summary: "Outcome A2",
            recommended: false,
            anomaly: true,
          },
        ],
      },
      {
        summary: "Path B",
        recommended: false,
        anomaly: true,
        children: [
          {
            summary: "Outcome B1",
            recommended: false,
            anomaly: false,
          },
        ],
      },
      {
        summary: "Path C",
        recommended: true,
        anomaly: false,
      },
    ],
  };

  const data = branchingData || defaultData;

  // Update dimensions based on expanded state
  useEffect(() => {
    if (isExpanded) {
      setDimensions({ 
        width: Math.min(window.innerWidth * 0.85, 1400), 
        height: Math.min(window.innerHeight * 0.75, 800) 
      });
    } else {
      setDimensions({ width: 800, height: 600 });
    }
  }, [isExpanded]);

  // Handle escape key to close expanded view
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  // Prevent body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  // Tree visualization using D3
  const renderTree = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };

    const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    const root = d3.hierarchy(data);
    treeLayout(root);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .style("fill", "none")
      .style("stroke", document.documentElement.classList.contains('dark') ? "#6b7280" : "#999")
      .style("stroke-width", 2);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", 8)
      .style("fill", d => {
        if (d.data.anomaly) return "#ef4444"; // red-500
        if (d.data.recommended) return "#22c55e"; // green-500
        return "#3b82f6"; // blue-500
      })
      .style("stroke", document.documentElement.classList.contains('dark') ? "#e5e7eb" : "#374151")
      .style("stroke-width", 2);

    node.append("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", document.documentElement.classList.contains('dark') ? "#f3f4f6" : "#374151")
      .text(d => d.data.summary);

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(20, 20)`);

    const legendData = [
      { color: "#22c55e", label: "Recommended" }, // green-500
      { color: "#3b82f6", label: "Normal" },      // blue-500
      { color: "#ef4444", label: "Anomaly" }      // red-500
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("circle")
        .attr("r", 6)
        .style("fill", item.color);

      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .style("font-size", "12px")
        .style("fill", document.documentElement.classList.contains('dark') ? "#f3f4f6" : "#374151")
        .text(item.label);
    });
  };

  // Network/Graph visualization
  const renderGraph = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Convert tree to nodes and links
    const root = d3.hierarchy(data);
    const nodes = root.descendants().map(d => ({
      id: d.data.summary,
      ...d.data,
      x: Math.random() * width,
      y: Math.random() * height
    }));

    const links = root.links().map(d => ({
      source: d.source.data.summary,
      target: d.target.data.summary
    }));

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .style("stroke", document.documentElement.classList.contains('dark') ? "#6b7280" : "#999")
      .style("stroke-width", 2);

    // Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", 15)
      .style("fill", d => {
        if (d.anomaly) return "#ef4444"; // red-500
        if (d.recommended) return "#22c55e"; // green-500
        return "#3b82f6"; // blue-500
      })
      .style("stroke", document.documentElement.classList.contains('dark') ? "#e5e7eb" : "#374151")
      .style("stroke-width", 2);

    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", document.documentElement.classList.contains('dark') ? "#f3f4f6" : "#374151")
      .text(d => d.id.substring(0, 8) + (d.id.length > 8 ? "..." : ""));

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(20, 20)`);

    const legendData = [
      { color: "#22c55e", label: "Recommended" }, // green-500
      { color: "#3b82f6", label: "Normal" },      // blue-500
      { color: "#ef4444", label: "Anomaly" }      // red-500
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("circle")
        .attr("r", 6)
        .style("fill", item.color);

      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .style("font-size", "12px")
        .style("fill", document.documentElement.classList.contains('dark') ? "#f3f4f6" : "#374151")
        .text(item.label);
    });
  };

  useEffect(() => {
    if (activeTab === "tree") {
      renderTree();
    } else {
      renderGraph();
    }
  }, [activeTab, data, dimensions]);

  return (
    <>
      {/* Backdrop for expanded mode */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <div 
        className={`${
          isExpanded 
            ? "fixed top-[5%] left-[5%] right-[5%] bottom-[5%] z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 overflow-auto" 
            : "w-full relative"
        } transition-all duration-300`}
      >
        {/* Header with tabs and expand button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex border-b border-gray-300 dark:border-gray-600 flex-1">
            <button
              onClick={() => setActiveTab("tree")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "tree"
                  ? "border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              🌳 Tree View
            </button>
            <button
              onClick={() => setActiveTab("graph")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "graph"
                  ? "border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              🕸️ Network View
            </button>
          </div>
          
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={isExpanded ? "Exit fullscreen (Esc)" : "Expand to fullscreen"}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>

      {/* Visualization Container */}
      <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-sm">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        />
      </div>

      {/* Info Panel */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {activeTab === "tree" ? "Tree View" : "Network View"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {activeTab === "tree"
            ? "Hierarchical representation showing the branching structure from top to bottom."
            : "Interactive network view where you can drag nodes to explore relationships. Nodes repel each other for better visibility."}
        </p>
      </div>
    </div>
    </>
  );
}
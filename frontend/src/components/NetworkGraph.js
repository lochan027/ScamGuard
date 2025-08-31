import React, { useEffect, useRef, useState } from 'react';
import './NetworkGraph.css';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

const NetworkGraph = ({ data, onNodeClick }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!data.nodes || data.nodes.length === 0) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = Math.max(600, window.innerHeight - 200);

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        setZoom(event.transform.k);
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Create main group for zoom
    const g = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.edges)
      .enter()
      .append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Create nodes
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    nodes.append('circle')
      .attr('r', d => Math.max(8, Math.min(20, d.riskScore / 5)))
      .attr('fill', d => getNodeColor(d.riskCategory))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip)
      .on('click', handleNodeClick);

    // Add labels to nodes
    nodes.append('text')
      .text(d => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label)
      .attr('x', 0)
      .attr('y', d => Math.max(8, Math.min(20, d.riskScore / 5)) + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .attr('pointer-events', 'none');

    // Add risk score labels
    nodes.append('text')
      .text(d => d.riskScore)
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
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

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [data]);

  const getNodeColor = (riskCategory) => {
    switch (riskCategory) {
      case 'scam': return '#ef4444';
      case 'suspicious': return '#f59e0b';
      case 'safe': return '#10b981';
      default: return '#6b7280';
    }
  };

  const showTooltip = (event, d) => {
    const tooltipContent = `
      <div class="graph-tooltip">
        <h4>${d.label}</h4>
        <p><strong>Risk Score:</strong> ${d.riskScore}/100</p>
        <p><strong>Category:</strong> ${d.riskCategory}</p>
        <p><strong>Type:</strong> ${d.type}</p>
        <p><strong>Timestamp:</strong> ${new Date(d.timestamp?.toDate?.() || d.timestamp).toLocaleString()}</p>
      </div>
    `;
    
    setTooltip({
      content: tooltipContent,
      x: event.pageX + 10,
      y: event.pageY - 10
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  const handleNodeClick = (event, d) => {
    setSelectedNode(d);
    if (onNodeClick) {
      onNodeClick(d);
    }
  };

  const handleZoomIn = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().scaleBy, 1.5
    );
  };

  const handleZoomOut = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().scaleBy, 1 / 1.5
    );
  };

  const handleReset = () => {
    d3.select(svgRef.current).transition().call(
      d3.zoom().transform, d3.zoomIdentity
    );
  };

  const getLegendItems = () => {
    const categories = [
      { category: 'safe', label: 'Safe', color: '#10b981' },
      { category: 'suspicious', label: 'Suspicious', color: '#f59e0b' },
      { category: 'scam', label: 'Scam', color: '#ef4444' }
    ];

    return categories.map(item => (
      <div key={item.category} className="legend-item">
        <div 
          className="legend-color" 
          style={{ backgroundColor: item.color }}
        ></div>
        <span className="legend-label">{item.label}</span>
      </div>
    ));
  };

  if (!data.nodes || data.nodes.length === 0) {
    return (
      <div className="graph-container empty">
        <div className="empty-state">
          <Info size={48} color="#6b7280" />
          <h3>No Network Data</h3>
          <p>Submit some content to see the network visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-container" ref={containerRef}>
      {/* Graph Controls */}
      <div className="graph-controls">
        <button onClick={handleZoomIn} className="control-btn" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className="control-btn" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={handleReset} className="control-btn" title="Reset View">
          <RotateCcw size={20} />
        </button>
        <div className="zoom-level">Zoom: {Math.round(zoom * 100)}%</div>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <h4>Risk Categories</h4>
        {getLegendItems()}
        <div className="legend-info">
          <p>Node size = Risk Score</p>
          <p>Connections = Similar Content</p>
        </div>
      </div>

      {/* Network Graph */}
      <svg ref={svgRef} className="network-svg"></svg>

      {/* Tooltip */}
      {tooltip && (
        <div 
          className="graph-tooltip-container"
          style={{ left: tooltip.x, top: tooltip.y }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="selected-node-info">
          <h4>Selected Node</h4>
          <div className="node-details">
            <p><strong>Content:</strong> {selectedNode.label}</p>
            <p><strong>Risk Score:</strong> {selectedNode.riskScore}/100</p>
            <p><strong>Category:</strong> {selectedNode.riskCategory}</p>
            <p><strong>Type:</strong> {selectedNode.type}</p>
          </div>
          <button 
            onClick={() => setSelectedNode(null)}
            className="close-btn"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GraphNode, GraphEdge, LoreEntry } from './types';
import { AppTheme } from './NoteTaskApp';
import { Users, Aperture, Package, Link as LinkIcon, Maximize2, Minimize2, Share2 } from 'lucide-react';

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentTheme: AppTheme;
  onNodeClick: (nodeId: string) => void;
  activeProjectName: string | null;
}

const NODE_RADIUS = 25;
const CHARACTER_COLOR = "#818CF8"; // Indigo-400
const ARCANA_COLOR = "#F472B6"; // Pink-400
const OTHER_LORE_COLOR = "#60A5FA"; // Blue-400

const GraphView: React.FC<GraphViewProps> = ({ nodes: initialNodes, edges, currentTheme, onNodeClick, activeProjectName }) => {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState("0 0 800 600"); // Initial viewBox
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    // Update internal nodes state if initialNodes prop changes (e.g., project switch)
    setNodes(initialNodes.map(n => ({...n, x: n.x || Math.random() * 700 + 50, y: n.y || Math.random() * 500 + 50})));
  }, [initialNodes]);

  const getNodeColor = (type: LoreEntry['type']) => {
    switch (type) {
      case 'Character': return CHARACTER_COLOR;
      case 'ArcanaSystem': return ARCANA_COLOR;
      default: return OTHER_LORE_COLOR;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && svgRef.current) {
      setDraggingNode(nodeId);
      const CTM = svgRef.current.getScreenCTM();
      if (CTM) {
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const transformedPoint = svgPoint.matrixTransform(CTM.inverse());
        setOffset({ x: transformedPoint.x - node.x, y: transformedPoint.y - node.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNode && svgRef.current) {
      const CTM = svgRef.current.getScreenCTM();
      if (CTM) {
          const svgPoint = svgRef.current.createSVGPoint();
          svgPoint.x = e.clientX;
          svgPoint.y = e.clientY;
          const transformedPoint = svgPoint.matrixTransform(CTM.inverse());

          setNodes(prevNodes =>
            prevNodes.map(n =>
              n.id === draggingNode
                ? { ...n, x: transformedPoint.x - offset.x, y: transformedPoint.y - offset.y }
                : n
            )
          );
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };
  
  const handleNodeClick = (nodeId: string) => {
    if (draggingNode) return; // Don't trigger click if it was a drag end
    onNodeClick(nodeId);
  };

  const handleZoom = (delta: number) => {
    const newZoomLevel = Math.max(0.2, Math.min(3, zoomLevel * delta));
    setZoomLevel(newZoomLevel);
    // This simple zoom just scales the viewbox; more advanced zoom might center on cursor
    const vb = viewBox.split(" ").map(Number);
    const newWidth = 800 / newZoomLevel;
    const newHeight = 600 / newZoomLevel;
    // Simple zoom from center
    const newX = vb[0] + (vb[2] - newWidth) / 2;
    const newY = vb[1] + (vb[3] - newHeight) / 2;
    setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
  };


  if (!initialNodes || initialNodes.length === 0) {
    return (
      <div className={`${currentTheme.cardBg} p-6 rounded-xl shadow-lg text-center`}>
        <Share2 size={48} className={`mx-auto mb-4 ${currentTheme.text} opacity-50`} />
        <h3 className={`text-xl font-semibold ${currentTheme.text} mb-2`}>
          ไม่มีข้อมูลสำหรับแสดงในกราฟ
        </h3>
        <p className={`${currentTheme.text} opacity-70`}>
          {activeProjectName !== "โปรเจกต์ทั้งหมด" 
            ? `โปรเจกต์ "${activeProjectName}" ยังไม่มีข้อมูลโลก (Lore Entries) หรือความสัมพันธ์ที่สามารถแสดงเป็นกราฟได้`
            : "เพิ่มข้อมูลโลก (Lore Entries) และกำหนดความสัมพันธ์ระหว่างตัวละครเพื่อเริ่มใช้งานกราฟ"}
        </p>
      </div>
    );
  }

  return (
    <div className={`${currentTheme.cardBg} p-4 sm:p-6 rounded-xl shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-semibold ${currentTheme.text} flex items-center`}>
          <Share2 className={`w-5 h-5 mr-2 ${currentTheme.accent.replace('bg-', 'text-')}`} />
          กราฟความสัมพันธ์: {activeProjectName || "โปรเจกต์ทั้งหมด"}
        </h3>
        <div className="flex gap-2">
            <button onClick={() => handleZoom(1.2)} title="ซูมเข้า" className={`${currentTheme.button} p-1.5 rounded-md`}><Maximize2 size={16}/></button>
            <button onClick={() => handleZoom(0.8)} title="ซูมออก" className={`${currentTheme.button} p-1.5 rounded-md`}><Minimize2 size={16}/></button>
        </div>
      </div>
      <div className={`relative w-full h-[60vh] border rounded-lg overflow-hidden ${currentTheme.inputBorder}`}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBox}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves SVG
          className={`${currentTheme.inputBg} bg-opacity-30`}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={currentTheme.text} opacity="0.6" />
            </marker>
          </defs>

          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            // Calculate text position (midpoint of the edge)
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;
            
            // Calculate angle for edge to avoid node overlap
            const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
            const sourceXAdjusted = sourceNode.x + NODE_RADIUS * Math.cos(angle);
            const sourceYAdjusted = sourceNode.y + NODE_RADIUS * Math.sin(angle);
            const targetXAdjusted = targetNode.x - NODE_RADIUS * Math.cos(angle);
            const targetYAdjusted = targetNode.y - NODE_RADIUS * Math.sin(angle);


            return (
              <g key={edge.id}>
                <line
                  x1={sourceXAdjusted}
                  y1={sourceYAdjusted}
                  x2={targetXAdjusted}
                  y2={targetYAdjusted}
                  stroke={currentTheme.text}
                  strokeWidth="1.5"
                  opacity="0.4"
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x={midX}
                    y={midY - 5} // Offset label slightly above the line
                    fill={currentTheme.text}
                    fontSize="10"
                    textAnchor="middle"
                    opacity="0.7"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map(node => (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y}) scale(${hoveredNode === node.id ? 1.1 : 1})`}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-grab active:cursor-grabbing transition-transform duration-150 ease-out"
            >
              <circle
                r={NODE_RADIUS}
                fill={node.color || getNodeColor(node.type)}
                stroke={hoveredNode === node.id ? currentTheme.accent.replace('bg-','') : currentTheme.divider.replace('border-','')}
                strokeWidth={hoveredNode === node.id ? 3 : 2}
                className="transition-all duration-150"
              />
              <text
                textAnchor="middle"
                y={NODE_RADIUS + 14} // Position below the circle
                fontSize="10"
                fill={currentTheme.text}
                className="select-none pointer-events-none"
              >
                {node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label}
              </text>
               {node.type === 'Character' && <Users size={16} x={-8} y={-8} color={currentTheme.cardBg} opacity="0.7"/>}
               {node.type === 'ArcanaSystem' && <Aperture size={16} x={-8} y={-8} color={currentTheme.cardBg} opacity="0.7"/>}
               {node.type !== 'Character' && node.type !== 'ArcanaSystem' && <Package size={16} x={-8} y={-8} color={currentTheme.cardBg} opacity="0.7"/>}
            </g>
          ))}
        </svg>
      </div>
       <p className={`${currentTheme.text} text-xs text-center opacity-60 mt-3`}>
        ลากโหนดเพื่อจัดเรียง | คลิกที่โหนดเพื่อดูรายละเอียด (จำลอง) | ใช้ปุ่ม +/- เพื่อซูม
      </p>
    </div>
  );
};

export default GraphView;

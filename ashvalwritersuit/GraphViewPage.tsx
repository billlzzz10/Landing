
import React from 'react';
import GraphView from './GraphView'; // Assuming GraphView.tsx is the component
import { GraphNode, GraphEdge } from './types';
import { AppTheme } from './NoteTaskApp';

interface GraphViewPageProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentTheme: AppTheme;
  onNodeClick: (nodeId: string) => void;
  activeProjectName: string | null;
}

const GraphViewPage: React.FC<GraphViewPageProps> = (props) => {
  return <GraphView {...props} />;
};

export default GraphViewPage;

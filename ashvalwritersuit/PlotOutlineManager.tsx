
import React, { useState, useCallback, useMemo } from 'react';
import { PlotOutlineNode, AppTheme } from './types';
import PlotOutlineNodeItem from './PlotOutlineNodeItem';
import PlotOutlineModal from './PlotOutlineModal';
import { Plus, GitBranch } from 'lucide-react';

interface PlotOutlineManagerProps {
  plotOutlines: PlotOutlineNode[];
  setPlotOutlines: React.Dispatch<React.SetStateAction<PlotOutlineNode[]>>;
  activeProjectId: string | null;
  currentTheme: AppTheme;
}

const PlotOutlineManager: React.FC<PlotOutlineManagerProps> = ({
  plotOutlines,
  setPlotOutlines,
  activeProjectId,
  currentTheme,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingNode, setEditingNode] = useState<PlotOutlineNode | null>(null);
  const [parentNodeIdForNew, setParentNodeIdForNew] = useState<string | null>(null);

  const projectPlotOutlines = useMemo(() => {
    return plotOutlines.filter(node => node.projectId === activeProjectId);
  }, [plotOutlines, activeProjectId]);

  const getChildren = useCallback((parentId: string | null): PlotOutlineNode[] => {
    return projectPlotOutlines
      .filter(node => node.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }, [projectPlotOutlines]);

  const handleOpenModalForNew = (parentId: string | null = null) => {
    setEditingNode(null);
    setParentNodeIdForNew(parentId);
    setShowModal(true);
  };

  const handleOpenModalForEdit = (node: PlotOutlineNode) => {
    setEditingNode(node);
    setParentNodeIdForNew(null); // Not adding, but editing
    setShowModal(true);
  };

  const handleSaveNode = (text: string) => {
    if (editingNode) {
      // Edit existing node
      setPlotOutlines(prev =>
        prev.map(node =>
          node.id === editingNode.id ? { ...node, text } : node
        )
      );
    } else {
      // Add new node
      const siblings = getChildren(parentNodeIdForNew);
      const newOrder = siblings.length; // 0-indexed order

      const newNode: PlotOutlineNode = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        text,
        parentId: parentNodeIdForNew,
        order: newOrder,
        projectId: activeProjectId,
        createdAt: new Date().toISOString(),
      };
      setPlotOutlines(prev => [...prev, newNode]);
    }
    setShowModal(false);
    setEditingNode(null);
    setParentNodeIdForNew(null);
  };

  const handleDeleteNodeRecursive = (nodeId: string) => {
    let idsToDelete = new Set<string>([nodeId]);
    let queue = [nodeId];

    while (queue.length > 0) {
      const currentParentId = queue.shift();
      const children = plotOutlines.filter(node => node.parentId === currentParentId);
      children.forEach(child => {
        idsToDelete.add(child.id);
        queue.push(child.id);
      });
    }
    
    // After deleting, re-order siblings
    const nodeToDelete = plotOutlines.find(n => n.id === nodeId);
    const parentIdOfDeleted = nodeToDelete?.parentId;

    setPlotOutlines(prev => {
        const remainingNodes = prev.filter(node => !idsToDelete.has(node.id));
        if (parentIdOfDeleted !== undefined) { // Could be null for root
            const siblings = remainingNodes
                .filter(n => n.parentId === parentIdOfDeleted && n.projectId === activeProjectId)
                .sort((a, b) => a.order - b.order);
            
            return remainingNodes.map(n => {
                if (n.parentId === parentIdOfDeleted && n.projectId === activeProjectId) {
                    const newOrder = siblings.findIndex(s => s.id === n.id);
                    return { ...n, order: newOrder };
                }
                return n;
            });
        }
        return remainingNodes;
    });
  };
  
  const handleMoveNode = (nodeId: string, direction: 'up' | 'down') => {
    setPlotOutlines(prev => {
      const allNodes = [...prev];
      const nodeToMove = allNodes.find(n => n.id === nodeId);
      if (!nodeToMove) return prev;

      const siblings = allNodes
        .filter(n => n.parentId === nodeToMove.parentId && n.projectId === activeProjectId)
        .sort((a, b) => a.order - b.order);
      
      const currentIndex = siblings.findIndex(n => n.id === nodeId);

      if (direction === 'up' && currentIndex > 0) {
        const prevSibling = siblings[currentIndex - 1];
        // Swap orders by modifying the original items in allNodes
        const nodeToMoveInAll = allNodes.find(n => n.id === nodeToMove.id)!;
        const prevSiblingInAll = allNodes.find(n => n.id === prevSibling.id)!;
        
        // Store original order before changing
        const originalNodeToMoveOrder = nodeToMoveInAll.order;
        nodeToMoveInAll.order = prevSiblingInAll.order;
        prevSiblingInAll.order = originalNodeToMoveOrder;

      } else if (direction === 'down' && currentIndex < siblings.length - 1) {
        const nextSibling = siblings[currentIndex + 1];
         // Swap orders
        const nodeToMoveInAll = allNodes.find(n => n.id === nodeToMove.id)!;
        const nextSiblingInAll = allNodes.find(n => n.id === nextSibling.id)!;
        
        // Store original order before changing
        const originalNodeToMoveOrder = nodeToMoveInAll.order;
        nodeToMoveInAll.order = nextSiblingInAll.order;
        nextSiblingInAll.order = originalNodeToMoveOrder;
      }
      // Return a new array to trigger re-render
      return [...allNodes]; 
    });
  };

  const rootNodes = getChildren(null);

  // Removed the internal renderChildren function. 
  // PlotOutlineNodeItem will handle its own children rendering.

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}>
          <GitBranch className={`w-6 h-6 mr-2 ${currentTheme.accent.replace('bg-', 'text-')}`} />
          โครงเรื่อง ({projectPlotOutlines.length} จุด)
        </h2>
        <button
          onClick={() => handleOpenModalForNew(null)}
          className={`${currentTheme.button} text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm`}
        >
          <Plus className="w-4 h-4 mr-1.5" /> เพิ่มจุดโครงเรื่องหลัก
        </button>
      </div>

      {projectPlotOutlines.length === 0 ? (
        <p className={`${currentTheme.text} opacity-70 italic text-center py-8`}>
          {activeProjectId ? 'โปรเจกต์นี้ยังไม่มีโครงเรื่อง เริ่มสร้างจุดโครงเรื่องหลักได้เลย!' : 'กรุณาเลือกโปรเจกต์เพื่อจัดการโครงเรื่อง หรือสร้างโปรเจกต์ใหม่'}
        </p>
      ) : (
        // Render root nodes; PlotOutlineNodeItem will handle recursion
        <div>
          {rootNodes.map((node, index, arr) => (
            <PlotOutlineNodeItem
              key={node.id}
              node={node}
              level={0}
              currentTheme={currentTheme}
              onEdit={handleOpenModalForEdit}
              onDelete={handleDeleteNodeRecursive}
              onAddChild={() => handleOpenModalForNew(node.id)}
              onMove={handleMoveNode}
              getChildren={getChildren} // Pass the getChildren function
              canMoveUp={node.order > 0}
              canMoveDown={node.order < arr.length - 1}
            />
          ))}
        </div>
      )}

      <PlotOutlineModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingNode(null); setParentNodeIdForNew(null);}}
        onSave={handleSaveNode}
        initialText={editingNode ? editingNode.text : ''}
        currentTheme={currentTheme}
        editingNodeId={editingNode?.id}
      />
    </div>
  );
};

export default PlotOutlineManager;
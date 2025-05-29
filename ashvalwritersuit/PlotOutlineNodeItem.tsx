import React from 'react';
import { PlotOutlineNode } from './types';
import { AppTheme } from './types';
import { Edit3, Trash2, PlusCircle, ArrowUpCircle, ArrowDownCircle, ChevronRight, CornerDownRight } from 'lucide-react';

interface PlotOutlineNodeItemProps {
  node: PlotOutlineNode;
  level: number;
  currentTheme: AppTheme;
  onEdit: (node: PlotOutlineNode) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (nodeId: string, direction: 'up' | 'down') => void;
  getChildren: (parentId: string | null) => PlotOutlineNode[];
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const PlotOutlineNodeItem: React.FC<PlotOutlineNodeItemProps> = ({
  node,
  level,
  currentTheme,
  onEdit,
  onDelete,
  onAddChild,
  onMove,
  getChildren, 
  canMoveUp,
  canMoveDown,
}) => {
  const IndentIcon = level > 0 ? CornerDownRight : ChevronRight;
  const directChildrenData = getChildren(node.id);
  const actionButtonClass = "p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200";

  return (
    <div className={`${currentTheme.cardBg} bg-opacity-50 p-3 rounded-lg mb-2 shadow-sm group`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-grow min-w-0">
          <span style={{ paddingLeft: `${level * 20}px` }} className="flex items-center">
            <IndentIcon size={16} className={`${currentTheme.text} opacity-60 mr-2 flex-shrink-0`} />
          </span>
          <p className={`${currentTheme.text} text-sm break-words flex-grow`}>{node.text}</p>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onAddChild(node.id)} title="เพิ่มจุดย่อย" className={`${currentTheme.text} ${actionButtonClass}`}>
            <PlusCircle size={16} />
          </button>
          <button onClick={() => onEdit(node)} title="แก้ไข" className={`${currentTheme.text} ${actionButtonClass}`}>
            <Edit3 size={16} />
          </button>
          <button onClick={() => onMove(node.id, 'up')} disabled={!canMoveUp} title="เลื่อนขึ้น" className={`${currentTheme.text} ${actionButtonClass} disabled:opacity-30 disabled:cursor-not-allowed`}>
            <ArrowUpCircle size={16} />
          </button>
          <button onClick={() => onMove(node.id, 'down')} disabled={!canMoveDown} title="เลื่อนลง" className={`${currentTheme.text} ${actionButtonClass} disabled:opacity-30 disabled:cursor-not-allowed`}>
            <ArrowDownCircle size={16} />
          </button>
          <button onClick={() => onDelete(node.id)} title="ลบ" className={`text-red-400 hover:text-red-300 ${actionButtonClass} hover:bg-red-500/20`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {directChildrenData.length > 0 && (
        <div className="mt-2">
          {directChildrenData.map((childNode, index, arr) => {
            return (
              <PlotOutlineNodeItem
                key={childNode.id}
                node={childNode}
                level={level + 1}
                currentTheme={currentTheme}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onMove={onMove}
                getChildren={getChildren}
                canMoveUp={childNode.order > 0}
                canMoveDown={childNode.order < arr.length - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlotOutlineNodeItem;
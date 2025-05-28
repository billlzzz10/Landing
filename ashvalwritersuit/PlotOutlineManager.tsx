
import React, { useState, useEffect, useCallback } from 'react';
import { PlotOutlineNode, AppNote, LoreEntry, Project } from './types';
import { AppTheme } from './NoteTaskApp';
import { BarChartHorizontalBig, Plus, Edit3, Trash2, Link, FileText, BookOpen, ChevronDown, ChevronRight, GripVertical, Package, X } from 'lucide-react';

interface PlotOutlineManagerProps {
  plotOutlines: PlotOutlineNode[];
  setPlotOutlines: React.Dispatch<React.SetStateAction<PlotOutlineNode[]>>;
  notes: AppNote[];
  loreEntries: LoreEntry[];
  currentTheme: AppTheme;
  activeProjectId: string | null;
  projects: Project[]; 
}

const PlotOutlineManager: React.FC<PlotOutlineManagerProps> = ({
  plotOutlines,
  setPlotOutlines,
  notes,
  loreEntries,
  currentTheme,
  activeProjectId,
  projects, 
}) => {
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showLinkModal, setShowLinkModal] = useState<PlotOutlineNode | null>(null);
  const [linkType, setLinkType] = useState<'note' | 'lore'>('note');

  const projectPlotOutlines = plotOutlines.filter(node =>
    !activeProjectId || node.projectId === activeProjectId || node.projectId === null
  );

  const getChildren = (parentId: string | null): PlotOutlineNode[] => {
    return projectPlotOutlines
      .filter(node => node.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };
  
  const toggleNodeExpansion = (nodeId: string) => {
    setPlotOutlines(prev => prev.map(node => 
      node.id === nodeId ? { ...node, isExpanded: !(node.isExpanded ?? true) } : node
    ));
  };


  const handleAddNode = (parentId: string | null) => {
    const siblings = getChildren(parentId);
    const newOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.order)) + 1 : 0;
    const newNode: PlotOutlineNode = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      text: 'จุดโครงเรื่องใหม่',
      order: newOrder,
      parentId: parentId,
      childrenIds: [],
      linkedNoteId: null,
      linkedLoreEntryId: null,
      projectId: activeProjectId,
      createdAt: new Date().toISOString(),
      isExpanded: true,
    };
    setPlotOutlines(prev => [...prev, newNode]);
  };

  const handleEditNode = (node: PlotOutlineNode) => {
    setEditingNodeId(node.id);
    setEditText(node.text);
  };

  const handleSaveEdit = (nodeId: string) => {
    setPlotOutlines(prev =>
      prev.map(node =>
        node.id === nodeId ? { ...node, text: editText } : node
      )
    );
    setEditingNodeId(null);
    setEditText('');
  };

  const handleDeleteNode = (nodeId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบจุดโครงเรื่องนี้และจุดย่อยทั้งหมด?')) {
      // Recursive delete might be complex with childrenIds. For now, simple delete.
      // A more robust solution would find all descendant IDs and filter them out.
      const nodeToDelete = plotOutlines.find(n => n.id === nodeId);
      if (nodeToDelete && nodeToDelete.childrenIds.length > 0) {
        alert("การลบจุดโครงเรื่องที่มีจุดย่อยยังไม่รองรับในเวอร์ชันนี้ กรุณาลบจุดย่อยก่อน");
        return;
      }
      setPlotOutlines(prev => prev.filter(node => node.id !== nodeId && node.parentId !== nodeId));
      // Also remove from parent's childrenIds array
      setPlotOutlines(prev => prev.map(p => {
        if (p.childrenIds.includes(nodeId)) {
          return {...p, childrenIds: p.childrenIds.filter(id => id !== nodeId)};
        }
        return p;
      }));
    }
  };
  
  const handleLinkSelection = (nodeId: string, selectedItemId: string | number | null) => {
    setPlotOutlines(prev => prev.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          linkedNoteId: linkType === 'note' ? (selectedItemId as number | null) : null,
          linkedLoreEntryId: linkType === 'lore' ? (selectedItemId as string | null) : null,
        };
      }
      return node;
    }));
    setShowLinkModal(null);
  };
  
  const getLinkedItemName = (node: PlotOutlineNode): string | null => {
    if (node.linkedNoteId) {
      return notes.find(n => n.id === node.linkedNoteId)?.title || null;
    }
    if (node.linkedLoreEntryId) {
      return loreEntries.find(l => l.id === node.linkedLoreEntryId)?.title || null;
    }
    return null;
  };


  const renderPlotNode = (node: PlotOutlineNode, level: number = 0): JSX.Element => {
    const children = getChildren(node.id); // This will be empty if childrenIds is not populated from parent
    const isExpanded = node.isExpanded ?? true;

    return (
      <div key={node.id} className={`ml-${level * 4} py-1.5 group/node`} style={{ paddingLeft: `${level * 1.25}rem`}}>
        <div className={`flex items-center gap-2 p-2 rounded-md hover:bg-white/5 transition-colors ${editingNodeId === node.id ? `${currentTheme.inputBg} bg-opacity-70` : ''}`}>
          <button onClick={() => toggleNodeExpansion(node.id)} className={`${currentTheme.text} opacity-70 hover:opacity-100 p-0.5`} disabled={children.length === 0}>
            {children.length > 0 ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span className="w-4 inline-block"></span>}
          </button>
          {/* <GripVertical size={16} className={`${currentTheme.text} opacity-30 cursor-grab group-hover/node:opacity-60`} /> */}

          {editingNodeId === node.id ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => handleSaveEdit(node.id)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(node.id)}
              className={`flex-grow p-1 text-sm rounded-md ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} focus:outline-none focus:ring-1 ${currentTheme.accent.replace('bg-','focus:ring-')}`}
              autoFocus
            />
          ) : (
            <span className={`${currentTheme.text} text-sm flex-grow cursor-pointer`} onClick={() => handleEditNode(node)}>
              {node.text}
            </span>
          )}
          <div className="flex items-center gap-1.5 opacity-0 group-hover/node:opacity-100 transition-opacity">
            <button onClick={() => handleAddNode(node.id)} title="เพิ่มจุดย่อย" className={`${currentTheme.text} hover:opacity-80 p-1`}><Plus size={14} /></button>
            <button onClick={() => { setShowLinkModal(node); setLinkType('note'); }} title="เชื่อมโยงกับโน้ต/ข้อมูลโลก" className={`${currentTheme.text} hover:opacity-80 p-1`}><Link size={14} /></button>
            <button onClick={() => handleEditNode(node)} title="แก้ไข" className={`${currentTheme.text} hover:opacity-80 p-1`}><Edit3 size={14} /></button>
            <button onClick={() => handleDeleteNode(node.id)} title="ลบ" className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
          </div>
        </div>
        {getLinkedItemName(node) && (
            <div className={`ml-${(level + 1) * 4 + 4} text-xs ${currentTheme.text} opacity-60 mt-0.5 flex items-center`} style={{ paddingLeft: `${(level + 1) * 1.25 + 1}rem`}}>
                 <Link size={10} className="mr-1 opacity-70"/> เชื่อมโยงกับ: {getLinkedItemName(node)} ({node.linkedNoteId ? 'โน้ต' : 'ข้อมูลโลก'})
            </div>
        )}
        {isExpanded && children.length > 0 && (
          <div className="mt-1">
            {children.map(childNode => renderPlotNode(childNode, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const rootNodes = getChildren(null);

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${currentTheme.text} flex items-center`}>
          <BarChartHorizontalBig className={`w-6 h-6 mr-2 ${currentTheme.accent.replace('bg-', 'text-')}`} />
          โครงเรื่อง ({rootNodes.length} จุดหลัก)
        </h2>
        <button
          onClick={() => handleAddNode(null)}
          className={`${currentTheme.button} ${currentTheme.buttonText} px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center text-sm`}
        >
          <Plus className="w-4 h-4 mr-1.5" /> เพิ่มจุดโครงเรื่องหลัก
        </button>
      </div>
      
      {activeProjectId && (
         <p className={`mb-4 text-sm ${currentTheme.text} opacity-80 flex items-center`}>
           <Package size={14} className="mr-1.5 opacity-80"/> กำลังแสดงโครงเรื่องสำหรับโปรเจกต์: {projects.find(p => p.id === activeProjectId)?.name || activeProjectId}
         </p>
      )}


      {rootNodes.length === 0 ? (
        <p className={`${currentTheme.text} opacity-70 italic text-center py-8`}>
          ยังไม่มีโครงเรื่อง เริ่มสร้างจุดโครงเรื่องหลักได้เลย!
        </p>
      ) : (
        <div className={`${currentTheme.cardBg} p-4 rounded-xl shadow-lg`}>
          {rootNodes.map(node => renderPlotNode(node))}
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`${currentTheme.cardBg} rounded-xl p-6 w-full max-w-md shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className={`${currentTheme.text} text-lg font-semibold`}>
                เชื่อมโยง "{showLinkModal.text}" กับ:
                </h4>
                <button 
                    onClick={() => setShowLinkModal(null)} 
                    className={`${currentTheme.textSecondary} hover:text-opacity-100 p-1.5 rounded-md hover:bg-white/10 transition-all`}
                    aria-label="ปิด"
                >
                    <X size={24} />
                </button>
            </div>
            <div className="flex gap-2 mb-3">
                <button 
                    onClick={() => setLinkType('note')}
                    className={`flex-1 py-2 rounded-md text-sm ${linkType === 'note' ? `${currentTheme.button} ${currentTheme.buttonText}` : `${currentTheme.textSecondary} bg-white/5 hover:bg-white/10`}`}
                >โน้ต</button>
                <button 
                    onClick={() => setLinkType('lore')}
                    className={`flex-1 py-2 rounded-md text-sm ${linkType === 'lore' ? `${currentTheme.button} ${currentTheme.buttonText}` : `${currentTheme.textSecondary} bg-white/5 hover:bg-white/10`}`}
                >ข้อมูลโลก</button>
            </div>

            <select
                onChange={(e) => handleLinkSelection(showLinkModal.id, e.target.value === "" ? null : (linkType === 'note' ? Number(e.target.value) : e.target.value) )}
                className={`w-full p-2.5 rounded-lg ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} appearance-none focus:outline-none focus:ring-2 ${currentTheme.accent.replace('bg-','focus:ring-')}`}
                value={linkType === 'note' ? (showLinkModal.linkedNoteId || "") : (showLinkModal.linkedLoreEntryId || "")}
            >
                <option value="">-- ไม่เชื่อมโยง --</option>
                {linkType === 'note' && notes
                    .filter(n => !activeProjectId || n.projectId === activeProjectId || n.projectId === null)
                    .map(note => <option key={note.id} value={note.id}>{note.title}</option>)}
                {linkType === 'lore' && loreEntries
                    .filter(l => !activeProjectId || l.projectId === activeProjectId || l.projectId === null)
                    .map(lore => <option key={lore.id} value={lore.id}>{lore.title} ({lore.type})</option>)}
            </select>
            {/* The primary action is done via select's onChange now, so a dedicated "Save Link" button is less critical here.
                The cancel button remains useful.
            */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotOutlineManager;
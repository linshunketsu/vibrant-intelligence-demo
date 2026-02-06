import React, { useRef, useState, useEffect } from 'react';
import { WorkflowNode, NodeType, BlockType } from '../types';
import { TOOLBAR_ITEMS, ICON_MAP } from '../constants';
import { 
  LayoutGrid, Plus, Trash2, Edit2, AlertTriangle, Check, 
  MoreHorizontal, Calendar, Info, Settings, Sparkles, X
} from 'lucide-react';

interface CanvasProps {
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  onDrop: (e: React.DragEvent, position: { x: number, y: number }) => void;
  onDeleteNode: (id: string) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onUpdateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  onAutoLayout: () => void;
  isAiGenerating?: boolean;
  isReviewing?: boolean;
  onAiAccept?: () => void;
  onAiReject?: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  nodes, 
  selectedNodeId, 
  onNodeSelect, 
  onDrop,
  onDeleteNode,
  onNodeMove,
  onUpdateNode,
  onAutoLayout,
  isAiGenerating = false,
  isReviewing = false,
  onAiAccept,
  onAiReject
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + containerRef.current.scrollLeft - 180; // Center on cursor
      const y = e.clientY - rect.top + containerRef.current.scrollTop - 40;
      onDrop(e, { x, y });
    }
  };

  // Node Dragging Logic
  const handleMouseDown = (e: React.MouseEvent, nodeId: string, initialPos: { x: number, y: number }) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click

    setDraggingNodeId(nodeId);
    
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Mouse pos relative to canvas container (including scroll)
        const mouseX = e.clientX - rect.left + containerRef.current.scrollLeft;
        const mouseY = e.clientY - rect.top + containerRef.current.scrollTop;
        
        setDragOffset({
            x: mouseX - initialPos.x,
            y: mouseY - initialPos.y
        });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + containerRef.current.scrollLeft;
      const mouseY = e.clientY - rect.top + containerRef.current.scrollTop;
      
      const newX = mouseX - dragOffset.x;
      const newY = mouseY - dragOffset.y;
      
      onNodeMove(draggingNodeId, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  useEffect(() => {
    if (draggingNodeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, dragOffset]);


  // Helper to render connections
  const renderConnections = () => {
    return nodes.map((node, index) => {
      if (index === nodes.length - 1) return null;
      const nextNode = nodes[index + 1];

      // Calculate center points
      const w1 = node.type === NodeType.LOGIC ? 160 : 360;
      const w2 = nextNode.type === NodeType.LOGIC ? 160 : 360;
      
      const h1 = node.type === NodeType.LOGIC ? 100 : 200; 
      
      const startX = node.position.x + w1 / 2;
      const startY = node.position.y + h1; // Bottom
      
      const endX = nextNode.position.x + w2 / 2;
      const endY = nextNode.position.y; // Top

      // Bezier Curve
      const distY = Math.abs(endY - startY);
      const cp1y = startY + distY * 0.5;
      const cp2y = endY - distY * 0.5;
      
      const pathData = `M ${startX} ${startY} C ${startX} ${cp1y}, ${endX} ${cp2y}, ${endX} ${endY}`;
      
      // Highlight connections between temp nodes differently
      const isTempConnection = node.isTemporary && nextNode.isTemporary;

      return (
        <g key={`conn-${node.id}-${nextNode.id}`}>
          <path 
            d={pathData} 
            fill="none" 
            stroke={isTempConnection ? "#0F4C81" : "#94a3b8"}
            strokeWidth="3" 
            strokeDasharray="5,5" // optional dash
            className={isTempConnection ? "animate-pulse" : ""}
          />
           <circle cx={endX} cy={endY} r="4" fill={isTempConnection ? "#0F4C81" : "#94a3b8"} />
           <path d={`M ${endX-5} ${endY-8} L ${endX} ${endY} L ${endX+5} ${endY-8}`} stroke={isTempConnection ? "#0F4C81" : "#94a3b8"} fill="none" strokeWidth="2" />
        </g>
      );
    });
  };

  return (
    <div 
      className="flex-1 bg-white/50 relative overflow-hidden flex flex-col"
    >
      {/* AI Generation Overlay */}
      {isAiGenerating && (
         <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 border-[6px] border-[#0F4C81]/20 animate-pulse transition-all"></div>
            <div className="bg-white/90 backdrop-blur px-8 py-6 rounded-2xl shadow-2xl border border-blue-100 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                <div className="p-3 bg-blue-50 rounded-full">
                    <Sparkles className="text-[#0F4C81] animate-pulse" size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-[#0F4C81] font-bold text-lg">AI Architect Working</h3>
                    <p className="text-slate-500 text-sm font-medium">Analyzing requirements & designing workflow...</p>
                </div>
            </div>
         </div>
      )}

      {/* Review Mode Overlay */}
      {isReviewing && !isAiGenerating && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-in slide-in-from-bottom-10 fade-in duration-500">
           <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/50 ring-1 ring-black/5 flex items-center gap-4 pr-3 pl-5 py-3">
              <div className="flex items-center gap-3 border-r border-slate-200/60 pr-4">
                  <div className="bg-blue-50 text-[#0F4C81] p-2 rounded-lg">
                      <Sparkles size={18} fill="currentColor" className="opacity-20" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                         Workflow Generated
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Review the highlighted nodes</span>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={onAiReject}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group"
                >
                   <X size={16} className="group-hover:scale-110 transition-transform"/>
                   Discard
                </button>
                
                <button 
                  onClick={onAiAccept}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#09355E] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                >
                   <Check size={16} strokeWidth={3} />
                   Accept Workflow
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Canvas Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-1 py-1">
        <button 
          onClick={onAutoLayout}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
        >
          <LayoutGrid size={14} />
          AutoLayout
        </button>
        <div className="w-px h-4 bg-gray-200 mx-2"></div>
        <button className="w-8 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded text-xs">-</button>
        <span className="text-xs font-medium text-slate-600 w-12 text-center">100%</span>
        <button className="w-8 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded text-xs">+</button>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none"></div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative w-full h-full"
        onDragOver={handleDragOver}
        onDrop={handleDropWrapper}
        onClick={(e) => {
            if (e.target === containerRef.current) {
                onNodeSelect(null);
            }
        }}
      >
         {/* Infinite Canvas Area simulation */}
         <div style={{ minWidth: '2000px', minHeight: '3000px', position: 'relative' }}>
            
            {/* Connection Layer */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0">
               {renderConnections()}
            </svg>

            {/* Nodes Layer */}
            {nodes.length === 0 ? (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-gray-400 pointer-events-none select-none opacity-50">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-2xl mb-4 flex items-center justify-center bg-gray-50">
                     <Plus size={32} className="text-gray-300" />
                  </div>
                  <div className="text-center space-y-1">
                     <h3 className="text-lg font-medium text-gray-500">Start building</h3>
                     <p className="text-sm">Drag blocks from the left</p>
                  </div>
               </div>
            ) : (
               nodes.map((node) => (
                 <div
                   key={node.id}
                   style={{
                     position: 'absolute',
                     left: node.position.x,
                     top: node.position.y,
                     zIndex: selectedNodeId === node.id || draggingNodeId === node.id ? 10 : 1,
                     cursor: draggingNodeId === node.id ? 'grabbing' : 'grab'
                   }}
                   onMouseDown={(e) => handleMouseDown(e, node.id, node.position)}
                 >
                    <NodeCard 
                      node={node} 
                      isSelected={selectedNodeId === node.id}
                      onClick={(e) => {
                         onNodeSelect(node.id);
                      }}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteNode(node.id);
                      }}
                      onUpdate={(updates) => onUpdateNode(node.id, updates)}
                    />
                 </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};

// --- Individual Node Components ---

const NodeCard: React.FC<{
  node: WorkflowNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
}> = ({ node, isSelected, onClick, onDelete, onUpdate }) => {
  
  // Temporary Node Styling Overlay
  const isTemp = node.isTemporary;
  const tempStyle = isTemp ? 'border-dashed border-[#0F4C81] ring-2 ring-blue-200 bg-blue-50/50' : '';
  
  const TempBadge = () => isTemp ? (
    <div className="absolute -top-3 -right-2 bg-[#0F4C81] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-20 animate-in fade-in duration-300">
      <Sparkles size={10} /> AI Generated
    </div>
  ) : null;

  // 1. TRIGGER NODE DESIGN
  if (node.type === NodeType.TRIGGER) {
    const events = node.config?.events || [];
    const isConfigured = events.length > 0;

    return (
      <div 
        onClick={onClick}
        className={`
          w-[360px] rounded-[2rem] p-5 border-2 relative transition-all duration-200 shadow-sm hover:shadow-md
          ${isSelected ? 'border-teal-600 bg-emerald-50/95 ring-1 ring-teal-600 shadow-lg scale-[1.01]' : 'border-teal-700/20 bg-emerald-50/90 hover:border-teal-700/40'}
          ${tempStyle}
        `}
      >
        <TempBadge />
        {/* Header */}
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-sm">
             <LayoutGrid size={24} />
          </div>
          <div>
             <h3 className="font-bold text-slate-800 text-base">{node.title}</h3>
             <p className="text-xs text-slate-500 leading-tight mt-0.5 mb-1.5">{node.description || 'Triggered by events'}</p>
             {isConfigured && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 uppercase tracking-wide">
                  <Check size={12} strokeWidth={3} /> Configured
                </div>
             )}
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-teal-100/50 rounded-xl p-3 mb-4 border border-teal-200/50">
           <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
              <MoreHorizontal size={14} className="text-slate-500" />
              Monitoring {events.length || 0} event:
           </div>
           <div className="flex flex-wrap gap-1.5">
              {events.slice(0, 4).map((event: string) => (
                <span key={event} className="bg-teal-200/60 text-teal-900 text-[10px] font-medium px-2 py-1 rounded-md">
                   {event}
                </span>
              ))}
              {events.length > 4 && (
                <span className="bg-teal-200/60 text-teal-900 text-[10px] font-medium px-2 py-1 rounded-md">
                   +{events.length - 4} more
                </span>
              )}
              {events.length === 0 && <span className="text-[10px] text-slate-400 italic">No events selected</span>}
           </div>
        </div>

        {/* Footer */}
        <button 
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on button click
          onClick={onDelete}
          className="w-full py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold bg-white hover:bg-red-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
           <Trash2 size={14} /> Delete
        </button>
      </div>
    );
  }

  // 2. APPOINTMENT NODE DESIGN (SPECIAL)
  if (node.blockType === BlockType.APPOINTMENT) {
    const message = node.config?.messageContent || '';
    const isConfigured = message.length > 0;

    return (
      <div 
        onClick={onClick}
        className={`
          w-[360px] rounded-[2rem] p-5 border-2 relative transition-all duration-200 shadow-sm bg-[#FFFBF0]
          ${isSelected ? 'border-orange-400 ring-1 ring-orange-400 shadow-lg scale-[1.01]' : 'border-orange-200 hover:border-orange-300'}
          ${tempStyle}
        `}
      >
        <TempBadge />
        {/* Header */}
        <div className="flex gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-sm">
             <Calendar size={24} />
          </div>
          <div>
             <h3 className="font-bold text-slate-800 text-base">Appointment</h3>
             <p className="text-xs text-slate-500 leading-tight mt-0.5 mb-1.5">Schedule an appointment with the patient</p>
             {!isConfigured && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">
                  <AlertTriangle size={12} strokeWidth={3} /> Needs Configuration.
                </div>
             )}
          </div>
        </div>

        {/* Info Box */}
        <div className="flex gap-2 mb-4">
             <div className="shrink-0 mt-0.5 text-blue-500 bg-white rounded-full">
                <Info size={18} className="fill-blue-500 text-white" />
             </div>
             <p className="text-xs text-slate-600 leading-relaxed">
                Send a message to the patient to request an appointment.
             </p>
        </div>

        {/* Input Area */}
        <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Send Appointment Request</label>
            <div className="relative">
                <textarea 
                    value={message}
                    onChange={(e) => {
                        const newVal = e.target.value.slice(0, 1000);
                        onUpdate({ config: { ...node.config, messageContent: newVal } });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    placeholder="Edit appointment request message"
                    className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400 text-slate-700"
                />
                <div className="flex justify-between items-center mt-1.5 px-1">
                    <span className="text-[10px] text-gray-400">{message.length}/1000 characters</span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({ config: { ...node.config, messageContent: '' } });
                        }}
                        className="text-[10px] font-medium text-slate-500 hover:text-blue-600 underline decoration-slate-300 hover:decoration-blue-600"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 mt-2">
           <button 
             onMouseDown={(e) => e.stopPropagation()}
             onClick={onDelete}
             className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold bg-white hover:bg-red-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
           >
              <Trash2 size={14} /> Delete
           </button>
           <button 
             onMouseDown={(e) => e.stopPropagation()}
             onClick={onClick} // Selects the node
             className="flex-1 py-2 rounded-lg bg-[#0F4C81] text-white text-xs font-bold hover:bg-[#09355E] flex items-center justify-center gap-2 transition-colors shadow-sm"
           >
              <Settings size={14} /> Configure
           </button>
        </div>
      </div>
    );
  }

  // 3. OTHER ACTION NODES
  if (node.type === NodeType.ACTION) {
    const isMessage = node.blockType === BlockType.SEND_MESSAGE;
    const isConfigured = node.config?.messageContent || node.config?.subject;
    
    // Icon & Color Logic
    const themeColor = isMessage ? 'orange' : 'blue'; 
    const IconComp = ICON_MAP[isMessage ? 'Mail' : 'CheckSquare'] || AlertTriangle;
    
    const bgClass = isMessage ? 'bg-orange-50/90' : 'bg-blue-50/90';
    const borderClass = isMessage 
       ? (isSelected ? 'border-orange-500 ring-1 ring-orange-500 shadow-lg scale-[1.01]' : 'border-orange-200 hover:border-orange-300')
       : (isSelected ? 'border-blue-500 ring-1 ring-blue-500 shadow-lg scale-[1.01]' : 'border-blue-200 hover:border-blue-300');
    
    const iconBgClass = isMessage ? 'bg-orange-400' : 'bg-blue-500';

    // Helper to get array of message types
    const messageTypes = Array.isArray(node.config?.messageType) 
        ? node.config.messageType 
        : (node.config?.messageType ? [node.config.messageType] : []);

    return (
      <div 
        onClick={onClick}
        className={`
          w-[360px] rounded-[2rem] p-5 border-2 relative transition-all duration-200 shadow-sm hover:shadow-md bg-white
          ${borderClass} ${bgClass}
          ${tempStyle}
        `}
      >
        <TempBadge />
        {/* Header */}
        <div className="flex gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl ${iconBgClass} text-white flex items-center justify-center shrink-0 shadow-sm`}>
             <IconComp size={24} />
          </div>
          <div className="min-w-0 flex-1">
             <h3 className="font-bold text-slate-800 text-base truncate">{node.title}</h3>
             <p className="text-xs text-slate-500 leading-tight mt-0.5 mb-1.5 line-clamp-1">{node.description || 'Action'}</p>
             {isConfigured ? (
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 uppercase tracking-wide">
                  <Check size={12} strokeWidth={3} /> Configured
                </div>
             ) : (
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">
                  <AlertTriangle size={12} strokeWidth={3} /> Needs Configuration
                </div>
             )}
          </div>
        </div>

        {/* Content Body */}
        {isMessage && (
           <div className="bg-white rounded-xl p-3 mb-4 border border-gray-100 shadow-sm space-y-2">
              <div className="text-xs">
                 <span className="font-semibold text-slate-700">Message Type: </span>
                 <span className="text-slate-600">
                   {messageTypes.length > 0 
                     ? messageTypes.map((t: string) => t === 'portal' ? 'Portal Chat' : t.toUpperCase()).join(', ') 
                     : 'Not set'}
                 </span>
              </div>
              {node.config?.subject && (
                <div className="text-xs truncate">
                   <span className="font-semibold text-slate-700">Subject: </span>
                   <span className="text-slate-600">{node.config.subject}</span>
                </div>
              )}
               <div className="text-xs truncate">
                   <span className="font-semibold text-slate-700">Message Content: </span>
                   <span className={`text-slate-600 ${!node.config?.messageContent && 'text-red-400 italic'}`}>
                     {node.config?.messageContent ? '(Configured)' : '(Required)'}
                   </span>
                </div>
           </div>
        )}

        {/* Footer */}
        <div className="flex gap-3">
           <button 
             onMouseDown={(e) => e.stopPropagation()}
             onClick={onDelete}
             className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold bg-white hover:bg-red-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
           >
              <Trash2 size={14} /> Delete
           </button>
           <button 
             onMouseDown={(e) => e.stopPropagation()}
             className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold bg-white hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
           >
              <Edit2 size={14} /> Edit
           </button>
        </div>
      </div>
    );
  }

  // 4. LOGIC NODE DESIGN
  if (node.type === NodeType.LOGIC) {
    return (
      <div 
        onClick={onClick}
        className={`
          w-40 h-auto rounded-2xl p-3 border-2 relative transition-all duration-200 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center bg-purple-50
          ${isSelected ? 'border-purple-600 ring-1 ring-purple-600 shadow-lg scale-[1.01]' : 'border-purple-200 hover:border-purple-300'}
          ${tempStyle}
        `}
      >
        <TempBadge />
         <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 shadow-sm">
             {React.createElement(ICON_MAP[node.blockType === BlockType.WAIT ? 'Clock' : 'ShieldCheck'] || AlertTriangle, { size: 20 })}
         </div>
         <span className="text-xs font-bold text-slate-800 leading-tight">
            {node.title === BlockType.REVIEW_APPROVAL ? 'View &\nApproval' : node.title}
         </span>
         
         {isSelected && (
           <button 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={onDelete}
              className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600"
           >
              <Trash2 size={12} />
           </button>
         )}
      </div>
    );
  }

  return null;
};
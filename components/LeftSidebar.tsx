import React, { useState } from 'react';
import { TOOLBAR_ITEMS, ICON_MAP } from '../constants';
import { NodeType, BlockType } from '../types';
import { Wand2, Zap, GitFork } from 'lucide-react';

interface LeftSidebarProps {
  onDragStart: (e: React.DragEvent, type: BlockType, category: NodeType) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onDragStart }) => {
  const [activeTab, setActiveTab] = useState<NodeType>(NodeType.TRIGGER);

  const tabs = [
    { id: NodeType.TRIGGER, label: 'Triggers', icon: Zap },
    { id: NodeType.ACTION, label: 'Actions', icon: Wand2 },
    { id: NodeType.LOGIC, label: 'Logic', icon: GitFork },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 z-10">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors relative ${
                isActive ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Description Area */}
      <div className="p-4 bg-slate-50 border-b border-gray-100">
        <p className="text-xs text-slate-500 leading-relaxed">
          {activeTab === NodeType.TRIGGER && "Triggers are events related to your patients or practice that may need your attentions or response. They are causes of your workflow actions."}
          {activeTab === NodeType.ACTION && "Actions will be taken after a trigger happened. You can select multiple actions in a workflow and customize them."}
          {activeTab === NodeType.LOGIC && "Logic is how you want an action to take place if it's triggered. Wait, Conditional and Loop will activated the connected actions automatically."}
        </p>
      </div>

      {/* Draggable Items Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {TOOLBAR_ITEMS[activeTab].map((item, index) => {
            const Icon = ICON_MAP[item.iconName];
            return (
              <div
                key={index}
                draggable
                onDragStart={(e) => onDragStart(e, item.blockType, item.type)}
                className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-grab active:cursor-grabbing bg-white transition-all group min-h-[6rem] text-center"
              >
                <div className={`p-2 rounded mb-2 transition-colors ${
                   activeTab === NodeType.TRIGGER ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-100' :
                   activeTab === NodeType.ACTION ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' :
                   'bg-orange-50 text-orange-600 group-hover:bg-orange-100'
                }`}>
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-slate-600 leading-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

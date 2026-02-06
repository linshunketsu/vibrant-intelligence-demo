import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Repeat, Settings, Copy, Save, Play, DollarSign, Tag, X, Check, Sparkles } from 'lucide-react';

interface HeaderProps {
  onRunTest?: () => void;
  onBack?: () => void;
  onSave?: (title: string, description: string) => void;
  onManageUsage?: () => void;
  initialTitle?: string;
  initialDescription?: string;
  price?: string | null;
  onSetPrice?: (price: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onRunTest, 
  onBack, 
  onSave,
  onManageUsage,
  initialTitle = 'Untitled Patient Workflow',
  initialDescription = '',
  price,
  onSetPrice
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [tempPrice, setTempPrice] = useState(price || '');
  const priceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (price) setTempPrice(price);
  }, [price]);

  // Handle outside click for price popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
            setIsPriceOpen(false);
        }
    };
    if (isPriceOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPriceOpen]);

  const handleSave = () => {
    if (onSave) {
      onSave(title, description);
    }
  };

  const handleSavePrice = () => {
    if (onSetPrice) {
        onSetPrice(tempPrice && parseFloat(tempPrice) > 0 ? parseFloat(tempPrice).toFixed(2) : null);
    }
    setIsPriceOpen(false);
  };

  const isProgram = !!price && parseFloat(price) > 0;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20 relative shadow-sm">
      <div className="flex items-center gap-4">
        {isProgram ? (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 shadow-sm animate-in fade-in duration-300">
             <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 text-amber-600">
               <Tag size={12} fill="currentColor" />
             </div>
             CLINICAL PROGRAM
             <span className="ml-1 bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-600 font-mono">
               ${price}
             </span>
           </div>
        ) : (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-100 cursor-pointer transition-colors">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon size={12} />
            </div>
            PATIENT WORKFLOW
            <Repeat size={14} className="ml-1" />
          </div>
        )}
        
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
          title="Back to Workflows"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="flex flex-col items-start justify-center flex-1 ml-4">
        <div className="flex items-center gap-2 group">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          />
          <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditIcon size={14} />
          </button>
        </div>
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Edit Workflow description here ..."
          className="text-sm text-gray-500 w-full max-w-md focus:outline-none bg-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Price Button */}
        <div className="relative" ref={priceRef}>
            <button 
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded transition-colors ${
                    isProgram 
                    ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                title="Set Program Price"
            >
                <DollarSign size={16} />
                {isProgram ? `Price: $${price}` : 'Set Price'}
            </button>

            {/* Price Popover */}
            {isPriceOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-amber-100">
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 text-amber-800">
                                <div className="p-1.5 bg-white rounded-md shadow-sm border border-amber-200/50">
                                    <Tag size={16} className="text-amber-600" />
                                </div>
                                <h4 className="font-bold text-sm">Monetize Workflow</h4>
                            </div>
                            <button onClick={() => setIsPriceOpen(false)} className="text-amber-800/50 hover:text-amber-800 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-amber-700/80 mt-2 leading-relaxed font-medium">
                            Turn this workflow into a <strong>Clinical Program</strong> that patients can purchase directly.
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program Price (USD)</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0F4C81] transition-colors">
                                    <DollarSign size={20} strokeWidth={2.5} />
                                </div>
                                <input 
                                    type="number" 
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white transition-all placeholder-slate-300"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 items-start p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                             <Sparkles size={16} className="text-blue-500 mt-0.5 shrink-0" />
                             <div className="text-xs text-blue-700/80 leading-relaxed">
                                 When active, this program will appear in the patient portal marketplace automatically.
                             </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                         {isProgram ? (
                            <button 
                                onClick={() => {
                                    setTempPrice('');
                                    if(onSetPrice) onSetPrice(null);
                                    setIsPriceOpen(false);
                                }}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline px-2"
                            >
                                Remove Price
                            </button>
                         ) : <div></div>}
                         
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setIsPriceOpen(false)}
                                className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSavePrice}
                                className="px-4 py-2 text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#09355E] rounded-md shadow-sm hover:shadow flex items-center gap-1.5 transition-all transform active:scale-95"
                            >
                                <Check size={14} strokeWidth={3} />
                                {isProgram ? 'Update Price' : 'Set Price'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <button 
          onClick={onManageUsage}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
        >
          <Settings size={16} />
          Manage Usage
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors">
          <Copy size={16} />
          Copy to New
        </button>
        <div className="flex flex-col gap-1 items-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Save size={16} />
            Save Workflow
          </button>
          <button 
            onClick={onRunTest}
            className="flex items-center gap-2 px-4 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors w-full justify-center"
          >
            <Play size={12} />
            Run Test
          </button>
        </div>
      </div>
    </header>
  );
};

// Simple internal icons for header
const UserIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const EditIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
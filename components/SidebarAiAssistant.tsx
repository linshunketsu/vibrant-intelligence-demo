import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Bot, Loader2, ArrowUp } from 'lucide-react';

interface SidebarAiAssistantProps {
  history: { role: 'user' | 'assistant'; text: React.ReactNode }[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  placeholder?: string;
  emptyStateMessage?: string;
}

export const SidebarAiAssistant: React.FC<SidebarAiAssistantProps> = ({
  history,
  isProcessing,
  onSendMessage,
  placeholder = "Tell AI Composer what to do...",
  emptyStateMessage = "Ask me to review reports, draft treatment plans, or summarize today's visit."
}) => {
  const [prompt, setPrompt] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    onSendMessage(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <Sparkles size={32} className="text-blue-600 mb-4 opacity-50" />
                    <h4 className="font-bold text-slate-800 text-sm">AI Composer</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{emptyStateMessage}</p>
                </div>
            )}
            {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[90%] p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#0F4C81] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                        {msg.role === 'assistant' && (
                            <div className="flex items-center gap-1.5 mb-1.5 opacity-50">
                                <Bot size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">AI Composer</span>
                            </div>
                        )}
                        {msg.text}
                    </div>
                </div>
            ))}
            {isProcessing && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-3">
                        <Loader2 size={14} className="animate-spin text-[#0F4C81]" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processing...</span>
                    </div>
                </div>
            )}
            <div ref={endRef} />
        </div>
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <form onSubmit={handleSubmit} className="relative">
                <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white resize-none h-24 shadow-inner transition-all"
                    onKeyDown={handleKeyDown}
                />
                <button type="submit" disabled={!prompt.trim() || isProcessing} className="absolute right-2 bottom-3 p-1.5 bg-[#0F4C81] text-white rounded-lg hover:bg-[#09355E] disabled:opacity-30 transition-all shadow-md active:scale-95">
                    <ArrowUp size={16} />
                </button>
            </form>
        </div>
    </div>
  );
};
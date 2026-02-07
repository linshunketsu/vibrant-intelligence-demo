import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Bot, ArrowUp, FileText, Calendar } from 'lucide-react';

interface SidebarAiAssistantProps {
  history: { role: 'user' | 'assistant'; text: React.ReactNode }[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  placeholder?: string;
  emptyStateMessage?: string;
}

// Suggested action chips
const suggestedActions = [
  { icon: FileText, label: "Summarize visit", prompt: "Summarize today's consultation and create a follow-up plan" },
  { icon: Calendar, label: "Order lab test", prompt: "Order Gut Zoomer lab test" },
];

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

  const handleSuggestedAction = (promptText: string) => {
    if (isProcessing) return;
    // Immediately send the message, don't set the prompt state first
    onSendMessage(promptText);
  };

  // Helper to safely convert text content to string for display
  const getTextContent = (text: React.ReactNode): string => {
    if (typeof text === 'string') return text;
    if (text === null || text === undefined) return '';
    return String(text);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50/30 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty State */}
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative z-10 p-3 bg-white rounded-2xl shadow-md border border-blue-100">
                <Sparkles size={24} className="text-[#0F4C81]" />
              </div>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">AI Composer</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-[200px]">{emptyStateMessage}</p>

            {/* Suggested Actions */}
            <div className="mt-5 space-y-2 w-full">
              {suggestedActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSuggestedAction(action.prompt)}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-2.5 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md hover:bg-blue-50/50 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:from-blue-200 group-hover:to-blue-100 transition-colors shadow-sm">
                      <Icon size={12} className="text-blue-700" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message List */}
        {history.map((msg, index) => {
          const isUser = msg.role === 'user';
          const textContent = getTextContent(msg.text);

          // Skip completely empty messages
          if (!textContent && typeof msg.text !== 'object') return null;

          return (
            <div key={`msg-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[90%] p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                isUser
                  ? 'bg-gradient-to-br from-[#0F4C81] to-blue-700 text-white rounded-tr-none shadow-blue-500/10'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-slate-200/50'
              }`}>
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-100">
                    <Bot size={11} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">AI Composer</span>
                  </div>
                )}
                {/* Render text content */}
                {typeof msg.text === 'string' ? (
                  <span>{textContent}</span>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm shadow-slate-200/50 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drafting...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-12 py-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:bg-white focus:border-blue-300 resize-none h-20 shadow-inner transition-all"
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isProcessing}
            className="absolute right-2 bottom-2 p-2.5 bg-gradient-to-r from-[#0F4C81] to-blue-600 text-white rounded-xl hover:from-[#09355E] hover:to-blue-700 disabled:opacity-30 transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <ArrowUp size={16} />
          </button>
        </form>
        <p className="text-[9px] text-slate-400 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
};

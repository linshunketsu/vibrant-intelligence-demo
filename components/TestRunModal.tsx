import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Circle, Loader2, Terminal, PlayCircle, List, Activity } from 'lucide-react';
import { WorkflowNode, NodeType } from '../types';

interface TestRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: WorkflowNode[];
}

type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

interface TestStep {
  id: string;
  label: string;
  subLabel?: string;
  successDesc: string;
  status: StepStatus;
  nodeType?: NodeType;
}

const INITIAL_SYSTEM_STEPS: TestStep[] = [
  { id: 'validation', label: 'Patient Data Validation', successDesc: 'Dummy patients data validated successfully', status: 'pending' },
  { id: 'condition', label: 'Condition Check', successDesc: 'IF condition evaluated to true', status: 'pending' },
  { id: 'notification', label: 'Send Notification', successDesc: 'Test notification sent to dummy patient', status: 'pending' },
  { id: 'update', label: 'Update Records', successDesc: 'Patient records updated in test database', status: 'pending' },
  { id: 'ai', label: 'AI Analysis', successDesc: 'AI processing completed with 95% confidence', status: 'pending' },
];

export const TestRunModal: React.FC<TestRunModalProps> = ({ isOpen, onClose, nodes }) => {
  const [activeTab, setActiveTab] = useState<'test' | 'log'>('test');
  const [testView, setTestView] = useState<'summary' | 'trace'>('summary');
  
  const [systemSteps, setSystemSteps] = useState<TestStep[]>(INITIAL_SYSTEM_STEPS);
  const [nodeSteps, setNodeSteps] = useState<TestStep[]>([]);
  
  const [isWorkflowSuccess, setIsWorkflowSuccess] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (isOpen) {
      // 1. Initialize
      setLogs(['> Initializing test runner...', '> Loading mock patient context (ID: P-9982)...']);
      setIsWorkflowSuccess(false);
      setActiveTab('test');
      setTestView('summary');
      setSystemSteps(INITIAL_SYSTEM_STEPS);

      // 2. Prepare Node Steps
      const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
      const generatedNodeSteps: TestStep[] = sortedNodes.map(node => ({
        id: node.id,
        label: node.title,
        subLabel: node.type,
        successDesc: getSuccessMessage(node),
        status: 'pending',
        nodeType: node.type
      }));
      setNodeSteps(generatedNodeSteps);
      
      // 3. Start Combined Simulation
      runCombinedSimulation(generatedNodeSteps);
    }
  }, [isOpen, nodes]);

  const getSuccessMessage = (node: WorkflowNode): string => {
    if (node.type === NodeType.TRIGGER) return `Event '${node.config?.events?.[0] || 'Trigger'}' detected.`;
    if (node.type === NodeType.ACTION) {
       if (node.blockType === 'Send Message') return `Message sent to patient (simulated).`;
       return `Action executed successfully.`;
    } 
    if (node.type === NodeType.LOGIC) return `Condition met. Proceeding to next step.`;
    return `Step processed.`;
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runCombinedSimulation = async (initialNodeSteps: TestStep[]) => {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(500);

    // --- Phase 1: System Checks ---
    addLog('Starting System Integrity Checks...');
    const sysSteps = [...INITIAL_SYSTEM_STEPS];
    
    for (let i = 0; i < sysSteps.length; i++) {
        const stepId = sysSteps[i].id;
        
        // Running
        setSystemSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: 'running' } : s));
        addLog(`Verifying: ${sysSteps[i].label}...`);
        
        await delay(400 + Math.random() * 300);

        // Completed
        setSystemSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: 'completed' } : s));
        addLog(`OK: ${sysSteps[i].label}`);
    }

    addLog('System Checks Passed. Starting Workflow Node Trace...');
    
    // --- Phase 2: Node Execution ---
    const nSteps = [...initialNodeSteps];
    for (let i = 0; i < nSteps.length; i++) {
        const stepId = nSteps[i].id;
        
        // Running
        setNodeSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: 'running' } : s));
        addLog(`Executing Node: [${nSteps[i].label}]`);
        
        await delay(300 + Math.random() * 200);

        // Completed
        setNodeSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: 'completed' } : s));
        addLog(`Step Complete: ${nSteps[i].label}`);
    }

    await delay(200);
    setIsWorkflowSuccess(true);
    addLog('WORKFLOW EXECUTION COMPLETED SUCCESSFULLY');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl min-h-[600px] max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#f8f8f8]/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <PlayCircle size={20} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-800">Test Patient Workflow Execution</h2>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-gray-100">
           <button 
             onClick={() => setActiveTab('test')}
             className={`mr-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'test' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
              <CheckCircle2 size={16} /> Test Run
           </button>
           <button 
             onClick={() => setActiveTab('log')}
             className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'log' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           >
              <Terminal size={16} /> Log View
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8f8f8]/30 flex flex-col">
           {activeTab === 'test' ? (
              <>
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-slate-500 px-1">
                      Verification results for <strong>Sarah Jenkins (ID: P-9982)</strong>.
                    </p>
                    
                    {/* View Toggle */}
                    <div className="bg-slate-200 p-1 rounded-lg flex text-xs font-semibold">
                       <button 
                         onClick={() => setTestView('summary')}
                         className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${testView === 'summary' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          <List size={14} /> Summary
                       </button>
                       <button 
                         onClick={() => setTestView('trace')}
                         className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${testView === 'trace' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          <Activity size={14} /> Node Trace
                       </button>
                    </div>
                 </div>
                 
                 {/* Overall Success Banner */}
                 {isWorkflowSuccess && (
                    <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg animate-in slide-in-from-top-2 duration-300 border border-emerald-100 mb-6 shrink-0">
                       <div className="mt-1">
                          <CheckCircle2 size={22} className="text-emerald-500" />
                       </div>
                       <div>
                          <h4 className="font-semibold text-slate-800 text-sm">Workflow Tested Successful</h4>
                          <p className="text-sm text-slate-500 mt-1">Workflow test run is successful.</p>
                       </div>
                    </div>
                 )}

                 {/* Steps List */}
                 <div className="space-y-3 flex-1">
                    {(testView === 'summary' ? systemSteps : nodeSteps).map((step, index) => (
                        <div 
                          key={step.id}
                          className={`
                            flex items-start gap-4 p-4 rounded-lg border transition-all duration-300
                            ${step.status === 'completed' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100'}
                            ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}
                            ${step.status === 'running' ? 'border-blue-200 bg-blue-50/30 shadow-sm transform scale-[1.01]' : ''}
                          `}
                        >
                          <div className="mt-1 relative">
                              {step.status === 'completed' && <CheckCircle2 size={22} className="text-emerald-500" />}
                              {step.status === 'running' && <Loader2 size={22} className="text-blue-500 animate-spin" />}
                              {step.status === 'pending' && <Circle size={22} className="text-slate-300" />}
                              
                              {/* Visual connector line for trace view */}
                              {testView === 'trace' && index < nodeSteps.length - 1 && (
                                  <div className={`absolute top-6 left-[10px] w-0.5 h-full -z-10 ${step.status === 'completed' ? 'bg-emerald-200' : 'bg-slate-200'}`} style={{ height: 'calc(100% + 2rem)' }}></div>
                              )}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className={`font-semibold text-sm ${step.status === 'completed' ? 'text-slate-800' : 'text-slate-600'}`}>
                                    {step.label}
                                </h4>
                                {step.subLabel && testView === 'trace' && (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        {step.subLabel}
                                    </span>
                                )}
                              </div>
                              
                              {step.status === 'completed' && (
                                <p className="text-xs text-slate-500 mt-1">{step.successDesc}</p>
                              )}
                              {step.status === 'running' && (
                                <p className="text-xs text-blue-500 mt-1 italic animate-pulse">Processing...</p>
                              )}
                          </div>
                        </div>
                    ))}
                    
                    {testView === 'trace' && nodeSteps.length === 0 && (
                        <div className="text-center py-10 text-slate-400 italic">
                            No nodes found in workflow to trace.
                        </div>
                    )}
                 </div>
              </>
           ) : (
              <div 
                ref={logContainerRef}
                className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 h-full overflow-y-auto shadow-inner border border-slate-700"
              >
                 {logs.map((log, i) => (
                    <div key={i} className="mb-1.5 break-words font-light tracking-wide border-l-2 border-transparent hover:border-green-600 pl-2 transition-colors">
                        {log}
                    </div>
                 ))}
                 <div className="animate-pulse pl-2">_</div>
              </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
           <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
           >
              Done
           </button>
        </div>
      </div>
    </div>
  );
};
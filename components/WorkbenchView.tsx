import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Canvas } from './Canvas';
import { EmailTemplateModal } from './EmailTemplateModal';
import { FormBuilderModal } from './FormBuilderModal';
import { TestRunModal } from './TestRunModal';
import { ManageUsageModal } from './ManageUsageModal';
import { WorkflowNode, NodeType, BlockType } from '../types';
import { FormTemplate, FormField } from '../formTypes';
import { FormTemplatesHome } from './form/FormTemplatesHome';
import { FormBuilder } from './form/FormBuilder';
import {
  Search, Plus, LayoutGrid, DollarSign, FileText,
  GitBranch, Archive, Edit3, Trash2, Move, UserCircle2,
  Building2, ChevronLeft, ChevronRight, Settings, ListFilter,
  Users, User, FileSpreadsheet, ShoppingCart, Key
} from 'lucide-react';

const uuid = () => Math.random().toString(36).substr(2, 9);

// The existing complex workflow, now saved as "Patient Purchase"
const PATIENT_PURCHASE_NODES: WorkflowNode[] = [
  {
    id: 'step-1',
    type: NodeType.TRIGGER,
    blockType: BlockType.ORDER_UPDATE,
    title: 'Order Update',
    description: 'Trigger: Order Created',
    isValid: true,
    tags: ['Order Created'],
    config: { events: ['Order Created'] },
    position: { x: 400, y: 50 }
  },
  {
    id: 'step-2',
    type: NodeType.ACTION,
    blockType: BlockType.SEND_MESSAGE,
    title: 'Send Message',
    description: 'Action: Purchase confirmation',
    isValid: true,
    config: { 
      messageType: ['email'], 
      subject: 'Order Confirmation #{order_id} - {clinic_name}',
      messageContent: `Dear {patient_name},\n\nThank you for your order with {clinic_name}. We have received your request and are currently processing it.\n\nOrder Details\n--------------------------------------------------\nOrder Number: {order_id}\nStatus: Processing\n\nNext Steps:\n1. Your test kit will be shipped to the address on file within 1-2 business days.\n2. Once shipped, you will receive a tracking number via email.\n3. Please log in to the patient portal to review any pre-test instructions: {portal_link}\n\nIf you have any questions or need to update your shipping address, please contact us immediately.\n\nWarm regards,\n\nThe Team at {clinic_name}\n(555) 123-4567`,
      selectedTemplateId: 'tpl_order_conf'
    },
    position: { x: 400, y: 300 }
  },
  {
    id: 'step-4',
    type: NodeType.TRIGGER,
    blockType: BlockType.ORDER_UPDATE,
    title: 'Order Update',
    description: 'Trigger: Kit Delivered',
    isValid: true,
    tags: ['Kit Delivered'],
    config: { events: ['Kit Delivered'] },
    position: { x: 400, y: 550 }
  },
  {
    id: 'step-5',
    type: NodeType.TRIGGER,
    blockType: BlockType.ORDER_UPDATE,
    title: 'Order Update',
    description: 'Trigger: Kit Returned',
    isValid: true,
    tags: ['Kit Returned'],
    config: { events: ['Kit Returned'] },
    position: { x: 400, y: 800 }
  },
  {
    id: 'step-6',
    type: NodeType.TRIGGER,
    blockType: BlockType.REPORT_UPDATE,
    title: 'Report Update',
    description: 'Trigger: Results Ready',
    isValid: true,
    tags: ['Report Ready'],
    config: { events: ['Report Ready'] },
    position: { x: 400, y: 1050 }
  },
  {
    id: 'step-8',
    type: NodeType.ACTION,
    blockType: BlockType.SEND_MESSAGE,
    title: 'Send Message',
    description: 'Action: Questionnaire Request',
    isValid: true,
    config: { 
      messageType: ['email'], 
      subject: 'Action Required: Please complete your profile',
      messageContent: 'Dear {patient_name},\n\nWe noticed you haven\'t completed your health questionnaire yet. This information is vital for your provider.\n\nPlease complete it here: {link}',
      selectedTemplateId: 'tpl_action_req',
      attachedDocumentId: 'doc_history' 
    },
    position: { x: 400, y: 1300 }
  },
  {
    id: 'step-9',
    type: NodeType.ACTION,
    blockType: BlockType.APPOINTMENT,
    title: 'Appointment',
    description: 'Action: Schedule Follow-up',
    isValid: true,
    position: { x: 400, y: 1550 }
  }
];

// Default fresh workflow state
const NEW_WORKFLOW_NODES: WorkflowNode[] = [];

// Mock Data for Workflow List
const INITIAL_WORKFLOWS = [
  { id: 'purchase_flow', title: 'Patient Purchase', description: 'Orchestrates the order fulfillment and follow-up process for new test kits.', steps: 7, active: 24, icon: 'ShoppingCart' },
  { id: '1', title: 'Chronic Care Management', description: 'Workflow description - what does the workflow do, purpose, target patients or clinic tasks, etc.', steps: 5, active: 3, icon: 'LayoutGrid' },
  { id: '2', title: 'Patient Onboarding', description: 'Workflow description - what does the workflow do, purpose, target patients or clinic tasks, etc.', steps: 5, active: 3, icon: 'User' },
  { id: '3', title: 'Post-Visit Follow-up', description: 'Automated check-ins after patient visits to ensure adherence to protocol.', steps: 4, active: 12, icon: 'User' },
  { id: '4', title: 'Lab Results Processing', description: 'Triggered when lab results arrive, notifies provider and patient.', steps: 6, active: 8, icon: 'LayoutGrid' },
];

export const WorkbenchView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'editor'>('home');
  const [nodes, setNodes] = useState<WorkflowNode[]>(NEW_WORKFLOW_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState('workflow'); // ezbill, template, workflow, report, archive
  const [isReviewingAI, setIsReviewingAI] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  // State for Workflows List and Metadata
  const [workflows, setWorkflows] = useState(INITIAL_WORKFLOWS);
  const [currentWorkflowMeta, setCurrentWorkflowMeta] = useState({ title: 'Untitled Patient Workflow', description: '' });
  const [workflowPrice, setWorkflowPrice] = useState<string | null>(null);
  
  // Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [isTestRunOpen, setIsTestRunOpen] = useState(false);
  const [isManageUsageOpen, setIsManageUsageOpen] = useState(false);
  const [currentFormName, setCurrentFormName] = useState('');

  // Document Template / Form Builder State
  const [formBuilderView, setFormBuilderView] = useState<'home' | 'builder'>('home');
  const [existingForms, setExistingForms] = useState<FormTemplate[]>([]);
  const [currentFormFields, setCurrentFormFields] = useState<FormField[]>([]);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    const stored = localStorage.getItem('gemini_api_key');
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    const processEnvKey = process.env.GEMINI_API_KEY;
    console.log('API Key sources:', {
      stored: stored ? 'FOUND' : 'NOT_FOUND',
      envKey: envKey ? 'FOUND' : 'NOT_FOUND',
      processEnvKey: processEnvKey ? 'FOUND' : 'NOT_FOUND'
    });
    return stored || envKey || processEnvKey || '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Handle Drop on Canvas
  const handleDrop = useCallback((e: React.DragEvent, position: { x: number, y: number }) => {
    e.preventDefault();
    const typeString = e.dataTransfer.getData('blockType');
    const categoryString = e.dataTransfer.getData('category');
    
    if (typeString && categoryString) {
       const blockType = typeString as BlockType;
       const category = categoryString as NodeType;
       
       // Determine default events based on block type
       let defaultEvents: string[] = [];
       if (category === NodeType.TRIGGER) {
          if (blockType === BlockType.REPORT_UPDATE) {
             defaultEvents = ['Report Ready'];
          } else if (blockType === BlockType.ORDER_UPDATE) {
             defaultEvents = ['Order Created'];
          } else {
             // Default to Order Created for other triggers for now to maintain behavior,
             // or could set to empty.
             defaultEvents = ['Order Created']; 
          }
       }

       const newNode: WorkflowNode = {
         id: uuid(),
         type: category,
         blockType: blockType,
         title: blockType,
         description: category === NodeType.TRIGGER 
            ? 'Triggered by status changes' 
            : category === NodeType.ACTION 
            ? 'Action block' 
            : 'Logic block',
         isValid: true,
         tags: defaultEvents,
         config: category === NodeType.TRIGGER ? { events: defaultEvents } : {},
         position
       };

       setNodes((prev) => [...prev, newNode]);
       setSelectedNodeId(newNode.id);
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, type: BlockType, category: NodeType) => {
    e.dataTransfer.setData('blockType', type);
    e.dataTransfer.setData('category', category);
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleUpdateNode = (id: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleNodeMove = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, position: { x, y } } : n));
  };

  const handleAutoLayout = () => {
    // Basic Vertical Auto Layout
    const CENTER_AXIS_X = 580; // A reasonable center point for the canvas
    const START_Y = 50;
    const GAP = 80;

    let currentY = START_Y;

    const newNodes = nodes.map(node => {
      // Determine approximate dimensions
      const isLogic = node.type === NodeType.LOGIC;
      
      // Widths from NodeCard styles: Regular = 360, Logic = 160
      const width = isLogic ? 160 : 360;
      // Approximate heights based on content (Action ~200, Logic ~100)
      const height = isLogic ? 100 : 200;

      // Center Align: x + width/2 = CENTER_AXIS_X
      const x = CENTER_AXIS_X - (width / 2);
      const y = currentY;

      currentY += height + GAP;

      return {
        ...node,
        position: { x, y }
      };
    });

    setNodes(newNodes);
  };

  const handleSaveTemplate = (data: { subject: string; content: string }) => {
    if (selectedNodeId) {
      handleUpdateNode(selectedNodeId, {
        config: {
          ...nodes.find(n => n.id === selectedNodeId)?.config,
          subject: data.subject,
          messageContent: data.content
        }
      });
    }
  };

  const handleOpenFormBuilder = (docId: string, docName: string) => {
     setCurrentFormName(docName);
     setIsFormBuilderOpen(true);
  };

  const handleCreateNew = () => {
    // Start fresh with minimal nodes
    setNodes(NEW_WORKFLOW_NODES);
    setSelectedNodeId(null);
    setCurrentWorkflowMeta({ title: 'Untitled Patient Workflow', description: '' });
    setWorkflowPrice(null);
    setViewMode('editor');
    setIsReviewingAI(false);
  };

  const handleEditWorkflow = (id: string) => {
    const wf = workflows.find(w => w.id === id);
    if (wf) {
        setCurrentWorkflowMeta({ title: wf.title, description: wf.description });
    }
    
    if (id === 'purchase_flow') {
      // Load the specific Patient Purchase workflow
      setNodes(PATIENT_PURCHASE_NODES);
      setWorkflowPrice("99.00"); // Example existing price
    } else {
      // Fallback/Mock for others (start fresh for prototype purposes on other items)
      setNodes(NEW_WORKFLOW_NODES);
      setWorkflowPrice(null);
    }
    
    setSelectedNodeId(null);
    setViewMode('editor');
    setIsReviewingAI(false);
  };

  const handleSaveWorkflow = (title: string, description: string) => {
    const newWorkflow = {
      id: uuid(),
      title: title || 'Untitled Workflow',
      description: description || 'No description provided.',
      steps: nodes.length,
      active: 0,
      icon: 'GitBranch'
    };

    // Add new workflow to the top of the list
    setWorkflows(prev => [newWorkflow, ...prev]);
    setViewMode('home');
  };

  // Form Builder Handlers
  const handleSaveForm = (form: FormTemplate) => {
    if (editingFormId) {
      setExistingForms(prev => prev.map(f => f.id === editingFormId ? form : form));
    } else {
      setExistingForms(prev => [...prev, form]);
    }
    setFormBuilderView('home');
    setCurrentFormFields([]);
    setEditingFormId(null);
  };

  const handleDeleteForm = (formId: string) => {
    setExistingForms(prev => prev.filter(f => f.id !== formId));
  };

  const handleNavigateToFormBuilder = (view: 'builder', fields?: FormField[], formId?: string) => {
    if (fields) setCurrentFormFields(fields);
    if (formId) setEditingFormId(formId);
    setFormBuilderView(view);
  };

  const handleCancelFormBuilder = () => {
    setFormBuilderView('home');
    setCurrentFormFields([]);
    setEditingFormId(null);
  };

  const handleSaveApiKey = (apiKey: string) => {
    setGeminiApiKey(apiKey);
    localStorage.setItem('gemini_api_key', apiKey);
    setShowApiKeyModal(false);
  };

  // Handler for AI to generate the demo workflow
  const handleAiGenerateWorkflow = () => {
     // Mark generated nodes as temporary for review
     const tempNodes = PATIENT_PURCHASE_NODES.map(node => ({
       ...node,
       isTemporary: true
     }));
     setNodes(tempNodes);
     setSelectedNodeId(null);
     setIsReviewingAI(true);
  };

  const handleAiAccept = () => {
    // Make nodes permanent
    setNodes(prev => prev.map(node => ({ ...node, isTemporary: false })));
    setIsReviewingAI(false);
  };

  const handleAiReject = () => {
    // Clear nodes
    setNodes([]);
    setIsReviewingAI(false);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  if (viewMode === 'editor') {
    return (
      <div className="flex flex-col h-full bg-white text-slate-800 font-sans overflow-hidden">
        <Header 
          onRunTest={() => setIsTestRunOpen(true)} 
          onBack={() => setViewMode('home')}
          onSave={handleSaveWorkflow}
          onManageUsage={() => setIsManageUsageOpen(true)}
          initialTitle={currentWorkflowMeta.title}
          initialDescription={currentWorkflowMeta.description}
          price={workflowPrice}
          onSetPrice={setWorkflowPrice}
        />
        
        <div className="flex flex-1 overflow-hidden relative">
          <LeftSidebar onDragStart={handleDragStart} />
          
          <Canvas 
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onDrop={handleDrop}
            onDeleteNode={handleDeleteNode}
            onNodeMove={handleNodeMove}
            onUpdateNode={handleUpdateNode}
            onAutoLayout={handleAutoLayout}
            isAiGenerating={isAiGenerating}
            isReviewing={isReviewingAI}
            onAiAccept={handleAiAccept}
            onAiReject={handleAiReject}
          />
          
          <RightSidebar 
            selectedNode={selectedNode}
            workflowNodes={nodes}
            onDeleteNode={handleDeleteNode}
            onUpdateNode={handleUpdateNode}
            onOpenTemplateEditor={() => setIsTemplateModalOpen(true)}
            onOpenFormBuilder={handleOpenFormBuilder}
            onGenerateWorkflow={handleAiGenerateWorkflow}
            isReviewing={isReviewingAI}
            onAcceptAi={handleAiAccept}
            onRejectAi={handleAiReject}
            onAiLoading={setIsAiGenerating}
          />

          {/* Email Template Modal */}
          <EmailTemplateModal 
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onSave={handleSaveTemplate}
            initialSubject={selectedNode?.config?.subject || ''}
            initialContent={selectedNode?.config?.messageContent || ''}
          />

          {/* Form Builder Modal */}
          <FormBuilderModal
             isOpen={isFormBuilderOpen}
             onClose={() => setIsFormBuilderOpen(false)}
             documentName={currentFormName}
          />

          {/* Test Run Modal */}
          <TestRunModal 
             isOpen={isTestRunOpen}
             onClose={() => setIsTestRunOpen(false)}
             nodes={nodes}
          />

          {/* Manage Usage Modal */}
          <ManageUsageModal 
            isOpen={isManageUsageOpen}
            onClose={() => setIsManageUsageOpen(false)}
            workflowTitle={currentWorkflowMeta.title}
          />
        </div>
      </div>
    );
  }

  // --- List / Home View ---
  // Render Document Template View
  if (sidebarTab === 'template') {
    if (formBuilderView === 'builder') {
      return (
        <div className="h-full bg-white">
          <FormBuilder
            initialFields={currentFormFields}
            onSaveForm={handleSaveForm}
            editingFormId={editingFormId}
            existingForms={existingForms}
            onCancel={handleCancelFormBuilder}
            geminiApiKey={geminiApiKey}
            onApiKeyRequired={() => setShowApiKeyModal(true)}
          />
          {/* API Key Modal */}
          {showApiKeyModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Gemini API Key Required</h3>
                <p className="text-sm text-slate-600 mb-4">
                  To use AI form generation, please enter your Gemini API key.
                </p>
                <input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mb-4"
                  defaultValue={geminiApiKey}
                  id="gemini-api-input"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const input = document.getElementById('gemini-api-input') as HTMLInputElement;
                      if (input?.value) handleSaveApiKey(input.value);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Key
                  </button>
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex h-full bg-[#f8f8f8]">
        {/* App Sidebar */}
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 z-20 space-y-2">
          <SidebarIcon icon={DollarSign} label="eZ-Bill" active={sidebarTab === 'ezbill'} onClick={() => setSidebarTab('ezbill')} />
          <SidebarIcon icon={FileText} label="Document Template" active={sidebarTab === 'template'} onClick={() => setSidebarTab('template')} />
          <SidebarIcon icon={GitBranch} label="Workflow" active={sidebarTab === 'workflow'} onClick={() => setSidebarTab('workflow')} />
          <SidebarIcon icon={FileSpreadsheet} label="Report Format" active={sidebarTab === 'report'} onClick={() => setSidebarTab('report')} />
          <SidebarIcon icon={Archive} label="Archive" active={sidebarTab === 'archive'} onClick={() => setSidebarTab('archive')} />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f8f8f8] p-8">
          <FormTemplatesHome
            onNavigate={handleNavigateToFormBuilder}
            existingForms={existingForms}
            onDeleteForm={handleDeleteForm}
          />
        </div>
      </div>
    );
  }

  // Default Workflow View
  return (
    <div className="flex h-full bg-[#f8f8f8]">

      {/* App Sidebar (Specific to Workbench) */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 shrink-0 z-20 space-y-2">
        <SidebarIcon icon={DollarSign} label="eZ-Bill" active={sidebarTab === 'ezbill'} onClick={() => setSidebarTab('ezbill')} />
        <SidebarIcon icon={FileText} label="Document Template" active={sidebarTab === 'template'} onClick={() => setSidebarTab('template')} />
        <SidebarIcon icon={GitBranch} label="Workflow" active={sidebarTab === 'workflow'} onClick={() => setSidebarTab('workflow')} />
        <SidebarIcon icon={FileSpreadsheet} label="Report Format" active={sidebarTab === 'report'} onClick={() => setSidebarTab('report')} />
        <SidebarIcon icon={Archive} label="Archive" active={sidebarTab === 'archive'} onClick={() => setSidebarTab('archive')} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* View Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
               <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Active Workflows</h1>
                  <span className="text-sm text-gray-400 font-normal">Patient workflows and practice-wide automation currently running</span>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-gray-400 hover:text-gray-600">
                  <ListFilter size={20} />
               </button>
               <button className="p-2 text-gray-400 hover:text-gray-600">
                  <LayoutGrid size={20} />
               </button>
               <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings size={20} />
               </button>
            </div>
          </div>

          <div className="flex justify-between items-end">
             <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button className="px-4 py-2 bg-white text-[#0F4C81] text-sm font-bold rounded-md shadow-sm border border-gray-200 flex items-center gap-2">
                   <GitBranch size={16} /> My Workflow
                </button>
                <button className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 flex items-center gap-2 hover:bg-white/50 rounded-md transition-colors">
                   <Archive size={16} /> Workflow Library
                </button>
             </div>

             <div className="flex items-center gap-3">
                <div className="relative">
                   <input
                     type="text"
                     placeholder="Search workflows"
                     className="w-64 pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                   <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-[#0F4C81] text-white text-sm font-bold rounded-md shadow-sm hover:bg-[#09355E] flex items-center gap-2 transition-colors"
                >
                   <UserCircle2 size={18} /> Create Patient Workflow
                </button>
                <button className="px-4 py-2 bg-blue-300 text-white text-sm font-bold rounded-md shadow-sm hover:bg-blue-400 flex items-center gap-2 transition-colors">
                   <Building2 size={18} /> Create Practice Workflow
                </button>
             </div>
          </div>
        </div>

        {/* Content - Cards Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
           <div className="max-w-7xl space-y-4">
              {workflows.map((wf) => (
                 <div key={wf.id} className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center shrink-0 border border-teal-100">
                       {wf.icon === 'User' ? <User size={24} /> :
                        wf.icon === 'LayoutGrid' ? <LayoutGrid size={24} /> :
                        wf.icon === 'ShoppingCart' ? <ShoppingCart size={24} /> :
                        <GitBranch size={24} />}
                    </div>

                    <div className="flex-1">
                       <h3 className="text-lg font-bold text-gray-900 mb-1">{wf.title}</h3>
                       <p className="text-sm text-gray-500 mb-3">{wf.description}</p>
                       <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                          <span>{wf.steps} steps</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{wf.active} active patients</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button
                          onClick={() => handleEditWorkflow(wf.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Workflow"
                       >
                          <Edit3 size={18} />
                       </button>
                       <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-move">
                          <Move size={18} />
                       </button>
                       <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
   <button 
      onClick={onClick}
      className={`
      w-full py-4 flex flex-col items-center gap-1.5 border-l-2 transition-all group relative
      ${active 
         ? 'border-[#0F4C81] bg-blue-50/50 text-[#0F4C81]' 
         : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'
      }
   `}>
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] text-center font-medium leading-tight px-1">{label}</span>
   </button>
);
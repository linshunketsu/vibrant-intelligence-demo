import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, UserCircle, RefreshCw, ChevronDown, Edit2,
  Trash2, Mic, Bold, Italic, Underline, Type, PenTool,
  List, ListOrdered, Phone, Mail, MapPin, Expand, Copy,
  Edit, Calendar, Mars, Venus, FileText, ClipboardList, StickyNote,
  Play, Pause, Square, RotateCcw, Sparkles, Check, Wand2,
  Pill, CheckSquare, ShoppingCart, Search, ChevronsLeftRight,
  Send, MessageSquare, Loader2, ThumbsUp, X, CheckCircle2,
  ArrowUp, User as UserIcon, Bot, Feather, Pin, Plus, Layout,
  Activity, Zap, FlaskConical, Stethoscope, AlertTriangle, CheckCheck, Clock, ChevronRight,
  Thermometer, Scale, Ruler, Heart, Video, PenLine, Users, AtSign, Paperclip, MessageCircle,
  Signature, Undo, History, UserPlus, Eye
} from 'lucide-react';
import { SidebarAiAssistant } from './SidebarAiAssistant';

export interface PatientData {
  id: string;
  name: string;
  initials: string;
  gender: 'Male' | 'Female' | string;
  dob: string;
  age: number;
  avatar?: string;
  workflowStatus?: 'on-track' | 'exception' | 'completed';
}

interface EncounterNotesEditorProps {
  onBack: () => void;
  patient: PatientData;
}

// --- MOCK DATABASES ---

const CLINICAL_OBJECTS = [
  { id: 'dr_amo', label: 'Amoxicillin 500mg', type: 'eRx', icon: Pill, color: 'text-emerald-500' },
  { id: 'dr_ato', label: 'Atorvastatin 20mg', type: 'eRx', icon: Pill, color: 'text-emerald-500' },
  { id: 'dr_lis', label: 'Lisinopril 10mg', type: 'eRx', icon: Pill, color: 'text-emerald-500' },
  { id: 'dr_met', label: 'Metformin 1000mg', type: 'eRx', icon: Pill, color: 'text-emerald-500' },
  { id: 'ord_gut', label: 'Gut Zoomer 3.0', type: 'Order', icon: FlaskConical, color: 'text-blue-500' },
  { id: 'ord_whe', label: 'Wheat Zoomer', type: 'Order', icon: FlaskConical, color: 'text-blue-500' },
  { id: 'ord_cbc', label: 'Complete Blood Count', type: 'Order', icon: FlaskConical, color: 'text-blue-500' },
  { id: 'wf_onb', label: 'Patient Onboarding', type: 'Workflow', icon: Zap, color: 'text-amber-500' },
  { id: 'wf_lab', label: 'Lab Follow-up Flow', type: 'Workflow', icon: Zap, color: 'text-amber-500' },
  { id: 'sb_vit', label: 'Vitals Block', type: 'Smart Block', icon: Activity, color: 'text-purple-500' },
  { id: 'sb_phy', label: 'Physical Exam Block', type: 'Smart Block', icon: Stethoscope, color: 'text-purple-500' },
];

const SLASH_COMMANDS = [
  { id: 'erx', label: 'eRx', icon: Pill, color: 'text-slate-600' },
  { id: 'internal_note', label: 'Internal Note', icon: StickyNote, color: 'text-slate-600' },
  { id: 'task', label: 'Task', icon: CheckSquare, color: 'text-slate-600' },
  { id: 'appointment', label: 'Appointment', icon: Calendar, color: 'text-slate-600' },
  { id: 'order', label: 'Order', icon: ShoppingCart, color: 'text-slate-600' },
];

const VARIABLE_COMMANDS = [
  { id: 'name', label: 'Patient Name', icon: UserCircle },
  { id: 'dob', label: 'Date of Birth', icon: Calendar },
  { id: 'age', label: 'Patient Age', icon: Activity },
  { id: 'gender', label: 'Gender', icon: Mars },
  { id: 'mrn', label: 'Medical Record Number', icon: ClipboardList },
  { id: 'emergency', label: 'Emergency Contact', icon: Phone },
  { id: 'bp', label: 'Blood Pressure', icon: Activity },
  { id: 'hr', label: 'Heart Rate', icon: Activity },
  { id: 'temp', label: 'Temperature', icon: Activity },
  { id: 'rr', label: 'Respiratory Rate', icon: Activity },
];

const NOTE_TEMPLATES = [
  {
    id: 'soap',
    label: 'SOAP Note',
    content: `<b>SUBJECTIVE:</b><br/>[Patient's report of symptoms and history]<br/><br/><b>OBJECTIVE:</b><br/>[Vital signs, physical exam findings, labs]<br/><br/><b>ASSESSMENT:</b><br/>[Differential diagnosis and clinical reasoning]<br/><br/><b>PLAN:</b><br/>[Treatment, medications, follow-up, and patient education]`
  },
  {
    id: 'bullets',
    label: 'Bullet Point Style',
    content: `• <b>Chief Complaint:</b> [Enter text]<br/>• <b>HPI:</b> [Enter text]<br/>• <b>Physical Exam:</b> [Enter text]<br/>• <b>Impression:</b> [Enter text]<br/>• <b>Recommendations:</b> [Enter text]`
  },
  {
    id: 'progress',
    label: 'Simple Progress Note',
    content: `<b>Clinical Progress:</b><br/>[Describe updates since last visit]<br/><br/><b>Adjustments:</b><br/>[Changes to treatment plan]`
  }
];

const LAB_TEST_OPTIONS = [
  { id: 'gut', name: 'Gut Zoomer 3.0' },
  { id: 'hormone', name: 'Hormone Zoomer' },
  { id: 'immune', name: 'Immune Zoomer' },
  { id: 'food', name: 'Food Sensitivity Complete' },
  { id: 'myco', name: 'Mycotoxins' },
  { id: 'neuro', name: 'Neural Zoomer' }
];

const MOCK_TRANSCRIPT = `Dr. Smith: Good morning, Sarah. How are you feeling today?
Patient: I've been feeling a bit tired lately, and I've had these headaches that come and go.
Dr. Smith: I see. How long has this been going on?
Patient: About a week now.
Dr. Smith: Can you describe the headaches? Are they sharp, dull, throbbing?
Patient: It's mostly a dull ache in the front of my head. It usually happens in the afternoon.
Dr. Smith: On a scale of 1 to 10, how bad is the pain?
Patient: Maybe a 3 or 4. It's annoying but not unbearable.
Dr. Smith: Have you noticed any other symptoms? Nausea, dizziness, vision changes?
Patient: No nausea, but maybe a little dizzy sometimes when I stand up too fast.
Dr. Smith: Okay. Any recent stress or changes in your diet or sleep?
Patient: Work has been pretty stressful. I haven't been sleeping great either, maybe 5 or 6 hours a night.
Dr. Smith: That could definitely be contributing. Let's check your vitals and maybe run a few blood tests to rule out anything else.`;

const MOCK_SUMMARY = `Chief Complaint (CC)
“Fatigue and intermittent headaches for the past week.”

History of Present Illness (HPI)
Patient is a 34-year-old individual presenting with one week of progressive fatigue and mild, dull frontal headaches occurring 2–3 times per day. Headaches last 30–60 minutes, not associated with vision changes, nausea, or photophobia. Symptoms worsen in the late afternoon. Patient reports increased work-related stress and reduced sleep (approximately 5–6 hours per night). Denies fever, URI symptoms, dizziness, weakness, or recent travel. No over-the-counter medications taken.

Past Medical History (PMH)
• Seasonal allergies
• Mild anxiety

Past Surgical History (PSH)
• None reported

Medications
• Loratadine 10mg daily`;

export const EncounterNotesEditor: React.FC<EncounterNotesEditorProps> = ({ onBack, patient }) => {
  const [noteTitle, setNoteTitle] = useState('Annual Checkup');
  const [pegBoardTab, setPegBoardTab] = useState<'cards' | 'ai'>('cards');
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<'recording' | 'review'>('recording');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<'transcription' | 'summary'>('summary');

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProposedDiff, setAiProposedDiff] = useState<{ content: string; explanation: string } | null>(null);
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'assistant'; text: React.ReactNode }[]>([]);
  const pendingAiDiffRef = useRef<{ content: string; explanation: string } | null>(null);

  // Summary Generation State
  const [isSummaryGenerated, setIsSummaryGenerated] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Modal States
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [apptForm, setApptForm] = useState({ date: '', time: '', reason: 'Follow-up', location: 'Zoom' });
  const [orderForm, setOrderForm] = useState({ testId: 'gut', deliveryMethod: 'office', paymentMethod: 'office_bill' });

  // Selection saving for modal insertion
  const savedRange = useRef<Range | null>(null);

  // Signature/Co-sign States
  const [noteStatus, setNoteStatus] = useState<'draft' | 'signed' | 'cosigned'>('draft');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showCoSignModal, setShowCoSignModal] = useState(false);
  const [signerInfo, setSignerInfo] = useState({
    signedBy: 'Dr. Irene Hoffman',
    signedAt: '',
    credentials: 'MD, FACP'
  });
  const [cosignerInfo, setCosignerInfo] = useState({
    cosignedBy: '',
    cosignedAt: '',
    credentials: ''
  });
  const [signedNoteContent, setSignedNoteContent] = useState('');

  // Collaboration States
  const [collaborators, setCollaborators] = useState([
    { id: '1', name: 'Dr. Sarah Chen', initials: 'SC', color: 'bg-purple-500', status: 'online', cursor: null },
    { id: '2', name: 'Nurse Amy', initials: 'NA', color: 'bg-teal-500', status: 'away', cursor: null }
  ]);
  const [showCommentPopover, setShowCommentPopover] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [comments, setComments] = useState<{id: string, text: string, author: string, time: string, selection: string}[]>([
    {
      id: '1',
      text: 'Patient mentioned they\'re not tolerating the new dosage well. Consider adjusting.',
      author: 'Dr. Sarah Chen',
      time: '10:30 AM',
      selection: 'Patient reports occasional dizziness'
    },
    {
      id: '2',
      text: 'I reviewed the lab results - everything looks stable.',
      author: 'Nurse Amy',
      time: '9:15 AM',
      selection: 'Lab results within normal limits'
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isCollaborationMode, setIsCollaborationMode] = useState(true);
  // Ref for tracking which card is currently being edited (if any)
  const editingCardRef = useRef<HTMLElement | null>(null);

  const [menuConfig, setMenuConfig] = useState<{ 
    open: boolean, 
    x: number, 
    y: number, 
    selectedIndex: number,
    type: 'slash' | 'variable' | 'clinical',
    filter: string
  }>({
    open: false,
    x: 0,
    y: 0,
    selectedIndex: 0,
    type: 'slash',
    filter: ''
  });

  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const templateBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let interval: any;
    if (isPanelOpen && recordingState === 'recording') {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPanelOpen, recordingState]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (isTemplateMenuOpen && templateBtnRef.current && !templateBtnRef.current.contains(e.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
      if (menuConfig.open) {
        setMenuConfig(prev => ({ ...prev, open: false }));
      }
      // Close comment popover when clicking outside
      if (showCommentPopover) {
        const target = e.target as HTMLElement;
        if (!target.closest('.comment-popover') && !target.closest('.comment-highlight')) {
          setShowCommentPopover(false);
        }
      }
      // Close mention and attachment menus
      if (showMentionMenu || showAttachMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest('.mention-menu') && !target.closest('.attach-menu') && !target.closest('[data-mention-trigger]') && !target.closest('[data-attach-trigger]')) {
          setShowMentionMenu(false);
          setShowAttachMenu(false);
        }
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isTemplateMenuOpen, menuConfig.open, showCommentPopover, showMentionMenu, showAttachMenu]);

  // Text selection for comments
  useEffect(() => {
    const handleSelectionChange = () => {
      if (isCollaborationMode && noteStatus === 'draft') {
        handleTextSelection();
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, [isCollaborationMode, noteStatus]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsPanelOpen(true);
    setRecordingState('recording');
    setRecordingSeconds(0);
  };

  const handleStopRecording = () => {
    setRecordingState('review');
    if (recordingSeconds < 5) setRecordingSeconds(4982); 
    setActiveReviewTab('transcription');
    setIsSummaryGenerated(false);
  };

  const handleResumeRecording = () => {
    setRecordingState('recording');
  };

  const handleGenerateSummary = (templateId: string) => {
    setIsGeneratingSummary(true);
    setTimeout(() => {
        setIsGeneratingSummary(false);
        setIsSummaryGenerated(true);
    }, 2500);
  };

  const insertAtCursor = (content: string | HTMLElement) => {
    const selection = window.getSelection();
    let range: Range | null = null;

    // Restore saved range if available (e.g. coming from modal)
    if (savedRange.current) {
        range = savedRange.current;
        selection?.removeAllRanges();
        selection?.addRange(range);
        savedRange.current = null;
    } else if (selection?.rangeCount) {
        range = selection.getRangeAt(0);
    }

    if (!range) return;
    range.deleteContents();

    if (typeof content === 'string') {
      const temp = document.createElement('div');
      temp.innerHTML = content;
      const frag = document.createDocumentFragment();
      let node;
      while (node = temp.firstChild) {
        frag.appendChild(node);
      }
      range.insertNode(frag);
    } else {
      range.insertNode(content);
      const space = document.createTextNode('\u00A0');
      content.after(space);
      range.setStartAfter(space);
    }
    
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    // Detect clicks on interactive cards to enable editing
    const target = (e.target as HTMLElement).closest('.interactive-card') as HTMLElement;
    if (target) {
        const type = target.dataset.type;
        const stateStr = target.dataset.state;
        
        if (type && stateStr) {
            try {
                const state = JSON.parse(stateStr);
                editingCardRef.current = target; // Track which card we are editing
                
                if (type === 'appointment') {
                    setApptForm(state);
                    setIsAppointmentModalOpen(true);
                } else if (type === 'order') {
                    setOrderForm(state);
                    setIsOrderModalOpen(true);
                }
                
                // Clear selection to avoid weird cursor placement inside non-editable block
                window.getSelection()?.removeAllRanges();
            } catch (err) {
                console.error("Error parsing card data", err);
            }
        }
    }
  };

  const handleConfirmAppointment = () => {
      if (!apptForm.date || !apptForm.time) return;

      const card = document.createElement('div');
      card.contentEditable = 'false';
      // Added interactive-card class and dataset for editability
      card.className = "interactive-card inline-flex items-center gap-3 p-3 my-2 mr-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 shadow-sm align-top select-none group relative cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all hover:shadow-md";
      card.dataset.type = 'appointment';
      card.dataset.state = JSON.stringify(apptForm);
      
      card.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="flex-1 min-w-0 pointer-events-none">
            <div class="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-0.5 flex items-center gap-1">
               Appointment Scheduled <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="font-bold text-sm truncate">${apptForm.date} @ ${apptForm.time}</div>
            <div class="text-xs text-blue-700/70 truncate flex gap-2">
                <span class="font-semibold text-blue-800">${apptForm.location}</span>
                <span class="opacity-50">•</span>
                <span>${apptForm.reason}</span>
            </div>
        </div>
      `;

      if (editingCardRef.current) {
          editingCardRef.current.replaceWith(card);
          editingCardRef.current = null;
      } else {
          insertAtCursor(card);
      }
      
      setIsAppointmentModalOpen(false);
      setApptForm({ date: '', time: '', reason: 'Follow-up', location: 'Zoom' });
  };

  const handleConfirmOrder = () => {
      const test = LAB_TEST_OPTIONS.find(t => t.id === orderForm.testId);
      const deliveryLabel = orderForm.deliveryMethod === 'patient' ? 'Ship to Patient' : 'Provided in Office';
      const paymentLabel = orderForm.paymentMethod === 'patient_now' ? 'Patient Pay Now' : orderForm.paymentMethod === 'patient_later' ? 'Patient Pay Later' : 'Office Bill';

      const card = document.createElement('div');
      card.contentEditable = 'false';
      // Added interactive-card class and dataset for editability
      card.className = "interactive-card inline-flex items-center gap-3 p-3 my-2 mr-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm align-top select-none group relative cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all hover:shadow-md";
      card.dataset.type = 'order';
      card.dataset.state = JSON.stringify(orderForm);

      card.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>
        </div>
        <div class="flex-1 min-w-0 pointer-events-none">
             <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5 flex items-center gap-1">
                Order Placed <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
             </div>
             <div class="font-bold text-sm truncate">${test?.name || 'Lab Order'}</div>
             <div class="text-xs text-emerald-700/70 flex flex-col gap-0.5 mt-0.5">
                <span class="font-medium">${deliveryLabel}</span>
                <span class="opacity-75">${paymentLabel}</span>
             </div>
        </div>
      `;

      if (editingCardRef.current) {
          editingCardRef.current.replaceWith(card);
          editingCardRef.current = null;
      } else {
          insertAtCursor(card);
      }

      setIsOrderModalOpen(false);
  };

  const handleApplyTemplate = (templateContent: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (editorRef.current.innerText.trim() === '') {
        editorRef.current.innerHTML = templateContent;
      } else {
        const div = document.createElement('div');
        div.innerHTML = `<br/><hr style="border:0; border-top:1px dashed #e2e8f0; margin:16px 0;"/><br/>` + templateContent;
        editorRef.current.appendChild(div);
      }
    }
    setIsTemplateMenuOpen(false);
  };

  const createClinicalChip = (item: any) => {
    const chip = document.createElement('span');
    chip.contentEditable = 'false';
    chip.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 mx-1 align-middle shadow-sm";
    
    const colorClass = item.color || 'text-slate-500';
    
    chip.innerHTML = `
      <span class="${colorClass} font-bold text-xs">${item.label}</span>
      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">${item.type}</span>
    `;
    
    return chip;
  };

  const createSlashCard = (type: string) => {
    const card = document.createElement('div');
    card.contentEditable = 'false';
    card.className = "inline-flex flex-col min-w-[240px] p-3 border border-slate-200 rounded-lg bg-white shadow-sm my-2 mr-2 align-top text-left";
    const cmd = SLASH_COMMANDS.find(c => c.id === type);
    card.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <div class="p-1 bg-slate-100 rounded text-slate-600">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">${cmd?.label || 'Item'}</span>
      </div>
      <div class="text-sm font-bold text-slate-900">Untitled ${cmd?.label}</div>
    `;
    return card;
  };

  const getFilteredList = () => {
    if (menuConfig.type === 'variable') {
      return VARIABLE_COMMANDS.filter(v => 
        v.label.toLowerCase().includes(menuConfig.filter) || 
        v.id.toLowerCase().includes(menuConfig.filter)
      );
    }
    if (menuConfig.type === 'clinical') {
      return CLINICAL_OBJECTS.filter(obj => 
        obj.label.toLowerCase().includes(menuConfig.filter)
      );
    }
    return SLASH_COMMANDS;
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (menuConfig.open) {
      const currentList = getFilteredList();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMenuConfig(prev => ({ ...prev, selectedIndex: (prev.selectedIndex + 1) % (currentList.length || 1) }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMenuConfig(prev => ({ ...prev, selectedIndex: (prev.selectedIndex - 1 + (currentList.length || 1)) % (currentList.length || 1) }));
      } else if (e.key === 'Enter') {
        if (currentList.length > 0) {
          e.preventDefault();
          executeCommand(currentList[menuConfig.selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMenuConfig(prev => ({ ...prev, open: false }));
      }
    }
  };

  const handleEditorKeyUp = (e: React.KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const textContent = textNode.textContent || '';
    const offset = range.startOffset;
    const textBefore = textContent.slice(0, offset);
    const words = textBefore.split(/\s/);
    const lastWord = words[words.length - 1];

    // 1. Maintain existing slash logic
    if (textBefore.endsWith('/')) {
      const rect = range.getBoundingClientRect();
      setMenuConfig({
        open: true,
        x: rect.left,
        y: rect.bottom + window.scrollY,
        selectedIndex: 0,
        type: 'slash',
        filter: ''
      });
      return;
    }

    // 2. Enhance variable logic ($ trigger + 3-letter matching)
    if (lastWord.startsWith('$')) {
      const filter = lastWord.slice(1).toLowerCase();
      const rect = range.getBoundingClientRect();
      setMenuConfig({
        open: true,
        x: rect.left,
        y: rect.bottom + window.scrollY,
        selectedIndex: 0,
        type: 'variable',
        filter
      });
      return;
    }

    // 3. 3-letter clinical matching
    if (lastWord.length >= 3 && /^[a-zA-Z0-9]+$/.test(lastWord)) {
      const filter = lastWord.toLowerCase();
      const matches = CLINICAL_OBJECTS.filter(obj => obj.label.toLowerCase().includes(filter));
      
      if (matches.length > 0) {
        const rect = range.getBoundingClientRect();
        setMenuConfig({
          open: true,
          x: rect.left,
          y: rect.bottom + window.scrollY,
          selectedIndex: 0,
          type: 'clinical',
          filter
        });
        return;
      }
    }

    if (menuConfig.open) {
      setMenuConfig(prev => ({ ...prev, open: false }));
    }
  };

  const executeCommand = (item: any) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const offset = range.startOffset;
    
    if (textNode.nodeType === Node.TEXT_NODE) {
      const content = textNode.textContent || '';
      const textBefore = content.slice(0, offset);
      const words = textBefore.split(/\s/);
      const lastWord = words[words.length - 1];
      const startOfWord = offset - lastWord.length;
      
      // Remove trigger text (including / or $)
      textNode.textContent = content.slice(0, startOfWord) + content.slice(offset);
      range.setStart(textNode, startOfWord);
      range.setEnd(textNode, startOfWord);
    }

    // Check for interactive commands
    if (item.id === 'appointment' || item.id === 'order') {
        // Save the current range so we can restore it after modal interaction
        const currentSel = window.getSelection();
        if (currentSel && currentSel.rangeCount > 0) {
             savedRange.current = currentSel.getRangeAt(0).cloneRange();
        }

        if (item.id === 'appointment') {
            setApptForm({ date: '2026-01-10', time: '10:00', reason: 'Follow-up', location: 'Zoom' });
            setIsAppointmentModalOpen(true);
        }
        if (item.id === 'order') {
            setOrderForm({ testId: 'gut', deliveryMethod: 'office', paymentMethod: 'office_bill' });
            setIsOrderModalOpen(true);
        }
        
        setMenuConfig(prev => ({ ...prev, open: false }));
        return; // Stop here, wait for modal
    }

    if (menuConfig.type === 'variable') {
      let value = '';
      switch (item.id) {
        case 'name': value = patient.name; break;
        case 'dob': value = patient.dob; break;
        case 'age': value = `${patient.age} yrs`; break;
        case 'gender': value = patient.gender; break;
        case 'mrn': value = 'MRN-120045'; break;
        case 'emergency': value = 'Jane Jenkins (+1 555-0123)'; break;
        case 'bp': value = '118/76 mmHg'; break;
        case 'hr': value = '74 bpm'; break;
        case 'temp': value = '98.6 °F'; break;
        case 'rr': value = '14 bpm'; break;
        default: value = `{${item.label}}`;
      }
      insertAtCursor(value);
    } else if (menuConfig.type === 'clinical') {
      const chip = createClinicalChip(item);
      insertAtCursor(chip);
    } else {
      const card = createSlashCard(item.id);
      insertAtCursor(card);
    }
    setMenuConfig(prev => ({ ...prev, open: false }));
  };

  const handleApproveAi = () => {
    const currentDiff = pendingAiDiffRef.current;
    if (currentDiff && editorRef.current) {
        const existingProposal = document.getElementById('ai-inline-proposal');
        if (existingProposal) {
            // Stripping markdown markers '###'
            const finalHtml = `
                <div class="mt-4 mb-4">
                    <p class="text-sm text-slate-900 font-bold mb-2">Proposed Cardiac Treatment Plan</p>
                    ${currentDiff.content.split('\n')
                      .filter(l => l && !l.includes('Cardiac Treatment Plan'))
                      .map(line => `<p class="text-sm text-slate-800 mb-1">${line.replace(/^[•\s]*/, '• ')}</p>`)
                      .join('')}
                </div>
            `;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = finalHtml;
            existingProposal.parentNode?.replaceChild(tempDiv, existingProposal);
        }
        setAiChatHistory(prev => [...prev, { role: 'assistant', text: "Done. I've added the plan to the note and queued the corresponding orders." }]);
        setAiProposedDiff(null);
        pendingAiDiffRef.current = null;
    }
  };

  // --- Signature & Co-sign Handlers ---

  const handleSignNote = () => {
    const now = new Date();
    const signedAt = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    setSignerInfo(prev => ({ ...prev, signedAt }));
    setSignedNoteContent(editorRef.current?.innerHTML || '');
    setNoteStatus('signed');
    setShowSignatureModal(false);
  };

  const handleCoSignNote = () => {
    const now = new Date();
    const cosignedAt = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    setCosignerInfo({
      cosignedBy: 'Dr. James Wilson',
      cosignedAt,
      credentials: 'MD, Cardiology'
    });
    setNoteStatus('cosigned');
    setShowCoSignModal(false);
  };

  const handleRequestCoSign = () => {
    setShowCoSignModal(true);
  };

  const handleAddAppendage = () => {
    // Allow adding addendum to signed note
    setNoteStatus('draft');
  };

  // --- Collaboration Handlers ---

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedText(text);
      setCommentPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowCommentPopover(true);
    } else {
      setShowCommentPopover(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: 'Dr. Irene Hoffman',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        selection: selectedText
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setShowCommentPopover(false);
      setSelectedText('');

      // Add comment indicator to the editor
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.className = 'comment-highlight bg-yellow-100 border-b-2 border-yellow-400 cursor-pointer relative';
          span.dataset.commentId = comment.id;
          span.title = comment.text;

          try {
            range.surroundContents(span);
          } catch (e) {
            // For complex selections, fallback to highlighting
            span.textContent = range.toString();
            range.deleteContents();
            range.insertNode(span);
          }
        }
      }
    }
  };

  const handleAddMention = (userId: string) => {
    insertAtCursor(`<span class="mention-tag bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-sm font-medium">@${userId}</span>&nbsp;`);
    setShowMentionMenu(false);
    setMentionFilter('');
  };

  const handleAttachFile = (fileType: string) => {
    const fileIcon = fileType === 'image' ? '🖼️' : fileType === 'lab' ? '🔬' : '📎';
    insertAtCursor(`<span class="attachment-tag inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-sm">${fileIcon} ${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Attached</span>&nbsp;`);
    setShowAttachMenu(false);
  };

  const availableProviders = [
    { id: 'dr-wilson', name: 'Dr. James Wilson', role: 'Cardiologist' },
    { id: 'dr-chen', name: 'Dr. Sarah Chen', role: 'Radiologist' },
    { id: 'nurse-amy', name: 'Nurse Amy Johnson', role: 'RN' },
    { id: 'pa-mike', name: 'Mike Thompson', role: 'PA-C' }
  ];

  const filteredProviders = availableProviders.filter(p =>
    p.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleAiMessage = (msg: string) => {
    // Safety check: ensure msg is a valid string
    const safeMsg = msg || '';
    setAiChatHistory(prev => [...prev, { role: 'user', text: safeMsg }]);
    const currentPrompt = safeMsg.toLowerCase();
    setIsAiProcessing(true);

    setTimeout(() => {
        setIsAiProcessing(false);

        // Helper function to create inline proposal with diff
        const createInlineProposal = (title: string, items: string[], badgeColor: string = 'blue', onApprove?: () => void) => {
            const explanation = `I've analyzed the request and prepared the following ${title.toLowerCase()} for your review.`;
            const content = `${title}\n${items.map(i => `• ${i}`).join('\n')}`;
            const diffData = { explanation, content, items };
            setAiProposedDiff(diffData);
            pendingAiDiffRef.current = diffData;
            setAiChatHistory(prev => [...prev, { role: 'assistant', text: explanation }]);

            if (editorRef.current) {
                const proposalContainer = document.createElement('div');
                proposalContainer.id = 'ai-inline-proposal';
                proposalContainer.className = "ai-proposal-wrapper border-2 border-dashed border-blue-300 bg-slate-50/40 rounded-lg p-5 my-6 animate-in slide-in-from-top-2 duration-500 relative";
                proposalContainer.contentEditable = "false";

                const colorClasses = badgeColor === 'emerald' ? 'bg-emerald-100/50 text-emerald-900 border-emerald-500' :
                                     badgeColor === 'amber' ? 'bg-amber-100/50 text-amber-900 border-amber-500' :
                                     badgeColor === 'purple' ? 'bg-purple-100/50 text-purple-900 border-purple-500' :
                                     'bg-emerald-100/50 text-emerald-900 border-emerald-500';

                const linesHtml = items.map((line, idx) => `
                    <div class="flex gap-3 text-sm mb-1 px-2 py-0.5 rounded ${colorClasses} border-l-4">
                        <span class="font-bold opacity-40 text-${badgeColor}-700">+</span>
                        <span>${line}</span>
                    </div>`).join('');

                proposalContainer.innerHTML = `
                    <div class="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        AI Suggested Actions
                    </div>
                    <div class="space-y-1">${linesHtml}</div>
                    <div class="mt-5 pt-4 border-t border-slate-200 flex justify-end gap-2">
                        <button id="inline-ai-discard" class="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-[11px] font-bold rounded hover:bg-slate-50">Discard</button>
                        <button id="inline-ai-approve" class="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded hover:bg-blue-700 shadow-sm flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Approve All
                        </button>
                    </div>`;

                editorRef.current.appendChild(proposalContainer);

                const discardBtn = document.getElementById('inline-ai-discard');
                const approveBtn = document.getElementById('inline-ai-approve');

                if (discardBtn) discardBtn.onclick = (ev: any) => { ev.stopPropagation(); setAiProposedDiff(null); proposalContainer.remove(); };
                if (approveBtn) approveBtn.onclick = (ev: any) => {
                    ev.stopPropagation();
                    // Execute the approved actions
                    setAiChatHistory(prev => [...prev, {
                        role: 'assistant',
                        text: (
                            <div className="space-y-2">
                                <p className="text-slate-700">✓ All actions completed successfully:</p>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    {items.map((item, i) => <li key={i} className="flex items-center gap-2"><span className="text-emerald-500">✓</span> {item}</li>)}
                                </ul>
                            </div>
                        )
                    }]);
                    setAiProposedDiff(null);
                    proposalContainer.remove();
                    onApprove?.();
                };
            }
        };

        // LAB ORDERS - must come before report/analyze to catch "order" first
        // Check for explicit "order" keyword with any lab-related term
        const hasOrderKeyword = currentPrompt.includes('order');
        const hasLabTerm = currentPrompt.includes('lab') || currentPrompt.includes('gut') || currentPrompt.includes('test') ||
                            currentPrompt.includes('food') || currentPrompt.includes('hormone') || currentPrompt.includes('neural') ||
                            currentPrompt.includes('toxin') || currentPrompt.includes('nutrient') || currentPrompt.includes('cellular') ||
                            currentPrompt.includes('cbc') || currentPrompt.includes('thyroid') || currentPrompt.includes('blood') ||
                            currentPrompt.includes('zoomer') || currentPrompt.includes('diagnostic');

        // Important: This must come BEFORE the report/analyze check
        if (hasOrderKeyword && hasLabTerm) {
            const tests = [];
            if (currentPrompt.includes('gut')) tests.push('Gut Zoomer 3.0 - Microbiome analysis ($550)');
            if (currentPrompt.includes('food') || currentPrompt.includes('sensitivity')) tests.push('Food Sensitivity Complete - Reactivity profile ($700)');
            if (currentPrompt.includes('hormone')) tests.push('Hormone Zoomer - Hormonal balance panel ($500)');
            if (currentPrompt.includes('neural')) tests.push('Neural Zoomer - Neurological markers ($450)');
            if (currentPrompt.includes('toxin')) tests.push('Toxin Zoomer - Toxin exposure panel ($700)');
            if (currentPrompt.includes('nutrient')) tests.push('Nutrient Zoomer - Nutritional status ($500)');
            if (currentPrompt.includes('cellular')) tests.push('Cellular Zoomer - Cellular function ($600)');
            if (currentPrompt.includes('cbc') || (currentPrompt.includes('blood') && !currentPrompt.includes('pressure'))) tests.push('Complete Blood Count (CBC)');
            if (currentPrompt.includes('thyroid')) tests.push('Thyroid Panel (TSH, Free T3, Free T4)');
            if (tests.length === 0) {
                tests.push('Gut Zoomer 3.0 - Microbiome analysis ($550)');
                tests.push('Comprehensive Metabolic Panel');
            }

            createInlineProposal('Lab Orders to Process', tests, 'emerald');
        }
        // MEDICATIONS / EPRESCRIPTION
        else if (currentPrompt.includes('medication') || currentPrompt.includes('prescrib') || currentPrompt.includes('erx') || currentPrompt.includes('rx')) {
            const meds = [];
            if (currentPrompt.includes('amoxicillin') || currentPrompt.includes('antibiotic')) meds.push('Amoxicillin 500mg - Take 1 capsule 3x daily for 10 days');
            if (currentPrompt.includes('atorvastatin') || currentPrompt.includes('lipitor') || currentPrompt.includes('cholesterol')) meds.push('Atorvastatin 20mg - Take 1 tablet daily at bedtime');
            if (currentPrompt.includes('lisinopril') || currentPrompt.includes('bp') || currentPrompt.includes('blood pressure')) meds.push('Lisinopril 10mg - Take 1 tablet daily');
            if (currentPrompt.includes('metformin') || currentPrompt.includes('diabetes')) meds.push('Metformin 1000mg - Take 1 tablet twice daily with meals');
            if (meds.length === 0) {
                meds.push('Review current medication list');
                meds.push('Reconcile with pharmacy records');
            }

            createInlineProposal('ePrescriptions to Send', meds, 'emerald');
        }
        // APPOINTMENTS
        else if (currentPrompt.includes('appointment') || currentPrompt.includes('schedule') || currentPrompt.includes('follow up') || currentPrompt.includes('follow-up')) {
            const apptItems = [
                `Schedule follow-up appointment for ${patient.name}`,
                'Set reminder for 24 hours before appointment',
                'Send calendar invitation to patient email'
            ];

            createInlineProposal('Appointment Scheduling', apptItems, 'blue', () => {
                // Auto-open appointment modal
                setApptForm({ date: '2025-12-17', time: '10:00', reason: 'Follow-up', location: 'Zoom' });
                setIsAppointmentModalOpen(true);
            });
        }
        // TASKS
        else if (currentPrompt.includes('task') || currentPrompt.includes('reminder') || currentPrompt.includes('todo')) {
            const taskItems = [
                'Task: Review lab results when available',
                'Task: Patient education - sleep hygiene',
                'Task: Follow up on headache symptoms in 2 weeks'
            ];

            createInlineProposal('Tasks to Create', taskItems, 'amber');
        }
        // WORKFLOWS
        else if (currentPrompt.includes('workflow') || currentPrompt.includes('onboarding') || currentPrompt.includes('lab follow')) {
            const workflowItems = [];
            if (currentPrompt.includes('onboard') || currentPrompt.includes('new patient')) {
                workflowItems.push('Start Patient Onboarding Workflow');
                workflowItems.push('Send welcome email with intake forms');
                workflowItems.push('Schedule initial consultation');
            } else if (currentPrompt.includes('lab')) {
                workflowItems.push('Trigger Lab Follow-up Workflow');
                workflowItems.push('Notify patient when results are ready');
                workflowItems.push('Schedule result review appointment');
            } else {
                workflowItems.push('Review available workflows');
                workflowItems.push('Select appropriate workflow trigger');
            }

            createInlineProposal('Workflow Automation', workflowItems, 'purple');
        }
        // REPORTS ANALYSIS
        else if (currentPrompt.includes('report') || currentPrompt.includes('result') || currentPrompt.includes('lab result') || currentPrompt.includes('analyze')) {
            const analysisContent = (
                <div className="space-y-3">
                    <p className="text-slate-700">I've analyzed the latest lab results for {patient.name}:</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Gut Zoomer 3.0</p>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">Action Needed</span>
                        </div>
                        <ul className="text-sm text-slate-700 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span><strong>Dysbiotic bacteria elevated:</strong> Multiple pathogenic markers detected</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span><strong>Beneficial bacteria low:</strong> Lactobacillus and Bifidobacterium below optimal</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span><strong>No parasites detected:</strong> All negative for common pathogens</span>
                            </li>
                        </ul>

                        <div className="pt-2 border-t border-slate-200">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Recommended Actions</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                                <li>• Start Gut Restoration Protocol Phase 1</li>
                                <li>• Order follow-up Gut Zoomer in 6 weeks</li>
                                <li>• Patient education: probiotic support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );

            setAiChatHistory(prev => [...prev, { role: 'assistant', text: analysisContent }]);
        }
        // CARDIAC / TREATMENT PLAN (existing)
        // Note: Must exclude 'order' to not conflict with lab orders
        else if (currentPrompt.includes('cardiac markers') || currentPrompt.includes('treatment plan')) {
            const explanation = "I've flagged elevated Troponin levels from the latest panel. Given the HPI, I've drafted a standard cardiac intervention plan for your review.";
            const content = `Proposed Cardiac Treatment Plan`;
            const items = [
                'Bedside Cardiac Monitoring',
                'Serial Troponin every 4h',
                'Cardiology consult requested',
                'Increase Aspirin to 325mg'
            ];

            createInlineProposal('Cardiac Treatment Plan', items, 'emerald');
        }
        // SUMMARIZE VISIT (existing)
        else if (currentPrompt.includes('summarize')) {
            const summaryContent = (
                <div className="space-y-3">
                    <p className="text-slate-700">Based on today's consultation, here's my summary:</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Chief Complaint</p>
                            <p className="text-sm text-slate-800">Patient presents with fatigue and intermittent frontal headaches for approximately one week.</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Key Findings</p>
                            <ul className="text-sm text-slate-700 space-y-1 mt-1">
                                <li>• Headaches: dull, frontal, occur 2-3x/day, lasting 30-60 minutes</li>
                                <li>• Pain severity: 3-4/10, worse in late afternoon</li>
                                <li>• Associated symptoms: occasional dizziness on standing, no nausea/vision changes</li>
                                <li>• Contributing factors: increased work stress, reduced sleep (5-6 hours/night)</li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assessment</p>
                            <p className="text-sm text-slate-800">Likely tension-type headaches exacerbated by poor sleep hygiene and stress. No red flags present.</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Follow-up Plan</p>
                            <ol className="text-sm text-slate-700 space-y-1 mt-1 list-decimal list-inside">
                                <li>Sleep optimization counseling provided</li>
                                <li>Stress management techniques discussed</li>
                                <li>Re-evaluate in 4 weeks if symptoms persist</li>
                                <li>Consider CBC to rule out anemia if fatigue continues</li>
                            </ol>
                        </div>
                    </div>

                    <p className="text-slate-700">Shall I insert this into the encounter note?</p>
                </div>
            );

            setAiChatHistory(prev => [...prev, { role: 'assistant', text: summaryContent }]);
        }
        // DRAFT ENCOUNTER NOTE
        else if (currentPrompt.includes('draft') || currentPrompt.includes('note') || currentPrompt.includes('consultation')) {
            const richContent = (
                <div className="space-y-3">
                    <p className="text-slate-700">I've drafted a follow-up note based on the consultation. Here's a preview:</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                        <div>
                            <p className="font-bold text-slate-800">Follow-up Note - {patient.name}</p>
                            <p className="text-slate-500">Date of Service: December 10, 2025</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Subjective:</p>
                            <p className="text-slate-600">Patient returns for follow-up of fatigue and headaches. Reports symptoms have improved slightly with better sleep hygiene. Still experiencing occasional headaches, particularly after stressful workdays.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Objective:</p>
                            <ul className="text-slate-600 space-y-0.5">
                                <li>• Vitals: BP 118/76, HR 72, Temp 98.4°F</li>
                                <li>• Appearance: Well-developed, no apparent distress</li>
                                <li>• Neurological: Alert & oriented x3, no focal deficits</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Assessment:</p>
                            <ol className="text-slate-600 list-decimal list-inside">
                                <li>Tension-type headaches - improving</li>
                                <li>Sleep deprivation - resolved with lifestyle modifications</li>
                            </ol>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Plan:</p>
                            <ul className="text-slate-600 space-y-0.5">
                                <li>• Continue current sleep hygiene regimen</li>
                                <li>• Stress reduction techniques reviewed</li>
                                <li>• Follow up in 4 weeks or PRN</li>
                                <li>• Patient to log headache frequency</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-700">Would you like me to insert this into the note editor?</p>
                </div>
            );
            setAiChatHistory(prev => [...prev, { role: 'assistant', text: richContent }]);
        }
        // DIABETES
        else if (currentPrompt.includes('diabetes') || currentPrompt.includes('a1c')) {
            const richContent = (
                <div className="space-y-3">
                    <p className="text-slate-700">I've drafted a diabetes-focused encounter note:</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                        <p className="font-bold text-slate-800">Diabetes Follow-up Note</p>
                        <div>
                            <p className="font-semibold text-slate-700">Subjective:</p>
                            <p className="text-slate-600">Patient presents for diabetes management. Reports home glucose monitoring has been consistent.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Objective:</p>
                            <ul className="text-slate-600 space-y-0.5">
                                <li>• A1C: 6.8% (down from 7.2%)</li>
                                <li>• Average glucose: 135 mg/dL</li>
                                <li>• No hypoglycemic episodes reported</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Assessment:</p>
                            <p className="text-slate-600">Type 2 Diabetes Mellitus - well controlled</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-700">Plan:</p>
                            <ul className="text-slate-600 space-y-0.5">
                                <li>• Continue current metformin regimen</li>
                                <li>• Repeat A1C in 3 months</li>
                                <li>• Dietary reinforcement provided</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-700">Shall I add this to your note?</p>
                </div>
            );
            setAiChatHistory(prev => [...prev, { role: 'assistant', text: richContent }]);
        }
        // FORMS
        else if (currentPrompt.includes('form') || currentPrompt.includes('intake') || currentPrompt.includes('questionnaire')) {
            const formItems = [
                'Standard Patient Intake Form',
                'Health Insurance Information',
                'Medical History Questionnaire',
                'Current Medications List'
            ];

            createInlineProposal('Forms to Generate', formItems, 'purple');
        }
        // COMMUNICATIONS
        else if (currentPrompt.includes('message') || currentPrompt.includes('email') || currentPrompt.includes('notify') || currentPrompt.includes('send')) {
            const messageItems = [
                'Send appointment reminder email',
                'Send lab results summary to patient portal',
                'Schedule follow-up SMS notification'
            ];

            createInlineProposal('Communications to Send', messageItems, 'blue');
        }
        // DOCUMENTS
        else if (currentPrompt.includes('document') || currentPrompt.includes('generate') || currentPrompt.includes('create')) {
            const docItems = [
                'Generate clinical visit summary',
                'Create patient care plan document',
                'Export treatment plan to PDF'
            ];

            createInlineProposal('Documents to Create', docItems, 'amber');
        }
        // GENERIC HELP
        else {
            const genericResponse = (
                <div className="space-y-2">
                    <p className="text-slate-700">I can help you with the following Vibrant Intelligence actions:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded">
                            <p className="font-bold text-slate-700">📋 Clinical Notes</p>
                            <ul className="text-slate-500 mt-1 space-y-0.5">
                                <li>• Summarize visit</li>
                                <li>• Draft SOAP notes</li>
                                <li>• Treatment plans</li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <p className="font-bold text-slate-700">🔬 Orders</p>
                            <ul className="text-slate-500 mt-1 space-y-0.5">
                                <li>• Order lab tests</li>
                                <li>• Prescribe medications</li>
                                <li>• Schedule imaging</li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <p className="font-bold text-slate-700">📅 Scheduling</p>
                            <ul className="text-slate-500 mt-1 space-y-0.5">
                                <li>• Book appointments</li>
                                <li>• Set reminders</li>
                                <li>• Calendar invites</li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <p className="font-bold text-slate-700">⚡ Automation</p>
                            <ul className="text-slate-500 mt-1 space-y-0.5">
                                <li>• Trigger workflows</li>
                                <li>• Create tasks</li>
                                <li>• Send messages</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-slate-700 mt-2">Try saying: <em className="text-blue-600">"Order Gut Zoomer lab test"</em> or <em className="text-blue-600">"Schedule follow-up appointment"</em></p>
                </div>
            );

            setAiChatHistory(prev => [...prev, { role: 'assistant', text: genericResponse }]);
        }
    }, 2000);
  };

  const filteredList = getFilteredList();

  return (
    <div className="flex h-full bg-white overflow-hidden relative">
      
      {/* REAL-TIME SUGGESTION DROPDOWN */}
      {menuConfig.open && (
        <div 
          className="fixed z-[999] w-72 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ top: menuConfig.y, left: menuConfig.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {menuConfig.type === 'variable' ? 'Patient Variables' : menuConfig.type === 'clinical' ? 'Clinical Objects' : 'Slash Commands'}
             </span>
             <span className="text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border shadow-sm">
                {filteredList.length} matches
             </span>
          </div>
          <div className="flex flex-col py-1 max-h-64 overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-400 italic">No results found</p>
                <button className="mt-2 text-xs font-bold text-blue-600 hover:underline">+ Create new</button>
              </div>
            ) : (
              filteredList.map((item, idx) => {
                const Icon = (item as any).icon;
                const active = menuConfig.selectedIndex === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => executeCommand(item)}
                    onMouseEnter={() => setMenuConfig(prev => ({ ...prev, selectedIndex: idx }))}
                    className={`flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-slate-50 last:border-0 ${active ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <div className={`p-1.5 rounded-lg ${active ? 'bg-white shadow-sm' : 'bg-slate-100'} ${(item as any).color || 'text-slate-400'}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold block truncate">{item.label}</span>
                      {(item as any).type && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{(item as any).type}</span>}
                    </div>
                    {active && <Check size={14} className="text-blue-500" strokeWidth={3} />}
                  </button>
                );
              })
            )}
          </div>
          <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
             <span>↑↓ Nav</span> <span>↵ Select</span> <span>ESC Close</span>
          </div>
        </div>
      )}

      {/* LEFT: MAIN EDITOR AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="px-6 py-4 border-b border-gray-200 flex items-start gap-4 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-sm">
                {patient.avatar ? <img src={patient.avatar} className="w-full h-full object-cover" alt="Patient"/> : patient.initials}
             </div>
          </div>
          <div className="flex-1 pt-1">
             <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
                <button className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-[#0F4C81] text-xs font-bold rounded-full hover:bg-blue-100 transition-colors shadow-sm">
                   <UserCircle size={14} /> SWITCH PATIENT <RefreshCw size={12} />
                </button>
             </div>
             <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Bio Gender: <span className="text-gray-900 font-medium">{patient.gender}</span></span>
                <span>DOB: <span className="text-gray-900 font-medium">{patient.dob}</span></span>
                <span>Date: <span className="text-gray-900 font-medium">Dec-10-2025</span></span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-medium text-gray-800">{noteTitle}</h2>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors"><Edit2 size={18} /></button>
                      {noteStatus !== 'draft' && (
                        <span className={`ml-2 px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${noteStatus === 'signed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {noteStatus === 'signed' ? '✓ Signed' : '✓✓ Co-Signed'}
                        </span>
                      )}
                   </div>
                   <div className="flex gap-2">
                       <button className="px-4 py-1.5 border border-red-200 text-red-600 text-sm font-bold rounded hover:bg-red-50 transition-colors">Delete</button>
                       {noteStatus === 'draft' ? (
                         <>
                           <button onClick={() => setShowSignatureModal(true)} className="px-4 py-1.5 bg-[#0F4C81] text-white text-sm font-bold rounded hover:bg-[#09355E] transition-colors shadow-sm flex items-center gap-2">
                             <Signature size={14} /> Sign Note
                           </button>
                         </>
                       ) : noteStatus === 'signed' ? (
                         <>
                           <button onClick={handleRequestCoSign} className="px-4 py-1.5 border border-blue-200 text-blue-600 text-sm font-bold rounded hover:bg-blue-50 transition-colors flex items-center gap-2">
                             <Users size={14} /> Request Co-Sign
                           </button>
                           <button onClick={handleAddAppendage} className="px-4 py-1.5 bg-amber-500 text-white text-sm font-bold rounded hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2">
                             <Plus size={14} /> Add Addendum
                           </button>
                         </>
                       ) : (
                         <button className="px-4 py-1.5 bg-gray-100 text-gray-400 text-sm font-bold rounded cursor-not-allowed">
                           <Check size={14} /> Fully Signed
                         </button>
                       )}
                   </div>
                </div>

                <div className="border border-gray-200 rounded-lg bg-white min-h-[600px] flex overflow-hidden shadow-sm">
                   {isPanelOpen && (
                     <div className="w-[400px] border-r border-gray-200 bg-white flex flex-col shrink-0 animate-in slide-in-from-left-4 fade-in duration-300">
                        {recordingState === 'recording' ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 relative">
                                <div className="relative mb-8">
                                   <div className="w-24 h-24 rounded-3xl bg-[#2D8CFF]/10 animate-pulse absolute inset-0"></div>
                                   <div className="w-24 h-24 rounded-3xl bg-[#2D8CFF] flex items-center justify-center relative z-10 shadow-xl transition-transform hover:scale-105">
                                      <Video size={48} className="text-white" fill="currentColor" />
                                   </div>
                                   <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm border border-gray-100 z-20">
                                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                                   </div>
                                </div>
                                
                                <div className="text-center mb-8">
                                   <h3 className="text-xl font-bold text-slate-800 mb-1">Zoom Meeting Active</h3>
                                   <div className="flex items-center justify-center gap-2 text-[#2D8CFF] font-medium text-xs bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mx-auto w-fit">
                                      <Activity size={12} className="animate-pulse" /> Capturing Audio Stream...
                                   </div>
                                </div>

                                <div className="font-mono text-4xl font-bold text-slate-700 tracking-wider mb-8 tabular-nums">
                                   {formatTime(recordingSeconds)}
                                </div>

                                <div className="w-full max-w-xs space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">DS</div>
                                        <div className="flex-1 min-w-0">
                                           <div className="text-xs font-bold text-slate-700">Dr. Smith (Host)</div>
                                           <div className="text-[10px] text-green-600 font-medium flex items-center gap-1"><Mic size={10}/> Audio Active</div>
                                        </div>
                                        <div className="h-4 w-12 bg-slate-50 rounded-full overflow-hidden flex items-center gap-0.5 px-1">
                                           <div className="w-1 h-2 bg-green-400 rounded-full animate-[bounce_1s_infinite]"></div>
                                           <div className="w-1 h-3 bg-green-400 rounded-full animate-[bounce_1.2s_infinite]"></div>
                                           <div className="w-1 h-1.5 bg-green-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm opacity-90">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                           {patient.avatar ? <img src={patient.avatar} className="w-full h-full object-cover"/> : patient.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                           <div className="text-xs font-bold text-slate-700">{patient.name}</div>
                                           <div className="text-[10px] text-green-600 font-medium flex items-center gap-1"><Mic size={10}/> Audio Active</div>
                                        </div>
                                         <div className="h-4 w-12 bg-slate-50 rounded-full overflow-hidden flex items-center gap-0.5 px-1">
                                           <div className="w-1 h-1.5 bg-green-400 rounded-full animate-[bounce_1.1s_infinite]"></div>
                                           <div className="w-1 h-3 bg-green-400 rounded-full animate-[bounce_0.9s_infinite]"></div>
                                           <div className="w-1 h-2 bg-green-400 rounded-full animate-[bounce_1.3s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleStopRecording} className="mt-8 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-xs hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2">
                                   <Square size={14} fill="currentColor" /> End & Process
                                </button>
                             </div>
                        ) : (
                            <div className="flex-1 flex flex-col bg-white">
                                <div className="p-4 border-b border-gray-100">
                                    <button onClick={() => setIsPlaying(!isPlaying)} className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 text-sm font-bold transition-all ${isPlaying ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-inner' : 'border-[#0F4C81] text-[#0F4C81] bg-white hover:bg-blue-50'}`}>
                                        {isPlaying ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>} {isPlaying ? 'Pause' : 'Play Recording'} <span className="font-mono ml-1">{formatTime(recordingSeconds)}</span>
                                    </button>
                                </div>
                                <div className="flex border-b border-gray-200">
                                   <button onClick={() => setActiveReviewTab('transcription')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${activeReviewTab === 'transcription' ? 'text-[#0F4C81] border-[#0F4C81]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>Transcription</button>
                                   <button onClick={() => setActiveReviewTab('summary')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${activeReviewTab === 'summary' ? 'text-[#0F4C81] border-[#0F4C81]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>AI Summary</button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                                    {activeReviewTab === 'transcription' ? (
                                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{MOCK_TRANSCRIPT}</div>
                                    ) : (
                                        <div className="h-full">
                                            {isGeneratingSummary ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center">
                                                    <Loader2 size={32} className="text-[#0F4C81] animate-spin mb-4" />
                                                    <h4 className="text-sm font-bold text-gray-800">Generating Summary</h4>
                                                    <p className="text-xs text-gray-500 mt-1">Analyzing transcript with clinical context...</p>
                                                </div>
                                            ) : !isSummaryGenerated ? (
                                                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                                        <Sparkles size={24} className="text-[#0F4C81]" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-gray-900 mb-2">Generate AI Composer Summary</h3>
                                                    <p className="text-sm text-gray-500 mb-6 max-w-xs">Select a template format to generate a clinical summary from this recording.</p>
                                                    
                                                    <div className="w-full space-y-3">
                                                        {NOTE_TEMPLATES.map(t => (
                                                            <button 
                                                                key={t.id}
                                                                onClick={() => handleGenerateSummary(t.id)}
                                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-[#0F4C81] hover:shadow-md transition-all text-left flex items-center justify-between group"
                                                            >
                                                                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0F4C81]">{t.label}</span>
                                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0F4C81]" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans animate-in fade-in duration-300">
                                                    {MOCK_SUMMARY}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {(activeReviewTab === 'transcription' || isSummaryGenerated) && (
                                    <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                                        <button 
                                            onClick={() => { 
                                                if(editorRef.current) {
                                                    let htmlContent = '';
                                                    if (activeReviewTab === 'summary') {
                                                        htmlContent = MOCK_SUMMARY.split('\n\n').map(sec => {
                                                            const parts = sec.split('\n');
                                                            const title = parts[0];
                                                            const content = parts.slice(1).join('<br/>');
                                                            return `<div class="mb-3"><div class="font-bold text-slate-800">${title}</div><div class="text-slate-600">${content}</div></div>`;
                                                        }).join('');
                                                    } else {
                                                        htmlContent = `<div class="whitespace-pre-wrap text-slate-600">${MOCK_TRANSCRIPT}</div>`;
                                                    }
                                                    
                                                    // Insert wrapped in a container for styling
                                                    const wrapper = `<div class="my-4 text-sm">${htmlContent}</div><p><br/></p>`;
                                                    editorRef.current.innerHTML += wrapper;
                                                    
                                                    // Move caret to end (simple approximation)
                                                    const range = document.createRange();
                                                    const sel = window.getSelection();
                                                    range.selectNodeContents(editorRef.current);
                                                    range.collapse(false);
                                                    sel?.removeAllRanges();
                                                    sel?.addRange(range);
                                                    editorRef.current.scrollTop = editorRef.current.scrollHeight;
                                                } 
                                            }} 
                                            className="flex-1 py-2.5 bg-white border border-[#0F4C81] text-[#0F4C81] font-bold text-xs rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText size={14} /> Insert into Note
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>
                   )}

                   <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                       {/* Collaboration Toolbar */}
                       {isCollaborationMode && noteStatus === 'draft' && (
                         <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             {/* Active Collaborators */}
                             <div className="flex items-center -space-x-1.5">
                               {collaborators.map(c => (
                                 <div
                                   key={c.id}
                                   className={`w-7 h-7 rounded-full ${c.color} flex items-center justify-center text-white text-[9px] font-bold border-2 border-white ${c.status === 'online' ? 'ring-2 ring-green-400' : 'opacity-60'}`}
                                   title={`${c.name} (${c.status})`}
                                 >
                                   {c.initials}
                                 </div>
                               ))}
                               <button className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 border-2 border-white transition-colors" title="Add collaborator">
                                 <UserPlus size={12} />
                               </button>
                             </div>
                             <span className="text-[10px] text-slate-500 font-medium ml-1">
                               {collaborators.filter(c => c.status === 'online').length} viewing
                             </span>
                           </div>
                           <div className="flex items-center gap-1">
                             <button
                               onClick={() => setIsCollaborationMode(false)}
                               className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                               title="Exit collaboration mode"
                             >
                               <X size={14} />
                             </button>
                           </div>
                         </div>
                       )}

                       <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-[#F8F9FA]">
                          <div className="flex items-center gap-4 text-gray-600">
                             <div className="relative">
                                <button
                                  ref={templateBtnRef}
                                  onClick={(e) => { e.stopPropagation(); setIsTemplateMenuOpen(!isTemplateMenuOpen); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                  <Layout size={14} className="text-indigo-500" /> Templates
                                </button>
                                {isTemplateMenuOpen && (
                                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] py-1 animate-in slide-in-from-top-2 duration-150">
                                    {NOTE_TEMPLATES.map((tpl) => (
                                      <button key={tpl.id} onClick={() => handleApplyTemplate(tpl.content)} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                                        <span className="font-medium">{tpl.label}</span>
                                        <Plus size={14} className="text-gray-300 group-hover:text-indigo-500" />
                                      </button>
                                    ))}
                                    <div className="mt-1 border-t border-gray-50 p-2">
                                      <button className="w-full py-2 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wide hover:bg-indigo-100 transition-colors">+ Custom Template</button>
                                    </div>
                                  </div>
                                )}
                             </div>
                             <div className="w-px h-4 bg-gray-300 mx-1"></div>
                             <button className="p-1 hover:bg-slate-200 rounded transition-colors font-bold">B</button>
                             <button className="p-1 hover:bg-slate-200 rounded transition-colors italic font-serif">I</button>
                             <button className="p-1 hover:bg-slate-200 rounded transition-colors underline font-serif">U</button>
                             <button className="p-1 hover:bg-slate-200 rounded transition-colors"><List size={18} /></button>

                             {/* Collaboration Tools */}
                             {noteStatus === 'draft' && (
                               <>
                                 <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                 <div className="relative">
                                   <button
                                     onClick={() => setShowMentionMenu(!showMentionMenu)}
                                     className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-600 flex items-center gap-1"
                                     title="Mention someone"
                                   >
                                     <AtSign size={16} />
                                   </button>
                                   {showMentionMenu && (
                                     <div className="mention-menu absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] py-2 animate-in slide-in-from-top-1 duration-100">
                                       <div className="px-3 pb-2">
                                         <input
                                           type="text"
                                           placeholder="Search providers..."
                                           className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           value={mentionFilter}
                                           onChange={(e) => setMentionFilter(e.target.value)}
                                           autoFocus
                                         />
                                       </div>
                                       <div className="max-h-48 overflow-y-auto">
                                         {filteredProviders.map(p => (
                                           <button
                                             key={p.id}
                                             onClick={() => handleAddMention(p.name)}
                                             className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                           >
                                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                                               {p.name.split(' ').map(n => n[0]).join('')}
                                             </div>
                                             <div className="text-left">
                                               <div className="text-sm font-medium text-slate-700">{p.name}</div>
                                               <div className="text-[10px] text-slate-400">{p.role}</div>
                                             </div>
                                           </button>
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                                 <div className="relative">
                                   <button
                                     onClick={() => setShowAttachMenu(!showAttachMenu)}
                                     className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-600"
                                     title="Attach file"
                                   >
                                     <Paperclip size={16} />
                                   </button>
                                   {showAttachMenu && (
                                     <div className="attach-menu absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] py-1 animate-in slide-in-from-top-1 duration-100">
                                       <button onClick={() => handleAttachFile('image')} className="w-full px-3 py-2 hover:bg-slate-50 text-left text-sm text-slate-700 flex items-center gap-2 transition-colors">
                                         <span>🖼️</span> Image
                                       </button>
                                       <button onClick={() => handleAttachFile('lab')} className="w-full px-3 py-2 hover:bg-slate-50 text-left text-sm text-slate-700 flex items-center gap-2 transition-colors">
                                         <span>🔬</span> Lab Result
                                       </button>
                                       <button onClick={() => handleAttachFile('document')} className="w-full px-3 py-2 hover:bg-slate-50 text-left text-sm text-slate-700 flex items-center gap-2 transition-colors">
                                         <span>📎</span> Document
                                       </button>
                                     </div>
                                   )}
                                 </div>
                                 <button
                                   onClick={() => setIsCollaborationMode(!isCollaborationMode)}
                                   className={`p-1.5 rounded transition-colors flex items-center gap-1 ${isCollaborationMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-200 text-slate-600'}`}
                                   title="Toggle collaboration"
                                 >
                                   <MessageCircle size={16} />
                                   <span className="text-[10px] font-bold hidden sm:inline">Comments</span>
                                   {comments.length > 0 && (
                                     <span className="ml-0.5 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full">{comments.length}</span>
                                   )}
                                 </button>
                               </>
                             )}
                          </div>
                          <div className="flex items-center gap-2">
                             {noteStatus === 'draft' && (
                               <button onClick={() => { setIsPanelOpen(true); setRecordingState('recording'); setRecordingSeconds(0); }} className="flex items-center gap-2 px-4 py-1.5 bg-[#2D8CFF] hover:bg-[#1E7ADC] text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95">
                                 <Video size={16} fill="currentColor" /> Connected from Zoom
                               </button>
                             )}
                             {noteStatus !== 'draft' && (
                               <div className="flex items-center gap-2 text-xs text-slate-500">
                                 <Eye size={14} />
                                 <span>Read-only</span>
                               </div>
                             )}
                          </div>
                       </div>

                       {/* Comment Popover */}
                       {showCommentPopover && (
                         <div
                           className="comment-popover fixed z-[1000] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                           style={{
                             left: `${commentPosition.x - 144}px`,
                             top: `${commentPosition.y - 10}px`,
                             transform: 'translateY(-100%)'
                           }}
                           onClick={(e) => e.stopPropagation()}
                         >
                           <div className="p-3">
                             <div className="flex items-center justify-between mb-2">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Comment</span>
                               <button onClick={() => setShowCommentPopover(false)} className="text-slate-400 hover:text-slate-600">
                                 <X size={14} />
                               </button>
                             </div>
                             <div className="bg-slate-50 rounded p-2 mb-2 text-xs text-slate-600 italic">
                               "{selectedText.length > 50 ? selectedText.slice(0, 50) + '...' : selectedText}"
                             </div>
                             <textarea
                               className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                               rows={3}
                               placeholder="Type your comment..."
                               value={newComment}
                               onChange={(e) => setNewComment(e.target.value)}
                               autoFocus
                             />
                             <div className="flex items-center justify-between mt-2">
                               <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Attach to comment">
                                 <Paperclip size={14} />
                               </button>
                               <button
                                 onClick={handleAddComment}
                                 disabled={!newComment.trim()}
                                 className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                               >
                                 <Send size={12} /> Comment
                               </button>
                             </div>
                           </div>
                         </div>
                       )}

                       <div
                          ref={editorRef}
                          contentEditable={noteStatus === 'draft'}
                          onClick={handleEditorClick}
                          onMouseUp={(e) => {
                            handleEditorClick(e);
                            setTimeout(() => {
                              const selection = window.getSelection();
                              const text = selection?.toString().trim();
                              if (text && text.length > 0 && isCollaborationMode && noteStatus === 'draft') {
                                const range = selection.getRangeAt(0);
                                const rect = range.getBoundingClientRect();
                                setSelectedText(text);
                                setCommentPosition({
                                  x: rect.left + rect.width / 2,
                                  y: window.scrollY + rect.top - 10
                                });
                                setShowCommentPopover(true);
                              }
                            }, 10);
                          }}
                          onKeyDown={handleEditorKeyDown}
                          onKeyUp={handleEditorKeyUp}
                          className="flex-1 w-full p-8 bg-white outline-none overflow-y-auto text-gray-700 leading-relaxed text-sm"
                          data-placeholder={noteStatus === 'draft' ? "Start typing clinical notes... (Use 3 letters for items or $ for variables). Select text to add comments." : ""}
                          style={noteStatus !== 'draft' ? { cursor: 'default' } : {}}
                       ></div>

                       {/* Comments Sidebar (visible when collaboration is on) */}
                       {isCollaborationMode && comments.length > 0 && (
                         <div className="border-t border-gray-100 bg-slate-50 p-3 max-h-40 overflow-y-auto">
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Comments ({comments.length})</div>
                           <div className="space-y-2">
                             {comments.map(c => (
                               <div key={c.id} className="bg-white rounded-lg p-2.5 border border-gray-100 shadow-sm">
                                 <div className="flex items-center justify-between mb-1">
                                   <span className="text-xs font-bold text-slate-700">{c.author}</span>
                                   <span className="text-[9px] text-slate-400">{c.time}</span>
                                 </div>
                                 <p className="text-xs text-slate-600 mb-1">{c.text}</p>
                                 <div className="text-[10px] text-slate-400 italic bg-slate-50 rounded px-1.5 py-0.5">
                                   "{c.selection.length > 40 ? c.selection.slice(0, 40) + '...' : c.selection}"
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT: PEG BOARD & AI ASSISTANT TABS */}
      <div className="w-80 bg-[#0F4C81] flex flex-col shrink-0 text-slate-800 border-l border-[#0a355c]">
         <div className="flex bg-[#0a355c]/40 shrink-0">
            <button onClick={() => setPegBoardTab('cards')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${pegBoardTab === 'cards' ? 'bg-[#0F4C81] text-white border-b-2 border-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>Peg Board</button>
            <button onClick={() => setPegBoardTab('ai')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${pegBoardTab === 'ai' ? 'bg-[#0F4C81] text-white border-b-2 border-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Sparkles size={12} className={pegBoardTab === 'ai' ? 'animate-pulse' : ''} /> AI Composer</button>
         </div>
         {pegBoardTab === 'cards' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {/* Active Exception Pin */}
                {patient.workflowStatus === 'exception' && (
                     <div className="bg-amber-50 rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow border-l-4 border-amber-500">
                        <PinIcon />
                        <div className="flex items-start gap-3">
                            <div className="pt-0.5"><AlertTriangle size={16} className="text-amber-600" /></div>
                            <div>
                                <div className="text-[10px] text-amber-600 mb-0.5 font-bold uppercase">Action Required</div>
                                <div className="text-sm font-bold text-gray-900">Lab Exception</div>
                                <div className="text-[10px] text-gray-500 mt-1">TNP - Redraw Needed</div>
                            </div>
                        </div>
                    </div>
                )}

                 {/* Completed Pin */}
                 {patient.workflowStatus === 'completed' && (
                     <div className="bg-emerald-50 rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow border-l-4 border-emerald-500">
                        <PinIcon />
                        <div className="flex items-start gap-3">
                            <div className="pt-0.5"><CheckCheck size={16} className="text-emerald-600" /></div>
                            <div>
                                <div className="text-[10px] text-emerald-600 mb-0.5 font-bold uppercase">Status Update</div>
                                <div className="text-sm font-bold text-gray-900">Workflow Complete</div>
                                <div className="text-[10px] text-gray-500 mt-1">Results sent & Reviewed</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Demographics Card (Updated Position) */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                   <PinIcon />
                   <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-3">
                         <Calendar size={16} className="text-gray-500" />
                         <span className="text-sm text-gray-700 font-medium">{patient.dob} ({patient.age} yrs)</span>
                      </div>
                      <div className="flex items-center gap-3">
                         {patient.gender === 'Male' ? <Mars size={16} className="text-gray-500" /> : <Venus size={16} className="text-gray-500" />}
                         <span className="text-sm text-gray-700 font-medium">{patient.gender}</span>
                      </div>
                   </div>
                </div>

                {/* Vitals */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                    <PinIcon />
                    <div className="flex items-start gap-3">
                        <div className="pt-0.5"><Activity size={16} className="text-gray-500" /></div>
                        <div>
                            <div className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase">Latest Vitals (Dec 10):</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700">
                                <span>BP: <span className="font-bold">118/76</span></span>
                                <span>HR: <span className="font-bold">72 bpm</span></span>
                                <span>Temp: <span className="font-bold">98.4°F</span></span>
                                <span>Wt: <span className="font-bold">145 lbs</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                    <PinIcon />
                    <div className="flex items-start gap-3">
                        <div className="pt-0.5"><Phone size={16} className="text-gray-500" /></div>
                        <div className="space-y-1 w-full">
                            <div className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase">Contact:</div>
                            <div className="text-xs text-gray-700 flex items-center gap-2">
                                <Phone size={10} className="text-gray-400"/> (555) 123-4567
                            </div>
                            <div className="text-xs text-gray-700 flex items-center gap-2 overflow-hidden text-ellipsis">
                                <Mail size={10} className="text-gray-400 shrink-0"/> <span className="truncate">sarah.j@example.com</span>
                            </div>
                            <div className="text-xs text-gray-700 flex items-start gap-2">
                                <MapPin size={10} className="text-gray-400 mt-0.5 shrink-0"/> <span>123 Wellness Blvd, Austin TX</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Past Visits */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                    <PinIcon />
                    <div className="flex items-start gap-3">
                        <div className="pt-0.5"><Calendar size={16} className="text-gray-500" /></div>
                        <div className="w-full">
                            <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Recent Visits:</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs border-b border-gray-100 pb-1">
                                    <span className="text-gray-700">Follow-up</span>
                                    <span className="text-gray-400">Nov 12, 2025</span>
                                </div>
                                <div className="flex justify-between text-xs border-b border-gray-100 pb-1">
                                    <span className="text-gray-700">Initial Consult</span>
                                    <span className="text-gray-400">Oct 05, 2025</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lab Results */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                    <PinIcon />
                    <div className="flex items-start gap-3">
                        <div className="pt-0.5"><FlaskConical size={16} className="text-gray-500" /></div>
                        <div className="w-full">
                            <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Recent Labs:</div>
                            <div className="space-y-2">
                                <div className="text-xs border-b border-gray-100 pb-1">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-700">Wheat Zoomer</span>
                                        <span className="text-gray-400 text-[10px]">Nov 20</span>
                                    </div>
                                    <div className="text-[10px] text-red-500 mt-0.5 font-medium flex items-center gap-1"><AlertTriangle size={8} /> High Sensitivity</div>
                                </div>
                                <div className="text-xs border-b border-gray-100 pb-1">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-700">Comp. Metabolic</span>
                                        <span className="text-gray-400 text-[10px]">Oct 08</span>
                                    </div>
                                    <div className="text-[10px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1"><Check size={8} /> Within Limits</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Previous Treatment Plans */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                    <PinIcon />
                    <div className="flex items-start gap-3">
                        <div className="pt-0.5"><ClipboardList size={16} className="text-gray-500" /></div>
                        <div>
                            <div className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase">Active Protocols:</div>
                            <div className="text-sm font-bold text-blue-700">Gut Restoration Phase 1</div>
                            <div className="text-[10px] text-gray-500 mt-1">Started: Oct 15, 2025</div>
                            <div className="mt-1.5 flex gap-1">
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded font-medium">Dietary</span>
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded font-medium">Supplements</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medications */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                   <PinIcon />
                   <div className="flex items-start gap-3">
                      <div className="pt-0.5"><Pill size={16} className="text-gray-500" /></div>
                      <div>
                         <div className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase">Medications (1):</div>
                         <div className="text-sm font-bold text-gray-900">Cymbalta</div>
                         <div className="text-[10px] text-gray-500 mt-1">60mg, 1 capsule daily with food<br/>Started on Dec-10-2021</div>
                      </div>
                   </div>
                </div>

                {/* Sample: Gut Zoomer */}
                <div className="bg-white rounded-md p-3 shadow-sm relative group hover:shadow-md transition-shadow">
                   <PinIcon />
                   <div className="flex items-start gap-3">
                      <div className="pt-0.5"><FlaskConical size={16} className="text-gray-500" /></div>
                      <div>
                         <div className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase">Sample:</div>
                         <div className="text-sm font-bold text-gray-900">Gut Zoomer</div>
                         <div className="text-[10px] text-gray-500 mt-1">Service Date: Dec-08-2025</div>
                         {patient.workflowStatus === 'exception' && <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded mt-1">Exception</span>}
                         {patient.workflowStatus === 'completed' && <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded mt-1">Results Ready</span>}
                      </div>
                   </div>
                </div>

            </div>
         ) : (
            <SidebarAiAssistant
                history={aiChatHistory}
                isProcessing={isAiProcessing}
                onSendMessage={handleAiMessage}
            />
         )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <Calendar className="text-[#0F4C81]" size={18} /> Schedule Appointment
                  </h3>
                  <button onClick={() => { setIsAppointmentModalOpen(false); editingCardRef.current = null; setApptForm({ date: '', time: '', reason: 'Follow-up', location: 'Zoom' }); }} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date</label>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={apptForm.date}
                        onChange={e => setApptForm({...apptForm, date: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Time</label>
                      <div className="relative">
                        <input 
                            type="time" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pl-9"
                            value={apptForm.time}
                            onChange={e => setApptForm({...apptForm, time: e.target.value})}
                        />
                        <Clock size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Meeting Location</label>
                      <div className="relative">
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pl-9"
                            value={apptForm.location}
                            onChange={e => setApptForm({...apptForm, location: e.target.value})}
                        />
                        <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Type / Reason</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={apptForm.reason}
                        onChange={e => setApptForm({...apptForm, reason: e.target.value})}
                        placeholder="e.g. Follow-up, Lab Review..."
                      />
                  </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                  <button onClick={() => { setIsAppointmentModalOpen(false); editingCardRef.current = null; setApptForm({ date: '', time: '', reason: 'Follow-up', location: 'Zoom' }); }} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleConfirmAppointment} disabled={!apptForm.date || !apptForm.time} className="px-4 py-2 text-sm font-bold text-white bg-[#0F4C81] hover:bg-[#09355E] rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Schedule</button>
              </div>
           </div>
        </div>
      )}

      {/* Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <FlaskConical className="text-emerald-600" size={18} /> Create Lab Order
                  </h3>
                  <button onClick={() => { setIsOrderModalOpen(false); editingCardRef.current = null; setOrderForm({ testId: 'gut', deliveryMethod: 'office', paymentMethod: 'office_bill' }); }} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Test Type</label>
                      <div className="relative">
                          <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                            value={orderForm.testId}
                            onChange={e => setOrderForm({...orderForm, testId: e.target.value})}
                          >
                             {LAB_TEST_OPTIONS.map(opt => (
                                 <option key={opt.id} value={opt.id}>{opt.name}</option>
                             ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                  </div>
                  
                  {/* Delivery Method */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Delivery Method</label>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => setOrderForm({...orderForm, deliveryMethod: 'office'})}
                              className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${orderForm.deliveryMethod === 'office' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >Provided by Office</button>
                          <button 
                              onClick={() => setOrderForm({...orderForm, deliveryMethod: 'patient'})}
                              className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${orderForm.deliveryMethod === 'patient' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >Ship to Patient</button>
                      </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Method</label>
                      <div className="relative">
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
                            value={orderForm.paymentMethod}
                            onChange={e => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                        >
                            <option value="office_bill">Office Bill (Default)</option>
                            <option value="patient_now">Patient Pay Now</option>
                            <option value="patient_later">Patient Pay Later</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                      </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500">
                      <p className="mb-1 font-semibold text-slate-700">Order Note:</p>
                      <p>This will generate a digital requisition form sent directly to the Vibrant Lab interface. The patient will be notified via portal.</p>
                  </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                  <button onClick={() => { setIsOrderModalOpen(false); editingCardRef.current = null; setOrderForm({ testId: 'gut', deliveryMethod: 'office', paymentMethod: 'office_bill' }); }} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleConfirmOrder} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-2"><Check size={14} /> Place Order</button>
              </div>
           </div>
        </div>
      )}
      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <PenLine className="text-emerald-600" size={18} /> Sign Encounter Note
              </h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold">IH</div>
                  <div>
                    <div className="font-bold text-slate-800">Dr. Irene Hoffman</div>
                    <div className="text-xs text-slate-500">MD, FACP • NPI: 1234567890</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div><span className="font-medium text-slate-700">Patient:</span> {patient.name}</div>
                  <div><span className="font-medium text-slate-700">Note Title:</span> {noteTitle}</div>
                  <div><span className="font-medium text-slate-700">Date of Service:</span> Dec 10, 2025</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>Electronic Signature Agreement:</strong> By signing this note, I certify that this documentation is accurate, complete, and was created by me or under my direct supervision. This electronic signature has the same legal effect as a handwritten signature.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Signature Preview</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-slate-50 text-center">
                  <div className="font-script text-2xl text-slate-700 italic" style={{ fontFamily: 'cursive' }}>Irene Hoffman, MD</div>
                  <div className="text-[10px] text-slate-400 mt-1">Electronically signed on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
              <button onClick={() => setShowSignatureModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSignNote} className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-2">
                <PenLine size={16} /> Sign Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Co-Sign Request Modal */}
      {showCoSignModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-blue-600" size={18} /> Request Co-Signature
              </h3>
              <button onClick={() => setShowCoSignModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-slate-600 mb-4">
                Select a provider to co-sign this encounter note. The co-signer will receive a notification and can review before signing.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Co-Signer</label>
                <div className="space-y-2">
                  {availableProviders.map((provider, idx) => (
                    <button
                      key={provider.id}
                      className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                        idx === 0 ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'bg-white border-gray-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{provider.name}</div>
                        <div className="text-[10px] text-slate-500">{provider.role}</div>
                      </div>
                      {idx === 0 && <Check className="text-blue-600" size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message to Co-Signer (Optional)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Add a note for the co-signer..."
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
              <button onClick={() => setShowCoSignModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleCoSignNote} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2">
                <Send size={14} /> Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; cursor: text; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .ai-proposal-wrapper::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; border-radius: inherit; box-shadow: inset 0 0 100px rgba(59, 130, 246, 0.05); }
      `}} />
    </div>
  );
};

const PinIcon = () => (
    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center z-10 transform rotate-12">
        <Pin size={12} className="text-red-500 fill-red-500" />
    </div>
);

// --- Icons Helpers ---
const SearchIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const SmartphoneIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
);
const ExpandIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
);
const MoveIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
);

import React, { useState } from 'react';
import {
  X, Bot, Send, Calendar, AlertTriangle, AlertCircle,
  CheckCircle2, Clock, ClipboardList, ShoppingCart, User, Tag
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type AutomationSeverity = 'urgent' | 'warning' | 'completed';
type AutomationStatus = 'active' | 'completed';
type TabId = 'automations' | 'mentions' | 'tasks' | 'orders';

interface BotThreadMessage {
  id: string;
  type: 'bot' | 'error' | 'warning' | 'system';
  text: string;
}

interface AutomationCard {
  id: string;
  severity: AutomationSeverity;
  status: AutomationStatus;
  title: string;
  patientName: string;
  description: string;
  timestamp: string;
  botThread: BotThreadMessage[];
  actionButton?: {
    label: string;
    callbackKey: string;
  };
}

interface MentionItem {
  id: string;
  author: string;
  context: string;
  timestamp: string;
}

interface TaskItem {
  id: string;
  title: string;
  patient: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface OrderItem {
  id: string;
  orderName: string;
  patient: string;
  status: string;
  timestamp: string;
}

interface NotificationCenterProps {
  onClose: () => void;
  onFormulaApproval: () => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_AUTOMATIONS: AutomationCard[] = [
  {
    id: 'ghp-formula',
    severity: 'urgent',
    status: 'active',
    title: 'Gut Health Program — Formula Approval',
    patientName: 'Maximiliana Montmoresy',
    description: 'System has calculated a personalized supplement formula based on latest Gut Zoomer test results. Your review is required to proceed.',
    timestamp: '5 min ago',
    botThread: [
      { id: 'g1', type: 'bot', text: 'Gut Zoomer 5.1 (Program Version) results received and parsed successfully.' },
      { id: 'g2', type: 'bot', text: 'Step 3 triggered: Auto-calculating supplement formula based on dysbiosis markers and gut microbiome profile.' },
      { id: 'g3', type: 'bot', text: 'Formula calculation complete. Recommended combination: Capsule A3 (probiotic blend) · Pills B1, B4, B6 · Pouch P2.' },
      { id: 'g4', type: 'warning', text: 'Action required: Formula approval is blocking shipment creation for this patient. Please review and approve to continue.' },
    ],
    actionButton: { label: 'Review Formula', callbackKey: 'onFormulaApproval' },
  },
  {
    id: 'n1',
    severity: 'urgent',
    status: 'active',
    title: 'Order Approval Required',
    patientName: 'Sarah Johnson',
    description: 'Comprehensive Blood Panel order needs approval before processing ($199).',
    timestamp: '10 min ago',
    botThread: [
      { id: 'n1a', type: 'bot', text: 'Order #CBP-2026 created via Patient Purchase workflow.' },
      { id: 'n1b', type: 'bot', text: 'Step 2/5: Verifying insurance coverage...' },
      { id: 'n1c', type: 'error', text: 'Insurance verification failed: Policy #INS-4829 not found in carrier database.' },
    ],
    actionButton: { label: 'Approve Order', callbackKey: 'noop' },
  },
  {
    id: 'n2',
    severity: 'urgent',
    status: 'active',
    title: 'Lab Results Review',
    patientName: 'Michael Chen',
    description: 'Thyroid panel results flagged for physician review. TSH levels elevated (5.2 mIU/L).',
    timestamp: '25 min ago',
    botThread: [
      { id: 'n2a', type: 'bot', text: 'Thyroid panel results received from Vibrant lab.' },
      { id: 'n2b', type: 'error', text: 'TSH: 5.2 mIU/L — above normal range (0.4–4.0 mIU/L). Flagged for physician review.' },
      { id: 'n2c', type: 'bot', text: 'Proposed protocol update: Levothyroxine 50mcg → 75mcg. Awaiting provider approval.' },
    ],
  },
  {
    id: 'n3',
    severity: 'warning',
    status: 'active',
    title: 'Program Milestone Pending',
    patientName: 'Emily Davis',
    description: 'Weight Management Program Week 4 check-in overdue by 2 days.',
    timestamp: '1 hour ago',
    botThread: [
      { id: 'n3a', type: 'bot', text: 'Week 4 check-in was due on March 16, 2026.' },
      { id: 'n3b', type: 'warning', text: 'Patient has not completed the check-in form. Automated reminder sent via portal.' },
    ],
  },
  {
    id: 'n4',
    severity: 'warning',
    status: 'active',
    title: 'Workflow Escalation',
    patientName: 'Robert Wilson',
    description: 'Automated follow-up workflow requires manual intervention due to missing insurance info.',
    timestamp: '2 hours ago',
    botThread: [
      { id: 'n4a', type: 'bot', text: 'Follow-up workflow paused at "Insurance Verification" step.' },
      { id: 'n4b', type: 'warning', text: 'Insurance information missing from patient profile. Manual update required to continue.' },
    ],
  },
  {
    id: 'n6',
    severity: 'completed',
    status: 'completed',
    title: 'New Form Submission',
    patientName: 'Jennifer Martinez',
    description: 'Health questionnaire completed and ready for review.',
    timestamp: '3 hours ago',
    botThread: [
      { id: 'n6a', type: 'bot', text: 'Health questionnaire submitted via patient portal.' },
      { id: 'n6b', type: 'system', text: 'Form automatically filed to patient record.' },
    ],
  },
  {
    id: 'n7',
    severity: 'completed',
    status: 'completed',
    title: 'Follow-Up Appointment',
    patientName: 'Michael Smith',
    description: 'Appointment confirmed for next week. Ensure patient has all necessary documents ready.',
    timestamp: '5 min ago',
    botThread: [
      { id: 'n7a', type: 'bot', text: 'Appointment request sent via portal.' },
      { id: 'n7b', type: 'system', text: 'Patient confirmed: Dec 18, 2025 at 10:00 AM. Calendar updated.' },
    ],
  },
  {
    id: 'n8',
    severity: 'completed',
    status: 'completed',
    title: 'GHP Enrollment Confirmed',
    patientName: 'Lisa Anderson',
    description: 'Payment of $299 processed for Gut Health Program. Enrollment confirmed.',
    timestamp: '5 hours ago',
    botThread: [
      { id: 'n8a', type: 'bot', text: 'Payment of $299 processed successfully via Stripe.' },
      { id: 'n8b', type: 'system', text: 'Gut Health Program enrollment confirmed. Welcome email sent to patient.' },
    ],
  },
];

const MOCK_MENTIONS: MentionItem[] = [
  { id: 'm1', author: 'Dr. Patel', context: 'Mentioned you in Emily Davis chart note re: Week 4 check-in concern', timestamp: '30 min ago' },
  { id: 'm2', author: 'Nurse Kim', context: 'Tagged you in Michael Chen lab result discussion — TSH protocol change', timestamp: '1 hour ago' },
  { id: 'm3', author: 'Admin Sara', context: 'Mentioned you in scheduling thread for Robert Wilson insurance follow-up', timestamp: '2 hours ago' },
  { id: 'm4', author: 'Dr. Patel', context: 'Mentioned you in Maximiliana Montmoresy GHP supplement formula note', timestamp: '3 hours ago' },
];

const MOCK_TASKS: TaskItem[] = [
  { id: 't1', title: 'Review supplement formula', patient: 'Maximiliana Montmoresy', dueDate: 'Today', priority: 'high' },
  { id: 't2', title: 'Sign off on Levothyroxine dosage change', patient: 'Michael Chen', dueDate: 'Today', priority: 'high' },
  { id: 't3', title: 'Complete insurance pre-authorization', patient: 'Robert Wilson', dueDate: 'Mar 19', priority: 'medium' },
  { id: 't4', title: 'Call patient re: missed Week 4 check-in', patient: 'Emily Davis', dueDate: 'Mar 19', priority: 'medium' },
  { id: 't5', title: 'Review and approve supplement formula', patient: 'Thomas Garcia', dueDate: 'Mar 20', priority: 'medium' },
  { id: 't6', title: 'Sign new patient intake form', patient: 'Jennifer Martinez', dueDate: 'Mar 21', priority: 'low' },
  { id: 't7', title: 'Follow up on appointment no-show', patient: 'David Brown', dueDate: 'Mar 22', priority: 'low' },
];

const MOCK_ORDERS: OrderItem[] = [
  { id: 'o1', orderName: 'Gut Zoomer 5.1 (Program Version)', patient: 'Maximiliana Montmoresy', status: 'Awaiting Approval', timestamp: '5 min ago' },
  { id: 'o2', orderName: 'Comprehensive Blood Panel', patient: 'Sarah Johnson', status: 'On Hold', timestamp: '10 min ago' },
  { id: 'o3', orderName: 'Thyroid Panel', patient: 'Michael Chen', status: 'Results Ready', timestamp: '25 min ago' },
  { id: 'o4', orderName: 'Toxin Zoomer', patient: 'Thomas Garcia', status: 'Kit Delivered', timestamp: '1 day ago' },
  { id: 'o5', orderName: 'Gut Health Supplement Package', patient: 'Lisa Anderson', status: 'Shipped', timestamp: '2 days ago' },
  { id: 'o6', orderName: 'Hormone Zoomer', patient: 'Jennifer Martinez', status: 'Processing', timestamp: '3 days ago' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const BotThreadView: React.FC<{ messages: BotThreadMessage[] }> = ({ messages }) => (
  <div className="space-y-2.5">
    {messages.map(msg => {
      if (msg.type === 'bot') {
        return (
          <div key={msg.id} className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={12} />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-xl rounded-tl-none px-3 py-2 text-xs text-slate-700 leading-relaxed">
              {msg.text}
            </div>
          </div>
        );
      }
      if (msg.type === 'error') {
        return (
          <div key={msg.id} className="flex items-start gap-2 pl-8">
            <div className="flex-1 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
              <AlertTriangle size={12} className="shrink-0 mt-0.5 text-red-500" />
              <span>{msg.text}</span>
            </div>
          </div>
        );
      }
      if (msg.type === 'warning') {
        return (
          <div key={msg.id} className="flex items-start gap-2 pl-8">
            <div className="flex-1 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
              <AlertCircle size={12} className="shrink-0 mt-0.5 text-amber-500" />
              <span>{msg.text}</span>
            </div>
          </div>
        );
      }
      // system
      return (
        <div key={msg.id} className="px-8">
          <div className="bg-slate-100 rounded-xl px-3 py-2 text-xs text-slate-500 italic text-center">
            {msg.text}
          </div>
        </div>
      );
    })}
  </div>
);

interface CardProps {
  card: AutomationCard;
  isExpanded: boolean;
  onToggle: () => void;
  replyValue: string;
  onReplyChange: (v: string) => void;
  onReplySubmit: () => void;
  actionCallbacks: Record<string, () => void>;
}

const AutomationCardItem: React.FC<CardProps> = ({
  card, isExpanded, onToggle, replyValue, onReplyChange, onReplySubmit, actionCallbacks
}) => {
  const borderColor =
    card.severity === 'urgent' ? 'border-l-red-500' :
    card.severity === 'warning' ? 'border-l-amber-400' :
    'border-l-teal-400';

  const SeverityIcon = card.severity === 'urgent' ? AlertTriangle :
                       card.severity === 'warning' ? AlertCircle :
                       CheckCircle2;

  const iconColor =
    card.severity === 'urgent' ? 'text-red-500' :
    card.severity === 'warning' ? 'text-amber-400' :
    'text-teal-500';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
      {/* Card Header — always visible, click to toggle */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <SeverityIcon size={14} className={`shrink-0 ${iconColor}`} fill={card.severity !== 'completed' ? 'currentColor' : 'none'} />
            <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-1">{card.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{card.timestamp}</span>
            <Calendar size={13} className="text-slate-300" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mb-1.5">
          Patient: <span className="font-medium text-slate-600">{card.patientName}</span>
        </p>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{card.description}</p>
      </div>

      {/* Expanded: bot thread + reply */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isExpanded ? '520px' : '0px' }}
      >
        <div className="border-t border-gray-100 bg-slate-50 p-4">
          <BotThreadView messages={card.botThread} />

          {card.actionButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const cb = actionCallbacks[card.actionButton!.callbackKey];
                if (cb) cb();
              }}
              className="mt-4 w-full py-2 px-4 bg-[#0F4C81] hover:bg-[#09355E] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {card.actionButton.label}
            </button>
          )}
        </div>

        {/* Reply input */}
        <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-2">
          <input
            type="text"
            value={replyValue}
            onChange={e => onReplyChange(e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Enter') onReplySubmit(); }}
            placeholder="Reply to agent..."
            className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onReplySubmit(); }}
            className="p-1.5 bg-[#0F4C81] text-white rounded-lg hover:bg-[#09355E] transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose, onFormulaApproval }) => {
  const [activeTab, setActiveTab] = useState<TabId>('automations');
  const [expandedCardId, setExpandedCardId] = useState<string | null>('ghp-formula');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const activeAutomations = MOCK_AUTOMATIONS.filter(c => c.status === 'active');
  const completedAutomations = MOCK_AUTOMATIONS.filter(c => c.status === 'completed');

  const TAB_COUNTS: Record<TabId, number> = {
    automations: activeAutomations.length,
    mentions: MOCK_MENTIONS.length,
    tasks: MOCK_TASKS.length,
    orders: MOCK_ORDERS.length,
  };

  const TAB_LABELS: Record<TabId, string> = {
    automations: 'Automations',
    mentions: 'Mentions',
    tasks: 'Tasks',
    orders: 'Orders',
  };

  const actionCallbacks: Record<string, () => void> = {
    onFormulaApproval,
    noop: () => {},
  };

  const handleCardToggle = (id: string) => {
    setExpandedCardId(prev => prev === id ? null : id);
  };

  const handleReplyChange = (id: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = (id: string) => {
    setReplyInputs(prev => ({ ...prev, [id]: '' }));
  };

  const renderCardGrid = (cards: AutomationCard[]) => (
    <div className="grid grid-cols-2 gap-4 items-start">
      {cards.map(card => (
        <AutomationCardItem
          key={card.id}
          card={card}
          isExpanded={expandedCardId === card.id}
          onToggle={() => handleCardToggle(card.id)}
          replyValue={replyInputs[card.id] ?? ''}
          onReplyChange={v => handleReplyChange(card.id, v)}
          onReplySubmit={() => handleReplySubmit(card.id)}
          actionCallbacks={actionCallbacks}
        />
      ))}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* ── Header + Tab Strip (white) ── */}
      <div className="bg-white border-b border-gray-200 px-6 shrink-0">
        <div className="flex items-center justify-between pt-4 pb-3">
          <h2 className="text-base font-bold text-slate-800">Notifications</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Tab Strip ── */}
        <div className="flex items-end gap-1">
        {(Object.keys(TAB_LABELS) as TabId[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all border-b-2
              ${activeTab === tab
                ? 'text-[#0F4C81] border-[#0F4C81]'
                : 'text-slate-400 border-transparent hover:text-slate-600'}
            `}
          >
            {TAB_LABELS[tab]}
            <span className={`
              text-[10px] font-bold px-1.5 py-0.5 rounded-full
              ${activeTab === tab ? 'bg-[#0F4C81] text-white' : 'bg-slate-100 text-slate-500'}
            `}>
              {TAB_COUNTS[tab]}
            </span>
          </button>
        ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">

        {/* AUTOMATIONS TAB */}
        {activeTab === 'automations' && (
          <div className="space-y-6">
            {/* Active section */}
            <div>
              {renderCardGrid(activeAutomations)}
            </div>

            {/* Completed section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-500" />
                  <span className="text-sm font-bold text-slate-600">Completed (agent session ended)</span>
                </div>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Auto-archived daily
                </span>
              </div>
              {renderCardGrid(completedAutomations)}
            </div>
          </div>
        )}

        {/* MENTIONS TAB */}
        {activeTab === 'mentions' && (
          <div className="space-y-3">
            {MOCK_MENTIONS.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.author}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.context}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {MOCK_TASKS.map(item => {
              const priorityColor =
                item.priority === 'high' ? 'text-red-500 bg-red-50 border-red-200' :
                item.priority === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                'text-slate-500 bg-slate-100 border-slate-200';
              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <ClipboardList size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Patient: {item.patient}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400">{item.dueDate}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${priorityColor}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {MOCK_ORDERS.map(item => {
              const statusColor =
                item.status === 'Awaiting Approval' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                item.status === 'On Hold' ? 'text-red-600 bg-red-50 border-red-200' :
                item.status === 'Results Ready' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                item.status === 'Shipped' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                'text-slate-500 bg-slate-100 border-slate-200';
              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <ShoppingCart size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.orderName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Patient: {item.patient}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Bot, ChevronDown, ChevronUp, Check,
  FlaskConical, Package, Pill, TrendingUp, TrendingDown,
  Minus, CheckCircle2, Truck, Sparkles, AlertTriangle, User
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SupplementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  recommended: boolean;
  rationale?: string;
}

interface GutFinding {
  marker: string;
  value: string;
  normal: string;
  direction: 'up' | 'down' | 'normal';
}

interface FormulaApprovalPageProps {
  patient: { name: string; initials: string; dob: string; age: number; gender: string };
  onBack: () => void;
  onApprove: () => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CAPSULES: SupplementItem[] = [
  { id: 'A1', code: 'A1', name: 'Lactobacillus Focus Blend', description: '15B CFU · Targeted L. acidophilus & L. rhamnosus support', recommended: false },
  { id: 'A2', code: 'A2', name: 'Bifido Restore Complex', description: '20B CFU · Bifidobacterium-focused restoration blend', recommended: false },
  { id: 'A3', code: 'A3', name: 'Broad-Spectrum Probiotic', description: '50B CFU · Multi-strain blend targeting high dysbiosis', recommended: true, rationale: 'F/B ratio 3.2 detected (normal < 2.0)' },
  { id: 'A4', code: 'A4', name: 'Spore-Forming Probiotic', description: '10B CFU · Bacillus-based for resilient gut colonization', recommended: false },
  { id: 'A5', code: 'A5', name: 'Gentle Microbiome Blend', description: '5B CFU · Low-dose introduction blend for sensitive patients', recommended: false },
];

const PILLS: SupplementItem[] = [
  { id: 'B1', code: 'B1', name: 'Inulin-FOS Prebiotic', description: 'Feeds Bifidobacterium & Lactobacillus colonization', recommended: true, rationale: 'Supports probiotic colonization post-treatment' },
  { id: 'B2', code: 'B2', name: 'GOS Prebiotic', description: 'Galactooligosaccharides · Promotes Bifidobacterium', recommended: false },
  { id: 'B3', code: 'B3', name: 'XOS Prebiotic', description: 'Short-chain fatty acid production support', recommended: false },
  { id: 'B4', code: 'B4', name: 'Butyrate Complex', description: 'Supports colonocytes & colon barrier health', recommended: true, rationale: 'Low butyrate-producing species detected' },
  { id: 'B5', code: 'B5', name: 'Zinc Carnosine', description: 'Strengthens gut lining integrity & mucosal barrier', recommended: false },
  { id: 'B6', code: 'B6', name: 'Quercetin Complex', description: 'Anti-inflammatory gut & systemic support', recommended: true, rationale: 'Calprotectin 245 μg/g elevated (normal < 50)' },
  { id: 'B7', code: 'B7', name: 'Berberine HCl', description: 'Antimicrobial support for dysbiosis management', recommended: false },
  { id: 'B8', code: 'B8', name: 'DGL Licorice Extract', description: 'Soothes gastric lining, upper GI support', recommended: false },
];

const POUCHES: SupplementItem[] = [
  { id: 'P1', code: 'P1', name: 'Collagen Peptides Powder', description: 'Supports gut lining repair & tissue integrity', recommended: false },
  { id: 'P2', code: 'P2', name: 'Digestive Enzyme Blend', description: 'Comprehensive enzyme support for improved absorption', recommended: true, rationale: 'Digestive enzyme activity 62% of normal' },
  { id: 'P3', code: 'P3', name: 'L-Glutamine Powder', description: 'Primary fuel for intestinal epithelial cells', recommended: false },
  { id: 'P4', code: 'P4', name: 'Magnesium Glycinate', description: 'Supports gut motility & muscle relaxation', recommended: false },
  { id: 'P5', code: 'P5', name: 'SCFA Complex', description: 'Acetate, propionate & butyrate microbiome metabolites', recommended: false },
  { id: 'P6', code: 'P6', name: 'Psyllium Fiber Blend', description: 'Soluble fiber for microbiome feeding & regularity', recommended: false },
  { id: 'P7', code: 'P7', name: 'Electrolyte Complex', description: 'Supports hydration and nutrient absorption efficiency', recommended: false },
  { id: 'P8', code: 'P8', name: 'Vitamin D3/K2 Powder', description: 'Immune-gut axis support, systemic anti-inflammatory', recommended: false },
];

const GUT_FINDINGS: GutFinding[] = [
  { marker: 'Firmicutes/Bacteroidetes Ratio', value: '3.2', normal: 'Normal < 2.0', direction: 'up' },
  { marker: 'Akkermansia muciniphila', value: '< 0.1%', normal: 'Normal > 1%', direction: 'down' },
  { marker: 'Butyrate-Producing Species', value: 'Reduced', normal: 'Normal range', direction: 'down' },
  { marker: 'Calprotectin (Inflammation)', value: '245 μg/g', normal: 'Normal < 50 μg/g', direction: 'up' },
  { marker: 'Digestive Enzyme Activity', value: '62% of normal', normal: '≥ 80% of normal', direction: 'down' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProductCardProps {
  item: SupplementItem;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  type: 'radio' | 'checkbox';
}

const ProductCard: React.FC<ProductCardProps> = ({ item, isSelected, isDisabled, onClick, type }) => (
  <div
    onClick={isDisabled ? undefined : onClick}
    className={`
      relative rounded-xl border-2 p-3 transition-all cursor-pointer
      ${isSelected
        ? 'border-[#0F4C81] bg-[#0F4C81]/5 shadow-[0_0_0_1px_#0F4C81]'
        : isDisabled
          ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
    `}
  >
    {/* Selected checkmark */}
    {isSelected && (
      <div className="absolute top-2 right-2 w-5 h-5 bg-[#0F4C81] rounded-full flex items-center justify-center">
        <Check size={11} className="text-white" strokeWidth={3} />
      </div>
    )}

    {/* Recommended badge */}
    {item.recommended && (
      <div className="mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
          <Sparkles size={9} />
          Recommended
        </span>
      </div>
    )}

    {/* Code */}
    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
      {item.code}
    </span>

    {/* Name */}
    <p className="text-xs font-bold text-slate-800 mt-1.5 leading-tight">{item.name}</p>

    {/* Description */}
    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{item.description}</p>

    {/* Rationale */}
    {item.recommended && item.rationale && (
      <p className="text-[10px] text-indigo-600 mt-1.5 leading-tight">
        ↳ {item.rationale}
      </p>
    )}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  rule: string;
  badge?: React.ReactNode;
}> = ({ icon, title, rule, badge }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {badge}
      </div>
      <p className="text-[11px] text-slate-500">{rule}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const FormulaApprovalPage: React.FC<FormulaApprovalPageProps> = ({ patient, onBack, onApprove }) => {
  const [selectedCapsule, setSelectedCapsule] = useState('A3');
  const [selectedPills, setSelectedPills] = useState<string[]>(['B1', 'B4', 'B6']);
  const [selectedPouch, setSelectedPouch] = useState('P2');
  const [findingsOpen, setFindingsOpen] = useState(false);
  const [approved, setApproved] = useState(false);

  const pillCount = selectedPills.length;
  const pillsValid = pillCount >= 3 && pillCount <= 5;
  const canApprove = selectedCapsule && pillsValid && selectedPouch;

  const handlePillToggle = (id: string) => {
    setSelectedPills(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 3) return prev; // can't go below min
        return prev.filter(p => p !== id);
      } else {
        if (prev.length >= 5) return prev; // can't exceed max
        return [...prev, id];
      }
    });
  };

  const handleApprove = () => {
    setApproved(true);
    setTimeout(() => {
      onApprove();
    }, 1800);
  };

  // ── Success state ──
  if (approved) {
    const capsuleItem = CAPSULES.find(c => c.id === selectedCapsule);
    const pillItems = PILLS.filter(p => selectedPills.includes(p.id));
    const pouchItem = POUCHES.find(p => p.id === selectedPouch);

    return (
      <div className="flex-1 flex flex-col h-full bg-white items-center justify-center p-12 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Formula Approved!</h2>
        <p className="text-slate-500 mb-8 text-center">Supplement shipment has been created and queued for fulfillment.</p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full max-w-md space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xs font-bold text-slate-500 w-16 shrink-0 pt-0.5">Capsule</span>
            <span className="text-sm font-semibold text-slate-800">{capsuleItem?.code} — {capsuleItem?.name}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xs font-bold text-slate-500 w-16 shrink-0 pt-0.5">Pills</span>
            <span className="text-sm font-semibold text-slate-800">{pillItems.map(p => p.code).join(', ')} — {pillItems.map(p => p.name).join(', ')}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xs font-bold text-slate-500 w-16 shrink-0 pt-0.5">Pouch</span>
            <span className="text-sm font-semibold text-slate-800">{pouchItem?.code} — {pouchItem?.name}</span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
          <Truck size={16} />
          <span>Returning to patient profile...</span>
        </div>
      </div>
    );
  }

  // ── Main page ──
  const selectedCapsuleItem = CAPSULES.find(c => c.id === selectedCapsule);
  const selectedPillItems = PILLS.filter(p => selectedPills.includes(p.id));
  const selectedPouchItem = POUCHES.find(p => p.id === selectedPouch);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
              {patient.initials}
            </div>
            <span className="text-sm font-bold text-slate-800 truncate">{patient.name}</span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-600">Formula Approval</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-[#0F4C81] bg-[#0F4C81]/10 px-2 py-1 rounded-full">
              Gut Health Program
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              Step 3 of 15
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* AI Context Banner */}
          <div className="bg-[#0F4C81]/5 border border-[#0F4C81]/15 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F4C81] mb-0.5">Formula auto-calculated from Gut Zoomer 5.1 results</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Based on {patient.name}'s latest test results, we've pre-selected the combination below. Each selection is tied to a specific finding. You may review and adjust before approving — the system will create a shipment upon your confirmation.
              </p>
            </div>
          </div>

          {/* Collapsible Findings */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setFindingsOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FlaskConical size={15} className="text-[#0F4C81]" />
                <span className="text-sm font-semibold text-slate-700">Gut Zoomer 5.1 Key Findings</span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Mar 15, 2026</span>
              </div>
              {findingsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {findingsOpen && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {GUT_FINDINGS.map(finding => (
                  <div key={finding.marker} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{finding.marker}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{finding.normal}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        finding.direction === 'up' ? 'text-red-600' :
                        finding.direction === 'down' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {finding.value}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        finding.direction === 'up' ? 'bg-red-100' :
                        finding.direction === 'down' ? 'bg-amber-100' :
                        'bg-emerald-100'
                      }`}>
                        {finding.direction === 'up' && <TrendingUp size={11} className="text-red-600" />}
                        {finding.direction === 'down' && <TrendingDown size={11} className="text-amber-600" />}
                        {finding.direction === 'normal' && <Minus size={11} className="text-emerald-600" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Capsule Section ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <SectionHeader
              icon={<FlaskConical size={16} />}
              title="Capsule"
              rule="Select 1 of 5"
            />
            <div className="grid grid-cols-3 gap-3">
              {CAPSULES.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  isSelected={selectedCapsule === item.id}
                  isDisabled={false}
                  onClick={() => setSelectedCapsule(item.id)}
                  type="radio"
                />
              ))}
            </div>
          </div>

          {/* ── Pills Section ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <SectionHeader
              icon={<Pill size={16} />}
              title="Pills"
              rule="Select 3–5 of 8"
              badge={
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pillCount < 3 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {pillCount} selected · min 3 · max 5
                </span>
              }
            />
            <div className="grid grid-cols-4 gap-3">
              {PILLS.map(item => {
                const isSelected = selectedPills.includes(item.id);
                const atMax = pillCount >= 5 && !isSelected;
                const atMin = pillCount <= 3 && isSelected;
                return (
                  <ProductCard
                    key={item.id}
                    item={item}
                    isSelected={isSelected}
                    isDisabled={atMax || (atMin && false) /* allow deselect but show visual cue */}
                    onClick={() => handlePillToggle(item.id)}
                    type="checkbox"
                  />
                );
              })}
            </div>
            {pillCount < 3 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                <AlertTriangle size={13} />
                Please select at least 3 pills to proceed.
              </div>
            )}
          </div>

          {/* ── Pouch Section ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <SectionHeader
              icon={<Package size={16} />}
              title="Pouch"
              rule="Select 1 of 8"
            />
            <div className="grid grid-cols-3 gap-3">
              {POUCHES.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  isSelected={selectedPouch === item.id}
                  isDisabled={false}
                  onClick={() => setSelectedPouch(item.id)}
                  type="radio"
                />
              ))}
            </div>
          </div>

        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-72 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Patient info */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Patient</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                  {patient.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                  <p className="text-[11px] text-slate-500">{patient.gender}, {patient.age} · DOB {patient.dob}</p>
                </div>
              </div>
            </div>

            {/* Test source */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <FlaskConical size={14} className="text-[#0F4C81] shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-slate-700">Gut Zoomer 5.1 (Program Version)</p>
                <p className="text-[10px] text-slate-400">Results: Mar 15, 2026</p>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Selected Formula</p>
              <div className="space-y-2.5">
                {/* Capsule */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FlaskConical size={10} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-500">Capsule</p>
                    {selectedCapsuleItem ? (
                      <p className="text-xs font-bold text-slate-800 leading-tight">{selectedCapsuleItem.code} — {selectedCapsuleItem.name}</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">None selected</p>
                    )}
                  </div>
                </div>

                {/* Pills */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill size={10} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-500">Pills ({pillCount})</p>
                    {selectedPillItems.length > 0 ? (
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {selectedPillItems.map(p => p.code).join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">None selected</p>
                    )}
                    {!pillsValid && (
                      <p className="text-[10px] text-amber-600 mt-0.5">Select {pillCount < 3 ? `${3 - pillCount} more` : `${pillCount - 5} fewer`}</p>
                    )}
                  </div>
                </div>

                {/* Pouch */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Package size={10} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-500">Pouch</p>
                    {selectedPouchItem ? (
                      <p className="text-xs font-bold text-slate-800 leading-tight">{selectedPouchItem.code} — {selectedPouchItem.name}</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">None selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Item */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Order Item</p>
              <div className="flex items-center gap-2">
                <Truck size={13} className="text-slate-400 shrink-0" />
                <p className="text-xs text-slate-700 font-medium">Gut Health Supplement Package (2mo)</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleApprove}
              disabled={!canApprove}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                ${canApprove
                  ? 'bg-[#0F4C81] hover:bg-[#09355E] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <Check size={16} />
              Approve &amp; Create Shipment
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Auto-approves with current selection in ~45 min if no action taken.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

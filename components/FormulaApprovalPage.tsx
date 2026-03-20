import React, { useState } from 'react';
import {
  X, Bot, ChevronDown, ChevronUp, Check,
  FlaskConical, Package, Pill, TrendingUp, TrendingDown,
  Minus, CheckCircle2, Truck, AlertTriangle, Info
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

// ─── Compact Product Card ─────────────────────────────────────────────────────

interface ProductCardProps {
  item: SupplementItem;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  type: 'radio' | 'checkbox';
}

const ProductCard: React.FC<ProductCardProps> = ({ item, isSelected, isDisabled, onClick, type }) => {
  const [showRationale, setShowRationale] = useState(false);
  return (
    <div
      onClick={isDisabled ? undefined : onClick}
      className={`
        relative rounded-xl border-2 p-2.5 transition-all cursor-pointer
        ${isSelected
          ? 'border-[#0F4C81] bg-[#0F4C81]/5 shadow-[0_0_0_1px_#0F4C81]'
          : isDisabled
            ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
      `}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-[#0F4C81] rounded-full flex items-center justify-center">
          <Check size={8} className="text-white" strokeWidth={3} />
        </div>
      )}

      {/* Code + recommended badge */}
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {item.code}
        </span>
        {item.recommended && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full leading-none">
            Recommended
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-[11px] font-bold text-slate-800 leading-tight pr-4">{item.name}</p>

      {/* Description */}
      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{item.description}</p>

      {/* Rationale expand */}
      {item.recommended && item.rationale && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setShowRationale(r => !r); }}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <Info size={9} />
            Why recommended
            <ChevronDown size={9} className={`transition-transform duration-150 ${showRationale ? 'rotate-180' : ''}`} />
          </button>
          {showRationale && (
            <p className="text-[10px] text-indigo-700 mt-1 leading-snug bg-indigo-50 rounded-lg px-2 py-1.5">
              {item.rationale}
            </p>
          )}
        </>
      )}
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  rule: string;
  badge?: React.ReactNode;
}> = ({ icon, title, rule, badge }) => (
  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
    <div className="w-6 h-6 rounded-md bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] shrink-0">
      {icon}
    </div>
    <span className="text-xs font-bold text-slate-800">{title}</span>
    <span className="text-[10px] text-slate-400">{rule}</span>
    {badge}
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
        if (prev.length <= 3) return prev;
        return prev.filter(p => p !== id);
      } else {
        if (prev.length >= 5) return prev;
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

  const selectedCapsuleItem = CAPSULES.find(c => c.id === selectedCapsule);
  const selectedPillItems = PILLS.filter(p => selectedPills.includes(p.id));
  const selectedPouchItem = POUCHES.find(p => p.id === selectedPouch);

  return (
    /* ── Modal Overlay ── */
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-[920px] max-h-[88vh]">

        {/* ── Success State ── */}
        {approved ? (
          <div className="flex flex-col items-center justify-center p-16 flex-1">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Formula Approved!</h2>
            <p className="text-slate-500 mb-8 text-center text-sm">Supplement shipment has been created and queued for fulfillment.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 w-full max-w-sm space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase w-14 shrink-0 pt-0.5">Capsule</span>
                <span className="text-xs font-semibold text-slate-800">{selectedCapsuleItem?.code} — {selectedCapsuleItem?.name}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase w-14 shrink-0 pt-0.5">Pills</span>
                <span className="text-xs font-semibold text-slate-800">{selectedPillItems.map(p => p.code).join(', ')}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase w-14 shrink-0 pt-0.5">Pouch</span>
                <span className="text-xs font-semibold text-slate-800">{selectedPouchItem?.code} — {selectedPouchItem?.name}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <Truck size={14} />
              <span>Returning to patient profile...</span>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 shrink-0 flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                  {patient.initials}
                </div>
                <span className="text-sm font-bold text-slate-800 truncate">{patient.name}</span>
                <span className="text-slate-300 text-sm">·</span>
                <span className="text-sm text-slate-600">Formula Approval</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-[#0F4C81] bg-[#0F4C81]/10 px-2 py-1 rounded-full">
                  Gut Health Program
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  Step 3 of 15
                </span>
                <button
                  onClick={onBack}
                  className="ml-1 w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden min-h-0">

              {/* Left: scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* AI Context Banner */}
                <div className="bg-[#0F4C81]/5 border border-[#0F4C81]/15 rounded-xl p-3 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#0F4C81] mb-0.5">Formula auto-calculated from Gut Zoomer 5.1 results</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Based on {patient.name}'s latest test results, we've pre-selected the combination below. Review and adjust before approving — a shipment will be created upon confirmation.
                    </p>
                  </div>
                </div>

                {/* Collapsible Findings */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setFindingsOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FlaskConical size={13} className="text-[#0F4C81]" />
                      <span className="text-xs font-semibold text-slate-700">Gut Zoomer 5.1 Key Findings</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Mar 15, 2026</span>
                    </div>
                    {findingsOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </button>

                  {findingsOpen && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {GUT_FINDINGS.map(finding => (
                        <div key={finding.marker} className="flex items-center justify-between px-4 py-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{finding.marker}</p>
                            <p className="text-[10px] text-slate-400">{finding.normal}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                              finding.direction === 'up' ? 'text-red-600' :
                              finding.direction === 'down' ? 'text-amber-600' :
                              'text-emerald-600'
                            }`}>
                              {finding.value}
                            </span>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              finding.direction === 'up' ? 'bg-red-100' :
                              finding.direction === 'down' ? 'bg-amber-100' :
                              'bg-emerald-100'
                            }`}>
                              {finding.direction === 'up' && <TrendingUp size={9} className="text-red-600" />}
                              {finding.direction === 'down' && <TrendingDown size={9} className="text-amber-600" />}
                              {finding.direction === 'normal' && <Minus size={9} className="text-emerald-600" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Capsule Section ── */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5">
                  <SectionHeader icon={<FlaskConical size={13} />} title="Capsule" rule="Select 1 of 5" />
                  <div className="grid grid-cols-3 gap-2">
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
                <div className="bg-white border border-gray-200 rounded-xl p-3.5">
                  <SectionHeader
                    icon={<Pill size={13} />}
                    title="Pills"
                    rule="Select 3–5 of 8"
                    badge={
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pillCount < 3 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {pillCount} / 5
                      </span>
                    }
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {PILLS.map(item => {
                      const isSelected = selectedPills.includes(item.id);
                      const atMax = pillCount >= 5 && !isSelected;
                      return (
                        <ProductCard
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          isDisabled={atMax}
                          onClick={() => handlePillToggle(item.id)}
                          type="checkbox"
                        />
                      );
                    })}
                  </div>
                  {pillCount < 3 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 px-3">
                      <AlertTriangle size={12} />
                      Select at least 3 pills to proceed.
                    </div>
                  )}
                </div>

                {/* ── Pouch Section ── */}
                <div className="bg-white border border-gray-200 rounded-xl p-3.5">
                  <SectionHeader icon={<Package size={13} />} title="Pouch" rule="Select 1 of 8" />
                  <div className="grid grid-cols-4 gap-2">
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
              <div className="w-56 shrink-0 border-l border-gray-200 bg-slate-50 flex flex-col overflow-y-auto">
                <div className="p-4 space-y-4">

                  {/* Patient info */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Patient</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {patient.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">{patient.name}</p>
                        <p className="text-[10px] text-slate-500">{patient.gender}, {patient.age} · DOB {patient.dob}</p>
                      </div>
                    </div>
                  </div>

                  {/* Test source */}
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-2">
                    <FlaskConical size={12} className="text-[#0F4C81] shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-700">Gut Zoomer 5.1</p>
                      <p className="text-[10px] text-slate-400">Results: Mar 15, 2026</p>
                    </div>
                  </div>

                  {/* Order summary */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Selected Formula</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                          <FlaskConical size={8} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-slate-400">Capsule</p>
                          {selectedCapsuleItem ? (
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">{selectedCapsuleItem.code} — {selectedCapsuleItem.name}</p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">None selected</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Pill size={8} className="text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-slate-400">Pills ({pillCount})</p>
                          {selectedPillItems.length > 0 ? (
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">
                              {selectedPillItems.map(p => p.code).join(', ')}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">None selected</p>
                          )}
                          {!pillsValid && (
                            <p className="text-[10px] text-amber-600 mt-0.5">{pillCount < 3 ? `Add ${3 - pillCount} more` : `Remove ${pillCount - 5}`}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Package size={8} className="text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-slate-400">Pouch</p>
                          {selectedPouchItem ? (
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">{selectedPouchItem.code} — {selectedPouchItem.name}</p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">None selected</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200" />

                  {/* CTA */}
                  <button
                    onClick={handleApprove}
                    disabled={!canApprove}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                      ${canApprove
                        ? 'bg-[#0F4C81] hover:bg-[#09355E] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    <Check size={14} />
                    Approve &amp; Create Shipment
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Auto-approves in ~45 min if no action taken.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

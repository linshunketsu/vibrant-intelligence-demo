import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Calendar, AlertCircle, CreditCard, Package, Building2 } from 'lucide-react';

type PaymentMethod = 'provider-bill' | 'patient-pay-later' | 'patient-pay-now';
type DeliveryMethod = 'office' | 'ship';

interface Test {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface PatientInfo {
  name: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female';
}

interface OrderDiagnosticTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientInfo;
  onOrder: (tests: Test[], paymentMethod: PaymentMethod, deliveryMethod: DeliveryMethod) => void;
}

// Available tests
const AVAILABLE_TESTS: Test[] = [
  { id: 'toxin-zoomer', name: 'Toxin Zoomer', price: 700, description: 'Comprehensive toxin exposure panel' },
  { id: 'cellular-zoomer', name: 'Cellular Zoomer', price: 600, description: 'Cellular function analysis' },
  { id: 'nutrient-zoomer', name: 'Nutrient Zoomer', price: 500, description: 'Nutritional status assessment' },
  { id: 'neural-zoomer', name: 'Neural Zoomer', price: 450, description: 'Neurological function markers' },
  { id: 'gut-zoomer', name: 'Gut Zoomer', price: 550, description: 'Digestive health and microbiome analysis' },
  { id: 'hormone-zoomer', name: 'Hormone Zoomer', price: 500, description: 'Hormonal balance panel' },
  { id: 'food-zoomer', name: 'Food Zoomer', price: 700, description: 'Food sensitivity and reactivity profile' },
  { id: 'antioxidant-genetics', name: 'Antioxidant Genetics', price: 400, description: 'Genetic antioxidant capacity markers' },
  { id: 'toxin-genetics', name: 'Toxin Genetics', price: 400, description: 'Genetic detoxification profile' },
  { id: 'tickborne-2', name: 'Tickborne Diseases 2.0', price: 900, description: 'Comprehensive tickborne pathogen panel' },
  { id: 'tickborne-1', name: 'Tickborne Diseases 1.0', price: 450, description: 'Basic tickborne disease screening' },
];

export const OrderDiagnosticTestsModal: React.FC<OrderDiagnosticTestsModalProps> = ({
  isOpen,
  onClose,
  patient,
  onOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('provider-bill');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('office');

  // Filter tests based on search
  const filteredTests = useMemo(() => {
    if (!searchQuery.trim()) return AVAILABLE_TESTS;
    const query = searchQuery.toLowerCase();
    return AVAILABLE_TESTS.filter(
      test =>
        test.name.toLowerCase().includes(query) ||
        (test.description && test.description.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const toggleTest = (testId: string) => {
    setSelectedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  const handleOrder = () => {
    const tests: Test[] = [];
    AVAILABLE_TESTS.forEach(test => {
      if (selectedTests.has(test.id)) {
        tests.push(test);
      }
    });
    onOrder(tests, paymentMethod, deliveryMethod);
    onClose();
  };

  const getSelectedTestsList = () => {
    return AVAILABLE_TESTS.filter(test => selectedTests.has(test.id));
  };

  if (!isOpen) return null;

  const selectedTestsList = getSelectedTestsList();
  const total = selectedTestsList.reduce((sum, test) => sum + test.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-white to-slate-50/30">
          <h2 className="text-lg font-semibold text-slate-800">Order Diagnostic Tests</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 text-gray-400 hover:text-gray-600"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Tests List */}
          <div className="flex-1 border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tests..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                />
              </div>
            </div>

            {/* Tests List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Search size={48} className="mb-3 opacity-50" />
                  <p className="text-sm">No tests found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTests.map((test) => (
                    <label
                      key={test.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        selectedTests.has(test.id)
                          ? 'bg-blue-50/80 border-blue-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTests.has(test.id)}
                        onChange={() => toggleTest(test.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0F4C81] focus:ring-[#0F4C81]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-gray-900">{test.name}</p>
                          <p className="text-sm font-bold text-[#0F4C81]">${test.price}</p>
                        </div>
                        {test.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{test.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-80 flex flex-col bg-gradient-to-b from-slate-50 to-gray-50 overflow-hidden">
            {/* Patient Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0F4C81] rounded-full flex items-center justify-center text-white font-bold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500">{patient.gender}, {patient.age} years</p>
                </div>
              </div>
            </div>

            {/* Selected Tests */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Your Order</h3>

              {selectedTestsList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No tests selected</p>
                  <p className="text-xs text-gray-400 mt-1">Select tests from the list to add them to your order</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTestsList.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/80 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{test.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0F4C81]">${test.price}</span>
                        <button
                          onClick={() => toggleTest(test.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Method */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard size={14} className="text-[#0F4C81]" />
                  Payment Method
                </h3>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                      paymentMethod === 'provider-bill'
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'provider-bill'}
                      onChange={() => setPaymentMethod('provider-bill')}
                      className="mt-0.5 w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Provider Bill</p>
                      <p className="text-xs text-gray-500">Billed to practice account</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                      paymentMethod === 'patient-pay-later'
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'patient-pay-later'}
                      onChange={() => setPaymentMethod('patient-pay-later')}
                      className="mt-0.5 w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Patient Pay Later</p>
                      <p className="text-xs text-gray-500">Bill sent to patient</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                      paymentMethod === 'patient-pay-now'
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'patient-pay-now'}
                      onChange={() => setPaymentMethod('patient-pay-now')}
                      className="mt-0.5 w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Patient Pay Now</p>
                      <p className="text-xs text-gray-500">Collect payment at checkout</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Package size={14} className="text-[#0F4C81]" />
                  Delivery Method
                </h3>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                      deliveryMethod === 'office'
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === 'office'}
                      onChange={() => setDeliveryMethod('office')}
                      className="mt-0.5 w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Provided by Office</p>
                      <p className="text-xs text-gray-500">Patient picks up kit at practice</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                      deliveryMethod === 'ship'
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === 'ship'}
                      onChange={() => setDeliveryMethod('ship')}
                      className="mt-0.5 w-4 h-4 text-[#0F4C81] focus:ring-[#0F4C81]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Ship to Patient</p>
                      <p className="text-xs text-gray-500">Kit mailed to patient address</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Total & Order Button */}
            <div className="p-4 border-t border-gray-200/60 bg-white shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <span className="text-lg font-bold text-[#0F4C81]">${total.toLocaleString()}</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={selectedTestsList.length === 0}
                className="w-full px-4 py-3 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#09355E] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Order {selectedTestsList.length} Test{selectedTestsList.length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={onClose}
                className="w-full mt-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

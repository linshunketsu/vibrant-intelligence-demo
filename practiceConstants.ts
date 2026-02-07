// Practice-related constants migrated from myPractice folder
import { Provider, BankAccount, AtRiskPatient, Transaction, PracticeDocument, ServiceFeeTemplate, ServiceFeeTrigger } from './practiceTypes';

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    role: 'Psychiatrist',
    avatar: 'https://picsum.photos/seed/doc1/100/100',
    wallet: { total: 12300, withdrawable: 11800, nonWithdrawable: 500 },
  },
  {
    id: '2',
    name: 'Carlos Sanchez',
    role: 'Nutritionist',
    avatar: 'https://picsum.photos/seed/doc2/100/100',
    wallet: { total: 11700, withdrawable: 11700, nonWithdrawable: 0 },
  },
  {
    id: '3',
    name: 'Dr. Anya Sharma',
    role: 'General Practitioner',
    avatar: 'https://picsum.photos/seed/doc3/100/100',
    wallet: { total: 17100, withdrawable: 16100, nonWithdrawable: 1000 },
  },
  {
    id: '4',
    name: 'Ben Carter',
    role: 'Therapist',
    avatar: 'https://picsum.photos/seed/doc4/100/100',
    wallet: { total: 9270, withdrawable: 9270, nonWithdrawable: 0 },
  },
];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [
    { id: 'b1', bankName: 'Chase Bank', accountLast4: '6789', isPrimary: true },
    { id: 'b2', bankName: 'Bank of America', accountLast4: '1234', isPrimary: false },
];

export const MOCK_PRACTICE_WALLET = { total: 82450, withdrawable: 32980, nonWithdrawable: 49470 };

export const MOCK_CHAT_ENGAGEMENT_DATA = [
  { name: 'Week 1', engaged: 45, notEngaged: 12, total: 57 },
  { name: 'Week 2', engaged: 52, notEngaged: 8, total: 60 },
  { name: 'Week 3', engaged: 48, notEngaged: 15, total: 63 },
  { name: 'Week 4', engaged: 55, notEngaged: 9, total: 64 },
];

export const MOCK_GROWTH_DATA = [
  { name: 'Jan', referral: 5, selfEnrolled: 10, providerInvite: 3 },
  { name: 'Feb', referral: 8, selfEnrolled: 12, providerInvite: 5 },
  { name: 'Mar', referral: 6, selfEnrolled: 15, providerInvite: 4 },
  { name: 'Apr', referral: 10, selfEnrolled: 18, providerInvite: 6 },
];

export const MOCK_REVENUE_BREAKDOWN_DATA = [
    { name: 'Wk 1', vibrantPayouts: 15000, serviceFees: 5500 },
    { name: 'Wk 2', vibrantPayouts: 14000, serviceFees: 4000 },
    { name: 'Wk 3', vibrantPayouts: 22000, serviceFees: 6500 },
    { name: 'Wk 4', vibrantPayouts: 12000, serviceFees: 3450 }
];

export const MOCK_PROVIDER_REVENUE_DATA = [
    { name: 'Wk 1', quickBill: 1200, practiceProducts: 800, labMarkup: 500, subscriptions: 1500, serviceFees: 2000 },
    { name: 'Wk 2', quickBill: 1400, practiceProducts: 900, labMarkup: 550, subscriptions: 1500, serviceFees: 2200 },
    { name: 'Wk 3', quickBill: 1800, practiceProducts: 1100, labMarkup: 600, subscriptions: 1600, serviceFees: 2500 },
    { name: 'Wk 4', quickBill: 1500, practiceProducts: 1000, labMarkup: 580, subscriptions: 1650, serviceFees: 2300 },
];

export const MOCK_VIBRANT_REVENUE_DATA = [
    { name: 'Wk 1', labPatientPay: 4000, labProviderPay: 3500 },
    { name: 'Wk 2', labPatientPay: 4200, labProviderPay: 3800 },
    { name: 'Wk 3', labPatientPay: 5000, labProviderPay: 4500 },
    { name: 'Wk 4', labPatientPay: 4500, labProviderPay: 4000 },
];

export const MOCK_COST_BREAKDOWN_DATA = [
    { name: 'Wk 1', labCosts: 10000, operationalCosts: 2300 },
    { name: 'Wk 2', labCosts: 9000, operationalCosts: 2700 },
    { name: 'Wk 3', labCosts: 14000, operationalCosts: 3100 },
    { name: 'Wk 4', labCosts: 7000, operationalCosts: 1370 }
];

export const MOCK_AT_RISK_PATIENTS: AtRiskPatient[] = [
    { id: 'p1', name: 'James Sullivan', reason: 'Unanswered question > 48h', lastContact: '3 days ago', assignedProvider: 'Dr. Evelyn Reed' },
    { id: 'p2', name: 'Maria Garcia', reason: 'Negative sentiment detected', lastContact: '2 days ago', assignedProvider: 'Ben Carter' },
    { id: 'p3', name: 'Robert Smith', reason: 'Frustration escalation detected', lastContact: '5 days ago', assignedProvider: 'Dr. Anya Sharma' },
    { id: 'p4', name: 'Linda Johnson', reason: 'Unanswered question > 48h', lastContact: '4 days ago', assignedProvider: 'Dr. Evelyn Reed' },
];

export const AI_ENGAGEMENT_SUMMARY = "Overall sentiment is positive 🙂 with an 84% engagement rate. We've identified 4 conversations showing risk signals like delayed responses or frustration.";
export const AI_FINANCIAL_SUMMARY = "Lab costs saw a 15% increase in Week 3, coinciding with a peak in patient volume, which impacted the Net Practice Balance. However, a steady rise in Clinic Service Fees, up 10% from the start of the month, has helped offset these costs, indicating strong service demand.";
export const AI_EXECUTIVE_SUMMARY = "This month shows strong patient growth, up 8% with 28 new patients. Engagement remains high at 82%, and patient satisfaction is positive. However, provider utilization is slightly down to 75%, and we've noted a 12% increase in cancellations, which requires attention. Message response times are excellent, averaging under 3 hours.";

export const AI_PRACTICE_INSIGHTS_METRICS = [
    { label: 'Patient Growth', value: '28' },
    { label: 'Active Patients', value: '342' },
    { label: 'Engagement Rate', value: '82%' },
    { label: 'No-Show Rate', value: '4.5%' },
    { label: 'Revenue Growth', value: '+12%' },
    { label: 'Avg Provider Response Time', value: '2.4h' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx_8293',
        date: '2024-05-28 14:30',
        patientName: 'Olivia Chen',
        patientAvatar: 'https://picsum.photos/seed/p1/50/50',
        amount: 250.00,
        paidAmount: 250.00,
        remainingBalance: 0,
        status: 'Completed',
        type: 'Lab Tests',
        paymentMethod: 'Card',
        paymentMethodLast4: '4242',
        paymentBrand: 'Visa',
        payer: 'Patient',
        payments: [
            { id: 'pm_1', date: '2024-05-28 14:30', amount: 250.00, method: 'Card', status: 'Completed' }
        ]
    },
    {
        id: 'tx_9921',
        date: '2024-05-28 11:05',
        patientName: 'Benjamin Carter',
        patientAvatar: 'https://picsum.photos/seed/p2/50/50',
        amount: 150.00,
        paidAmount: 75.00,
        remainingBalance: 75.00,
        status: 'Pending',
        type: 'Practice Products',
        paymentMethod: 'Card',
        paymentMethodLast4: '1023',
        paymentBrand: 'MasterCard',
        payer: 'Patient',
        payments: [
            { id: 'pm_2', date: '2024-05-28 11:05', amount: 75.00, method: 'Card', status: 'Completed' }
        ]
    },
    {
        id: 'tx_7732',
        date: '2024-05-27 16:45',
        patientName: 'Sophia Rodriguez',
        patientAvatar: 'https://picsum.photos/seed/p3/50/50',
        amount: 300.00,
        paidAmount: 300.00,
        remainingBalance: 0,
        status: 'Completed',
        type: 'Quick Bill',
        paymentMethod: 'Bank Transfer',
        paymentMethodLast4: '8832',
        payer: 'Patient',
        payments: [
            { id: 'pm_3', date: '2024-05-27 16:45', amount: 150.00, method: 'Card', status: 'Completed' },
            { id: 'pm_4', date: '2024-05-28 09:00', amount: 150.00, method: 'Bank Transfer', status: 'Completed' }
        ]
    },
    {
        id: 'tx_1209',
        date: '2024-05-27 09:00',
        patientName: 'Liam Goldberg',
        patientAvatar: 'https://picsum.photos/seed/p4/50/50',
        amount: 500.00,
        paidAmount: 200.00,
        remainingBalance: 300.00,
        status: 'Pending',
        type: 'Top Up',
        paymentMethod: 'Wallet Credit',
        payer: 'Patient',
        payments: [
            { id: 'pm_5', date: '2024-05-27 09:00', amount: 200.00, method: 'Wallet Credit', status: 'Completed' }
        ]
    },
    {
        id: 'tx_4451',
        date: '2024-05-26 13:20',
        patientName: 'Ava Nguyen',
        patientAvatar: 'https://picsum.photos/seed/p5/50/50',
        amount: 50.00,
        paidAmount: 0,
        remainingBalance: 50.00,
        status: 'Failed',
        type: 'Lab Tests',
        paymentMethod: 'Card',
        paymentMethodLast4: '5511',
        paymentBrand: 'Visa',
        payer: 'Patient',
        payments: [
            { id: 'pm_6', date: '2024-05-26 13:20', amount: 50.00, method: 'Card', status: 'Failed' }
        ]
    },
    {
        id: 'tx_3321',
        date: '2024-05-25 10:15',
        patientName: 'Dr. Evelyn Reed',
        patientAvatar: 'https://picsum.photos/seed/doc1/100/100',
        amount: 1500.00,
        paidAmount: 1500.00,
        remainingBalance: 0,
        status: 'Completed',
        type: 'Cash Out',
        paymentMethod: 'Bank Transfer',
        paymentMethodLast4: '6789',
        payer: 'System',
        payments: [
            { id: 'pm_7', date: '2024-05-25 10:15', amount: 1500.00, method: 'Bank Transfer', status: 'Completed' }
        ]
    },
    {
        id: 'tx_5543',
        date: '2024-05-24 15:45',
        patientName: 'Noah Williams',
        patientAvatar: 'https://picsum.photos/seed/p6/50/50',
        amount: 120.00,
        paidAmount: 120.00,
        remainingBalance: 0,
        status: 'Completed',
        type: 'Refund to Wallet',
        paymentMethod: 'Wallet Credit',
        payer: 'Provider',
        payments: [
            { id: 'pm_8', date: '2024-05-24 15:45', amount: 120.00, method: 'Wallet Credit', status: 'Completed' }
        ]
    },
];

export const MOCK_DOCUMENTS: PracticeDocument[] = [
    { id: 'd1', title: 'New Patient Intake Form.pdf', type: 'Template', uploadedBy: 'Admin', uploadedByAvatar: 'https://picsum.photos/seed/sys/50/50', date: '2024-05-24', notes: 'Standard intake form for all new clinical patients.' },
    { id: 'd2', title: 'Consent for Telehealth Services.docx', type: 'Template', uploadedBy: 'Admin', uploadedByAvatar: 'https://picsum.photos/seed/sys/50/50', date: '2024-05-23', notes: 'Required for all remote consultations.' },
    { id: 'd3', title: 'James S - Lab Results 05-20-24.pdf', type: 'Uploaded', uploadedBy: 'Dr. Evelyn Reed', uploadedByAvatar: 'https://picsum.photos/seed/doc1/50/50', date: '2024-05-20', notes: 'Reviewed during the May 21st follow-up.' },
    { id: 'd4', title: 'Practice Privacy Policy.pdf', type: 'Template', uploadedBy: 'Admin', uploadedByAvatar: 'https://picsum.photos/seed/sys/50/50', date: '2024-05-18' },
    { id: 'd6', title: 'Maria G - Care Plan.pdf', type: 'Uploaded', uploadedBy: 'Ben Carter', uploadedByAvatar: 'https://picsum.photos/seed/doc4/50/50', date: '2024-05-26', notes: 'Updated diet protocols for the next 3 months.' },
    { id: 'd7', title: 'Treatment Protocols v2.pdf', type: 'Template', uploadedBy: 'Admin', uploadedByAvatar: 'https://picsum.photos/seed/adm/50/50', date: '2024-05-28' },
];

export const MOCK_SERVICE_FEE_TEMPLATES: ServiceFeeTemplate[] = [
  { id: 'fee1', serviceName: 'New Patient Consultation Fee', amount: 50, triggerType: ServiceFeeTrigger.AppointmentCompleted, autoApply: true, status: 'Active' },
  { id: 'fee2', serviceName: 'Lab Order Processing Fee', amount: 15, triggerType: ServiceFeeTrigger.OrderCreated, autoApply: true, status: 'Active' },
  { id: 'fee3', serviceName: 'Telehealth Convenience Fee', amount: 25, triggerType: ServiceFeeTrigger.TelehealthSessionClosed, autoApply: false, status: 'Active' },
  { id: 'fee4', serviceName: 'Follow-up Visit Fee', amount: 35, triggerType: ServiceFeeTrigger.AppointmentCompleted, autoApply: true, status: 'Inactive' },
];

export const METRIC_LIBRARY_DATA: Record<string, Array<{id: string, label: string, description: string, value: string}>> = {
    'Engagement': [
        { id: '1', label: 'Engagement Rate', description: 'Provider-led closes', value: '82%' },
        { id: '2', label: 'Engaged Conversation Count', description: 'Total active convos', value: '55' },
        { id: '3', label: 'Avg Provider Response Time', description: 'Time to reply', value: '2.4h' },
    ],
    'Operations': [
        { id: '4', label: 'No-Show Rate', description: 'Missed appointments', value: '4.5%' },
        { id: '5', label: 'Active Patients', description: 'Total active', value: '342' },
        { id: '8', label: 'Provider Utilization', description: 'Available slot fill', value: '75%' },
    ],
    'Growth & Revenue': [
        { id: '6', label: 'Patient Growth', description: 'New patients', value: '28' },
        { id: '7', label: 'Revenue Growth', description: 'Period over period', value: '+12%' },
    ]
};

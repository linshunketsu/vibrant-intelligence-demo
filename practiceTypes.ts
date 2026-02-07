// Practice-related types migrated from myPractice folder

export enum View {
  Dashboard = 'DASHBOARD',
  PracticeSettings = 'PRACTICE_SETTINGS',
}

export enum TimeRange {
    Last7Days = 'Last 7 Days',
    Last30Days = 'Last 30 Days',
    LastQuarter = 'Last Quarter',
    LastYear = 'Last Year',
    CustomRange = 'Custom Range',
}

export enum UserRole {
  Admin = 'Admin',
  Provider = 'Provider',
  Staff = 'Staff',
}

export enum FinancialMode {
    Personal = 'Personal',
    Shared = 'Shared',
}

export interface Wallet {
    total: number;
    withdrawable: number;
    nonWithdrawable: number;
}

export interface Provider {
  id: string;
  name: string;
  role: string;
  avatar: string;
  wallet: Wallet;
}

export interface BankAccount {
    id: string;
    bankName: string;
    accountLast4: string;
    isPrimary: boolean;
}

export interface AtRiskPatient {
    id: string;
    name: string;
    reason: string;
    lastContact: string;
    assignedProvider: string;
}

export interface PaymentDetail {
    id: string;
    date: string;
    amount: number;
    method: 'Card' | 'Bank Transfer' | 'Wallet Credit';
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface Transaction {
    id: string;
    date: string;
    patientName: string; // Serves as the entity name (Patient or Provider)
    patientAvatar: string;
    amount: number; // Total Amount
    paidAmount: number;
    remainingBalance: number;
    status: 'Completed' | 'Pending' | 'Failed';
    type: string;
    paymentMethod: 'Card' | 'Bank Transfer' | 'Wallet Credit' | 'N/A';
    paymentMethodLast4?: string;
    paymentBrand?: string; // e.g., Visa, Amex
    payer: 'Patient' | 'Provider' | 'System';
    payments: PaymentDetail[];
}

export interface PracticeDocument {
    id: string;
    title: string;
    type: 'Template' | 'Uploaded';
    uploadedBy: string;
    uploadedByAvatar: string;
    date: string;
    notes?: string;
}

export interface GrowthData {
    name: string;
    referral: number;
    selfEnrolled: number;
    providerInvite: number;
}

export interface RevenueData {
    name: string;
    vibrantPayouts: number;
    serviceFees: number;
}

export interface ProviderRevenueData {
    name: string;
    quickBill: number;
    practiceProducts: number;
    labMarkup: number;
    subscriptions: number;
    serviceFees: number;
}

export interface VibrantRevenueData {
    name: string;
    labPatientPay: number;
    labProviderPay: number;
}

export interface CostData {
    name: string;
    labCosts: number;
    operationalCosts: number;
}

export enum ServiceFeeTrigger {
    OrderCreated = 'Order Created',
    AppointmentCompleted = 'Appointment Completed',
    TelehealthSessionClosed = 'Telehealth Session Closed',
}

export interface ServiceFeeTemplate {
    id: string;
    serviceName: string;
    amount: number;
    triggerType: ServiceFeeTrigger;
    filter?: string;
    autoApply: boolean;
    status: 'Active' | 'Inactive';
}

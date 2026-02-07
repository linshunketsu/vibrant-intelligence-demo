// Form Builder Types
// Migrated from vibrant-intelligence-form-builder

export enum FormFieldType {
  SECTION_HEADER = 'SECTION_HEADER',
  NOTE = 'NOTE',
  IMAGE = 'IMAGE',
  COMPANY_HEADER = 'COMPANY_HEADER',
  TEXT_INPUT = 'TEXT_INPUT',
  TEXTAREA = 'TEXTAREA',
  PERSONAL_INFO = 'PERSONAL_INFO',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  RADIO_GROUP = 'RADIO_GROUP',
  CHECKBOX_GROUP = 'CHECKBOX_GROUP',
  CHECKBOX = 'CHECKBOX',
  DROPDOWN = 'DROPDOWN',
  YES_NO = 'YES_NO',
  DATE_PICKER = 'DATE_PICKER',
  DATETIME_PICKER = 'DATETIME_PICKER',
  TIME_PICKER = 'TIME_PICKER',
  NUMERIC = 'NUMERIC',
  RATING_SCALE = 'RATING_SCALE',
  SIGNATURE = 'SIGNATURE',
  MEDICATION_HISTORY = 'MEDICATION_HISTORY',
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
  RICH_TEXT = 'RICH_TEXT',
  VITALS = 'VITALS',
  PAYMENT_DETAILS = 'PAYMENT_DETAILS',
  UNIVERSAL_AGREEMENT = 'UNIVERSAL_AGREEMENT',
}

export interface PersonalInfoSelection {
  includeFullName: boolean;
  includePreferredName: boolean;
  includeMiddleName: boolean;
  includeGender: boolean;
  includePronouns: boolean;
  includeAddress: boolean;
  includeDOB: boolean;
  includeOccupation: boolean;
  includeReferralSource: boolean;
  includeRelationshipStatus: boolean;
  includeContactInfo: boolean;
}

export interface MedicationHistorySelection {
  includeProductName: boolean;
  includeDateRange: boolean;
  includeDosage: boolean;
  includeNotes: boolean;
}

export interface HealthInsuranceSelection {
  includePolicyHolder: boolean;
  includePayerId: boolean;
  includeName: boolean;
  includeCoverageType: boolean;
  includeGender: boolean;
  includeMemberId: boolean;
  includeDob: boolean;
  includePlanId: boolean;
  includePhoneNumber: boolean;
  includeGroupId: boolean;
  includeAddress: boolean;
  includeCopay: boolean;
  includePayerName: boolean;
  includeDeductible: boolean;
}

export interface VitalsSelection {
  includeHeight: boolean;
  includeWeight: boolean;
  includeBmi: boolean;
  includeBloodPressure: boolean;
  includeHeartRate: boolean;
  includeTemperature: boolean;
  includeRespiratoryRate: boolean;
  includeOxygenSaturation: boolean;
}

export interface PaymentDetailsSelection {
  includeCardDetails: boolean;
  includeBillingAddress: boolean;
}

export interface UniversalAgreementSelection {
  includePrintedName: boolean;
  includeDate: boolean;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  required?: boolean;
  rows?: number;
  ratingScale?: number;
  personalInfo?: PersonalInfoSelection;
  medicationHistory?: MedicationHistorySelection;
  healthInsurance?: HealthInsuranceSelection;
  vitals?: VitalsSelection;
  paymentDetails?: PaymentDetailsSelection;
  universalAgreement?: UniversalAgreementSelection;
  agreementText?: string;
  logoSrc?: string;
  minValue?: number;
  maxValue?: number;
}

export interface CustomElement {
  id: string;
  name: string;
  emoji: string;
  fields: FormField[];
  mappings?: EHRMapping[];
}

export interface EHRMapping {
  formFieldId: string;
  subFieldKey?: string;
  ehrField: string;
}

export type EHRMappingSuggestion = {
  formFieldId: string;
  subFieldKey?: string;
  ehrField: string;
  reason: string;
};

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  fields: FormField[];
  mappings?: EHRMapping[];
}

export interface VitalsEntry {
  date: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRateBpm?: number;
  temperatureCelsius?: number;
  respiratoryRateBpm?: number;
  oxygenSaturationPercent?: number;
}

export type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN';

export interface PatientFieldDefinition {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
}

export interface Patient {
  id: string;
  ehrData: {
    demographics: {
      name: {
        first: string;
        last: string;
        middle?: string;
        full: string;
      };
      dob: string;
      gender: 'Male' | 'Female' | 'Other';
      pronouns?: string;
      address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
      };
      contact: {
        phone: string;
        email: string;
      };
      occupation?: string;
      relationshipStatus?: string;
    };
    vitals?: VitalsEntry[];
    clinical?: {
      chiefComplaint?: string;
      allergies?: {
        list: string[];
      };
      medications?: {
        current: string[];
      };
      riskFactors?: {
        smokingStatus?: 'Current Smoker' | 'Former Smoker' | 'Never Smoked';
      };
    };
    insurance?: {
      providerName: string;
      memberId: string;
      groupId?: string;
    };
  };
  customData?: Record<string, any>;
}

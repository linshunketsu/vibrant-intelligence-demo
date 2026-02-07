// Form Builder Constants
// Migrated from vibrant-intelligence-form-builder

import { FormFieldType, FormTemplate, PersonalInfoSelection, MedicationHistorySelection, HealthInsuranceSelection, VitalsSelection, PaymentDetailsSelection } from './formTypes';

export const TOOLBOX_CATEGORIES = [
  {
    name: 'Layout',
    elements: [
      { type: FormFieldType.SECTION_HEADER, label: 'Section Header', emoji: '📑' },
      { type: FormFieldType.COMPANY_HEADER, label: 'Company Header', emoji: '🏢' },
      { type: FormFieldType.NOTE, label: 'Note', emoji: 'ℹ️' },
      { type: FormFieldType.IMAGE, label: 'Image', emoji: '🖼️' },
    ],
  },
  {
    name: 'Text Inputs',
    elements: [
      { type: FormFieldType.TEXT_INPUT, label: 'Short Response', emoji: '✏️' },
      { type: FormFieldType.TEXTAREA, label: 'Long Response', emoji: '📄' },
      { type: FormFieldType.RICH_TEXT, label: 'Text', emoji: '📝' },
    ],
  },
  {
    name: 'Personal Info',
    elements: [
      { type: FormFieldType.PERSONAL_INFO, label: 'Personal Info', emoji: '👤' },
      { type: FormFieldType.HEALTH_INSURANCE, label: 'Health Insurance', emoji: '💳' },
      { type: FormFieldType.EMAIL, label: 'Email', emoji: '📧' },
      { type: FormFieldType.PHONE, label: 'Phone Number', emoji: '📞' },
    ],
  },
  {
    name: 'Choice Inputs',
    elements: [
      { type: FormFieldType.RADIO_GROUP, label: 'Single Choice', emoji: '🔘' },
      { type: FormFieldType.CHECKBOX_GROUP, label: 'Multi Choice', emoji: '☑️' },
      { type: FormFieldType.CHECKBOX, label: 'Checkbox', emoji: '✅' },
      { type: FormFieldType.DROPDOWN, label: 'Dropdown', emoji: '🔽' },
      { type: FormFieldType.YES_NO, label: 'Yes/No Question', emoji: '❓' },
    ],
  },
  {
    name: 'Specialized Inputs',
    elements: [
      { type: FormFieldType.DATE_PICKER, label: 'Date', emoji: '📅' },
      { type: FormFieldType.DATETIME_PICKER, label: 'Date/Time', emoji: '🕰️' },
      { type: FormFieldType.TIME_PICKER, label: 'Time', emoji: '⏰' },
      { type: FormFieldType.NUMERIC, label: 'Numeric', emoji: '🔢' },
      { type: FormFieldType.RATING_SCALE, label: 'Rating Scale', emoji: '⭐' },
      { type: FormFieldType.SIGNATURE, label: 'Signer', emoji: '✍️' },
      { type: FormFieldType.MEDICATION_HISTORY, label: 'Medication History', emoji: '💊' },
      { type: FormFieldType.VITALS, label: 'Vitals', emoji: '🩺' },
      { type: FormFieldType.PAYMENT_DETAILS, label: 'Payment Details', emoji: '💵' },
      { type: FormFieldType.UNIVERSAL_AGREEMENT, label: 'Agreement', emoji: '🤝' },
    ],
  },
];

const excludedForPrimitives = [
  FormFieldType.PERSONAL_INFO,
  FormFieldType.HEALTH_INSURANCE,
  FormFieldType.MEDICATION_HISTORY,
  FormFieldType.VITALS,
  FormFieldType.PAYMENT_DETAILS,
];

export const PRIMITIVE_TOOLBOX_CATEGORIES = TOOLBOX_CATEGORIES.map(category => ({
  ...category,
  elements: category.elements.filter(el => !excludedForPrimitives.includes(el.type))
})).filter(category => category.elements.length > 0);

export const INITIAL_FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'tpl_intake',
    title: 'Standard Patient Intake',
    description: 'A comprehensive form for new patient registration and medical history.',
    category: 'General Medicine',
    fields: [
      {
        id: 'pi_1',
        type: FormFieldType.PERSONAL_INFO,
        label: 'Patient Information',
        personalInfo: {
          includeFullName: true,
          includePreferredName: false,
          includeMiddleName: true,
          includeGender: true,
          includePronouns: false,
          includeAddress: true,
          includeDOB: true,
          includeOccupation: false,
          includeReferralSource: false,
          includeRelationshipStatus: false,
          includeContactInfo: true,
        }
      },
      { id: 'sh_2', type: FormFieldType.SECTION_HEADER, label: 'Medical History' },
      { id: 'allerg_1', type: FormFieldType.TEXTAREA, label: 'Allergies', placeholder: 'e.g., Penicillin, Peanuts' },
      { id: 'meds_1', type: FormFieldType.TEXTAREA, label: 'Current Medications', placeholder: 'e.g., Lisinopril 10mg' },
      { id: 'smoke_1', type: FormFieldType.RADIO_GROUP, label: 'Smoking Status', options: ['Current Smoker', 'Former Smoker', 'Never Smoked'], required: true },
    ],
  },
  {
    id: 'tpl_consent',
    title: 'Telehealth Consent',
    description: 'A consent form for patients to agree to telehealth services.',
    category: 'Administrative',
    fields: [
      { id: 'sh_consent', type: FormFieldType.SECTION_HEADER, label: 'Consent for Telehealth Services' },
      { id: 'p_name_c', type: FormFieldType.TEXT_INPUT, label: 'Patient Name', required: true },
      { id: 'consent_chk_1', type: FormFieldType.CHECKBOX, label: 'I understand the risks and benefits of telehealth.', required: true },
      { id: 'consent_chk_2', type: FormFieldType.CHECKBOX, label: 'I consent to receive medical care via telehealth.', required: true },
      { id: 'date_c', type: FormFieldType.DATE_PICKER, label: 'Date of Consent', required: true },
    ],
  },
  {
    id: 'tpl_followup',
    title: 'Post-Operative Follow-up',
    description: 'A form to track patient recovery and symptoms after a surgical procedure.',
    category: 'Surgery',
    fields: [
      { id: 'sh_fu_1', type: FormFieldType.SECTION_HEADER, label: 'Symptom Check' },
      { id: 'pain_lvl_1', type: FormFieldType.DROPDOWN, label: 'Pain Level (0-10)', options: Array.from({ length: 11 }, (_, i) => i.toString()), required: true },
      { id: 'symptoms_1', type: FormFieldType.TEXTAREA, label: 'Describe any new or worsening symptoms', placeholder: 'e.g., increased swelling, fever, redness...' },
      { id: 'wound_care_1', type: FormFieldType.CHECKBOX, label: 'I have been following the wound care instructions.', required: true },
    ],
  },
  {
    id: 'tpl_mental_health_intake',
    title: 'Mental Health Intake',
    description: 'A comprehensive intake form for new mental health patients.',
    category: 'Mental Health',
    fields: [
      {
        id: 'pi_mh_1',
        type: FormFieldType.PERSONAL_INFO,
        label: 'Patient Information',
        personalInfo: {
          includeFullName: true,
          includePreferredName: true,
          includeMiddleName: false,
          includeGender: true,
          includePronouns: true,
          includeAddress: true,
          includeDOB: true,
          includeOccupation: true,
          includeReferralSource: false,
          includeRelationshipStatus: true,
          includeContactInfo: true,
        }
      },
      { id: 'sh_mh_presenting', type: FormFieldType.SECTION_HEADER, label: 'Presenting Concerns' },
      { id: 'concern_desc', type: FormFieldType.TEXTAREA, label: 'Please describe the reasons you are seeking services today.', required: true, rows: 4 },
      { id: 'symptom_checklist', type: FormFieldType.CHECKBOX_GROUP, label: 'Please check any symptoms you have experienced in the last month:', options: ['Anxiety/Worry', 'Depressed Mood', 'Sleep Disturbance', 'Appetite Change', 'Difficulty Concentrating', 'Panic Attacks', 'Mood Swings'] },
      { id: 'sh_mh_history', type: FormFieldType.SECTION_HEADER, label: 'Psychiatric History' },
      { id: 'prev_therapy', type: FormFieldType.YES_NO, label: 'Have you received mental health services before?' },
      { id: 'prev_diagnosis', type: FormFieldType.TEXTAREA, label: 'If yes, please list any previous diagnoses and providers.' },
      { id: 'sh_risk', type: FormFieldType.SECTION_HEADER, label: 'Risk Assessment' },
      { id: 'suicidal_thoughts', type: FormFieldType.YES_NO, label: 'Have you had thoughts of harming yourself in the past month?' },
      { id: 'self_harm', type: FormFieldType.YES_NO, label: 'Have you engaged in non-suicidal self-harm in the past month?' },
    ]
  },
  {
    id: 'tpl_hipaa',
    title: 'HIPAA Acknowledgement',
    description: 'A standard form for patients to acknowledge receipt of the HIPAA Notice of Privacy Practices.',
    category: 'Administrative',
    fields: [
      { id: 'sh_hipaa_header', type: FormFieldType.SECTION_HEADER, label: 'HIPAA Notice of Privacy Practices Acknowledgement' },
      { id: 'hipaa_note', type: FormFieldType.NOTE, label: 'Our Notice of Privacy Practices provides information about how we may use and disclose protected health information about you. You have the right to review our notice before signing this consent.' },
      { id: 'hipaa_ack', type: FormFieldType.CHECKBOX, label: 'By checking this box, I acknowledge that I have received a copy of this office\'s Notice of Privacy Practices.', required: true },
      { id: 'hipaa_p_name', type: FormFieldType.TEXT_INPUT, label: 'Patient Full Name', required: true },
      { id: 'hipaa_sig', type: FormFieldType.SIGNATURE, label: 'Patient or Legal Guardian Signature', required: true },
      { id: 'hipaa_date', type: FormFieldType.DATE_PICKER, label: 'Date', required: true },
    ]
  },
];

export const personalInfoLabels: Record<keyof PersonalInfoSelection, string> = {
  includeFullName: 'Full Name',
  includePreferredName: 'Preferred Name',
  includeMiddleName: 'Middle Name',
  includeGender: 'Gender',
  includePronouns: 'Pronouns',
  includeAddress: 'Address Block',
  includeDOB: 'Date of Birth (DOB)',
  includeOccupation: 'Occupation',
  includeReferralSource: 'Referral Source',
  includeRelationshipStatus: 'Relationship Status',
  includeContactInfo: 'Contact Info Block'
};

export const medicationHistoryLabels: Record<keyof MedicationHistorySelection, string> = {
  includeProductName: 'Product Name',
  includeDateRange: 'Date Range',
  includeDosage: 'Dosage Information',
  includeNotes: 'Additional Notes',
};

export const healthInsuranceLabels: Record<keyof HealthInsuranceSelection, string> = {
  includePolicyHolder: 'Relationship to Patient',
  includePayerId: 'Payer ID',
  includeName: 'Policy Holder Name',
  includeCoverageType: 'Coverage Type',
  includeGender: 'Policy Holder Gender',
  includeMemberId: 'Member ID',
  includeDob: 'Policy Holder DOB',
  includePlanId: 'Plan ID',
  includePhoneNumber: 'Insurance Phone Number',
  includeGroupId: 'Group ID',
  includeAddress: 'Policy Holder Address',
  includeCopay: 'Copay',
  includePayerName: 'Payer Name',
  includeDeductible: 'Deductible',
};

export const vitalsLabels: Record<keyof VitalsSelection, string> = {
  includeHeight: 'Height',
  includeWeight: 'Weight',
  includeBmi: 'Body Mass Index (BMI)',
  includeBloodPressure: 'Blood Pressure',
  includeHeartRate: 'Heart Rate',
  includeTemperature: 'Temperature',
  includeRespiratoryRate: 'Respiratory Rate',
  includeOxygenSaturation: 'Oxygen Saturation (SpO2)',
};

export const paymentDetailsLabels: Record<keyof PaymentDetailsSelection, string> = {
  includeCardDetails: 'Card Details',
  includeBillingAddress: 'Billing Address',
};

export const EHR_FIELD_PATHS: { label: string; value: string; category: string }[] = [
  { category: 'Demographics', label: 'Full Name', value: 'demographics.name.full' },
  { category: 'Demographics', label: 'First Name', value: 'demographics.name.first' },
  { category: 'Demographics', label: 'Last Name', value: 'demographics.name.last' },
  { category: 'Demographics', label: 'Middle Name', value: 'demographics.name.middle' },
  { category: 'Demographics', label: 'Date of Birth', value: 'demographics.dob' },
  { category: 'Demographics', label: 'Gender', value: 'demographics.gender' },
  { category: 'Demographics', label: 'Pronouns', value: 'demographics.pronouns' },
  { category: 'Demographics', label: 'Address (Composite)', value: 'demographics.address' },
  { category: 'Demographics', label: 'Phone Number', value: 'demographics.contact.phone' },
  { category: 'Demographics', label: 'Email Address', value: 'demographics.contact.email' },
  { category: 'Demographics', label: 'Occupation', value: 'demographics.occupation' },
  { category: 'Demographics', label: 'Relationship Status', value: 'demographics.relationshipStatus' },
  { category: 'Vitals', label: 'Height (cm)', value: 'vitals.heightCm' },
  { category: 'Vitals', label: 'Weight (kg)', value: 'vitals.weightKg' },
  { category: 'Vitals', label: 'BMI', value: 'vitals.bmi' },
  { category: 'Vitals', label: 'Blood Pressure (Composite)', value: 'vitals.bloodPressure' },
  { category: 'Vitals', label: 'Systolic BP', value: 'vitals.bloodPressure.systolic' },
  { category: 'Vitals', label: 'Diastolic BP', value: 'vitals.bloodPressure.diastolic' },
  { category: 'Vitals', label: 'Heart Rate (bpm)', value: 'vitals.heartRateBpm' },
  { category: 'Vitals', label: 'Temperature (°C)', value: 'vitals.temperatureCelsius' },
  { category: 'Vitals', label: 'Respiratory Rate (bpm)', value: 'vitals.respiratoryRateBpm' },
  { category: 'Vitals', label: 'Oxygen Saturation (%)', value: 'vitals.oxygenSaturationPercent' },
  { category: 'Clinical', label: 'Chief Complaint', value: 'clinical.chiefComplaint' },
  { category: 'Clinical', label: 'Allergies', value: 'clinical.allergies.list' },
  { category: 'Clinical', label: 'Current Medications', value: 'clinical.medications.current' },
  { category: 'Clinical', label: 'Smoking Status', value: 'clinical.riskFactors.smokingStatus' },
  { category: 'Insurance', label: 'Provider Name', value: 'insurance.providerName' },
  { category: 'Insurance', label: 'Member ID', value: 'insurance.memberId' },
  { category: 'Insurance', label: 'Group ID', value: 'insurance.groupId' },
];

export const DEFAULT_SUBFIELD_MAPPINGS: Record<string, string> = {
  // Personal Info
  'includeFullName': 'demographics.name.full',
  'includeMiddleName': 'demographics.name.middle',
  'includeDOB': 'demographics.dob',
  'includeGender': 'demographics.gender',
  'includePronouns': 'demographics.pronouns',
  'includeAddress': 'demographics.address',
  'includeOccupation': 'demographics.occupation',
  'includeRelationshipStatus': 'demographics.relationshipStatus',
  // Health Insurance
  'includePayerName': 'insurance.providerName',
  'includeMemberId': 'insurance.memberId',
  'includeGroupId': 'insurance.groupId',
  // Vitals
  'includeHeight': 'vitals.heightCm',
  'includeWeight': 'vitals.weightKg',
  'includeBmi': 'vitals.bmi',
  'includeBloodPressure': 'vitals.bloodPressure',
  'includeHeartRate': 'vitals.heartRateBpm',
  'includeTemperature': 'vitals.temperatureCelsius',
  'includeRespiratoryRate': 'vitals.respiratoryRateBpm',
  'includeOxygenSaturation': 'vitals.oxygenSaturationPercent',
};

export const DEFAULT_FIELD_TYPE_MAPPINGS: Partial<Record<FormFieldType, string>> = {
  [FormFieldType.EMAIL]: 'demographics.contact.email',
  [FormFieldType.PHONE]: 'demographics.contact.phone',
};

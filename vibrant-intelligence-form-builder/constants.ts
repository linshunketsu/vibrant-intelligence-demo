
import { FormFieldType, FormTemplate, Patient, PersonalInfoSelection, MedicationHistorySelection, HealthInsuranceSelection, VitalsSelection, PaymentDetailsSelection } from './types';

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
    id: 'tpl_pt_eval',
    title: 'Physical Therapy Evaluation',
    description: 'Initial evaluation form for physical therapy patients to assess pain and function.',
    category: 'Physical Therapy',
    fields: [
      { id: 'sh_pt_pain', type: FormFieldType.SECTION_HEADER, label: 'Pain Assessment' },
      { id: 'pain_location', type: FormFieldType.TEXT_INPUT, label: 'Primary location of pain', required: true },
      { id: 'pain_level_now', type: FormFieldType.RATING_SCALE, label: 'Current Pain Level (0=no pain, 10=worst imaginable)', ratingScale: 10, required: true },
      { id: 'pain_description', type: FormFieldType.TEXTAREA, label: 'Describe the pain (e.g., sharp, dull, aching, burning)' },
      { id: 'sh_pt_function', type: FormFieldType.SECTION_HEADER, label: 'Functional Limitations' },
      { id: 'difficult_activities', type: FormFieldType.TEXTAREA, label: 'What daily activities are difficult due to your condition?' },
      { id: 'sh_pt_goals', type: FormFieldType.SECTION_HEADER, label: 'Patient Goals' },
      { id: 'therapy_goals', type: FormFieldType.TEXTAREA, label: 'What do you hope to achieve with physical therapy?' },
    ]
  },
  {
    id: 'tpl_derm_note',
    title: 'Dermatology Visit Note',
    description: 'A focused note for documenting dermatology patient encounters.',
    category: 'Dermatology',
    fields: [
      { id: 'chief_complaint', type: FormFieldType.TEXT_INPUT, label: 'Chief Complaint', required: true },
      { id: 'hpi', type: FormFieldType.TEXTAREA, label: 'History of Present Illness', required: true },
      { id: 'derm_symptoms', type: FormFieldType.CHECKBOX_GROUP, label: 'Associated Symptoms', options: ['Itching', 'Burning', 'Scaling', 'Bleeding', 'Pain'] },
      { id: 'history_skin_cancer', type: FormFieldType.YES_NO, label: 'Personal history of skin cancer?' },
      { id: 'family_history_skin_cancer', type: FormFieldType.YES_NO, label: 'Family history of melanoma?' },
      { id: 'sh_derm_exam', type: FormFieldType.SECTION_HEADER, label: 'Physical Exam' },
      { id: 'exam_findings', type: FormFieldType.TEXTAREA, label: 'Skin exam findings' },
      { id: 'sh_derm_plan', type: FormFieldType.SECTION_HEADER, label: 'Assessment & Plan' },
      { id: 'assessment', type: FormFieldType.TEXTAREA, label: 'Assessment / Diagnosis' },
      { id: 'plan', type: FormFieldType.TEXTAREA, label: 'Treatment Plan' },
    ]
  },
  {
    id: 'tpl_peds_1yr',
    title: 'Pediatric Well-Child Visit (1 Year)',
    description: 'A checklist for a 12-month pediatric visit covering development and nutrition.',
    category: 'Pediatrics',
    fields: [
      { id: 'sh_peds_concerns', type: FormFieldType.SECTION_HEADER, label: 'Parent Concerns' },
      { id: 'parent_concerns', type: FormFieldType.TEXTAREA, label: 'Do you have any concerns about your child\'s health, growth, or development?' },
      { id: 'sh_peds_nutrition', type: FormFieldType.SECTION_HEADER, label: 'Nutrition' },
      { id: 'feeding_type', type: FormFieldType.RADIO_GROUP, label: 'Primary feeding type', options: ['Breastmilk', 'Formula', 'Whole Milk', 'Combination'] },
      { id: 'solid_foods', type: FormFieldType.TEXTAREA, label: 'What types of solid foods does your child eat?' },
      { id: 'sh_peds_dev', type: FormFieldType.SECTION_HEADER, label: 'Developmental Milestones (Check if "Yes")' },
      { id: 'dev_pull_stand', type: FormFieldType.CHECKBOX, label: 'Pulls to a standing position?' },
      { id: 'dev_cruising', type: FormFieldType.CHECKBOX, label: 'Cruises or walks holding onto furniture?' },
      { id: 'dev_pincer', type: FormFieldType.CHECKBOX, label: 'Uses pincer grasp (thumb and index finger) to pick up small objects?' },
      { id: 'dev_mamadada', type: FormFieldType.CHECKBOX, label: 'Says "mama" or "dada" (specific)?' },
      { id: 'dev_waves', type: FormFieldType.CHECKBOX, label: 'Waves "bye-bye"?' },
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

export const EXISTING_FORMS: FormTemplate[] = [
  {
    id: 'form_main_intake_v2',
    title: 'Main Clinic Patient Intake (v2.1)',
    description: 'The primary intake form for all new patients visiting the main clinic.',
    category: 'Practice Forms',
    fields: [
      { 
        id: 'pi_1', 
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
      { id: 'sh_2', type: FormFieldType.SECTION_HEADER, label: 'Insurance Information' },
      { id: 'ins_provider', type: FormFieldType.TEXT_INPUT, label: 'Insurance Provider', required: true },
      { id: 'ins_id', type: FormFieldType.TEXT_INPUT, label: 'Member ID', required: true },
      { id: 'sh_3', type: FormFieldType.SECTION_HEADER, label: 'Medical History' },
      { id: 'allerg_1', type: FormFieldType.TEXTAREA, label: 'Allergies', placeholder: 'e.g., Penicillin, Peanuts' },
      { id: 'meds_1', type: FormFieldType.TEXTAREA, label: 'Current Medications', placeholder: 'e.g., Lisinopril 10mg' },
    ],
  },
  {
    id: 'form_cardio_followup_smith',
    title: 'Dr. Smith\'s Cardiology Follow-Up',
    description: 'Standard follow-up questionnaire for patients of Dr. Smith.',
    category: 'Practice Forms',
    fields: [
      { id: 'sh_fu_1', type: FormFieldType.SECTION_HEADER, label: 'Symptom Check' },
      { id: 'pain_lvl_1', type: FormFieldType.DROPDOWN, label: 'Chest Pain Level (0-10)', options: Array.from({ length: 11 }, (_, i) => i.toString()), required: true },
      { id: 'symptoms_1', type: FormFieldType.CHECKBOX_GROUP, label: 'Have you experienced any of the following?', options: ['Shortness of breath', 'Dizziness', 'Heart palpitations', 'Swelling in legs'] },
      { id: 'med_adherence_1', type: FormFieldType.YES_NO, label: 'Are you taking your medication as prescribed?', required: true },
    ],
  },
  {
    id: 'form_telehealth_consent_2024',
    title: 'Telehealth Services Consent 2024',
    description: 'Annual consent form for patients engaging in telehealth services.',
    category: 'Practice Forms',
    fields: [
        { id: 'sh_consent', type: FormFieldType.SECTION_HEADER, label: 'Consent for Telehealth Services' },
        { id: 'note_1', type: FormFieldType.NOTE, label: 'Please read the following information carefully before signing.'},
        { id: 'p_name_c', type: FormFieldType.TEXT_INPUT, label: 'Patient Full Name', required: true },
        { id: 'consent_chk_1', type: FormFieldType.CHECKBOX, label: 'I understand that telehealth has potential risks, including but not limited to, technical failures and reduced accuracy of remote examination.', required: true },
        { id: 'consent_chk_2', type: FormFieldType.CHECKBOX, label: 'I consent to receive medical care from Vibrant Intelligence Health.', required: true },
        { id: 'sig_1', type: FormFieldType.SIGNATURE, label: 'Patient Signature', required: true },
        { id: 'date_c', type: FormFieldType.DATE_PICKER, label: 'Date of Consent', required: true },
    ],
  },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat_1',
    ehrData: {
      demographics: {
        name: { first: 'Eleanor', last: 'Vance', full: 'Eleanor Vance' },
        dob: '1985-07-22',
        gender: 'Female',
        pronouns: 'she/her',
        address: { street: '123 Maple Street', city: 'Springfield', state: 'IL', zip: '62704' },
        contact: { phone: '555-0101', email: 'eleanor.vance@example.com' },
        occupation: 'Architect',
        relationshipStatus: 'Married',
      },
      vitals: [
        {
            date: '2024-07-15',
            heightCm: 165,
            weightKg: 68,
            bmi: 24.9,
            bloodPressure: { systolic: 120, diastolic: 78 },
            heartRateBpm: 70,
            temperatureCelsius: 36.8,
            respiratoryRateBpm: 16,
            oxygenSaturationPercent: 99,
        },
        {
            date: '2024-04-10',
            heightCm: 165,
            weightKg: 69.5,
            bmi: 25.5,
            bloodPressure: { systolic: 122, diastolic: 80 },
            heartRateBpm: 75,
            temperatureCelsius: 36.9,
        },
        {
            date: '2024-01-20',
            heightCm: 165,
            weightKg: 70,
            bmi: 25.7,
            bloodPressure: { systolic: 128, diastolic: 84 },
            heartRateBpm: 78,
        }
      ],
      clinical: {
        allergies: { list: ['Penicillin'] },
        medications: { current: ['Lisinopril 10mg', 'Amlodipine 5mg'] },
        riskFactors: { smokingStatus: 'Never Smoked' },
      },
      insurance: {
        providerName: 'Blue Cross Blue Shield',
        memberId: 'X123456789',
        groupId: 'GROUP987',
      },
    },
    customData: {
        'cust_pharmacy': 'CVS Main St',
        'cust_transport': 'None'
    }
  },
  {
    id: 'pat_2',
    ehrData: {
      demographics: {
        name: { first: 'Arthur', last: 'Pendleton', full: 'Arthur Pendleton' },
        dob: '1952-11-09',
        gender: 'Male',
        pronouns: 'he/him',
        address: { street: '456 Oak Avenue', city: 'Springfield', state: 'IL', zip: '62702' },
        contact: { phone: '555-0102', email: 'arthur.p@example.com' },
        occupation: 'Retired Teacher',
        relationshipStatus: 'Widowed',
      },
      vitals: [
        {
            date: '2024-06-20',
            heightCm: 178,
            weightKg: 81.5,
            bmi: 25.6,
            bloodPressure: { systolic: 132, diastolic: 84 },
            heartRateBpm: 65,
            temperatureCelsius: 36.7,
        },
        {
            date: '2024-03-15',
            heightCm: 178,
            weightKg: 82,
            bmi: 25.8,
            bloodPressure: { systolic: 135, diastolic: 85 },
            heartRateBpm: 68,
            temperatureCelsius: 36.6,
        },
        {
            date: '2023-12-10',
            heightCm: 178,
            weightKg: 84,
            bmi: 26.4,
            bloodPressure: { systolic: 140, diastolic: 88 },
            heartRateBpm: 70,
        },
        {
            date: '2023-09-05',
            heightCm: 178,
            weightKg: 85.5,
            bmi: 26.9,
            bloodPressure: { systolic: 142, diastolic: 90 },
            heartRateBpm: 72,
        }
      ],
      clinical: {
        chiefComplaint: 'Follow-up for hypertension',
        allergies: { list: ['No Known Allergies'] },
        medications: { current: ['Metformin 500mg', 'Atorvastatin 20mg'] },
        riskFactors: { smokingStatus: 'Former Smoker' },
      },
      insurance: {
        providerName: 'Aetna',
        memberId: 'W987654321',
      },
    },
    customData: {
        'cust_pharmacy': 'Walgreens South',
        'cust_transport': 'Wheelchair'
    }
  },
  {
    id: 'pat_3',
    ehrData: {
      demographics: {
        name: { first: 'Maria', last: 'Garcia', full: 'Maria Garcia' },
        dob: '1993-02-15',
        gender: 'Female',
        pronouns: 'she/her',
        address: { street: '789 Pine Lane', city: 'Metropolis', state: 'NY', zip: '10001' },
        contact: { phone: '555-0103', email: 'm.garcia@example.com' },
        occupation: 'Graphic Designer',
        relationshipStatus: 'Single',
      },
      vitals: [
        {
            date: '2024-05-01',
            oxygenSaturationPercent: 98,
            heartRateBpm: 78,
            weightKg: 62
        },
        {
            date: '2023-11-15',
            oxygenSaturationPercent: 99,
            heartRateBpm: 75,
            weightKg: 61.5
        }
      ],
      clinical: {
        allergies: { list: ['Sulfa Drugs', 'Latex'] },
        medications: { current: ['Albuterol Inhaler (as needed)'] },
      },
      insurance: {
        providerName: 'Cigna',
        memberId: 'Y246813579',
        groupId: 'GROUP123',
      },
    },
  },
  {
    id: 'pat_4',
    ehrData: {
      demographics: {
        name: { first: 'James', last: 'Rodriguez', middle: 'Carlos', full: 'James Carlos Rodriguez' },
        dob: '1978-05-30',
        gender: 'Male',
        pronouns: 'he/him',
        address: { street: '321 Birch Road', city: 'Springfield', state: 'IL', zip: '62707' },
        contact: { phone: '555-0104', email: 'jc.rodriguez@example.com' },
        occupation: 'Software Engineer',
      },
      vitals: [
        {
            date: '2024-06-01',
            bloodPressure: { systolic: 118, diastolic: 76 },
            heartRateBpm: 65,
        }
      ],
      clinical: {
        medications: { current: ['Loratadine 10mg (seasonal)'] },
      },
      insurance: {
        providerName: 'United Healthcare',
        memberId: 'Z135792468',
      },
    },
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

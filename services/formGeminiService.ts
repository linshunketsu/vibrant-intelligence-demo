// Gemini AI Service for Form Builder
// Migrated from vibrant-intelligence-form-builder

import { GoogleGenAI, Type } from "@google/genai";
import { FormField, FormFieldType, PersonalInfoSelection, MedicationHistorySelection, HealthInsuranceSelection, VitalsSelection, PaymentDetailsSelection, UniversalAgreementSelection } from '../formTypes';
import { personalInfoLabels, medicationHistoryLabels, healthInsuranceLabels, vitalsLabels } from '../formConstants';

// Get API key from environment or local storage
const getApiKey = (): string => {
  // Try environment variable first
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // Fallback to local storage (user can set via UI)
  const stored = localStorage.getItem('gemini_api_key');
  if (stored) return stored;
  throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable or provide it via the settings.');
};

// Type definition for EHRMappingSuggestion
export type EHRMappingSuggestion = {
  formFieldId: string;
  subFieldKey?: string;
  ehrField: string;
  reason: string;
};

// --- Schema definitions for generateFormWithAI ---

const personalInfoSelectionSchema = {
  type: Type.OBJECT,
  properties: {
    includeFullName: { type: Type.BOOLEAN },
    includePreferredName: { type: Type.BOOLEAN },
    includeMiddleName: { type: Type.BOOLEAN },
    includeGender: { type: Type.BOOLEAN },
    includePronouns: { type: Type.BOOLEAN },
    includeAddress: { type: Type.BOOLEAN },
    includeDOB: { type: Type.BOOLEAN },
    includeOccupation: { type: Type.BOOLEAN },
    includeReferralSource: { type: Type.BOOLEAN },
    includeRelationshipStatus: { type: Type.BOOLEAN },
    includeContactInfo: { type: Type.BOOLEAN },
  }
};

const medicationHistorySelectionSchema = {
  type: Type.OBJECT,
  properties: {
    includeProductName: { type: Type.BOOLEAN },
    includeDateRange: { type: Type.BOOLEAN },
    includeDosage: { type: Type.BOOLEAN },
    includeNotes: { type: Type.BOOLEAN },
  }
};

const healthInsuranceSelectionSchema = {
  type: Type.OBJECT,
  properties: {
    includePolicyHolder: { type: Type.BOOLEAN },
    includePayerId: { type: Type.BOOLEAN },
    includeName: { type: Type.BOOLEAN },
    includeCoverageType: { type: Type.BOOLEAN },
    includeGender: { type: Type.BOOLEAN },
    includeMemberId: { type: Type.BOOLEAN },
    includeDob: { type: Type.BOOLEAN },
    includePlanId: { type: Type.BOOLEAN },
    includePhoneNumber: { type: Type.BOOLEAN },
    includeGroupId: { type: Type.BOOLEAN },
    includeAddress: { type: Type.BOOLEAN },
    includeCopay: { type: Type.BOOLEAN },
    includePayerName: { type: Type.BOOLEAN },
    includeDeductible: { type: Type.BOOLEAN },
  }
};

const vitalsSelectionSchema = {
  type: Type.OBJECT,
  properties: {
    includeHeight: { type: Type.BOOLEAN },
    includeWeight: { type: Type.BOOLEAN },
    includeBmi: { type: Type.BOOLEAN },
    includeBloodPressure: { type: Type.BOOLEAN },
    includeHeartRate: { type: Type.BOOLEAN },
    includeTemperature: { type: Type.BOOLEAN },
    includeRespiratoryRate: { type: Type.BOOLEAN },
    includeOxygenSaturation: { type: Type.BOOLEAN },
  }
};

const paymentDetailsSelectionSchema = {
  type: Type.OBJECT,
  properties: {
    includeCardDetails: { type: Type.BOOLEAN },
    includeBillingAddress: { type: Type.BOOLEAN },
  }
};

const universalAgreementSelectionSchema = {
  type: Type.OBJECT,
  properties: {
    includePrintedName: { type: Type.BOOLEAN },
    includeDate: { type: Type.BOOLEAN },
  }
};

const formFieldSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'A unique identifier for the field, e.g., "pi_1" or "allerg_1". Use a short, descriptive prefix and a unique suffix if needed.' },
    type: { type: Type.STRING, enum: Object.values(FormFieldType), description: "The type of the form field." },
    label: { type: Type.STRING, description: "The display text for the field's label." },
    placeholder: { type: Type.STRING, description: "Placeholder text for input fields." },
    helpText: { type: Type.STRING, description: "Additional instructional text for the user." },
    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of choices for choice-based fields." },
    required: { type: Type.BOOLEAN, description: "Whether the field must be filled out." },
    rows: { type: Type.INTEGER, description: "The number of text lines for a TEXTAREA." },
    ratingScale: { type: Type.INTEGER, description: "The maximum value for a RATING_SCALE." },
    personalInfo: personalInfoSelectionSchema,
    medicationHistory: medicationHistorySelectionSchema,
    healthInsurance: healthInsuranceSelectionSchema,
    vitals: vitalsSelectionSchema,
    paymentDetails: paymentDetailsSelectionSchema,
    universalAgreement: universalAgreementSelectionSchema,
    agreementText: { type: Type.STRING, description: "The full text content for a UNIVERSAL_AGREEMENT field." },
    minValue: { type: Type.NUMBER },
    maxValue: { type: Type.NUMBER },
  },
  required: ['id', 'type', 'label'],
};

export async function generateFormWithAI(
  apiKey: string,
  formPurpose: string,
  formDescription: string,
  existingFields: FormField[]
): Promise<FormField[]> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert AI assistant for creating and refining components for medical forms in an Electronic Health Record (EHR) system.
    Your task is to intelligently modify an existing list of form fields to create a new component or form. You will add to, remove from, or modify the existing fields to best match the new requirements.

    User's Goal:
    - Form Purpose: ${formPurpose}
    - Form Description: ${formDescription}

    Existing Form Fields:
    ${JSON.stringify(existingFields, null, 2)}

    Your Instructions:
    1.  **Analyze**: Carefully review the 'Existing Form Fields' and understand their structure.
    2.  **Refine**: Based on the user's goal, determine the optimal final set of fields for the form or component.
        -   **Keep Fields**: If an existing field is relevant to the new purpose, you should keep it.
        -   **Modify Fields**: You can modify the properties of an existing field (like its 'label' or 'options') if it's mostly correct but needs adjustments.
        -   **Remove Fields**: If an existing field is no longer relevant, you must remove it from the final list.
        -   **Add Fields**: Add new fields that are necessary to fulfill the user's request but are missing from the existing form.
    3.  **Preserve IDs**: This is critical. If you decide to KEEP or MODIFY an existing field, you MUST use its original 'id' in the final output. This allows the system to track changes.
    4.  **Create New IDs**: For any completely NEW fields you add, create a new, unique, and descriptive 'id' (e.g., 'new_symptom_checker').
    5.  **Return the Final List**: Your final output must be a single JSON array representing the complete, final state of the form fields. Do not explain your reasoning or return anything else. The list should include the kept, modified, and newly added fields in a logical order.

    General Rules for field creation are the same:
    - Use composite fields like 'PERSONAL_INFO' for complex sections.
    - Use 'COMPANY_HEADER' once at the very beginning of a form for branding purposes, if appropriate.
    - Use 'UNIVERSAL_AGREEMENT' for any type of consent, terms of service, or HIPAA acknowledgement. This is a specialized field for legally binding agreements and should include a text block, a required checkbox, and optional name/date fields.
    - Ensure all fields adhere to the provided JSON schema.
    - Keep the total number of fields reasonable (e.g., under 20).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: formFieldSchema
        },
      },
    });

    const jsonString = response.text.trim();
    const generatedFields: FormField[] = JSON.parse(jsonString);

    // Post-processing step to enforce default state for ALL fields
    const processedFields = generatedFields.map(field => {
      const newField = { ...field };

      // --- Set defaults for SIMPLE fields that might be missing properties ---
      switch (newField.type) {
        case FormFieldType.CHECKBOX_GROUP:
        case FormFieldType.RADIO_GROUP:
        case FormFieldType.DROPDOWN:
          if (!newField.options || newField.options.length === 0) {
            newField.options = ['Option 1', 'Option 2'];
          }
          break;
        case FormFieldType.RATING_SCALE:
          if (newField.ratingScale === undefined) {
            newField.ratingScale = 5;
          }
          break;
        case FormFieldType.TEXTAREA:
          if (newField.rows === undefined) {
            newField.rows = 3;
          }
          break;
        case FormFieldType.NUMERIC:
          if (newField.minValue === undefined) {
            newField.minValue = 0;
          }
          if (newField.maxValue === undefined) {
            newField.maxValue = 100;
          }
          break;
      }

      // --- Enforce full default structure for COMPOSITE fields ---
      switch (newField.type) {
        case FormFieldType.PERSONAL_INFO:
          newField.personalInfo = {
            includeFullName: true, includePreferredName: true, includeMiddleName: true,
            includeGender: true, includePronouns: true, includeAddress: true,
            includeDOB: true, includeOccupation: true, includeReferralSource: true,
            includeRelationshipStatus: true, includeContactInfo: true,
          };
          break;
        case FormFieldType.HEALTH_INSURANCE:
          newField.healthInsurance = {
            includePolicyHolder: true, includePayerId: true, includeName: true,
            includeCoverageType: true, includeGender: true, includeMemberId: true,
            includeDob: true, includePlanId: true, includePhoneNumber: true,
            includeGroupId: true, includeAddress: true, includeCopay: true,
            includePayerName: true, includeDeductible: true,
          };
          break;
        case FormFieldType.MEDICATION_HISTORY:
          newField.medicationHistory = {
            includeProductName: true, includeDateRange: true,
            includeDosage: true, includeNotes: true,
          };
          break;
        case FormFieldType.VITALS:
          newField.vitals = {
            includeHeight: true, includeWeight: true, includeBmi: true,
            includeBloodPressure: true, includeHeartRate: true,
            includeTemperature: true, includeRespiratoryRate: true,
            includeOxygenSaturation: true,
          };
          break;
        case FormFieldType.PAYMENT_DETAILS:
          newField.paymentDetails = {
            includeCardDetails: true, includeBillingAddress: true,
          };
          break;
        case FormFieldType.UNIVERSAL_AGREEMENT:
          if (!newField.agreementText) {
            newField.agreementText = 'The AI generated this agreement field. Please replace this placeholder with your own terms, conditions, or consent language.';
          }
          if (!newField.universalAgreement) {
            newField.universalAgreement = {
              includePrintedName: true,
              includeDate: true,
            };
          }
          newField.required = true;
          break;
      }

      return newField;
    });

    return processedFields;

  } catch (e) {
    console.error("Error generating form with AI:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    throw new Error(`The AI failed to generate a valid form structure. Please try again. Reason: ${errorMessage}`);
  }
}

// --- Schema and function for suggestEHRMappings ---

const ehrMappingSuggestionSchema = {
  type: Type.OBJECT,
  properties: {
    formFieldId: { type: Type.STRING, description: "The 'id' of the form field to be mapped." },
    subFieldKey: { type: Type.STRING, description: "For composite fields, this is the key of the specific sub-field being mapped (e.g., 'includeFullName'). Omit for simple fields." },
    ehrField: { type: Type.STRING, description: "The corresponding path in the EHR data structure, e.g., 'demographics.name.full'." },
    reason: { type: Type.STRING, description: "A brief explanation for why this mapping is suggested." },
  },
  required: ['formFieldId', 'ehrField', 'reason'],
};

export async function suggestEHRMappings(
  apiKey: string,
  fields: FormField[]
): Promise<EHRMappingSuggestion[]> {
  const ai = new GoogleGenAI({ apiKey });

  if (fields.length === 0) {
    return [];
  }

  const ehrDataStructure = `
  // This is the target EHR data structure for a patient.
  // Map the form fields to a path within this structure.
  {
    demographics: {
      name: { first, last, middle, full },
      dob,
      gender,
      pronouns,
      address: { street, city, state, zip },
      contact: { phone, email },
      occupation,
      relationshipStatus,
    },
    vitals: [ // This is an array of vital entries. New submissions create new entries.
      {
        date, // e.g., "YYYY-MM-DD"
        heightCm,
        weightKg,
        bmi,
        bloodPressure: { systolic, diastolic },
        heartRateBpm,
        temperatureCelsius,
        respiratoryRateBpm,
        oxygenSaturationPercent,
      }
    ],
    clinical: {
      chiefComplaint,
      allergies: { list: [] },
      medications: { current: [] },
      riskFactors: { smokingStatus: "'Current Smoker' | 'Former Smoker' | 'Never Smoked'" },
    },
    insurance: {
      providerName,
      memberId,
      groupId,
    }
  }
  `;

  const mappableFields: { id: string, subFieldKey?: string, label: string, type?: FormFieldType }[] = [];
  fields.forEach(field => {
    if (field.type === FormFieldType.PERSONAL_INFO && field.personalInfo) {
      Object.keys(field.personalInfo).forEach(key => {
        const typedKey = key as keyof PersonalInfoSelection;
        if (field.personalInfo![typedKey]) {
          mappableFields.push({
            id: field.id,
            subFieldKey: typedKey,
            label: personalInfoLabels[typedKey] || typedKey,
          });
        }
      });
    } else if (field.type === FormFieldType.HEALTH_INSURANCE && field.healthInsurance) {
      Object.keys(field.healthInsurance).forEach(key => {
        const typedKey = key as keyof HealthInsuranceSelection;
        if (field.healthInsurance![typedKey]) {
          mappableFields.push({
            id: field.id,
            subFieldKey: typedKey,
            label: healthInsuranceLabels[typedKey] || typedKey,
          });
        }
      });
    } else if (field.type === FormFieldType.MEDICATION_HISTORY && field.medicationHistory) {
      Object.keys(field.medicationHistory).forEach(key => {
        const typedKey = key as keyof MedicationHistorySelection;
        if (field.medicationHistory![typedKey]) {
          mappableFields.push({
            id: field.id,
            subFieldKey: typedKey,
            label: medicationHistoryLabels[typedKey] || typedKey,
          });
        }
      });
    } else if (field.type === FormFieldType.VITALS && field.vitals) {
      Object.keys(field.vitals).forEach(key => {
        const typedKey = key as keyof VitalsSelection;
        if (field.vitals![typedKey]) {
          mappableFields.push({
            id: field.id,
            subFieldKey: typedKey,
            label: vitalsLabels[typedKey] || typedKey,
          });
        }
      });
    } else if (![FormFieldType.SECTION_HEADER, FormFieldType.NOTE, FormFieldType.IMAGE, FormFieldType.SIGNATURE, FormFieldType.RICH_TEXT, FormFieldType.PAYMENT_DETAILS].includes(field.type)) {
      mappableFields.push({
        id: field.id,
        label: field.label,
        type: field.type
      });
    }
  });

  if (mappableFields.length === 0) {
    return [];
  }

  const prompt = `
    You are an expert in mapping clinical form fields to an Electronic Health Record (EHR) system.
    Your task is to suggest mappings between fields (and their sub-fields) from a given form and a target EHR data structure.

    Here is the structure of the EHR data:
    ${ehrDataStructure}

    Here are the mappable items from the form. Some items represent an entire field, while others represent a specific part of a composite field (indicated by 'subFieldKey').
    ${JSON.stringify(mappableFields, null, 2)}

    Based on the item labels, generate a JSON array of suggested mappings.
    - For each suggestion, provide the 'formFieldId' from the original field.
    - If the item has a 'subFieldKey', you MUST include that 'subFieldKey' in your response. For simple fields, omit 'subFieldKey'.
    - Provide the corresponding 'ehrField' path from the EHR data structure.
    - Provide a concise 'reason' for the mapping.
    - Only suggest mappings where you have high confidence.
    - Map 'Full Name' to 'demographics.name.full'. Map 'Date of Birth (DOB)' to 'demographics.dob'.
    - Map 'Member ID' to 'insurance.memberId'. Map 'Payer Name' to 'insurance.providerName'.
    - Map 'Height' to 'vitals.heightCm'. Map 'Weight' to 'vitals.weightKg'. Map 'Heart Rate' to 'vitals.heartRateBpm'.
    - For "Blood Pressure", map to 'vitals.bloodPressure'.
    - For sub-fields like "Contact Info Block", infer mappings for email to 'demographics.contact.email' and phone to 'demographics.contact.phone'.
    - For "Address Block", map to 'demographics.address'.
    - Do not suggest mappings for vague composite sub-fields like 'includePolicyHolder' or 'includeDateRange' unless a very clear target exists. Focus on specific data points.
    - For vitals, the system will automatically create a new dated entry in the 'vitals' array. Your task is to map to the correct property key within a vitals entry object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: ehrMappingSuggestionSchema
        },
      },
    });

    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    return suggestions as EHRMappingSuggestion[];
  } catch (e) {
    console.error("Error suggesting EHR mappings:", e);
    // Return empty array on failure to avoid blocking the user.
    return [];
  }
}

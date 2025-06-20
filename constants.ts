
import { HealthRecord, PatientInfo, LabResult, Diagnosis, VitalSign, Medication, Allergy } from './types';
import { v4 as uuidv4 } from 'uuid';

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const EMPTY_PATIENT_INFO: PatientInfo = {
  id: uuidv4(),
  name: '',
  dob: '',
  gender: 'Prefer not to say',
};

export const INITIAL_HEALTH_RECORD: HealthRecord = {
  patientInfo: { ...EMPTY_PATIENT_INFO, id: uuidv4() },
  labResults: [],
  diagnoses: [],
  vitals: [],
  medications: [],
  imagingReports: [],
  allergies: [],
  pastMedicalHistory: [],
  surgicalHistory: [],
  dentalRecords: [],
};

export const GENDER_OPTIONS: PatientInfo['gender'][] = ['Male', 'Female', 'Other', 'Prefer not to say'];
export const LAB_INTERPRETATION_OPTIONS: LabResult['interpretation'][] = ['Normal', 'Abnormal', 'Critical', ''];
export const DIAGNOSIS_STATUS_OPTIONS: Diagnosis['status'][] = ['Active', 'Resolved', ''];
export const VITAL_TYPE_OPTIONS: VitalSign['type'][] = ['Blood Pressure', 'Heart Rate', 'Weight', 'BMI', 'Temperature', 'SpO2'];
export const MEDICATION_STATUS_OPTIONS: Medication['status'][] = ['Active', 'Inactive', 'On Hold', ''];
export const ALLERGY_SEVERITY_OPTIONS: Allergy['severity'][] = ['Mild', 'Moderate', 'Severe', ''];

export const EXAMPLE_HEALTH_RECORD: HealthRecord = {
  patientInfo: { id: uuidv4(), name: "Jane Doe", dob: "1985-07-22", gender: "Female" },
  labResults: [
    { id: uuidv4(), name: "Hemoglobin A1c", loincCode: "4548-4", value: "6.5", unit: "%", referenceRange: "4.0-5.6%", date: "2023-10-15", interpretation: "Abnormal" },
    { id: uuidv4(), name: "Total Cholesterol", loincCode: "2093-3", value: "220", unit: "mg/dL", referenceRange: "<200 mg/dL", date: "2023-10-15", interpretation: "Abnormal" },
  ],
  diagnoses: [
    { id: uuidv4(), description: "Type 2 Diabetes Mellitus", icd10Code: "E11.9", snomedCode: "44054006", date: "2022-05-01", status: "Active" },
    { id: uuidv4(), description: "Hypertension", icd10Code: "I10", snomedCode: "38341003", date: "2021-11-20", status: "Active" },
  ],
  vitals: [
    { id: uuidv4(), type: "Blood Pressure", value: "145/90", unit: "mmHg", date: "2023-11-01" },
    { id: uuidv4(), type: "Heart Rate", value: "78", unit: "bpm", date: "2023-11-01" },
  ],
  medications: [
    { id: uuidv4(), name: "Metformin", rxNormId: "860975", dose: "500mg", route: "Oral", frequency: "Twice daily", startDate: "2022-05-01", status: "Active" },
    { id: uuidv4(), name: "Lisinopril", rxNormId: "203155", dose: "10mg", route: "Oral", frequency: "Once daily", startDate: "2021-11-20", status: "Active" },
  ],
  imagingReports: [
    { id: uuidv4(), type: "Chest X-Ray", date: "2023-01-10", reportText: "Lungs are clear. No acute cardiopulmonary process." }
  ],
  allergies: [
    { id: uuidv4(), substance: "Penicillin", reaction: "Rash", severity: "Moderate", onsetDate: "2005-03-01" }
  ],
  pastMedicalHistory: [
    { id: uuidv4(), description: "Seasonal allergies", date: "Childhood" }
  ],
  surgicalHistory: [
    { id: uuidv4(), description: "Appendectomy", date: "2000" }
  ],
  dentalRecords: [
    { id: uuidv4(), procedureCode: "D1110", description: "Adult Prophylaxis", date: "2023-06-15", notes: "Routine cleaning, no issues."}
  ]
};

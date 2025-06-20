
export interface PatientInfo {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
}

export interface LabResult {
  id: string;
  name: string;
  loincCode: string;
  value: string;
  unit: string;
  referenceRange: string;
  date: string; // YYYY-MM-DD
  interpretation: 'Normal' | 'Abnormal' | 'Critical' | '';
}

export interface Diagnosis {
  id: string;
  description: string;
  icd10Code: string;
  snomedCode: string;
  date: string; // YYYY-MM-DD
  status: 'Active' | 'Resolved' | '';
}

export interface VitalSign {
  id: string;
  type: 'Blood Pressure' | 'Heart Rate' | 'Weight' | 'BMI' | 'Temperature' | 'SpO2';
  value: string;
  unit: string;
  date: string; // YYYY-MM-DD
}

export interface Medication {
  id: string;
  name: string;
  rxNormId: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string; // YYYY-MM-DD
  status: 'Active' | 'Inactive' | 'On Hold' | '';
}

export interface ImagingReport {
  id: string;
  type: string; // e.g., "X-Ray Chest", "MRI Brain"
  date: string; // YYYY-MM-DD
  reportText: string; // Simplified impression/report
}

export interface Allergy {
  id: string;
  substance: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | '';
  onsetDate: string; // YYYY-MM-DD
}

export interface HistoryItem { // For PMH, SH
  id: string;
  description: string;
  date: string; // YYYY-MM-DD or year
}

export interface DentalRecord {
  id: string;
  procedureCode: string;
  description: string;
  date: string; // YYYY-MM-DD
  notes: string;
}

export interface HealthRecord {
  patientInfo: PatientInfo;
  labResults: LabResult[];
  diagnoses: Diagnosis[];
  vitals: VitalSign[];
  medications: Medication[];
  imagingReports: ImagingReport[];
  allergies: Allergy[];
  pastMedicalHistory: HistoryItem[];
  surgicalHistory: HistoryItem[];
  dentalRecords: DentalRecord[];
}

export interface AiSummaries {
  doctorSummary: string;
  patientSummary: string;
  alerts: string[];
}

export type ViewMode = 'dataInput' | 'patient' | 'clinician';

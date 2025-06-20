import React, { useState, useEffect, useRef } from 'react';
import { HealthRecord, PatientInfo, LabResult, Diagnosis, VitalSign, Medication, ImagingReport, Allergy, HistoryItem, DentalRecord } from '../types';
import { GENDER_OPTIONS, LAB_INTERPRETATION_OPTIONS, DIAGNOSIS_STATUS_OPTIONS, VITAL_TYPE_OPTIONS, MEDICATION_STATUS_OPTIONS, ALLERGY_SEVERITY_OPTIONS, INITIAL_HEALTH_RECORD, EXAMPLE_HEALTH_RECORD } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { IconPlus, IconTrash, IconUserCircle, IconClipboardCheck, IconDownload, IconLink, IconFileUpload, IconX } from './icons';
import * as XLSX from 'xlsx';

interface DataInputViewProps {
  initialData: HealthRecord;
  onSubmit: (data: HealthRecord) => void;
  onLoadExample: () => void;
  setHealthRecord: React.Dispatch<React.SetStateAction<HealthRecord>>; // To update App's state directly after import
  setTransientMessage: (message: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null) => void;
}

// Generic InputField component (no changes)
interface InputFieldProps<T> {
  label: string;
  id: string;
  name: keyof T;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, id?: string) => void;
  type?: string;
  options?: readonly string[];
  parentId?: string; // For array items
  required?: boolean;
  placeholder?: string;
  isTextArea?: boolean;
}

const InputField = <T,>({ label, id, name, value, onChange, type = 'text', options, parentId, required, placeholder, isTextArea }: InputFieldProps<T>) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select
        id={id}
        name={name as string}
        value={value as string}
        onChange={(e) => onChange(e, parentId)}
        required={required}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : isTextArea ? (
       <textarea
        id={id}
        name={name as string}
        value={value as string}
        onChange={(e) => onChange(e, parentId)}
        required={required}
        placeholder={placeholder}
        rows={3}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
      />
    ) : (
      <input
        type={type}
        id={id}
        name={name as string}
        value={value}
        onChange={(e) => onChange(e, parentId)}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
      />
    )}
  </div>
);


const handleArrayItemChange = <T extends { id: string },>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  id: string,
  field: keyof T,
  value: string
) => {
  setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
};

const addArrayItem = <T extends { id: string },>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  newItem: Omit<T, 'id'>
) => {
  setter(prev => [...prev, { ...newItem, id: uuidv4() } as T]);
};

const removeArrayItem = <T extends { id: string },>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  id: string
) => {
  setter(prev => prev.filter(item => item.id !== id));
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 className="text-xl font-semibold text-brand-secondary mb-4 border-b pb-2">{title}</h2>
    {children}
  </div>
);

export const DataInputView: React.FC<DataInputViewProps> = ({ initialData, onSubmit, onLoadExample, setHealthRecord, setTransientMessage }) => {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>(initialData.patientInfo);
  const [labResults, setLabResults] = useState<LabResult[]>(initialData.labResults);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(initialData.diagnoses);
  const [vitals, setVitals] = useState<VitalSign[]>(initialData.vitals);
  const [medications, setMedications] = useState<Medication[]>(initialData.medications);
  const [imagingReports, setImagingReports] = useState<ImagingReport[]>(initialData.imagingReports);
  const [allergies, setAllergies] = useState<Allergy[]>(initialData.allergies);
  const [pastMedicalHistory, setPastMedicalHistory] = useState<HistoryItem[]>(initialData.pastMedicalHistory);
  const [surgicalHistory, setSurgicalHistory] = useState<HistoryItem[]>(initialData.surgicalHistory);
  const [dentalRecords, setDentalRecords] = useState<DentalRecord[]>(initialData.dentalRecords);

  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateFullHealthRecordState = (newRecord: HealthRecord) => {
    setPatientInfo(newRecord.patientInfo);
    setLabResults(newRecord.labResults);
    setDiagnoses(newRecord.diagnoses);
    setVitals(newRecord.vitals);
    setMedications(newRecord.medications);
    setImagingReports(newRecord.imagingReports);
    setAllergies(newRecord.allergies);
    setPastMedicalHistory(newRecord.pastMedicalHistory);
    setSurgicalHistory(newRecord.surgicalHistory);
    setDentalRecords(newRecord.dentalRecords);
    // Also update App's master HealthRecord state
    setHealthRecord(newRecord); 
  };
  
  useEffect(() => {
    updateFullHealthRecordState(initialData);
  }, [initialData, setHealthRecord]); // Added setHealthRecord to dep array if it could change


  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      patientInfo, labResults, diagnoses, vitals, medications, imagingReports, 
      allergies, pastMedicalHistory, surgicalHistory, dentalRecords 
    });
  };
  
  const resetForm = () => {
    updateFullHealthRecordState(JSON.parse(JSON.stringify(INITIAL_HEALTH_RECORD))); // Deep copy
    setTransientMessage({ type: 'info', message: 'Form has been reset.' });
    setTimeout(() => setTransientMessage(null), 3000);
  };

  const handleSimulatedFhirConnect = () => {
    updateFullHealthRecordState(JSON.parse(JSON.stringify(EXAMPLE_HEALTH_RECORD))); // Deep copy to ensure fresh state
    setIsFhirModalOpen(false);
    setTransientMessage({ type: 'success', message: 'Simulated FHIR connection successful. Example data loaded.' });
    setTimeout(() => setTransientMessage(null), 3000);
  };

  const handleExcelImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExcelFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input to allow re-uploading the same file name
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File data could not be read.");
        const workbook = XLSX.read(data, { type: 'array' });
        
        const newRecord: HealthRecord = JSON.parse(JSON.stringify(INITIAL_HEALTH_RECORD)); // Start with a fresh deep copy

        // Patient Info
        const patientSheet = workbook.Sheets['PatientInfo'];
        if (patientSheet) {
          const patientData = XLSX.utils.sheet_to_json<any>(patientSheet);
          if (patientData.length > 0) {
            const p = patientData[0];
            newRecord.patientInfo = {
              id: uuidv4(),
              name: p['Name'] || '',
              dob: p['DOB'] ? String(p['DOB']) : '', // Ensure DOB is string
              gender: p['Gender'] || 'Prefer not to say',
            };
          }
        }
        
        // Helper to parse array sheets
        const parseSheet = <T extends {id: string}>(sheetName: string, fieldMappings: Record<string, keyof Omit<T, 'id'>>, defaultItem: Omit<T, 'id'>) => {
          const sheet = workbook.Sheets[sheetName];
          const items: T[] = [];
          if (sheet) {
            const jsonData = XLSX.utils.sheet_to_json<any>(sheet);
            jsonData.forEach(row => {
              // Initialize as a full T object using defaultItem and a new id
              const currentItem: T = { ...defaultItem, id: uuidv4() } as T;
              
              for (const excelHeader in fieldMappings) {
                const itemKey = fieldMappings[excelHeader]; // This is keyof Omit<T, 'id'>
                if (row[excelHeader] !== undefined) {
                  // Assign the value from the Excel row, ensuring it's a string.
                  (currentItem as any)[itemKey] = String(row[excelHeader]);
                }
                // If row[excelHeader] is undefined, the value from defaultItem (already in currentItem) remains.
              }
              items.push(currentItem);
            });
          }
          return items;
        };
        
        newRecord.labResults = parseSheet<LabResult>('LabResults', 
            {'Test Name': 'name', 'LOINC Code': 'loincCode', 'Value': 'value', 'Unit': 'unit', 'Reference Range': 'referenceRange', 'Date': 'date', 'Interpretation': 'interpretation'},
            { name: '', loincCode: '', value: '', unit: '', referenceRange: '', date: '', interpretation: ''}
        );
        newRecord.diagnoses = parseSheet<Diagnosis>('Diagnoses',
            {'Description': 'description', 'ICD-10 Code': 'icd10Code', 'SNOMED Code': 'snomedCode', 'Date': 'date', 'Status': 'status'},
            { description: '', icd10Code: '', snomedCode: '', date: '', status: ''}
        );
        newRecord.vitals = parseSheet<VitalSign>('Vitals',
            {'Type': 'type', 'Value': 'value', 'Unit': 'unit', 'Date': 'date'},
            { type: 'Blood Pressure', value: '', unit: '', date: ''}
        );
        newRecord.medications = parseSheet<Medication>('Medications',
            {'Name': 'name', 'RxNorm ID': 'rxNormId', 'Dose': 'dose', 'Route': 'route', 'Frequency': 'frequency', 'Start Date': 'startDate', 'Status': 'status'},
            { name: '', rxNormId: '', dose: '', route: '', frequency: '', startDate: '', status: ''}
        );
        newRecord.imagingReports = parseSheet<ImagingReport>('ImagingReports',
            {'Type': 'type', 'Date': 'date', 'Report Text': 'reportText'},
            { type: '', date: '', reportText: ''}
        );
        newRecord.allergies = parseSheet<Allergy>('Allergies',
            {'Substance': 'substance', 'Reaction': 'reaction', 'Severity': 'severity', 'Onset Date': 'onsetDate'},
            { substance: '', reaction: '', severity: '', onsetDate: ''}
        );
        newRecord.pastMedicalHistory = parseSheet<HistoryItem>('PastMedicalHistory',
            {'Description': 'description', 'Date': 'date'},
            { description: '', date: ''}
        );
        newRecord.surgicalHistory = parseSheet<HistoryItem>('SurgicalHistory',
            {'Description': 'description', 'Date': 'date'},
            { description: '', date: ''}
        );
        newRecord.dentalRecords = parseSheet<DentalRecord>('DentalRecords',
            {'Procedure Code': 'procedureCode', 'Description': 'description', 'Date': 'date', 'Notes': 'notes'},
            { procedureCode: '', description: '', date: '', notes: ''}
        );

        updateFullHealthRecordState(newRecord);
        setTransientMessage({ type: 'success', message: 'Data imported successfully from Excel.' });

      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setTransientMessage({ type: 'error', message: `Failed to import from Excel. Ensure the file is valid and follows the expected format. Error: ${error instanceof Error ? error.message : String(error)}` });
      } finally {
        setTimeout(() => setTransientMessage(null), 5000);
      }
    };
    reader.readAsArrayBuffer(file);
  };


  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
          <h1 className="text-3xl font-bold text-brand-primary">Enter Health Record Data</h1>
          <div className="flex flex-wrap gap-2">
              <button
                  type="button"
                  onClick={() => setIsFhirModalOpen(true)}
                  className="bg-brand-info hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center"
                  title="Simulate connecting to an EHR via FHIR"
              >
                  <IconLink className="w-5 h-5 mr-2" /> Connect to EHR (FHIR)
              </button>
              <button
                  type="button"
                  onClick={handleExcelImportClick}
                  className="bg-brand-success hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center"
                  title="Import data from an Excel file"
              >
                  <IconFileUpload className="w-5 h-5 mr-2" /> Import from Excel
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleExcelFileChange} 
                className="hidden" 
                accept=".xlsx, .xls"
              />
              <button
                  type="button"
                  onClick={onLoadExample}
                  className="bg-brand-accent hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center"
              >
                  <IconDownload className="w-5 h-5 mr-2" /> Load Example
              </button>
              <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center"
              >
                  <IconTrash className="w-5 h-5 mr-2" /> Reset Form
              </button>
          </div>
        </div>

        <Section title="Patient Information">
          <IconUserCircle className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" id="patientName" name="name" value={patientInfo.name} onChange={handlePatientInfoChange} required placeholder="e.g., John Doe"/>
            <InputField label="Date of Birth" id="patientDob" name="dob" type="date" value={patientInfo.dob} onChange={handlePatientInfoChange} required />
            <InputField label="Gender" id="patientGender" name="gender" value={patientInfo.gender} onChange={handlePatientInfoChange} options={GENDER_OPTIONS} required />
          </div>
        </Section>

        {/* Lab Results Section */}
        <Section title="Lab Results">
          {labResults.map((lab, index) => (
            <div key={lab.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md mb-4 relative">
              <button type="button" onClick={() => removeArrayItem(setLabResults, lab.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <IconTrash className="w-5 h-5" />
              </button>
              <InputField label={`Test Name ${index+1}`} id={`labName-${lab.id}`} name="name" value={lab.name} onChange={(e) => handleArrayItemChange(setLabResults, lab.id, 'name', e.target.value)} placeholder="e.g., Hemoglobin A1c" />
              <InputField label="LOINC Code" id={`labLoinc-${lab.id}`} name="loincCode" value={lab.loincCode} onChange={(e) => handleArrayItemChange(setLabResults, lab.id, 'loincCode', e.target.value)} placeholder="e.g., 4548-4" />
              <InputField label="Value" id={`labValue-${lab.id}`} name="value" value={lab.value} onChange={(e) => handleArrayItemChange(setLabResults, lab.id, 'value', e.target.value)} placeholder="e.g., 6.5" />
              <InputField label="Unit" id={`labUnit-${lab.id}`} name="unit" value={lab.unit} onChange={(e) => handleArrayItemChange(setLabResults, lab.id, 'unit', e.target.value)} placeholder="e.g., %" />
              <InputField label="Reference Range" id={`labRefRange-${lab.id}`} name="referenceRange" value={lab.referenceRange} onChange={(e) => handleArrayItemChange(setLabResults, lab.id, 'referenceRange', e.target.value)} placeholder="e.g., 4.0-5.6%" />
              <InputField label="Date" id={`labDate-${lab.id}`} name="date" type="date" value={lab.date} onChange={(e) => handleArrayItemChange(setLabResults, lab.id, 'date', e.target.value)} />
              <InputField label="Interpretation" id={`labInterp-${lab.id}`} name="interpretation" value={lab.interpretation} onChange={(e) => handleArrayItemChange(setLabResults, lab.id, 'interpretation', e.target.value)} options={LAB_INTERPRETATION_OPTIONS} />
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem(setLabResults, { name: '', loincCode: '', value: '', unit: '', referenceRange: '', date: '', interpretation: '' })}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
            <IconPlus className="w-5 h-5 mr-2" /> Add Lab Result
          </button>
        </Section>
        
        {/* Diagnoses Section */}
        <Section title="Diagnoses">
          {diagnoses.map((diag, index) => (
            <div key={diag.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md mb-4 relative">
               <button type="button" onClick={() => removeArrayItem(setDiagnoses, diag.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <IconTrash className="w-5 h-5" />
              </button>
              <InputField label={`Description ${index+1}`} id={`diagDesc-${diag.id}`} name="description" value={diag.description} onChange={(e) => handleArrayItemChange(setDiagnoses, diag.id, 'description', e.target.value)} placeholder="e.g., Type 2 Diabetes" />
              <InputField label="ICD-10 Code" id={`diagIcd10-${diag.id}`} name="icd10Code" value={diag.icd10Code} onChange={(e) => handleArrayItemChange(setDiagnoses, diag.id, 'icd10Code', e.target.value)} placeholder="e.g., E11.9" />
              <InputField label="SNOMED Code" id={`diagSnomed-${diag.id}`} name="snomedCode" value={diag.snomedCode} onChange={(e) => handleArrayItemChange(setDiagnoses, diag.id, 'snomedCode', e.target.value)} placeholder="e.g., 44054006" />
              <InputField label="Date" id={`diagDate-${diag.id}`} name="date" type="date" value={diag.date} onChange={(e) => handleArrayItemChange(setDiagnoses, diag.id, 'date', e.target.value)} />
              <InputField label="Status" id={`diagStatus-${diag.id}`} name="status" value={diag.status} onChange={(e) => handleArrayItemChange(setDiagnoses, diag.id, 'status', e.target.value)} options={DIAGNOSIS_STATUS_OPTIONS} />
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem(setDiagnoses, { description: '', icd10Code: '', snomedCode: '', date: '', status: '' })}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
            <IconPlus className="w-5 h-5 mr-2" /> Add Diagnosis
          </button>
        </Section>

        {/* Vitals Section */}
        <Section title="Vital Signs">
          {vitals.map((vital, index) => (
            <div key={vital.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md mb-4 relative">
               <button type="button" onClick={() => removeArrayItem(setVitals, vital.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <IconTrash className="w-5 h-5" />
              </button>
              <InputField label={`Type ${index+1}`} id={`vitalType-${vital.id}`} name="type" value={vital.type} onChange={(e) => handleArrayItemChange(setVitals, vital.id, 'type', e.target.value)} options={VITAL_TYPE_OPTIONS} />
              <InputField label="Value" id={`vitalValue-${vital.id}`} name="value" value={vital.value} onChange={(e) => handleArrayItemChange(setVitals, vital.id, 'value', e.target.value)} placeholder="e.g., 120/80 or 72" />
              <InputField label="Unit" id={`vitalUnit-${vital.id}`} name="unit" value={vital.unit} onChange={(e) => handleArrayItemChange(setVitals, vital.id, 'unit', e.target.value)} placeholder="e.g., mmHg or bpm" />
              <InputField label="Date" id={`vitalDate-${vital.id}`} name="date" type="date" value={vital.date} onChange={(e) => handleArrayItemChange(setVitals, vital.id, 'date', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem(setVitals, { type: 'Blood Pressure', value: '', unit: '', date: '' })}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
            <IconPlus className="w-5 h-5 mr-2" /> Add Vital Sign
          </button>
        </Section>
        
        {/* Medications Section */}
      <Section title="Medications">
        {medications.map((med, index) => (
          <div key={med.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md mb-4 relative">
            <button type="button" onClick={() => removeArrayItem(setMedications, med.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <IconTrash className="w-5 h-5" />
            </button>
            <InputField label={`Name ${index+1}`} id={`medName-${med.id}`} name="name" value={med.name} onChange={(e) => handleArrayItemChange(setMedications, med.id, 'name', e.target.value)} placeholder="e.g., Metformin"/>
            <InputField label="RxNorm ID" id={`medRxNorm-${med.id}`} name="rxNormId" value={med.rxNormId} onChange={(e) => handleArrayItemChange(setMedications, med.id, 'rxNormId', e.target.value)} placeholder="e.g., 860975"/>
            <InputField label="Dose" id={`medDose-${med.id}`} name="dose" value={med.dose} onChange={(e) => handleArrayItemChange(setMedications, med.id, 'dose', e.target.value)} placeholder="e.g., 500mg"/>
            <InputField label="Route" id={`medRoute-${med.id}`} name="route" value={med.route} onChange={(e) => handleArrayItemChange(setMedications, med.id, 'route', e.target.value)} placeholder="e.g., Oral"/>
            <InputField label="Frequency" id={`medFreq-${med.id}`} name="frequency" value={med.frequency} onChange={(e) => handleArrayItemChange(setMedications, med.id, 'frequency', e.target.value)} placeholder="e.g., Twice daily"/>
            <InputField label="Start Date" id={`medStartDate-${med.id}`} name="startDate" type="date" value={med.startDate} onChange={(e) => handleArrayItemChange(setMedications, med.id, 'startDate', e.target.value)} />
            <InputField label="Status" id={`medStatus-${med.id}`} name="status" value={med.status} onChange={(e) => handleArrayItemChange(setMedications, med.id, 'status', e.target.value)} options={MEDICATION_STATUS_OPTIONS} />
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(setMedications, { name: '', rxNormId: '', dose: '', route: '', frequency: '', startDate: '', status: '' })}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
          <IconPlus className="w-5 h-5 mr-2" /> Add Medication
        </button>
      </Section>

      {/* Imaging Reports Section */}
      <Section title="Imaging Reports">
        {imagingReports.map((report, index) => (
          <div key={report.id} className="border p-4 rounded-md mb-4 relative">
            <button type="button" onClick={() => removeArrayItem(setImagingReports, report.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <IconTrash className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label={`Type ${index+1}`} id={`imgType-${report.id}`} name="type" value={report.type} onChange={(e) => handleArrayItemChange(setImagingReports, report.id, 'type', e.target.value)} placeholder="e.g., Chest X-Ray"/>
              <InputField label="Date" id={`imgDate-${report.id}`} name="date" type="date" value={report.date} onChange={(e) => handleArrayItemChange(setImagingReports, report.id, 'date', e.target.value)} />
            </div>
            <InputField label="Report Text / Impression" id={`imgReport-${report.id}`} name="reportText" value={report.reportText} onChange={(e) => handleArrayItemChange(setImagingReports, report.id, 'reportText', e.target.value)} isTextArea={true} placeholder="Enter key findings or summary"/>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(setImagingReports, { type: '', date: '', reportText: '' })}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
          <IconPlus className="w-5 h-5 mr-2" /> Add Imaging Report
        </button>
      </Section>

      {/* Allergies Section */}
      <Section title="Allergies">
        {allergies.map((allergy, index) => (
          <div key={allergy.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md mb-4 relative">
            <button type="button" onClick={() => removeArrayItem(setAllergies, allergy.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <IconTrash className="w-5 h-5" />
            </button>
            <InputField label={`Substance ${index+1}`} id={`allergySubstance-${allergy.id}`} name="substance" value={allergy.substance} onChange={(e) => handleArrayItemChange(setAllergies, allergy.id, 'substance', e.target.value)} placeholder="e.g., Penicillin"/>
            <InputField label="Reaction" id={`allergyReaction-${allergy.id}`} name="reaction" value={allergy.reaction} onChange={(e) => handleArrayItemChange(setAllergies, allergy.id, 'reaction', e.target.value)} placeholder="e.g., Rash, Anaphylaxis"/>
            <InputField label="Severity" id={`allergySeverity-${allergy.id}`} name="severity" value={allergy.severity} onChange={(e) => handleArrayItemChange(setAllergies, allergy.id, 'severity', e.target.value)} options={ALLERGY_SEVERITY_OPTIONS}/>
            <InputField label="Onset Date" id={`allergyOnsetDate-${allergy.id}`} name="onsetDate" type="date" value={allergy.onsetDate} onChange={(e) => handleArrayItemChange(setAllergies, allergy.id, 'onsetDate', e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(setAllergies, { substance: '', reaction: '', severity: '', onsetDate: '' })}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
          <IconPlus className="w-5 h-5 mr-2" /> Add Allergy
        </button>
      </Section>
      
      {/* Past Medical History Section */}
      <Section title="Past Medical History">
        {pastMedicalHistory.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md mb-4 relative">
            <button type="button" onClick={() => removeArrayItem(setPastMedicalHistory, item.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <IconTrash className="w-5 h-5" />
            </button>
            <InputField label={`Description ${index+1}`} id={`pmhDesc-${item.id}`} name="description" value={item.description} onChange={(e) => handleArrayItemChange(setPastMedicalHistory, item.id, 'description', e.target.value)} placeholder="e.g., Asthma"/>
            <InputField label="Date/Year" id={`pmhDate-${item.id}`} name="date" value={item.date} onChange={(e) => handleArrayItemChange(setPastMedicalHistory, item.id, 'date', e.target.value)} placeholder="e.g., Childhood or YYYY-MM-DD"/>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(setPastMedicalHistory, { description: '', date: '' })}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
          <IconPlus className="w-5 h-5 mr-2" /> Add PMH Item
        </button>
      </Section>

      {/* Surgical History Section */}
      <Section title="Surgical History">
        {surgicalHistory.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md mb-4 relative">
             <button type="button" onClick={() => removeArrayItem(setSurgicalHistory, item.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <IconTrash className="w-5 h-5" />
            </button>
            <InputField label={`Procedure ${index+1}`} id={`shDesc-${item.id}`} name="description" value={item.description} onChange={(e) => handleArrayItemChange(setSurgicalHistory, item.id, 'description', e.target.value)} placeholder="e.g., Appendectomy"/>
            <InputField label="Date/Year" id={`shDate-${item.id}`} name="date" value={item.date} onChange={(e) => handleArrayItemChange(setSurgicalHistory, item.id, 'date', e.target.value)} placeholder="e.g., 2005 or YYYY-MM-DD"/>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(setSurgicalHistory, { description: '', date: '' })}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
          <IconPlus className="w-5 h-5 mr-2" /> Add Surgical Item
        </button>
      </Section>

      {/* Dental Records Section */}
      <Section title="Dental Records">
        {dentalRecords.map((record, index) => (
          <div key={record.id} className="border p-4 rounded-md mb-4 relative">
            <button type="button" onClick={() => removeArrayItem(setDentalRecords, record.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <IconTrash className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label={`Procedure Code ${index+1}`} id={`dentalCode-${record.id}`} name="procedureCode" value={record.procedureCode} onChange={(e) => handleArrayItemChange(setDentalRecords, record.id, 'procedureCode', e.target.value)} placeholder="e.g., D1110"/>
              <InputField label="Description" id={`dentalDesc-${record.id}`} name="description" value={record.description} onChange={(e) => handleArrayItemChange(setDentalRecords, record.id, 'description', e.target.value)} placeholder="e.g., Adult Prophylaxis"/>
              <InputField label="Date" id={`dentalDate-${record.id}`} name="date" type="date" value={record.date} onChange={(e) => handleArrayItemChange(setDentalRecords, record.id, 'date', e.target.value)} />
            </div>
            <InputField label="Notes" id={`dentalNotes-${record.id}`} name="notes" value={record.notes} onChange={(e) => handleArrayItemChange(setDentalRecords, record.id, 'notes', e.target.value)} isTextArea={true} placeholder="e.g., Routine cleaning"/>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(setDentalRecords, { procedureCode: '', description: '', date: '', notes: '' })}
          className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center">
          <IconPlus className="w-5 h-5 mr-2" /> Add Dental Record
        </button>
      </Section>


        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-end space-x-3">
          <button
            type="submit"
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out flex items-center text-lg"
          >
            <IconClipboardCheck className="w-6 h-6 mr-2" /> Submit Health Data
          </button>
        </div>
      </form>

      {/* FHIR Connection Modal */}
      {isFhirModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" id="fhir-modal">
          <div className="relative mx-auto p-8 border w-full max-w-md shadow-lg rounded-md bg-white">
            <button 
              onClick={() => setIsFhirModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <IconX className="w-6 h-6"/>
            </button>
            <div className="text-center">
              <IconLink className="w-12 h-12 text-brand-info mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-brand-secondary mb-4">Connect to EHR (FHIR)</h3>
              <p className="text-sm text-gray-600 mb-4">
                This is a simulation. In a real application, you would enter your EHR's FHIR server URL to securely fetch patient data.
              </p>
              <input 
                type="text" 
                placeholder="Enter FHIR Server Base URL (e.g., https://fhir.example.com/R4)" 
                className="w-full p-2 border border-gray-300 rounded-md mb-6 focus:ring-brand-primary focus:border-brand-primary"
              />
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleSimulatedFhirConnect}
                  className="bg-brand-info hover:bg-opacity-80 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Connect & Load Data
                </button>
                <button 
                  onClick={() => setIsFhirModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
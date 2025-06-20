
import React, { useState } from 'react';
import { HealthRecord, AiSummaries } from '../types';
import { IconSparkles, IconDocumentText, IconUserMd, IconExclamationCircle, IconChevronDown, IconChevronUp } from './icons'; // Assuming IconUserMd for clinician

interface ClinicianViewProps {
  healthRecord: HealthRecord;
  summaries: AiSummaries | null;
  onGenerateSummaries: () => void;
}

const SummaryCard: React.FC<{ title: string; content: string | string[]; icon: React.ReactNode; isAlert?: boolean }> = ({ title, content, icon, isAlert = false }) => (
  <div className={`bg-white shadow-xl rounded-lg p-6 ${isAlert ? 'border-l-4 border-brand-danger' : 'border-l-4 border-brand-primary'}`}>
    <div className="flex items-center mb-3">
      {icon}
      <h2 className={`text-2xl font-semibold ml-3 ${isAlert ? 'text-brand-danger' : 'text-brand-secondary'}`}>{title}</h2>
    </div>
    {Array.isArray(content) ? (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {content.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ) : (
       <div className="text-gray-700 prose max-w-none prose-sm sm:prose" dangerouslySetInnerHTML={{ __html: content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    )}
  </div>
);

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-50 rounded-lg shadow mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left text-lg font-medium text-brand-secondary hover:bg-gray-100 focus:outline-none"
      >
        {title}
        {isOpen ? <IconChevronUp className="w-5 h-5" /> : <IconChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className="p-4 border-t">{children}</div>}
    </div>
  );
};


export const ClinicianView: React.FC<ClinicianViewProps> = ({ healthRecord, summaries, onGenerateSummaries }) => {
  const hasData = healthRecord.patientInfo.name || healthRecord.labResults.length > 0 || healthRecord.diagnoses.length > 0; // etc.

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col md:flex-row justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2">Clinician Dashboard</h1>
            <p className="text-gray-600">Patient: <span className="font-semibold">{healthRecord.patientInfo.name || "N/A"}</span> | DOB: <span className="font-semibold">{healthRecord.patientInfo.dob || "N/A"}</span></p>
        </div>
        {hasData && !summaries && (
          <button
            onClick={onGenerateSummaries}
            className="mt-4 md:mt-0 bg-brand-accent hover:bg-opacity-80 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center text-lg"
          >
            <IconSparkles className="w-6 h-6 mr-2" /> Generate Clinical Summaries
          </button>
        )}
      </div>

      {summaries && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SummaryCard 
            title="Clinical Summary (SOAP)" 
            content={summaries.doctorSummary} 
            icon={<IconUserMd className="w-8 h-8 text-brand-primary" />}
          />
          {summaries.alerts && summaries.alerts.length > 0 && (summaries.alerts[0] !== "No critical alerts identified." || summaries.alerts.length > 1) && (
            <SummaryCard 
              title="Clinical Alerts & Flags" 
              content={summaries.alerts} 
              icon={<IconExclamationCircle className="w-8 h-8 text-brand-danger" />} 
              isAlert 
            />
          )}
        </div>
      )}
      
      {hasData ? (
        <div className="bg-white shadow-xl rounded-lg p-6">
          <div className="flex items-center mb-4">
             <IconDocumentText className="w-8 h-8 text-brand-primary" />
             <h2 className="text-2xl font-semibold ml-3 text-brand-secondary">Detailed Health Record (Simulated FHIR View)</h2>
          </div>
          <CollapsibleSection title="Patient Information" defaultOpen>
             <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                {JSON.stringify(healthRecord.patientInfo, null, 2)}
             </pre>
          </CollapsibleSection>
          {healthRecord.labResults.length > 0 && (
            <CollapsibleSection title="Lab Results">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.labResults, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
          {healthRecord.diagnoses.length > 0 && (
            <CollapsibleSection title="Diagnoses">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.diagnoses, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
           {healthRecord.vitals.length > 0 && (
            <CollapsibleSection title="Vital Signs">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.vitals, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
          {healthRecord.medications.length > 0 && (
            <CollapsibleSection title="Medications">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.medications, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
          {healthRecord.imagingReports.length > 0 && (
            <CollapsibleSection title="Imaging Reports">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.imagingReports, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
           {healthRecord.allergies.length > 0 && (
            <CollapsibleSection title="Allergies">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.allergies, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
          {healthRecord.pastMedicalHistory.length > 0 && (
            <CollapsibleSection title="Past Medical History">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.pastMedicalHistory, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
          {healthRecord.surgicalHistory.length > 0 && (
            <CollapsibleSection title="Surgical History">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.surgicalHistory, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
          {healthRecord.dentalRecords.length > 0 && (
            <CollapsibleSection title="Dental Records">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(healthRecord.dentalRecords, null, 2)}
              </pre>
            </CollapsibleSection>
          )}
        </div>
      ) : (
         <div className="text-center py-10 bg-white rounded-lg shadow">
              <IconDocumentText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No patient data available.</p>
              <p className="text-gray-500">Please input data via the 'Data Input' view first.</p>
          </div>
      )}
    </div>
  );
};

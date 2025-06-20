
import React from 'react';
import { HealthRecord, AiSummaries } from '../types';
import { IconSparkles, IconUser, IconHeart, IconBeaker, IconPill, IconDocumentText, IconExclamationCircle, IconCalendar } from './icons';

interface PatientViewProps {
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
      <div className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
    )}
  </div>
);

const HealthTimelineEvent: React.FC<{ date: string; title: string; description: string; icon: React.ReactNode }> = ({ date, title, description, icon }) => (
  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex-shrink-0 text-brand-primary">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</p>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export const PatientView: React.FC<PatientViewProps> = ({ healthRecord, summaries, onGenerateSummaries }) => {
  const getTimelineEvents = () => {
    const events = [];
    healthRecord.labResults.forEach(lr => events.push({ date: lr.date, title: `Lab: ${lr.name}`, description: `Value: ${lr.value} ${lr.unit}`, icon: <IconBeaker className="w-6 h-6"/> }));
    healthRecord.diagnoses.forEach(d => events.push({ date: d.date, title: `Diagnosis: ${d.description}`, description: `Status: ${d.status}`, icon: <IconDocumentText className="w-6 h-6"/> }));
    healthRecord.medications.forEach(m => events.push({ date: m.startDate, title: `Medication: ${m.name}`, description: `${m.dose}, ${m.frequency}`, icon: <IconPill className="w-6 h-6"/> }));
    healthRecord.imagingReports.forEach(ir => events.push({ date: ir.date, title: `Imaging: ${ir.type}`, description: `Key findings available.`, icon: <IconDocumentText className="w-6 h-6"/> }));
    // Add more event types (vitals, dental, etc.) as needed
    return events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  const timelineEvents = getTimelineEvents();

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col md:flex-row justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-2">Welcome, {healthRecord.patientInfo.name || "Patient"}!</h1>
            <p className="text-gray-600">Here's your personalized health overview.</p>
        </div>
        {!summaries && (
          <button
            onClick={onGenerateSummaries}
            className="mt-4 md:mt-0 bg-brand-accent hover:bg-opacity-80 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center text-lg"
          >
            <IconSparkles className="w-6 h-6 mr-2" /> Generate My Health Summary
          </button>
        )}
      </div>

      {summaries && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SummaryCard 
            title="Your Health Explained" 
            content={summaries.patientSummary} 
            icon={<IconUser className="w-8 h-8 text-brand-primary" />} 
          />
          {summaries.alerts && summaries.alerts.length > 0 && (summaries.alerts[0] !== "No critical alerts identified." || summaries.alerts.length > 1) && (
            <SummaryCard 
                title="Important Alerts" 
                content={summaries.alerts} 
                icon={<IconExclamationCircle className="w-8 h-8 text-brand-danger" />} 
                isAlert 
            />
          )}
        </div>
      )}
      
      {timelineEvents.length > 0 && (
        <div className="bg-white shadow-xl rounded-lg p-6">
            <div className="flex items-center mb-4">
                <IconCalendar className="w-8 h-8 text-brand-primary" />
                <h2 className="text-2xl font-semibold ml-3 text-brand-secondary">Your Health Timeline</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {timelineEvents.map(event => <HealthTimelineEvent key={`${event.title}-${event.date}-${Math.random()}`} {...event} />)}
            </div>
        </div>
      )}

      {(!summaries && timelineEvents.length === 0 && !healthRecord.patientInfo.name) && (
          <div className="text-center py-10 bg-white rounded-lg shadow">
              <IconUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No health data entered yet.</p>
              <p className="text-gray-500">Please go to the 'Data Input' view to add your health records.</p>
          </div>
      )}
    </div>
  );
};


import React, { useState, useCallback } from 'react';
import { HealthRecord, AiSummaries, ViewMode } from './types';
import { INITIAL_HEALTH_RECORD, EXAMPLE_HEALTH_RECORD } from './constants';
import { Header } from './components/Header';
import { DataInputView } from './components/DataInputView';
import { PatientView } from './components/PatientView';
import { ClinicianView } from './components/ClinicianView';
import { generateAllSummaries } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AlertMessage } from './components/AlertMessage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dataInput');
  const [healthRecord, setHealthRecord] = useState<HealthRecord>(INITIAL_HEALTH_RECORD);
  const [summaries, setSummaries] = useState<AiSummaries | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transientMessage, setTransientMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  const clearTransientMessage = () => setTransientMessage(null);

  const handleDataSubmit = (record: HealthRecord) => {
    setHealthRecord(record);
    setError(null);
    setSummaries(null); // Clear previous summaries
    setTransientMessage({ type: 'success', message: 'Health data saved locally. Proceed to generate summaries.'});
    setCurrentView('patient'); // Switch to patient view to see data and then generate summary
    setTimeout(clearTransientMessage, 3000);
  };
  
  const handleLoadExampleData = () => {
    setHealthRecord(EXAMPLE_HEALTH_RECORD);
    setError(null);
    setSummaries(null);
    setTransientMessage({ type: 'info', message: 'Example data loaded into the form.'});
    setCurrentView('dataInput'); 
    setTimeout(clearTransientMessage, 3000);
  };

  const handleGenerateSummaries = useCallback(async () => {
    if (!healthRecord.patientInfo.name) {
      setError("Patient information is incomplete. Please fill in at least the patient's name.");
      setTransientMessage(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setTransientMessage(null);
    setSummaries(null);
    try {
      const generatedSummaries = await generateAllSummaries(healthRecord);
      setSummaries(generatedSummaries);
      setTransientMessage({ type: 'success', message: 'AI summaries generated successfully!'});
      setTimeout(clearTransientMessage, 3000);
    } catch (err) {
      console.error("Error generating summaries:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating summaries.");
    } finally {
      setIsLoading(false);
    }
  }, [healthRecord]);

  const renderView = () => {
    switch (currentView) {
      case 'dataInput':
        return <DataInputView 
                  initialData={healthRecord} 
                  onSubmit={handleDataSubmit} 
                  onLoadExample={handleLoadExampleData}
                  setHealthRecord={setHealthRecord} 
                  setTransientMessage={setTransientMessage}
                />;
      case 'patient':
        return <PatientView healthRecord={healthRecord} summaries={summaries} onGenerateSummaries={handleGenerateSummaries} />;
      case 'clinician':
        return <ClinicianView healthRecord={healthRecord} summaries={summaries} onGenerateSummaries={handleGenerateSummaries} />;
      default:
        return <DataInputView 
                  initialData={healthRecord} 
                  onSubmit={handleDataSubmit} 
                  onLoadExample={handleLoadExampleData}
                  setHealthRecord={setHealthRecord}
                  setTransientMessage={setTransientMessage}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-blue-100 flex flex-col">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <LoadingSpinner message="Generating AI summaries, please wait..." />}
        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}
        {transientMessage && <AlertMessage type={transientMessage.type} message={transientMessage.message} onClose={clearTransientMessage} />}
        {renderView()}
      </main>
      <footer className="bg-brand-secondary text-white text-center p-4">
        <p>&copy; {new Date().getFullYear()} CareSynapse. All rights reserved.</p>
        <p className="text-sm">This is a demo application. Do not use with real patient data.</p>
      </footer>
    </div>
  );
};

export default App;

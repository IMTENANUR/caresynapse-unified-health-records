
import React from 'react';
import { ViewMode } from '../types';
import { IconChartBar, IconUser, IconClipboardList, IconPencilAlt } from './icons'; // Assuming IconPencilAlt for Data Input

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const navItems: { view: ViewMode; label: string; icon: React.ReactNode }[] = [
    { view: 'dataInput', label: 'Data Input', icon: <IconPencilAlt className="w-5 h-5 mr-2" /> },
    { view: 'patient', label: 'Patient View', icon: <IconUser className="w-5 h-5 mr-2" /> },
    { view: 'clinician', label: 'Clinician View', icon: <IconChartBar className="w-5 h-5 mr-2" /> },
  ];

  return (
    <header className="bg-brand-primary shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center text-white mb-4 sm:mb-0">
          <IconClipboardList className="w-10 h-10 mr-3 text-brand-accent" />
          <h1 className="text-3xl font-bold">CareSynapse</h1>
        </div>
        <nav className="flex space-x-2 sm:space-x-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                ${currentView === item.view 
                  ? 'bg-brand-accent text-brand-secondary shadow-md' 
                  : 'text-white hover:bg-brand-secondary hover:text-white'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};


import React from 'react';
import { IconExclamationCircle, IconCheckCircle, IconInformationCircle } from './icons';

interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, onClose }) => {
  const baseClasses = "p-4 rounded-md shadow-lg flex items-start space-x-3 mb-4";
  let typeClasses = "";
  let IconComponent;

  switch (type) {
    case 'success':
      typeClasses = "bg-green-50 border-l-4 border-green-500 text-green-700";
      IconComponent = <IconCheckCircle className="h-6 w-6 text-green-500" />;
      break;
    case 'error':
      typeClasses = "bg-red-50 border-l-4 border-red-500 text-red-700";
      IconComponent = <IconExclamationCircle className="h-6 w-6 text-red-500" />;
      break;
    case 'warning':
      typeClasses = "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700";
      IconComponent = <IconExclamationCircle className="h-6 w-6 text-yellow-500" />;
      break;
    case 'info':
    default:
      typeClasses = "bg-blue-50 border-l-4 border-blue-500 text-blue-700";
      IconComponent = <IconInformationCircle className="h-6 w-6 text-blue-500" />;
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <div className="flex-shrink-0">
        {IconComponent}
      </div>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8
            ${type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-400' : ''}
            ${type === 'error' ? 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-400' : ''}
            ${type === 'warning' ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-400' : ''}
            ${type === 'info' ? 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-400' : ''}
          `}
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

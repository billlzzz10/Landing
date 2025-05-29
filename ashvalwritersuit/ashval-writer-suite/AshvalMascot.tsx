import React, { useState, useEffect } from 'react';
import { ASHVAL_MASCOT_QUOTES } from './constants'; // Assuming quotes are in constants

interface AshvalMascotProps {
  isVisible: boolean;
  onClose?: () => void;
}

const AshvalMascot: React.FC<AshvalMascotProps> = ({ isVisible, onClose }) => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (isVisible) {
      setQuote(ASHVAL_MASCOT_QUOTES[Math.floor(Math.random() * ASHVAL_MASCOT_QUOTES.length)]);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-5 bg-indigo-100 dark:bg-indigo-700 p-4 rounded-lg shadow-lg z-50 max-w-xs">
      <div className="flex items-start">
        <span className="text-3xl mr-3">✍️</span> {/* Placeholder for actual mascot image/icon */}
        <div>
          <p className="text-sm text-indigo-800 dark:text-indigo-100">{quote}</p>
          {onClose && (
            <button onClick={onClose} className="text-xs text-indigo-500 dark:text-indigo-300 hover:underline mt-2">
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default AshvalMascot;
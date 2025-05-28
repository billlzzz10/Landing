
import React, { useState, useEffect, useRef } from 'react';
import { Smile, X } from 'lucide-react'; 
import { AppTheme } from './NoteTaskApp';

interface EmojiPickerProps {
  selectedEmoji: string | undefined;
  onEmojiSelect: (emoji: string) => void;
  currentTheme: AppTheme;
}

const defaultEmojis: string[] = [
  '✨', '📝', '📄', '📓', '📚', '🖋️', '🧠', '💡', '💬', '✅', '☑️', '📋', 
  '🎯', '🚀', '📈', '📊', '📌', '📍', '🗓️', '⏰', '⚙️', '🔧', '🎨', '🎭', 
  '🎬', '🌍', '🔬', '🌱', '💰', '❤️', '⭐', '🎉', '🎁', '🏠', '💼', 
  '✈️', '🛒', '🤔', '👍', '👎', '❓', '❗', '⚠️', '🤖', '👻', '👽', '🪵', 
  '🔥', '💧', '💨',
  '💖', '🗺️', '💎', '💭', '💻', '🤷'
]; // Removed duplicate emojis

const uniqueDefaultEmojis = Array.from(new Set(defaultEmojis)); // Ensure uniqueness

const EmojiPicker: React.FC<EmojiPickerProps> = ({ selectedEmoji, onEmojiSelect, currentTheme }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsPanelOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`w-12 h-12 flex items-center justify-center rounded-xl ${currentTheme.inputBg} ${currentTheme.inputText} ${currentTheme.inputBorder} ${currentTheme.focusRing} focus:border-transparent focus:outline-none text-2xl shadow-sm hover:bg-opacity-80 transition-colors`}
        aria-label="เลือกไอคอนอีโมจิ"
        aria-expanded={isPanelOpen}
      >
        {selectedEmoji || <Smile className={`w-6 h-6 ${currentTheme.textSecondary} opacity-70`} />}
      </button>

      {isPanelOpen && (
        <div className={`absolute z-20 mt-2 w-72 ${currentTheme.cardBg} border ${currentTheme.divider} rounded-xl shadow-2xl p-4`}>
          <div className="grid grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`h-10 w-10 flex items-center justify-center rounded-lg ${currentTheme.buttonSecondaryBg} ${currentTheme.buttonSecondaryText} hover:bg-opacity-80 transition-colors`}
              title="ไม่มีไอคอน"
              aria-label="เลือกไม่มีไอคอน"
            >
              <X className="w-5 h-5" />
            </button>
            {uniqueDefaultEmojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                className={`h-10 w-10 flex items-center justify-center rounded-lg hover:bg-opacity-20 text-2xl transition-colors
                  ${currentTheme.text} 
                  ${selectedEmoji === emoji ? `${currentTheme.accent} bg-opacity-30 ring-2 ${currentTheme.accent.replace('bg-','ring-')}` : `hover:${currentTheme.inputBg}`}
                `}
                aria-label={`เลือกอีโมจิ ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;

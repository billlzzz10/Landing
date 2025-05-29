import React from 'react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onClose }) => {
  // A real emoji picker would be more complex
  const emojis = ['😀', '🎉', '💡', '📚', '✍️'];
  return (
    <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-700 shadow-lg rounded-lg p-2 border border-gray-200 dark:border-gray-600 z-50">
      <div className="flex space-x-1">
        {emojis.map(emoji => (
          <button 
            key={emoji} 
            // onClick={() => onSelectEmoji(emoji)} // Prop not passed in this placeholder
            className="p-1 text-xl hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
      <button onClick={onClose} className="mt-2 text-xs text-indigo-500 hover:underline">Close</button>
    </div>
  );
};
export default EmojiPicker;
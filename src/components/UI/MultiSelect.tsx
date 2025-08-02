import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select options",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleToggle = (optionValue: string | number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string | number) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            w-full min-h-[2.5rem] px-3 py-2 border rounded-md shadow-sm cursor-pointer transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-[#0e4d3c] focus:border-transparent
            ${error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#0e4d3c] text-white"
                >
                  {option.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(option.value);
                    }}
                    className="ml-1 hover:text-gray-300"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown 
              size={16} 
              className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map(option => (
              <div
                key={option.value}
                className={`
                  px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors
                  ${value.includes(option.value) ? 'bg-[#0e4d3c] text-white hover:bg-[#0a3d2f]' : ''}
                `}
                onClick={() => handleToggle(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
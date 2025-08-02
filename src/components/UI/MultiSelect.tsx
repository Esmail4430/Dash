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
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`
            w-full min-h-[3rem] px-4 py-3 border rounded-lg shadow-sm cursor-pointer transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#0e4d3c] focus:border-transparent
            hover:shadow-md
            ${error 
              ? 'border-red-300 bg-red-50 focus:ring-red-500' 
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500 py-1">{placeholder}</span>
            ) : (
              selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#0e4d3c] text-white shadow-sm"
                >
                  {option.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(option.value);
                    }}
                    className="ml-2 hover:text-gray-300 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown 
              size={20} 
              className={`transform transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
            {options.map(option => (
              <div
                key={option.value}
                className={`
                  px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0
                  ${value.includes(option.value) 
                    ? 'bg-[#0e4d3c] text-white hover:bg-[#0a3d2f]' 
                    : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleToggle(option.value)}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {value.includes(option.value) && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
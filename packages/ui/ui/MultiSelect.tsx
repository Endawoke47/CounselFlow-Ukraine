import { ChevronRight, Search as SearchIcon, XIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils';

import { Button } from '@/shared/ui/Button';
import Label from '@/shared/ui/Label';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
  hasSearch?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  isShowSelectAll?: boolean;
  isShowClear?: boolean;
  isShowClose?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options',
  isDisabled = false,
  hasSearch = false,
  className = '',
  label,
  required = false,
  isShowSelectAll = true,
  isShowClear = true,
  isShowClose = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const removeSelectedValue = (value: string) => {
    onChange(selectedValues.filter((item) => item !== value));
  };

  const clearSelectedValues = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onChange([]);
  };

  const setAllSelectedValues = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const allValues = options.map((option) => option.value);
    onChange(allValues);
  };

  const filteredOptions = hasSearch
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  return (
    <div className={cn('relative w-full', className)} ref={dropdownRef}>
      {label && (
        <Label className="text-sm text-slate-800" required={required}>
          {label}
        </Label>
      )}
      <div
        className={cn(
          'w-[501px] px-4 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          isDisabled && 'cursor-not-allowed opacity-50',
          isOpen && 'border-blue-500',
          className
        )}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between space-x-2 cursor-pointer min-h-5"
        >
          <div className="flex items-center gap-2">
            {hasSearch && <SearchIcon className="w-4 h-4 text-gray-500" />}
            {selectedValues.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((value) => {
                  const option = options.find((opt) => opt.value === value);
                  return (
                    option && (
                      <div
                        key={value}
                        className="flex items-center gap-2 text-sm px-4 py-1 bg-blue-100 rounded-xl"
                      >
                        <span>{option.label}</span>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeSelectedValue(value);
                          }}
                          className="p-2 flex items-center rounded-3xl w-3 h-3 bg-blue-700 hover:bg-blue-500 text-white"
                        >
                          <XIcon strokeWidth={3} size="4px" />
                        </Button>
                      </div>
                    )
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center text-slate-400">
                <span>{placeholder}</span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 mr-0" />
        </div>
      </div>
      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {hasSearch && (
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border-b focus:outline-none pl-10"
              />
              <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'px-4 py-2 cursor-pointer hover:bg-blue-100 border-b',
                  selectedValues?.includes(option.value) && 'bg-blue-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedValues?.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="mr-2"
                />
                {option.label}
              </li>
            ))}
          </ul>
          <div className="flex justify-around px-4 py-2 border-t">
            {isShowSelectAll && (
              <button
                onClick={setAllSelectedValues}
                className="text-gray-600 hover:text-gray-800"
              >
                Select All
              </button>
            )}
            {isShowClear && (
              <button
                onClick={clearSelectedValues}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            )}
            {isShowClose && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

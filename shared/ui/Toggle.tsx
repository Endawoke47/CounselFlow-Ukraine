import React from 'react';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  size?: number;
  onColor?: string;
  offColor?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  label,
  size = 25,
  onColor = '#2563EB',
  offColor = '#D1D5DB',
  disabled = false,
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <button
        className="relative flex items-center rounded-full transition-all duration-300"
        style={{
          width: size * 2,
          height: size * 1.1,
          backgroundColor: checked ? onColor : offColor,
          opacity: disabled ? 0.6 : 1,
          padding: 2,
        }}
        onClick={() => !disabled && onChange?.(!checked)}
      >
        <div
          className="bg-white rounded-full transition-all duration-300 shadow-md"
          style={{
            width: size - 2,
            height: size - 2,
            position: 'absolute',
            left: checked ? `calc(100% - ${size}px - 4px)` : '4px',
          }}
        />
      </button>
    </label>
  );
};

export default Toggle;

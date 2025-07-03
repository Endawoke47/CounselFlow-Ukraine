import { ComponentProps, forwardRef, useRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface ColorPickerProps extends ComponentProps<'input'> {
  color: string;
  setColor: (color: string) => void;
  register?: UseFormRegisterReturn;
}

const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ color, setColor, register }, _ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
      const colorInput = inputRef?.current;
      if (colorInput) {
        colorInput.click();
      }
    };

    return (
      <button
        className="flex items-center cursor-pointer"
        onClick={handleClick}
      >
        <div
          className="w-4 h-4 rounded-3xl mr-2"
          style={{ backgroundColor: color }}
        />
        <input
          type="color"
          value={color}
          ref={inputRef}
          onChange={(e) => setColor(e.target.value)}
          className="opacity-0 absolute w-[30px] h-[30px] cursor-pointer"
        />
        <span className="mr-3 text-slate-800 text-sm">Indentifier Color</span>
        <img src="/icons/chevron-down.png" alt="" />
      </button>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };

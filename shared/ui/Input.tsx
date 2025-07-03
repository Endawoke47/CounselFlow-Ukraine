import { ComponentProps, forwardRef, ReactNode } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '../lib/utils';

import Label from '@/shared/ui/Label';

interface InputProps extends ComponentProps<'input'> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  label?: string;
  errorMessage?: string;
  register?: UseFormRegisterReturn;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      startIcon,
      endIcon,
      label,
      errorMessage,
      type = 'text',
      register,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <Label className="text-sm text-slate-800" required={props.required}>
            {label}
          </Label>
        )}

        <div
          className={cn(
            'relative flex items-center rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
            errorMessage && 'border-red-500 focus-within:ring-red-500',
            className
          )}
        >
          {startIcon && (
            <span className="absolute left-3 text-gray-500 h-full py-[10px]">
              {startIcon}
            </span>
          )}

          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-black placeholder-gray-500 border-divider-light-grey focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              startIcon && 'pl-10',
              endIcon && 'pr-10'
            )}
            ref={ref}
            {...register} // Integrate with React Hook Form
            {...props}
          />

          {endIcon && (
            <span className="absolute right-3 text-gray-500">{endIcon}</span>
          )}
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

import { ComponentProps, forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '../lib/utils';

import Label from '@/shared/ui/Label';

interface TextAreaProps extends ComponentProps<'textarea'> {
  register?: UseFormRegisterReturn;
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, register, label, ...props }, ref) => {
    return (
      <div>
        {label && (
          <Label className="block text-sm font-medium text-gray-700 mb-3" required={props.required}>
            {label}
          </Label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-divider-light-grey bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
          ref={ref}
          {...register}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

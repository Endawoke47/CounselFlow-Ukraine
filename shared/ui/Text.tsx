import { cva, VariantProps } from 'class-variance-authority';
import { ElementType, forwardRef, JSX, ReactNode } from 'react';

import { cn } from '../lib/utils';

const textVariants = cva(
  'block text-black dark:text-gray-100', // Default base styles
  {
    variants: {
      variant: {
        heading: 'font-bold text-2xl md:text-4xl',
        subheading: 'font-semibold text-lg md:text-xl',
        body: 'text-base md:text-lg',
        caption: 'text-sm md:text-base',
        label: 'font-medium text-sm uppercase tracking-wide',
      },
      color: {
        primary: 'text-black dark:text-white-foreground',
        secondary: 'text-secondary dark:text-secondary-foreground',
        muted: 'text-muted-foreground',
        danger: 'text-red-500 dark:text-red-400',
        success: 'text-green-500 dark:text-green-400',
        warning: 'text-yellow-500 dark:text-yellow-400',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
    },
    defaultVariants: {
      variant: 'body',
      color: 'primary',
      align: 'left',
    },
  }
);

interface TextProps<T extends ElementType = 'p'>
  extends VariantProps<typeof textVariants> {
  as?: T;
  className?: string;
  children: ReactNode;
}

const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = 'p',
      variant,
      color,
      align,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = Component as keyof JSX.IntrinsicElements;
    return (
      <Comp
        className={cn(textVariants({ variant, color, align }), className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };

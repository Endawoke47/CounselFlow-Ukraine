import { cva, type VariantProps } from 'class-variance-authority';
import {
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input text-white bg-teal-900 hover:bg-teal-800 hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  isIconButton?: boolean;
  menuItems?: ReactNode;
  menuItemsClassName?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      startIcon,
      endIcon,
      isIconButton = false,
      menuItems,
      children,
      menuItemsClassName,
      ...props
    },
    ref
  ) => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown')) {
          closeMenu();
        }
      };

      if (isMenuOpen) {
        document.addEventListener('click', handleClickOutside);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }

      return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    if (menuItems) {
      return (
        <div className="relative dropdown inline-flex z-10">
          <button
            onClick={toggleMenu}
            className={cn(
              buttonVariants({ variant, size }),
              'transition-all duration-200 ease-in-out focus:ring focus:ring-blue-400 focus:ring-opacity-50',
              className
            )}
            ref={ref}
            {...props}
          >
            {startIcon && <span className="mr-2">{startIcon}</span>}
            {children}
            {endIcon && <span className="ml-2">{endIcon}</span>}
          </button>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div
              className={cn(
                'absolute top-full mt-2 w-48 bg-white shadow-lg rounded-md z-70',
                menuItemsClassName
              )}
            >
              {menuItems}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        className={cn(
          buttonVariants({
            variant,
            size: isIconButton ? 'icon' : size,
          }),
          'transition-all duration-200 ease-in-out focus:ring focus:ring-blue-400 focus:ring-opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {startIcon && !isIconButton && (
          <span className="mr-2">{startIcon}</span>
        )}
        {!isIconButton && children}
        {endIcon && !isIconButton && <span className="ml-2">{endIcon}</span>}
        {isIconButton && startIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React from 'react';

import { cn } from '../../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

const Drawer = ({
  isOpen,
  onClose,
  side = 'right',
  children,
  className,
}: DrawerProps) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className={cn(
            'fixed z-50 h-full max-w-xs w-full bg-white shadow-lg overflow-y-auto transition-transform duration-300 top-0',
            side === 'left'
              ? 'left-0 data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full'
              : 'right-0 data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full',
            className
          )}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
          {/* Content */}
          <div className="py-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Drawer;

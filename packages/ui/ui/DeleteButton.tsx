import { Trash2Icon } from 'lucide-react';
import { ComponentProps, forwardRef } from 'react';

import { Button } from '@/shared/ui/Button';

interface DeleteButtonProps extends ComponentProps<'button'> {
  onButtonClick?: () => void;
}

const DeleteButton = forwardRef<HTMLInputElement, DeleteButtonProps>(
  ({ onButtonClick }, _ref) => {
    const handleClick = (e: any) => {
      e.preventDefault();
      onButtonClick?.();
    };

    return (
      <Button
        onClick={handleClick}
        className="p-1 bg-red-200 h-6 rounded-xl text-red-500"
      >
        <Trash2Icon size={16} />
      </Button>
    );
  }
);

DeleteButton.displayName = 'DeleteButton';

export { DeleteButton };

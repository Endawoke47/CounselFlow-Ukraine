import { FC } from 'react';

import { Button } from '@/shared/ui';

interface DrawerFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  selectedTab: number;
  lastTabNumber: number;
}

export const DrawerFooter: FC<DrawerFooterProps> = ({
  onCancel,
  onSubmit,
  selectedTab,
  lastTabNumber,
}) => {
  return (
    <div className="flex justify-center my-5 gap-[25px]">
      <Button
        variant="outline"
        type="submit"
        className="w-[140px] h-[40] rounded-md bg-gray-300 border-none"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        variant="outline"
        className="w-[140px] h-[40] rounded-md bg-blue-600 text-white"
        type="submit"
        onClick={(e) => {
          if (onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
      >
        {selectedTab === lastTabNumber ? 'Save' : 'Next'}
      </Button>
    </div>
  );
};

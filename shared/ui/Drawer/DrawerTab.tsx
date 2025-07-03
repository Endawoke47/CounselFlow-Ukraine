import React, { FC } from 'react';

import { cn } from '@/shared/lib/utils';

interface DrawerTabProps {
  isSelected: boolean;
  tabText: string;
  isCompleted?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const DrawerTab: FC<DrawerTabProps> = ({
  isSelected,
  tabText,
  isCompleted,
  onClick,
}) => (
  <button
    className={cn(
      'opacity-1 w-[210px] cursor-pointer rounded-lg px-4 py-3 text-left font-text flex items-center',
      {
        'bg-blue-400': isSelected,
        'text-white': isSelected,
      }
    )}
    onClick={onClick}
  >
    <span className="w-4 mr-2">
      {isCompleted && <img src="/icons/sidebar/check.png" alt="checked" />}
    </span>
    <span>{tabText}</span>
  </button>
);

import { FC, ReactNode } from 'react';

interface DrawerTabsContentProps {
  children: ReactNode;
}

export const DrawerTabsContent: FC<DrawerTabsContentProps> = ({ children }) => {
  return <div>{children}</div>;
};

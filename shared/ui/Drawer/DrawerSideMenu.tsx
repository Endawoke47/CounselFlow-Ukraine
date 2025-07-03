import React, { FC } from 'react';
import { RecoilState, useRecoilState, useRecoilValue } from 'recoil';

import { DrawerTab } from '@/shared/ui/Drawer/DrawerTab';

interface DrawerSideMenuProps {
  tabs: Tab[];
  completedTabsAtom: RecoilState<number[]>;
  selectedTabAtom: RecoilState<number>;
}

interface Tab {
  id: number;
  text: string;
}

export const DrawerSideMenu: FC<DrawerSideMenuProps> = ({
  tabs,
  completedTabsAtom,
  selectedTabAtom,
}) => {
  const completedTabs = useRecoilValue(completedTabsAtom);
  const [selectedTab, setSelectedTab] = useRecoilState(selectedTabAtom);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, tab: number) => {
    e.preventDefault();
    if (completedTabs.includes(tab)) {
      setSelectedTab(tab);
    }
  };

  return (
    <div className="flex w-[267px] pt-4 pl-6 flex-col gap-4 border-r bg-slate-200 border-decorative-border-light-gray">
      {tabs.map((tab) => (
        <DrawerTab
          key={tab.id}
          isSelected={selectedTab === tab.id}
          tabText={tab.text}
          isCompleted={completedTabs.includes(tab.id)}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            handleClick(e, tab.id)
          }
        />
      ))}
    </div>
  );
};

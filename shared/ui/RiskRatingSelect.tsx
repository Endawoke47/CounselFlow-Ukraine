import { FlagIcon } from 'lucide-react';
import { FC } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';

const risks = [
  {
    icon: (
      <div className="bg-red-500 rounded-3xl p-1 text-white">
        <FlagIcon size={10} />
      </div>
    ),
    value: 'High',
    label: 'High Risk',
  },
  {
    icon: (
      <div className="bg-yellow-500 rounded-3xl p-1 text-white">
        <FlagIcon size={10} />
      </div>
    ),
    value: 'Medium',
    label: 'Medium Risk',
  },
  {
    icon: (
      <div className="bg-green-500 rounded-3xl p-1 text-white">
        <FlagIcon size={10} />
      </div>
    ),
    value: 'Low',
    label: 'Low Risk',
  },
];

interface RiskRatingSelectProps {
  field: ControllerRenderProps<any, 'riskRating'>;
}
export const RiskRatingSelect: FC<RiskRatingSelectProps> = ({ field }) => {
  return (
    <SelectGroup>
      <SelectLabel>Risk Rating</SelectLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select risk rating" />
        </SelectTrigger>
        <SelectContent>
          {risks?.map((risk) => (
            <SelectItem key={risk.value} value={risk.value}>
              <div className="flex gap-2 items-center">
                {risk.icon} {risk.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};

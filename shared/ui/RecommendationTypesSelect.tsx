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

const recommendationTypes = [
  {
    value: 'Price Adjustment',
    label: 'Price Adjustment',
  },
  {
    value: 'Warranty / Representation',
    label: 'Warranty / Representation',
  },
  {
    value: 'Indemnity',
    label: 'Indemnity',
  },
  {
    value: 'Condition Precedent',
    label: 'Condition Precedent',
  },
  {
    value: 'Deal-Breaker',
    label: 'Deal-Breaker',
  },
  {
    value: 'Condition Subsequent',
    label: 'Condition Subsequent',
  },
  {
    value: 'Tidy-Up',
    label: 'Tidy-Up',
  },
];

interface RiskRatingSelectProps {
  field: ControllerRenderProps<any, `recommendations.${number}.recommendation`>;
}
export const RecommendationTypesSelect: FC<RiskRatingSelectProps> = ({
  field,
}) => {
  return (
    <SelectGroup>
      <SelectLabel>Recommendation</SelectLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Client to Note" />
        </SelectTrigger>
        <SelectContent>
          {recommendationTypes?.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex gap-2 items-center">{type.label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SelectGroup>
  );
};

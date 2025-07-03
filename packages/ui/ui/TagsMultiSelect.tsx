import { FC, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import MultiSelect from '@/shared/ui/MultiSelect';

const matterStatuses = [
  {
    value: 'urgent',
    label: 'Urgent',
  },
  {
    value: 'highValue',
    label: 'High Value',
  },
  {
    value: 'strategic',
    label: 'Strategic',
  }
];

interface TagsMultiSelectProps {
  field: ControllerRenderProps<any, 'tags'>;
  required?: boolean;
}

export const TagsMultiSelect: FC<TagsMultiSelectProps> = ({ field, required }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleTagsSelect = (tags: any) =>{
    setSelected(tags);
    field.onChange(tags)
  }

  return (
    <MultiSelect
      className="w-full"
      options={matterStatuses}
      selectedValues={selected}
      onChange={handleTagsSelect}
      placeholder="Choose tags"
      hasSearch
    />
  );
};

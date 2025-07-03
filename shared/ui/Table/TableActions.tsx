import { ChevronDown, Filter } from 'lucide-react';

import { Button } from '../Button';
import { Input } from '../Input';


const TableActions = () => {
  return (
    <div className="flex justify-between items-center w-full">
      <Input
        placeholder="Filter"
        startIcon={<Filter className="w-4 h-4 text-gray-500" />}
        className="min-w-[100px] max-w-[400px] w-full border-divider-light-grey rounded-md"
      />

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          endIcon={<ChevronDown className="w-4 h-4" />}
          menuItems={
            <ul className="p-2">
              <li className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                Action 1
              </li>
              <li className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                Action 2
              </li>
            </ul>
          }
        >
          Actions
        </Button>
      </div>
    </div>
  );
};

export default TableActions;

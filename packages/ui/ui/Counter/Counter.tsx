import { useRecoilState } from 'recoil';

import { exampleAtom } from '@/shared/state/exampleAtom';
import { Button } from '@/shared/ui';

export const Counter = () => {
  const [value, setValue] = useRecoilState(exampleAtom);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Counter: {value}</h2>
      <Button
        variant="default"
        className="px-6 py-2 bg-green-500 text-white dark:bg-green-600 rounded-lg shadow-md hover:bg-green-600 dark:hover:bg-green-700 transition-all"
        onClick={() => setValue(value + 1)}
      >
        Increment
      </Button>
    </div>
  );
};

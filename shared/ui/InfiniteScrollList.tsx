import { TPaginatedResponse } from '1pd-types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { fetchWithPagination } from '@/entities/api/fetchWithPagination';
import { cn } from '@/shared/lib/utils';


interface InfiniteScrollListProps<T> {
  url: string;
  queryKey: string[];
  placeholder: string;
  renderItem: (item: T) => React.ReactNode;
  onSelectItem?: (item: T) => void;
  initialSelectedValue?: T | null;
}

const InfiniteScrollList = <
  T extends { id: number | string; name?: string; middleName?: string },
>({
  url,
  queryKey,
  placeholder,
  renderItem,
  onSelectItem,
  initialSelectedValue,
}: InfiniteScrollListProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<T | null>(
    initialSelectedValue ?? null
  );

  const listRef = useRef<HTMLDivElement>(null);
  const selectButtonRef = useRef<HTMLButtonElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<TPaginatedResponse<T>, Error>({
      queryKey: [queryKey],
      queryFn: ({ pageParam = 1 }) =>
        fetchWithPagination<T>(url, { page: pageParam as number }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage?.links.next
          ? new URL(lastPage.links.next).searchParams.get('page')
            ? parseInt(new URL(lastPage.links.next).searchParams.get('page')!)
            : undefined
          : undefined;
      },
    });

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectItem = (item: T) => {
    setSelectedValue(item);
    setIsOpen(false);
    onSelectItem?.(item);
  };

  const handleScroll = () => {
    if (
      listRef.current &&
      listRef.current.scrollTop + listRef.current.clientHeight >=
        listRef.current.scrollHeight - 20 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        selectButtonRef.current &&
        !selectButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.addEventListener('scroll', handleScroll);
      return () => {
        listRef.current?.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const displayedValue =
    selectedValue?.name ?? selectedValue?.middleName ?? initialSelectedValue?.name ?? placeholder;

  return (
    <div className="relative">
      <button
        ref={selectButtonRef}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-divider-light-grey bg-background px-3 py-2 text-sm ring-offset-background placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          isOpen && 'border-ring'
        )}
        onClick={handleToggle}
      >
        {displayedValue}
        <ChevronDown
          className={cn('h-4 w-4 opacity-50', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-md border bg-popover shadow-md"
        >
          <ul>
            {data?.pages?.flatMap((page) =>
              page.data.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={cn(
                    'px-3 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground',
                    selectedValue?.id === item.id &&
                      'bg-gray-400 text-accent-foreground'
                  )}
                >
                  {renderItem(item)}
                </li>
              ))
            )}
            {isFetchingNextPage && (
              <li className="px-3 py-2 text-sm text-gray-500">
                Loading more...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollList;

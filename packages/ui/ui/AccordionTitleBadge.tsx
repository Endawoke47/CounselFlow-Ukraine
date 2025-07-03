import { forwardRef } from 'react';

export interface AccordionTitleBadgeProps {
  length: number;
}

const AccordionTitleBadge = forwardRef<
  HTMLButtonElement,
  AccordionTitleBadgeProps
>(({ length }, ref) => {
  return (
    <div className="text-slate-500 text-[12px] border w-[25px] h-[25px] rounded-3xl flex items-center justify-center">
      {length}
    </div>
  );
});

AccordionTitleBadge.displayName = 'AccordionTitleBadge';

export { AccordionTitleBadge };

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './Accordion';

interface MultiAccordionProps {
  items: string[]; // Can be updated in future
  className?: string;
}

export const MultiAccordion = ({ items, className }: MultiAccordionProps) => {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <Accordion key={item} type="single" className={className} collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>{item}</AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

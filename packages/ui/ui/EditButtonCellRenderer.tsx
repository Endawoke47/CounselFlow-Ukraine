import { Link } from '@tanstack/react-router';
import { ICellRendererParams } from 'ag-grid-community';
import { Pencil } from 'lucide-react';

interface ICellRendererProps extends ICellRendererParams {
  url: string
}

export const EditButtonCellRenderer = (params: ICellRendererProps) => {
  return (
    <Link to={params.url} params={{ id: params.value }}>
      <Pencil size={'16'} color="green" />
    </Link>
  );
};

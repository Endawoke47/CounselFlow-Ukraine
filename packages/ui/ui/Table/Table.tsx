import {
  ClientSideRowModelModule,
  ColDef,
  ColGroupDef,
  CustomFilterModule,
  DateFilterModule,
  GridApi,
  ModuleRegistry,
  NumberFilterModule,
  RowSelectionModule,
  RowStyleModule,
  TextFilterModule,
  ValidationModule,
  Column,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import { useState } from 'react';

import './style.css';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  RowStyleModule,
  RowSelectionModule,
]);

interface TableProps {
  rowData: any[];
  columns: (ColDef<any, any> | ColGroupDef<any>)[];
  rowSelection?: 'multiple' | 'single' | undefined;
  setSelectedIds?: (ids: string[]) => void;
}

const Table = ({
  rowData,
  columns,
  rowSelection,
  setSelectedIds,
}: TableProps) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const onGridReady = (params: { api: GridApi }) => {
    setGridApi(params.api);
  };

  const onCellClicked = (params: {
    column: Column;
    api: GridApi;
    node: any;
    data: any;
  }) => {
    setSelectedIds?.(params.data.id);
    if (params.column.getColId() !== 'checkbox') {
      params.api.deselectAll();
      if (params.node) {
        params.node.setSelected(false);
      }
    }
  };

  return (
    <div className="ag-theme-alpine w-full">
      <AgGridReact
        rowData={rowData}
        columnDefs={columns}
        rowSelection={rowSelection ? rowSelection : undefined}
        getRowId={(params) => params.data.id ?? JSON.stringify(params.data)}
        onGridReady={onGridReady}
        domLayout="autoHeight"
        cellSelection={true}
        getRowHeight={(params) => {
          return params.data.project ? 100 : 50;
        }}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
          filter: true,
        }}
        getRowStyle={(params) => ({
          backgroundColor: params.node.isSelected() ? '#EAF3FF' : '',
        })}
        onCellClicked={onCellClicked}
      />
    </div>
  );
};

export default Table;

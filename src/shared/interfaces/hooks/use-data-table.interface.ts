import { AriaRole, ReactNode } from "react";
import { TableContainerProps, TableProps, TableRowProps } from "@mui/material";


export interface DataTableHeadCellProps<T extends Object> {
    disablePadding: boolean;
    id: keyof T;
    label: string;
    numeric: boolean;
}
  
export interface DataTableDataRow extends Object {
    id_data_table: number;
}
  

export type DataTableOrder = 'asc' | 'desc';

export interface IDataTableOptions<T extends Object>{
    pagination?: {
      rowsPerPageOptions?: number[];
      rowsPerPage?: number;
    },
    showCheckbocHead?: boolean;
    onShowSelectAllCheckbox?: boolean
    onShow?: (values: T[]) => void;
    fieldsSearchExtra?: Array<keyof T>
    disableSorting?: boolean;
}
  
export interface IListItemDataTable{
    id_data_table: number;
    isHandleClick?: boolean;
    role?: AriaRole;
    props?: TableRowProps;
    children: ReactNode;
}

export interface IDataByFilterDataTable<T extends object>{
    field: keyof T;
    action: TypeActionByFilterDataTable;
    value: any;
}

export type TypeActionByFilterDataTable = '=' | '>' | '>=' | '<' | '<=' | 'date-from' | 'date-to';

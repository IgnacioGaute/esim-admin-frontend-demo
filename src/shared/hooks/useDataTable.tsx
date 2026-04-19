import { useEffect, useMemo, useState } from "react"
import { TableRow, TableCell } from "@mui/material"
import {
  getComparatorDataTable,
  onFilterDataTable,
  onSearchDataTable,
  stableSortDataTable,
} from "../helpers/hooks/useDataTableHelper"
import { EnhancedTableHead } from "../components/data-table"

import {
  DataTableDataRow,
  DataTableHeadCellProps,
  DataTableOrder,
  IDataByFilterDataTable,
  IDataTableOptions,
  IListItemDataTable,
  TypeActionByFilterDataTable,
} from "../interfaces/hooks/use-data-table.interface"

export const useDataTable = <T extends Object>(
  headCells: DataTableHeadCellProps<T>[],
  data: T[],
  orderByInit: keyof T,
  options?: IDataTableOptions<T>
) => {
  const [rows, setRows] = useState<Array<T & DataTableDataRow>>([])
  const [order, setOrder] = useState<DataTableOrder>("desc")
  const [orderBy, setOrderBy] = useState<keyof T>(orderByInit)
  const [selected, setSelected] = useState<readonly number[]>([])
  const [page, setPage] = useState(0)

  // actions toolbar by search and filter
  const [dataByFilter, setDataByFilter] = useState<IDataByFilterDataTable<T>[]>([])

  // ✅ data pagination
  // ✅ default: 30
  const [rowsPerPage, setRowsPerPage] = useState(options?.pagination?.rowsPerPage || 30)

  // ✅ default options: 10, 30, 100, 500, 1000
  const rowsPerPageOptions = options?.pagination?.rowsPerPageOptions || [10, 30, 100, 500, 1000]

  const unionDataRows = (): Array<T & DataTableDataRow> => {
    let newRows: Array<T & DataTableDataRow> = []
    data.map((item, idx) => newRows.push({ ...item, id_data_table: idx + 1 }))
    return newRows
  }

  useEffect(() => {
    setRows(unionDataRows())
    setSelected([])
  }, [data])

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id_data_table)
      setSelected(newSelected)
      return
    }
    setSelected([])
  }

  const handleClick = (id: number) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected: readonly number[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
    }

    setSelected(newSelected)
  }

  const itemRowClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, id: number) => {
    let { cellIndex, nodeName } = e.target as any

    if (nodeName) {
      if (!cellIndex && nodeName !== "checkbox" && nodeName != "radio" && nodeName !== "INPUT") {
        cellIndex = 1
      }
    }

    if (cellIndex && cellIndex > 0) {
      const findItem = rows.find((row) => row.id_data_table == id)
      if (options?.onShow && findItem) options.onShow([findItem])
    }
  }

  const onGetItemSelectd = () => {
    let rowsData: Array<T & DataTableDataRow> = []
    selected.map((select) => {
      const findItem = rows.find((row) => row.id_data_table == select)
      if (findItem) rowsData.push(findItem)
    })
    return rowsData
  }

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isSelected = (id: number) => selected.indexOf(id) !== -1

  const visibleRows = useMemo(
    () =>
      stableSortDataTable(rows, getComparatorDataTable<T>(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [order, orderBy, page, rowsPerPage, rows]
  )

  const onSetFilter = (field: keyof T, action: TypeActionByFilterDataTable, value: any | "all") => {
    setDataByFilter((values) => {
      const cleanValue = value === "all" ? "" : value
      const newValue = { field, action, value: cleanValue }

      // ✅ si viene vacío: eliminar ese filtro puntual (field + action)
      if (cleanValue === "" || cleanValue === null || typeof cleanValue === "undefined") {
        return values.filter((f) => !(f.field === field && f.action === action))
      }

      // ✅ si ya existe ese mismo filtro (field + action), lo actualiza
      const idx = values.findIndex((f) => f.field === field && f.action === action)
      if (idx >= 0) {
        return values.map((f, i) => (i === idx ? { ...f, value: cleanValue } : f))
      }

      // ✅ si es "=", dejamos solo un filtro por field (opcional)
      if (action === "=") {
        return [...values.filter((f) => f.field !== field), newValue]
      }

      // ✅ para > >= < <= y date-from/date-to: se pueden acumular
      return [...values, newValue]
    })
  }

  const onApplyFilter = (filterData: IDataByFilterDataTable<T>[], isDefault: boolean = false) => {
    if (isDefault) {
      setDataByFilter([])
      setRows(unionDataRows())
      return
    }

    setRows(onFilterDataTable<T & DataTableDataRow>(unionDataRows(), filterData))
  }

  // func search
  const onSearch = (search: string) => {
    let newRows: Array<T & DataTableDataRow> = unionDataRows()

    if (search > "") {
      let fields: Array<keyof T> = []
      headCells.map(({ id }) => fields.push(id))

      if (options?.fieldsSearchExtra) fields = [...fields, ...options.fieldsSearchExtra]

      newRows = onSearchDataTable<T & DataTableDataRow>(search, fields, newRows, "id_data_table")
    }

    setRows(newRows)
  }

  // ✅ el head sigue igual: los tooltips van dentro de EnhancedTableHead
  const DataTableHead = useMemo(
    () =>
      EnhancedTableHead<T>({
        numSelected: selected.length,
        order: order,
        orderBy: String(orderBy),
        onSelectAllClick:
          options?.onShowSelectAllCheckbox && options.onShowSelectAllCheckbox ? handleSelectAllClick : undefined,
        showCheckbocHead: options?.showCheckbocHead,
        onRequestSort: handleRequestSort,
        rowCount: rows.length,
        headCells,
        disableSorting: options?.disableSorting,
      }),
    [headCells, orderBy, order, options?.disableSorting, rows.length, selected.length]
  )

  const ListItemTable = ({ id_data_table, isHandleClick = true, role = "checkbox", props, children }: IListItemDataTable) => {
    const isItemSelected = isSelected(id_data_table)

    return (
      <TableRow
        onClick={isHandleClick ? (e) => itemRowClick(e, id_data_table) : undefined}
        role={role}
        tabIndex={-1}
        aria-checked={role == "radio" || role == "checkbox" ? isItemSelected : undefined}
        selected={role == "radio" || role == "checkbox" ? isItemSelected : undefined}
        sx={{ cursor: "pointer" }}
        {...props}
      >
        {children}
      </TableRow>
    )
  }

  return {
    rows: visibleRows,
    pagination: {
      rowsPerPageOptions: rowsPerPageOptions,
      count: rows.length,
      rowsPerPage,
      page,
      handleChangePage,
      handleChangeRowsPerPage,
    },
    selected,
    dataByFilter,

    //func component
    DataTableHead,
    ListItemTable,
    ItemDataTable: TableCell,

    //func
    isSelectedItem: isSelected,
    onSelectItem: handleClick,
    onSearch,
    onSetFilter,
    onApplyFilter,
    onGetItemSelectd,
  }
}

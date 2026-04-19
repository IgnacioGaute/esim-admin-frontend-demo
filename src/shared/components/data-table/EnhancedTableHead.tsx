import React from "react"
import {
  Box,
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Tooltip,
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { DataTableHeadCellProps, DataTableOrder } from "@/shared/interfaces/hooks"

interface EnhancedTableProps<T extends object> {
  numSelected: number
  onRequestSort: (property: keyof T) => void
  onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: DataTableOrder
  orderBy: string
  rowCount: number
  headCells: DataTableHeadCellProps<T>[]
  showCheckbocHead?: boolean
  disableSorting?: boolean
}

export const EnhancedTableHead = <T extends object>(props: EnhancedTableProps<T>) => {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    headCells,
    showCheckbocHead,
    disableSorting = false,
  } = props

  const createSortHandler = (property: keyof T) => {
    onRequestSort(property)
  }

  // ✅ campos fecha (ajustá si querés)
  const dateFields = new Set<string>(["created_at", "updated_at"])

  const getLabelText = (headCell: DataTableHeadCellProps<T>) => {
    // label DEBE ser string. Si por algo llega otra cosa, usamos el id.
    return typeof (headCell as any).label === "string" ? (headCell as any).label : String(headCell.id)
  }

  const getTooltipText = (headCell: DataTableHeadCellProps<T>, isActive: boolean) => {
    const idStr = String(headCell.id)
    const labelText = getLabelText(headCell)

    const nextDir: DataTableOrder = !isActive ? "asc" : order === "asc" ? "desc" : "asc"

    const isDate = dateFields.has(idStr)
    const isNumeric = Boolean(headCell.numeric)
    const isText = !isNumeric && !isDate

    if (isText) {
      const nextLabel = nextDir === "asc" ? "A-Z" : "Z-A"
      return `Click para ordenar por "${labelText}" (cambiar a ${nextLabel})`
    }

    if (isDate) {
      const nextLabel = nextDir === "asc" ? "Más viejo" : "Más nuevo"
      return `Click para ordenar por "${labelText}" (cambiar a ${nextLabel})`
    }

    const nextLabel = nextDir === "asc" ? "Menor → Mayor" : "Mayor → Menor"
    return `Click para ordenar por "${labelText}" (cambiar a ${nextLabel})`
  }

  return (
    <TableHead>
      <TableRow>
        {showCheckbocHead && (
          <TableCell padding="checkbox">
            {onSelectAllClick && (
              <Checkbox
                color="primary"
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{ "aria-label": "select all" }}
              />
            )}
          </TableCell>
        )}

        {headCells.map((headCell) => {
          const idStr = String(headCell.id)
          const isActive = orderBy === idStr
          const labelText = getLabelText(headCell)

          return (
            <TableCell
              key={idStr}
              align={headCell.numeric ? "right" : "left"}
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={disableSorting ? false : isActive ? order : false}
            >
              {disableSorting ? (
                <Typography variant="subtitle2" component="div" fontWeight={500}>
                  {labelText}
                </Typography>
              ) : (
                <Tooltip arrow placement="top" title={getTooltipText(headCell, isActive)}>
                  {/* span necesario para Tooltip */}
                  <span>
                    <TableSortLabel
                      active={isActive}
                      direction={isActive ? order : "asc"}
                      onClick={() => createSortHandler(headCell.id)}
                    >
                      {labelText}
                      {isActive ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === "desc" ? "sorted descending" : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </span>
                </Tooltip>
              )}
            </TableCell>
          )
        })}
      </TableRow>
    </TableHead>
  )
}

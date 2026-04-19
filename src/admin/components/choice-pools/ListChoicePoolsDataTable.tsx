import React, { useMemo, useState } from "react"
import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks"
import { IChoicePool } from "@/admin/utils"
import { Box, Button, Checkbox, IconButton, Tooltip, Typography } from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { Edit, DeleteOutline } from "@mui/icons-material"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import logo2x from "@/assets/images/logo/logo-2x.png"

// ✅ helpers del hook para exportar con filtros + búsqueda
import { onFilterDataTable, onSearchDataTable } from "@/shared/helpers/hooks/useDataTableHelper"

interface Props {
  loading?: boolean
  onEdit: (poolId: string) => void
  onDelete: (poolId: string) => void
  data: IChoicePool[]
}

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const drawHeaderFactory = (doc: jsPDF, logoDataUrl: string | null, totalRows: number) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 52
  const safeRight = pageWidth - marginX

  const hr = (y: number) => {
    doc.setDrawColor(210)
    doc.setLineWidth(0.8)
    doc.line(marginX, y, safeRight, y)
  }

  return () => {
    const topY = 26

    if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)

    const textX = logoDataUrl ? marginX + 125 : marginX

    doc.setTextColor(0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text("Listado de Choice Pools", textX, topY + 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
    doc.text(`Registros: ${totalRows}`, textX, topY + 48)

    hr(topY + 64)
  }
}

export const ListChoicePoolsDataTable = ({ loading = false, onEdit, onDelete, data }: Props) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchText, setSearchText] = useState("")

  const {
    ListItemTable,
    ItemDataTable,
    pagination,
    DataTableHead,
    rows,
    onGetItemSelectd,
    onSelectItem,
    selected,
    onSearch,
    isSelectedItem,
    dataByFilter,
    onApplyFilter,
  } = useDataTable<IChoicePool>(headCells, data, "idPool", {
    showCheckbocHead: false,
  })

  const onActionSendId = (action: "delete" | "update") => {
    const pool = onGetItemSelectd()
    if (pool.length > 0) {
      if (action === "delete") return onDelete(pool[0].id)
      return onEdit(pool[0].id)
    }
  }

  const handleSearch = (value: unknown) => {
    const v = typeof value === "string" ? value : String((value as any)?.target?.value ?? "")
    setSearchText(v)
    onSearch(v)
  }

  // ✅ rows para PDF: aplica filtros + búsqueda sobre data (no solo paginado)
  const rowsForExport = useMemo(() => {
    const base = data.map((item: any, idx) => ({ ...item, id_data_table: idx + 1 }))
    let result = base

    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)

    const q = (searchText || "").trim()
    if (q) {
      let fields: any[] = []
      headCells.forEach(({ id }) => fields.push(id))
      fields = [...fields, "idPool", "name", "provider", "imsiFrom", "imsiTo", "availableQuantity", "amountUsed"]
      result = onSearchDataTable(q, fields as any, result as any, "id_data_table")
    }

    return result as any as IChoicePool[]
  }, [data, dataByFilter, searchText])

  const handleDownloadPdf = async () => {
    try {
      if (!rowsForExport.length) return
      setIsDownloading(true)

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const marginX = 52
      const TOP_TABLE_Y = 110

      const logoUrl = typeof logo2x === "string" ? logo2x : (logo2x as any).src

      let logoDataUrl: string | null = null
      try {
        const blob = await fetch(logoUrl).then((r) => r.blob())
        logoDataUrl = await blobToDataURL(blob)
      } catch {
        logoDataUrl = null
      }

      const drawHeader = drawHeaderFactory(doc, logoDataUrl, rowsForExport.length)
      drawHeader()

      const head = [[
        "ID Pool",
        "Nombre",
        "Proveedor",
        "IMSI (From - To)",
        "Disponible",
        "Usada",
      ]]

      const body = rowsForExport.map((row: any) => [
        String(row.idPool ?? "-"),
        String(row.name ?? "-"),
        String(row.provider ?? "-"),
        `${String(row.imsiFrom ?? "-")} - ${String(row.imsiTo ?? "-")}`,
        String(row.availableQuantity ?? "0"),
        String(row.amountUsed ?? "0"),
      ])

      // ✅ forzamos a que NO se corte
      const tableWidth = pageWidth - marginX * 2

      // fijos
      const W_DISP = 110
      const W_USADA = 110
      const W_PROV = 130
      const W_IMSI = 130

      // lo que queda para ID + Nombre
      const remaining = tableWidth - (W_DISP + W_USADA + W_PROV + W_IMSI)
      const W_ID = Math.max(130, Math.floor(remaining * 0.35))
      const W_NOMBRE = Math.max(130, remaining - W_ID)

      autoTable(doc, {
        head,
        body,

        startY: TOP_TABLE_Y,
        margin: { left: marginX, right: marginX, top: TOP_TABLE_Y },
        tableWidth,

        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 5,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fontStyle: "bold",
          fillColor: [28, 54, 128],
          textColor: 255,
        },
        alternateRowStyles: { fillColor: [245, 247, 252] },

        columnStyles: {
          0: { cellWidth: W_ID },                      // ID Pool
          1: { cellWidth: W_NOMBRE },                  // Nombre
          2: { cellWidth: W_PROV },                    // Proveedor
          3: { cellWidth: W_IMSI },                    // IMSI
          4: { cellWidth: W_DISP, halign: "right" },   // Disponible
          5: { cellWidth: W_USADA, halign: "right" },  // Usada
        },

        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      doc.save(`choice-pools-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <PaperDataTable>
      {/* ✅ Botón PDF arriba derecha */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, px: 2, pt: 2 }}>
        <Button
          onClick={handleDownloadPdf}
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          disabled={isDownloading || !rowsForExport.length}
          sx={{
            backgroundColor: "#E60023",
            "&:hover": { backgroundColor: "#C4001E" },
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 1,
          }}
        >
          {isDownloading ? "Generando..." : "Descargar"}
        </Button>
      </Box>

      <DataTableToolbar
        numSelected={selected.length}
        onChangeSearch={handleSearch}
        onDelete={() => onActionSendId("delete")}
        onEdit={() => onActionSendId("update")}
        onApplyFilter={() => onApplyFilter(dataByFilter)}
        title="Choice Pools"
        description={
          <Typography variant="body2" color="text.secondary">
            Administración de pools de recursos (IMSI) por proveedor. Te permite ver stock disponible/usado,
            buscar rápidamente y exportar el estado a PDF.
          </Typography>
        }
      />

      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: puedes ordenar los datos haciendo click en las flechas (↑↓) de cada columna.
        </Typography>
      </Box>

      <DataTable
        DataTableHead={DataTableHead}
        pagination={pagination}
        loading={{
          load: loading || false,
          cell: headCells.length + 1,
        }}
      >
        {rows.map((row, idx) => {
          const labelId = `enhanced-table-checkbox-${idx}`
          const checked = isSelectedItem(row.id_data_table)

          return (
            <ListItemTable key={row.id_data_table} id_data_table={row.id_data_table} isHandleClick={false}>
              {/* ✅ Checkbox + acciones solo si está seleccionado */}
              <ItemDataTable padding="checkbox">
                <Box display="flex" alignItems="center" flexDirection="row" gap={0.25}>
                  <Checkbox
                    color="primary"
                    checked={checked}
                    onChange={() => onSelectItem(row.id_data_table)}
                    inputProps={{ "aria-label": "select pool" }}
                  />

                  {checked && (
                    <>
                      <Tooltip title="Editar pool" placement="top" arrow>
                        <IconButton
                          size="medium"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onEdit(row.id)
                          }}
                          aria-label="Editar pool"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar pool" placement="top" arrow>
                        <IconButton
                          size="medium"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDelete(row.id)
                          }}
                          aria-label="Eliminar pool"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </ItemDataTable>

              <ItemDataTable component="th" id={labelId} scope="row">
                {row.idPool}
              </ItemDataTable>

              <ItemDataTable align="left">{row.name}</ItemDataTable>

              <ItemDataTable align="right">{row.provider}</ItemDataTable>

              <ItemDataTable align="right">
                {row.imsiFrom} - {row.imsiTo}
              </ItemDataTable>

              <ItemDataTable align="right">{row.availableQuantity}</ItemDataTable>

              <ItemDataTable align="right">{row.amountUsed}</ItemDataTable>
            </ListItemTable>
          )
        })}
      </DataTable>
    </PaperDataTable>
  )
}

const headCells: DataTableHeadCellProps<IChoicePool>[] = [
  { id: "idPool", numeric: false, disablePadding: false, label: "ID Pool" },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "provider", numeric: true, disablePadding: false, label: "Proveedor" },
  { id: "imsiFrom", numeric: true, disablePadding: false, label: "IMSI" },
  { id: "availableQuantity", numeric: true, disablePadding: false, label: "Cantidad disponible" },
  { id: "amountUsed", numeric: true, disablePadding: false, label: "Cantidad usada" },
]

import React, { useMemo, useState } from "react"
import { Box, Button, Checkbox, Typography } from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import logo2x from "@/assets/images/logo/logo-2x.png"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { IDataNotificationPush } from "@/admin/utils/interfaces/notification-push.interface"

// ✅ helpers del hook para exportar con filtros + búsqueda
import { onFilterDataTable, onSearchDataTable } from "@/shared/helpers/hooks/useDataTableHelper"

interface Props {
  notificationList: IDataNotificationPush[]
  onDelete: (notificationId: string) => void
  loading?: boolean
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
    doc.text("Listado de Notificaciones Push", textX, topY + 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
    doc.text(`Registros: ${totalRows}`, textX, topY + 48)

    hr(topY + 64)
  }
}

export const ListNotificationPush = ({ notificationList, onDelete, loading }: Props) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchText, setSearchText] = useState("")

  const {
    ListItemTable,
    ItemDataTable,
    onSearch,
    onApplyFilter,
    onSelectItem,
    isSelectedItem,
    onGetItemSelectd,
    pagination,
    DataTableHead,
    selected,
    rows,
    dataByFilter,
  } = useDataTable<IDataNotificationPush>(headCells, notificationList, "created_at", {
    showCheckbocHead: true,
  })

  const onActionSendId = (action: "delete" | "update") => {
    const notification = onGetItemSelectd()
    if (notification.length > 0) {
      if (action === "delete") return onDelete(notification[0].id)
    }
  }

  // ✅ rows para PDF: aplica filtros + búsqueda sobre notificationList (no solo paginado)
  const rowsForExport = useMemo(() => {
    const base = notificationList.map((item: any, idx) => ({ ...item, id_data_table: idx + 1 }))
    let result = base

    if (dataByFilter?.length) {
      result = onFilterDataTable(result, dataByFilter as any)
    }

    const q = (searchText || "").trim()
    if (q) {
      let fields: any[] = []
      headCells.forEach(({ id }) => fields.push(id))
      fields = [...fields, "title", "description", "channel", "created_at"]
      result = onSearchDataTable(q, fields as any, result as any, "id_data_table")
    }

    return result as any as IDataNotificationPush[]
  }, [notificationList, dataByFilter, searchText])

  const handleSearch = (value: unknown) => {
    const v = typeof value === "string" ? value : String((value as any)?.target?.value ?? "")
    setSearchText(v)
    onSearch(v)
  }

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

      const head = [["Título", "Descripción", "Canal", "Fecha creado"]]

      const body = rowsForExport.map((row: any) => [
        String(row.title ?? "-"),
        String(row.description ?? "-"),
        String(row.channel ?? "-"),
        formatterDateDDMMYYYY(row.created_at),
      ])

      // ✅ forzamos a que NO se corte
      const tableWidth = pageWidth - marginX * 2

      // fijos
      const W_CANAL = 140
      const W_FECHA = 140

      // lo que queda para título + descripción
      const remaining = tableWidth - (W_CANAL + W_FECHA)
      const W_TITULO = Math.max(200, Math.floor(remaining * 0.30))
      const W_DESC = Math.max(320, remaining - W_TITULO)

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
          0: { cellWidth: W_TITULO },                 // Título
          1: { cellWidth: W_DESC },                   // Descripción
          2: { cellWidth: W_CANAL },                  // Canal
          3: { cellWidth: W_FECHA, halign: "right" }, // Fecha
        },

        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      doc.save(`notifications-push-${new Date().toISOString().slice(0, 10)}.pdf`)
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
        onApplyFilter={() => onApplyFilter(dataByFilter)}
        // si NO querés buscador en este listado:
        // showSearch={false}
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

          return (
            <ListItemTable key={row.id_data_table} id_data_table={row.id_data_table}>
              <ItemDataTable padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={isSelectedItem(row.id_data_table)}
                  onChange={() => onSelectItem(row.id_data_table)}
                  inputProps={{ "aria-label": "select notification" }}
                />
              </ItemDataTable>

              <ItemDataTable component="th" id={labelId} scope="row">
                {row.title}
              </ItemDataTable>

              <ItemDataTable align="left">
                <Typography color="rgba(0, 0, 0, 0.87)">{row.description}</Typography>
              </ItemDataTable>

              <ItemDataTable align="left">{row.channel}</ItemDataTable>

              <ItemDataTable align="right">{formatterDateDDMMYYYY(row.created_at)}</ItemDataTable>
            </ListItemTable>
          )
        })}
      </DataTable>
    </PaperDataTable>
  )
}

const headCells: DataTableHeadCellProps<IDataNotificationPush>[] = [
  { id: "title", numeric: false, disablePadding: false, label: "Título" },
  { id: "description", numeric: false, disablePadding: false, label: "Descripción" },
  { id: "channel", numeric: false, disablePadding: false, label: "Canal" },
  { id: "created_at", numeric: true, disablePadding: false, label: "Fecha creado" },
]

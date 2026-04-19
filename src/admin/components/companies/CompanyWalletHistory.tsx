import { useMemo, useState } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TablePagination,
  Button,
  Stack,
  Chip,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DownloadIcon from "@mui/icons-material/Download"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import { useFetch } from "@/shared/hooks"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import logo2x from "@/assets/images/logo/logo-2x.png"

interface Props {
  companyId: string
  companyName?: string
  companyEmail?: string
  userName?: string
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

interface Transaction {
  id: string
  createdAt: string
  type: "ADD_BALANCE" | "SUBTRACT_BALANCE" | "BUY_ESIM"
  status?: "PENDING" | "COMPLETED" | "REJECTED" | "FAILED" | "CANCELLED"
  amount: number
  balanceAfter: number
  metadata?: {
    reason?: string
    direction?: "ADD" | "SUBTRACT"
    performedBy?: {
      id: string
      type: string
      email: string
    }
    orderId?: string
  }
}

type CompanyWalletResponse = {
  id: string
  companyId: string
  walletId: string
  company?: { id: string; name?: string }
  wallet?: {
    id: string
    balance: number
    transactions?: Transaction[]
  }
}

const mapTypeLabel = (type: Transaction["type"]) => {
  if (type === "ADD_BALANCE") return "Balance agregado"
  if (type === "SUBTRACT_BALANCE") return "Balance restado"
  if (type === "BUY_ESIM") return "Compra de eSIM"
  return type
}

const mapStatusLabel = (status?: Transaction["status"]) => {
  const s = String(status ?? "").toUpperCase()
  if (s === "COMPLETED") return "Completado"
  if (s === "PENDING") return "Pendiente"
  if (s === "REJECTED") return "Rechazado"
  if (s === "FAILED") return "Fallido"
  if (s === "CANCELLED") return "Cancelado"
  return status ?? "N/A"
}

const getStatusChipSx = (status?: Transaction["status"]) => {
  const s = String(status ?? "").toUpperCase()

  if (s === "COMPLETED") {
    return {
      bgcolor: "rgba(34, 197, 94, 0.10)",
      color: "#16a34a",
      border: "1px solid rgba(34, 197, 94, 0.18)",
    }
  }

  if (s === "PENDING") {
    return {
      bgcolor: "rgba(245, 158, 11, 0.12)",
      color: "#d97706",
      border: "1px solid rgba(245, 158, 11, 0.20)",
    }
  }

  if (s === "REJECTED" || s === "FAILED" || s === "CANCELLED") {
    return {
      bgcolor: "rgba(239, 68, 68, 0.10)",
      color: "#dc2626",
      border: "1px solid rgba(239, 68, 68, 0.18)",
    }
  }

  return {
    bgcolor: "rgba(100, 116, 139, 0.10)",
    color: "#475569",
    border: "1px solid rgba(100, 116, 139, 0.18)",
  }
}

const formatMoney = (n: number) => `${Number(n).toFixed(2)} USD`

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const modernAccordionSx = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "rgba(0, 0, 0, 0.08)",
  bgcolor: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:before": { display: "none" },
  "&:hover": {
    borderColor: "rgba(59, 130, 246, 0.3)",
    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.08)",
  },
  "&.Mui-expanded": {
    borderColor: "rgba(59, 130, 246, 0.4)",
    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.12)",
  },
}

const modernTableHeadCellSx = {
  fontWeight: 600,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#64748b",
  bgcolor: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
  py: 1.5,
}

const modernTableRowSx = {
  transition: "all 0.2s ease",
  "&:hover": {
    bgcolor: "rgba(59, 130, 246, 0.04)",
  },
  "&:last-child td": {
    borderBottom: 0,
  },
}

const modernTableCellSx = {
  py: 1.5,
  borderBottom: "1px solid #f1f5f9",
  fontSize: "0.875rem",
}

export const CompanyWalletHistory = ({
  companyId,
  companyName,
  companyEmail,
  userName,
  expanded,
  onExpandedChange,
}: Props) => {
  const { data, loading } = useFetch<CompanyWalletResponse>(
    companyId ? `/wallets/company/${companyId}` : "",
    "GET",
    {
      init: !!companyId,
      cache: { enabled: false },
    }
  )

  const transactions: Transaction[] = Array.isArray(data?.wallet?.transactions)
    ? (data!.wallet!.transactions as Transaction[])
    : []

  const effectiveCompanyName = companyName ?? data?.company?.name ?? ""
  const effectiveCompanyEmail = companyEmail ?? ""

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const total = transactions.length
  const paginated = transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const canDownload = useMemo(() => !loading && total > 0, [loading, total])
  const effectiveUserName = userName ?? ""

  const LOGIN_URL = "https://portal.esim-demo.com/sign-in"

  const handleDownloadPdf = async () => {
    if (!transactions.length) return

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const marginX = 52
    const safeRight = pageWidth - marginX

    const generatedAt = new Date().toLocaleString()

    let logoDataUrl: string | null = null
    try {
      const blob = await fetch(logo2x).then((r) => r.blob())
      logoDataUrl = await blobToDataURL(blob)
    } catch {
      logoDataUrl = null
    }

    const hr = (y: number) => {
      doc.setDrawColor(210)
      doc.setLineWidth(0.8)
      doc.line(marginX, y, safeRight, y)
    }

    const ensureSpace = (y: number, needed: number) => {
      if (y + needed > pageHeight - 60) {
        doc.addPage()
        return 60
      }
      return y
    }

    const drawHeader = () => {
      const topY = 30

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)
      }

      const textX = logoDataUrl ? marginX + 125 : marginX

      doc.setTextColor(0)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text((effectiveCompanyName || "NOMBRE DE LA EMPRESA").toUpperCase(), textX, topY + 14)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text("Resumen de las transferencias de saldos", textX, topY + 30)

      doc.text(`Generado: ${generatedAt}`, textX, topY + 44)
      doc.text(`Usuario: ${effectiveUserName || ""}`, textX, topY + 58)

      hr(topY + 74)
    }

    drawHeader()

    let y = 130
    y = ensureSpace(y, 120)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(
      `Estimado (${effectiveCompanyName || "EMPRESA"}${effectiveUserName ? " y " + effectiveUserName : ""}):`,
      marginX,
      y
    )

    y += 20
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    const p1 = `Como fue pedido por el usuario (${effectiveUserName || "NOMBRE"}) adjunto resumen de las transferencias y saldo de la cuenta de la empresa (${effectiveCompanyName || "NOMBRE DE LA EMPRESA"}).`
    const p2 = `Para revisar estos movimientos con más detalles, ingresar tu cuenta en :`

    const p1Lines = doc.splitTextToSize(p1, safeRight - marginX)
    doc.text(p1Lines, marginX, y)
    y += p1Lines.length * 14 + 10

    const p2Lines = doc.splitTextToSize(p2, safeRight - marginX)
    doc.text(p2Lines, marginX, y)
    y += p2Lines.length * 14 + 8

    doc.setTextColor(28, 54, 128)
    doc.textWithLink(LOGIN_URL, marginX, y, { url: LOGIN_URL })
    doc.setTextColor(0)
    y += 22

    const head = [["Fecha", "Tipo", "Estado", "Monto", "Saldo luego", "Realizado por"]]

    const body = transactions.map((tx) => {
      const isSub = tx.type === "SUBTRACT_BALANCE" || tx.metadata?.direction === "SUBTRACT"
      const sign = isSub ? "-" : "+"

      const performedBy = tx.metadata?.performedBy
        ? `${tx.metadata.performedBy.email} (${tx.metadata.performedBy.type})`
        : "N/A"

      return [
        new Date(tx.createdAt).toLocaleString(),
        mapTypeLabel(tx.type),
        mapStatusLabel(tx.status),
        `${sign}${formatMoney(Number(tx.amount))}`,
        formatMoney(Number(tx.balanceAfter)),
        performedBy,
      ]
    })

    autoTable(doc, {
      head,
      body,
      startY: y,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: {
        fontSize: 8.6,
        cellPadding: 5,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fontStyle: "bold",
        fillColor: [28, 54, 128],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 252],
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 100 },
        2: { cellWidth: 80 },
        3: { cellWidth: 78, halign: "right" },
        4: { cellWidth: 82, halign: "right" },
        5: { cellWidth: 145 },
      },
      didDrawPage: () => {
        drawHeader()
      },
    })

    const lastY = (doc as any).lastAutoTable?.finalY ?? y + 200
    let fy = ensureSpace(lastY + 26, 70)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.text(
      "Si no reconoces esta acción, toma contacto con la persona quien creó tu usuario o tu ejecutivo\nde la cuenta en eSIM Demo.",
      marginX,
      fy
    )
    fy += 40

    doc.text("Atentamente,", marginX, fy)
    fy += 14
    doc.text("El equipo de eSIM Demo", marginX, fy)

    const safeName = (effectiveCompanyName || "company").replace(/\s+/g, "-").toLowerCase()
    const fileName = `wallet-company-resumen-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`

    doc.save(fileName)
  }

  return (
    <Box mt={4} id="company-wallet-history">
      <Accordion
        elevation={0}
        expanded={Boolean(expanded)}
        onChange={(_, next) => onExpandedChange?.(next)}
        sx={modernAccordionSx}
      >
        <AccordionSummary
          id="company-wallet-history"
          expandIcon={
            <ExpandMoreIcon
              sx={{
                color: "#3b82f6",
                transition: "transform 0.3s ease",
              }}
            />
          }
          sx={{
            px: 3,
            py: 2,
            minHeight: 72,
            "& .MuiAccordionSummary-content": {
              margin: 0,
              alignItems: "center",
              gap: 2,
            },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
            }}
          >
            <AccountBalanceWalletIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Historial de balances (Empresa)
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontSize: "0.8125rem",
                mt: 0.25,
              }}
            >
              Ver movimientos del wallet de esta empresa
            </Typography>
          </Box>
          {total > 0 && (
            <Chip
              label={`${total} movimientos`}
              size="small"
              sx={{
                bgcolor: "rgba(59, 130, 246, 0.1)",
                color: "#3b82f6",
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 26,
                mr: 1,
              }}
            />
          )}
        </AccordionSummary>

        <AccordionDetails
          sx={{
            px: 3,
            pb: 3,
            pt: 0,
            bgcolor: "#fff",
          }}
        >
          {loading && (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Cargando historial de balances...
              </Typography>
            </Box>
          )}

          {!loading && total === 0 && (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                bgcolor: "#f8fafc",
                borderRadius: 2,
                border: "1px dashed #e2e8f0",
              }}
            >
              <AccountBalanceWalletIcon
                sx={{
                  fontSize: 40,
                  color: "#cbd5e1",
                  mb: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Esta empresa todavía no tiene movimientos en su wallet.
              </Typography>
            </Box>
          )}

          {!loading && total > 0 && (
            <>
              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPdf}
                  disabled={!canDownload}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: "#e2e8f0",
                      boxShadow: "none",
                    },
                  }}
                >
                  Descargar PDF
                </Button>
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  borderColor: "#e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={modernTableHeadCellSx}>Fecha</TableCell>
                        <TableCell sx={modernTableHeadCellSx}>Tipo</TableCell>
                        <TableCell sx={modernTableHeadCellSx}>Estado</TableCell>
                        <TableCell align="right" sx={modernTableHeadCellSx}>Monto</TableCell>
                        <TableCell align="right" sx={modernTableHeadCellSx}>Saldo luego</TableCell>
                        <TableCell sx={modernTableHeadCellSx}>Realizado por</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginated.map((tx) => {
                        const isSub =
                          tx.type === "SUBTRACT_BALANCE" || tx.metadata?.direction === "SUBTRACT"
                        const sign = isSub ? "-" : "+"
                        const isEsim = tx.type === "BUY_ESIM"

                        return (
                          <TableRow key={tx.id} sx={modernTableRowSx}>
                            <TableCell sx={modernTableCellSx}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#334155" }}>
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                {new Date(tx.createdAt).toLocaleTimeString()}
                              </Typography>
                            </TableCell>

                            <TableCell sx={modernTableCellSx}>
                              <Chip
                                label={mapTypeLabel(tx.type)}
                                size="small"
                                sx={{
                                  bgcolor: isEsim
                                    ? "rgba(139, 92, 246, 0.1)"
                                    : isSub
                                    ? "rgba(239, 68, 68, 0.1)"
                                    : "rgba(34, 197, 94, 0.1)",
                                  color: isEsim
                                    ? "#7c3aed"
                                    : isSub
                                    ? "#dc2626"
                                    : "#16a34a",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            </TableCell>

                            <TableCell sx={modernTableCellSx}>
                              <Chip
                                label={mapStatusLabel(tx.status)}
                                size="small"
                                sx={{
                                  ...getStatusChipSx(tx.status),
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  height: 24,
                                }}
                              />
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                ...modernTableCellSx,
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: isSub ? "#dc2626" : "#16a34a",
                              }}
                            >
                              {sign}
                              {Number(tx.amount).toFixed(2)} USD
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                ...modernTableCellSx,
                                fontWeight: 600,
                                color: "#334155",
                              }}
                            >
                              {Number(tx.balanceAfter).toFixed(2)} USD
                            </TableCell>

                            <TableCell sx={modernTableCellSx}>
                              <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.8125rem" }}>
                                {tx.metadata?.performedBy ? tx.metadata.performedBy.email : "N/A"}
                              </Typography>
                              {tx.metadata?.performedBy && (
                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                  {tx.metadata.performedBy.type}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage="Filas por pagina"
                  sx={{
                    borderTop: "1px solid #f1f5f9",
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                      fontSize: "0.8125rem",
                      color: "#64748b",
                    },
                    "& .MuiTablePagination-select": {
                      fontSize: "0.8125rem",
                    },
                  }}
                />
              </Paper>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
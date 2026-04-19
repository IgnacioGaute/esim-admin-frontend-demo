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
  alpha,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DownloadIcon from "@mui/icons-material/Download"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import { useFetch } from "@/shared/hooks"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import logo2x from "@/assets/images/logo/logo-2x.png"

interface Props {
  resellerId: string
  userName?: string
  userEmail?: string
}

interface Transaction {
  id: string
  createdAt: string
  type: "ADD_BALANCE" | "SUBTRACT_BALANCE" | "BUY_ESIM"
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

const mapTypeLabel = (type: Transaction["type"]) => {
  if (type === "ADD_BALANCE") return "Balances agregados"
  if (type === "SUBTRACT_BALANCE") return "Balances restados"
  if (type === "BUY_ESIM") return "Compra de eSIM"
  return type
}

const formatMoney = (n: number) => `${Number(n).toFixed(2)} USD`

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

export const UserWalletHistory = ({ resellerId, userName, userEmail }: Props) => {
  const { data: transactions, loading } = useFetch<Transaction[]>(
    resellerId ? `/wallets/transactions?resellerId=${resellerId}` : "",
    "GET",
    {
      init: !!resellerId,
      cache: { enabled: false },
    }
  )

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [expanded, setExpanded] = useState(false)

  const total = transactions?.length ?? 0
  const paginated =
    transactions?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? []

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDownloadPdf = async () => {
    if (!transactions || transactions.length === 0) return

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()

    const marginX = 70

    const title = "Historial de balances - Wallet"
    const generatedAt = new Date().toLocaleString()

    const displayUser =
      userName && userEmail
        ? `${userName} - ${userEmail}`
        : userEmail
        ? userEmail
        : userName
        ? userName
        : resellerId

    let logoDataUrl: string | null = null
    try {
      const blob = await fetch(logo2x).then((r) => r.blob())
      logoDataUrl = await blobToDataURL(blob)
    } catch {
      logoDataUrl = null
    }

    const head = [["Fecha", "Tipo", "Monto", "Saldo luego", "Realizado por", "Order ID"]]

    const body = transactions.map((tx) => {
      const isSub = tx.type === "SUBTRACT_BALANCE" || tx.metadata?.direction === "SUBTRACT"
      const sign = isSub ? "-" : "+"

      const performedBy = tx.metadata?.performedBy
        ? `${tx.metadata.performedBy.email} (${tx.metadata.performedBy.type})`
        : "N/A"

      return [
        new Date(tx.createdAt).toLocaleString(),
        mapTypeLabel(tx.type),
        `${sign}${formatMoney(tx.amount)}`,
        formatMoney(tx.balanceAfter),
        performedBy,
        tx.metadata?.orderId ?? "-",
      ]
    })

    const drawHeader = () => {
      const topY = 28

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)
      }

      const textX = logoDataUrl ? marginX + 125 : marginX

      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text(title, textX, topY + 18)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Generado: ${generatedAt}`, textX, topY + 36)
      doc.text(`Usuario: ${displayUser}`, textX, topY + 50)

      doc.setDrawColor(220)
      doc.line(marginX, topY + 78, pageWidth - marginX, topY + 78)
    }

    drawHeader()

    autoTable(doc, {
      head,
      body,
      startY: 120,

      margin: { left: marginX, right: marginX },

      tableWidth: "wrap" as any,

      theme: "grid",

      styles: {
        fontSize: 8.5,
        cellPadding: 5,
        overflow: "linebreak",
        valign: "middle",
      },

      headStyles: {
        fontStyle: "bold",
        fillColor: [23, 58, 121],
        textColor: 255,
      },

      alternateRowStyles: {
        fillColor: [245, 247, 252],
      },

      columnStyles: {
        0: { cellWidth: 125 },
        1: { cellWidth: 125 },
        2: { cellWidth: 85, halign: "right" },
        3: { cellWidth: 95, halign: "right" },
        4: { cellWidth: 170 },
        5: { cellWidth: 150 },
      },

      didDrawPage: () => {
        drawHeader()
      },
    })

    const safeName = (userName || "user").replace(/\s+/g, "-").toLowerCase()
    const fileName = `wallet-historial-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(fileName)
  }

  const canDownload = useMemo(
    () => !loading && (transactions?.length ?? 0) > 0,
    [loading, transactions]
  )

  const getTypeChip = (type: Transaction["type"]) => {
    if (type === "ADD_BALANCE") {
      return (
        <Chip
          label="Agregado"
          size="small"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
            color: "success.dark",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      )
    }
    if (type === "SUBTRACT_BALANCE") {
      return (
        <Chip
          label="Restado"
          size="small"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            color: "error.dark",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      )
    }
    return (
      <Chip
        label="Compra eSIM"
        size="small"
        sx={{
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
          color: "secondary.dark",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
    )
  }

  return (
    <Box mt={4}>
      <Accordion
        elevation={0}
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: expanded ? "primary.main" : "divider",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.04)
              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.04)
              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          transition: "all 0.3s ease",
          "&:before": { display: "none" },
          ...(expanded && {
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
          }),
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon
              sx={{
                color: expanded ? "primary.main" : "text.secondary",
                transition: "color 0.3s ease",
              }}
            />
          }
          sx={{
            px: 3,
            py: 2,
            "& .MuiAccordionSummary-content": {
              margin: 0,
              alignItems: "center",
              gap: 2,
            },
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
            }}
          >
            <AccountBalanceWalletIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box flex={1}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}
            >
              Historial de balances
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Ver movimientos de wallet de este usuario
            </Typography>
          </Box>
          {total > 0 && (
            <Chip
              label={`${total} movimiento${total !== 1 ? "s" : ""}`}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                fontWeight: 600,
              }}
            />
          )}
        </AccordionSummary>

        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
          {loading && (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Cargando historial de balances...
              </Typography>
            </Box>
          )}

          {!loading && total === 0 && (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
              }}
            >
              <ReceiptLongIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Este usuario todavia no tiene movimientos en su wallet.
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
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.5)",
                    },
                  }}
                >
                  Descargar PDF
                </Button>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.light",
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                  },
                }}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor: (theme) =>
                            theme.palette.mode === "dark"
                              ? alpha(theme.palette.common.white, 0.05)
                              : alpha(theme.palette.common.black, 0.02),
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "text.secondary",
                            borderBottom: "2px solid",
                            borderColor: "divider",
                          }}
                        >
                          Fecha
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "text.secondary",
                            borderBottom: "2px solid",
                            borderColor: "divider",
                          }}
                        >
                          Tipo
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "text.secondary",
                            borderBottom: "2px solid",
                            borderColor: "divider",
                          }}
                        >
                          Monto
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "text.secondary",
                            borderBottom: "2px solid",
                            borderColor: "divider",
                          }}
                        >
                          Saldo luego
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "text.secondary",
                            borderBottom: "2px solid",
                            borderColor: "divider",
                          }}
                        >
                          Realizado por
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginated.map((tx, index) => {
                        const isSub =
                          tx.type === "SUBTRACT_BALANCE" || tx.metadata?.direction === "SUBTRACT"
                        const sign = isSub ? "-" : "+"
                        const date = new Date(tx.createdAt)

                        return (
                          <TableRow
                            key={tx.id}
                            sx={{
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                              },
                              animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                              "@keyframes fadeIn": {
                                from: { opacity: 0, transform: "translateY(10px)" },
                                to: { opacity: 1, transform: "translateY(0)" },
                              },
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {date.toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {date.toLocaleTimeString()}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{getTypeChip(tx.type)}</TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{ color: isSub ? "error.main" : "success.main" }}
                              >
                                {sign}
                                {Number(tx.amount).toFixed(2)} USD
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={500}>
                                {Number(tx.balanceAfter).toFixed(2)} USD
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {tx.metadata?.performedBy
                                  ? `${tx.metadata.performedBy.email} (${tx.metadata.performedBy.type})`
                                  : "N/A"}
                              </Typography>
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
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.02)
                        : alpha(theme.palette.common.black, 0.01),
                    "& .MuiTablePagination-actions button": {
                      borderRadius: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      },
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

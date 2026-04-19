import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Link,
  TextField,
  Typography,
  Fade,
  alpha,
  Zoom,
} from "@mui/material"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined"
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import logo2x from "@/assets/images/logo/esim-logo.svg"

import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { useNotiAlert } from "@/shared/hooks"
import useConfirmPartnerRequest from "./hooks/useConfirmPartnerRequest"
import useRejectedPartnerRequest from "./hooks/useRejectedPartnerRequest"
import useUpdatePartnerComment from "./hooks/useUpdatePartnerComment"
import {
  BusinessIntention,
  IPartnerData,
  RequestType,
  SalesScope,
  SocialPlatform,
  Status,
} from "@/admin/utils/interfaces/partners.interface"

interface Props {
  opened: boolean
  onClose: () => void
  partner?: IPartnerData | null
  onConfirmed?: () => void
}

const getPartnerStatusLabel = (status: Status | string) => {
  switch (status) {
    case "PENDING":
      return "Pendiente"
    case "APPROVED":
      return "Aprobado"
    case "REJECTED":
      return "Rechazado"
    default:
      return String(status ?? "No disponible")
  }
}

const getStatusStyles = (status: Status | string) => {
  switch (status) {
    case "APPROVED":
      return {
        background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
        color: "#1B5E20",
        borderColor: "#81C784",
      }
    case "PENDING":
      return {
        background: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
        color: "#E65100",
        borderColor: "#FFB74D",
      }
    case "REJECTED":
      return {
        background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
        color: "#B71C1C",
        borderColor: "#E57373",
      }
    default:
      return {
        background: "linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)",
        color: "#424242",
        borderColor: "#BDBDBD",
      }
  }
}

const getRequestTypeLabel = (type: RequestType | string | null | undefined) => {
  switch (type) {
    case "OWN_USE":
      return "Personal individual"
    case "INFLUENCE":
      return "Influencer"
    case "TECH_COMPANY":
      return "Empresa Tech"
    case "TRAVEL_AGENCY":
      return "Agencia de viaje"
    case "OTHER":
      return "Otro"
    default:
      return "No disponible"
  }
}

const getBusinessIntentionLabel = (
  type: BusinessIntention | string | null | undefined
) => {
  switch (type) {
    case "SELL_TO_END_CUSTOMERS":
      return "Vender eSIMs a clientes finales"
    case "RESELL_TO_AGENCIES":
      return "Revender / distribuir a otras agencias"
    case "BOTH":
      return "Ambas"
    default:
      return "No disponible"
  }
}

const getSalesScopeLabel = (scope: SalesScope | string | null | undefined) => {
  switch (scope) {
    case "NATIONAL":
      return "Nacional"
    case "INTERNATIONAL":
      return "Internacional"
    default:
      return "No disponible"
  }
}

const getBooleanLabel = (value: boolean | null | undefined) => {
  if (value === true) return "Si"
  if (value === false) return "No"
  return "No disponible"
}

const getSocialPlatformLabel = (platform: SocialPlatform | string | null | undefined) => {
  switch (platform) {
    case "LINKEDIN":
      return "LinkedIn"
    case "INSTAGRAM":
      return "Instagram"
    case "FACEBOOK":
      return "Facebook"
    case "X":
      return "X"
    case "YOUTUBE":
      return "YouTube"
    case "OTHER":
      return "Otro"
    default:
      return "Otro"
  }
}

const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) => {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")

  return (
    <Grid item xs={12} md={6}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
          {icon && (
            <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>
              {icon}
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              fontSize: "0.65rem",
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
          {isEmpty ? "No disponible" : value}
        </Typography>
      </Box>
    </Grid>
  )
}

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

export const DetailPartnerRequest = ({ opened, onClose, partner, onConfirmed }: Props) => {
  const [loadingConfirm, setLoadingConfirm] = useState(false)
  const [loadingRejected, setLoadingRejected] = useState(false)
  const [loadingSaveComment, setLoadingSaveComment] = useState(false)
  const [comment, setComment] = useState("")
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const { confirmPartnerRequest } = useConfirmPartnerRequest()
  const { rejectedPartnerRequest } = useRejectedPartnerRequest()
  const { updatePartnerComment } = useUpdatePartnerComment()
  const { snackBarAlert } = useNotiAlert()

  useEffect(() => {
    setComment(partner?.comments ?? "")
    setIsEditingComment(false)
  }, [partner, opened])

  const handleConfirm = async () => {
    if (!partner?.id) return

    try {
      setLoadingConfirm(true)

      const resp = await confirmPartnerRequest(partner.id, comment)

      if (resp?.ok) {
        snackBarAlert("La solicitud fue aprobada correctamente", {
          variant: "success",
        })

        onConfirmed?.()
        onClose()
      }
    } finally {
      setLoadingConfirm(false)
    }
  }

  const handleRejected = async () => {
    if (!partner?.id) return

    try {
      setLoadingRejected(true)

      const resp = await rejectedPartnerRequest(partner.id, comment)

      if (resp?.ok) {
        snackBarAlert("La solicitud fue rechazada correctamente", {
          variant: "success",
        })

        onConfirmed?.()
        onClose()
      }
    } finally {
      setLoadingRejected(false)
    }
  }

  const handleSaveComment = async () => {
    if (!partner?.id) return

    try {
      setLoadingSaveComment(true)

      const resp = await updatePartnerComment(partner.id, comment)

      if (resp?.ok) {
        snackBarAlert("El comentario fue actualizado correctamente", {
          variant: "success",
        })

        setIsEditingComment(false)
        onConfirmed?.()
        onClose()
      }
    } finally {
      setLoadingSaveComment(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!partner) return
    try {
      setIsDownloading(true)

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const marginX = 52

      const logoUrl = typeof logo2x === "string" ? logo2x : (logo2x as any).src
      let logoDataUrl: string | null = null
      try {
        const blob = await fetch(logoUrl).then((r) => r.blob())
        logoDataUrl = await blobToDataURL(blob)
      } catch {
        logoDataUrl = null
      }

      const topY = 26
      if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)

      const textX = logoDataUrl ? marginX + 125 : marginX
      doc.setTextColor(0)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.text("Detalle de Solicitud de Partner", textX, topY + 16)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Empresa: ${partner.name || "No disponible"}`, textX, topY + 34)
      doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 48)
      doc.setDrawColor(210)
      doc.setLineWidth(0.8)
      doc.line(marginX, topY + 64, pageWidth - marginX, topY + 64)

      const rows: [string, string][] = [
        ["Empresa", partner.name ?? "No disponible"],
        ["RUT", partner.rut != null ? String(partner.rut) : "No disponible"],
        ["País", partner.country ?? "No disponible"],
        ["Ciudad", partner.city ?? "No disponible"],
        ["Dirección", partner.address ?? "No disponible"],
        ["Rubro", partner.commercialTour ?? "No disponible"],
        ["Tipo de solicitud", getRequestTypeLabel(partner.requestType)],
        ["Intención comercial", getBusinessIntentionLabel(partner.businessIntention)],
        ["Alcance de venta", getSalesScopeLabel(partner.salesScope)],
        ["Invierte en publicidad", getBooleanLabel(partner.willInvestInAds)],
        ["Usuario", partner.ownerName ?? "No disponible"],
        ["Cargo", partner.companyPosition ?? "No disponible"],
        ["Email", partner.email ?? "No disponible"],
        ["Teléfono", partner.phone ?? "No disponible"],
        ["Estado", getPartnerStatusLabel(partner.status)],
        ["Actualizado por", partner.updateBy ?? "No disponible"],
        ["Fecha de creación", formatterDateDDMMYYYY(partner.created_at)],
        ["Última actualización", formatterDateDDMMYYYY(partner.updated_at)],
      ]

      if (partner.socialMedia?.length) {
        partner.socialMedia.forEach((s, i) => {
          rows.push([`Red social ${i + 1}`, `${getSocialPlatformLabel(s.platform)}: ${s.url ?? ""}`])
        })
      }

      if (partner.comments?.trim()) {
        rows.push(["Comentario", partner.comments])
      }

      autoTable(doc, {
        body: rows,
        startY: topY + 80,
        margin: { left: marginX, right: marginX },
        tableWidth: pageWidth - marginX * 2,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 6, overflow: "linebreak", valign: "middle" },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [28, 54, 128], textColor: 255, cellWidth: 160 } as any,
          1: { cellWidth: "auto" } as any,
        },
        alternateRowStyles: { fillColor: [245, 247, 252] },
      })

      doc.save(`partner-detalle-${partner.name?.replace(/\s+/g, "-") ?? "solicitud"}-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  const hasCurrentComment = Boolean((partner?.comments ?? "").trim())
  const statusStyles = partner ? getStatusStyles(partner.status) : getStatusStyles("")

  return (
    <Dialog
      open={opened}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BusinessOutlinedIcon sx={{ color: "white", fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
              Detalle de Solicitud
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              {partner?.name || "Sin empresa"}
            </Typography>
          </Box>
          {partner && (
            <Chip
              label={getPartnerStatusLabel(partner.status)}
              sx={{
                ...statusStyles,
                fontWeight: 700,
                border: "1px solid",
                fontSize: "0.8rem",
                px: 1,
              }}
            />
          )}
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {!partner ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No hay datos para mostrar.</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <DetailRow
                label="Empresa"
                value={partner.name}
                icon={<BusinessOutlinedIcon sx={{ fontSize: 16 }} />}
              />
              <DetailRow label="RUT" value={partner.rut} />
              <DetailRow
                label="Pais"
                value={partner.country}
                icon={<PublicOutlinedIcon sx={{ fontSize: 16 }} />}
              />
              <DetailRow
                label="Ciudad"
                value={partner.city}
                icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />}
              />
              <DetailRow label="Direccion" value={partner.address} />
              <DetailRow
                label="Rubro"
                value={partner.commercialTour}
                icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
              />
              <DetailRow label="Tipo de solicitud" value={getRequestTypeLabel(partner.requestType)} />
              <DetailRow
                label="Intencion comercial"
                value={getBusinessIntentionLabel(partner.businessIntention)}
              />
              <DetailRow
                label="Alcance de venta"
                value={getSalesScopeLabel(partner.salesScope)}
              />
              <DetailRow
                label="Invierte en publicidad"
                value={getBooleanLabel(partner.willInvestInAds)}
              />
              <DetailRow
                label="Usuario"
                value={partner.ownerName}
                icon={<PersonOutlinedIcon sx={{ fontSize: 16 }} />}
              />
              <DetailRow label="Cargo" value={partner.companyPosition} />
              <DetailRow
                label="Email"
                value={partner.email}
                icon={<EmailOutlinedIcon sx={{ fontSize: 16 }} />}
              />
              <DetailRow
                label="Telefono"
                value={partner.phone}
                icon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
              />
              <DetailRow label="Estado" value={getPartnerStatusLabel(partner.status)} />
              <DetailRow label="Actualizado por" value={partner.updateBy} />
              <DetailRow label="Fecha de creacion" value={formatterDateDDMMYYYY(partner.created_at)} />
              <DetailRow label="Ultima actualizacion" value={formatterDateDDMMYYYY(partner.updated_at)} />

              {/* Redes sociales */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <ShareOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                        fontSize: "0.65rem",
                      }}
                    >
                      Redes sociales
                    </Typography>
                  </Box>

                  {!partner.socialMedia?.length ? (
                    <Typography variant="body1" sx={{ fontWeight: 500, color: "text.secondary" }}>
                      No disponible
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {partner.socialMedia.map((social, index) => (
                        <Box
                          key={`${social.platform}-${index}`}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                              borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: "primary.main" }}>
                            {getSocialPlatformLabel(social.platform)}
                          </Typography>

                          <Link
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ wordBreak: "break-all", fontSize: "0.875rem" }}
                          >
                            {social.url}
                          </Link>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Comentario */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                        fontSize: "0.65rem",
                      }}
                    >
                      Comentario
                    </Typography>

                    {!isEditingComment && hasCurrentComment && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setIsEditingComment(true)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      >
                        Editar
                      </Button>
                    )}

                    {!isEditingComment && !hasCurrentComment && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddCommentOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => setIsEditingComment(true)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      >
                        Agregar
                      </Button>
                    )}

                    {isEditingComment && partner.status !== "PENDING" && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                          setComment(partner?.comments ?? "")
                          setIsEditingComment(false)
                        }}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Box>

                  {!isEditingComment && hasCurrentComment && (
                    <Box
                      sx={{
                        minHeight: 100,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        px: 2,
                        py: 1.5,
                        backgroundColor: "background.paper",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        {comment}
                      </Typography>
                    </Box>
                  )}

                  {!isEditingComment && !hasCurrentComment && (
                    <Box
                      sx={{
                        minHeight: 80,
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        px: 2,
                        py: 1.5,
                        backgroundColor: "background.paper",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No hay comentario cargado.
                      </Typography>
                    </Box>
                  )}

                  {isEditingComment && (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Comentario"
                        placeholder="Escribe un comentario sobre la solicitud"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />

                      {partner.status !== "PENDING" && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveOutlinedIcon />}
                            onClick={handleSaveComment}
                            disabled={loadingSaveComment}
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: 2,
                              px: 3,
                              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                              "&:hover": {
                                boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                              },
                            }}
                          >
                            {loadingSaveComment ? "Guardando..." : "Guardar comentario"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            px: 3,
          }}
        >
          Cerrar
        </Button>

        {partner && (
          <Button
            onClick={handleDownloadPdf}
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            disabled={isDownloading}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              bgcolor: "#E60023",
              "&:hover": { bgcolor: "#C4001E" },
            }}
          >
            {isDownloading ? "Generando..." : "Descargar PDF"}
          </Button>
        )}

        {partner?.status === "PENDING" && (
          <>
            <Button
              onClick={handleRejected}
              variant="outlined"
              color="error"
              startIcon={<CancelOutlinedIcon />}
              disabled={loadingRejected || loadingConfirm}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                "&:hover": {
                  backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              {loadingRejected ? "Rechazando..." : "Rechazar"}
            </Button>

            <Button
              onClick={handleConfirm}
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlineIcon />}
              disabled={loadingConfirm || loadingRejected}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.success.main, 0.4)}`,
                "&:hover": {
                  boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.success.main, 0.5)}`,
                },
              }}
            >
              {loadingConfirm ? "Aprobando..." : "Aprobar"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

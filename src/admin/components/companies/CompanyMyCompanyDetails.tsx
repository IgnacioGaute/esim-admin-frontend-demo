import { useMemo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Link,
  Tooltip,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import AddBusinessOutlined from "@mui/icons-material/AddBusinessOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkIcon from "@mui/icons-material/Link";

import { useFetch } from "@/shared/hooks";
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface";

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER";

export enum SocialPlatform {
  LINKEDIN = "LINKEDIN",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  X = "X",
  YOUTUBE = "YOUTUBE",
  OTHER = "OTHER",
}
export type SocialLink = { platform: SocialPlatform; url: string };

interface Props {
  companyId: string;
  currentRole: Role;
  onEdit?: (companyId: string) => void;
  onCreate?: () => void;
}

const roleLabel = (role: Role) => {
  if (role === "SUPER_ADMIN") return "Super Administrador";
  if (role === "ADMIN") return "Administrador";
  return "Usuario";
};

const userRoleLabel = (t?: string) => {
  if (t === "SUPER_ADMIN") return "Super Admin";
  if (t === "ADMIN") return "Admin";
  if (t === "SELLER") return "User";
  return t || "-";
};

const paymentLabel = (v: any) => {
  if (!v) return "-";
  if (v === "PRE_PAYMENT") return "Prepago";
  if (v === "POST_PAYMENT") return "Postpago";
  return String(v);
};

const platformLabel: Record<SocialPlatform, string> = {
  [SocialPlatform.LINKEDIN]: "LinkedIn",
  [SocialPlatform.INSTAGRAM]: "Instagram",
  [SocialPlatform.FACEBOOK]: "Facebook",
  [SocialPlatform.X]: "X",
  [SocialPlatform.YOUTUBE]: "YouTube",
  [SocialPlatform.OTHER]: "Otra",
};

const platformIcon = (p: SocialPlatform) => {
  switch (p) {
    case SocialPlatform.LINKEDIN:
      return <LinkedInIcon fontSize="small" />;
    case SocialPlatform.INSTAGRAM:
      return <InstagramIcon fontSize="small" />;
    case SocialPlatform.FACEBOOK:
      return <FacebookIcon fontSize="small" />;
    case SocialPlatform.YOUTUBE:
      return <YouTubeIcon fontSize="small" />;
    case SocialPlatform.X:
      return <TwitterIcon fontSize="small" />;
    default:
      return <LinkIcon fontSize="small" />;
  }
};

const money = (n: any) => {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "-";
  return v.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const InfoRow = ({
  icon,
  label,
  value,
  isLink,
}: {
  icon: React.ReactNode;
  label: string;
  value?: any;
  isLink?: boolean;
}) => {
  const clean = value ?? "-";
  return (
    <Box
      display="flex"
      gap={1.5}
      alignItems="flex-start"
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: "primary.main",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {icon}
      </Box>

      <Box flex={1} minWidth={0}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.secondary",
            fontWeight: 500,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            fontSize: "0.68rem",
            mb: 0.25,
          }}
        >
          {label}
        </Typography>

        {isLink && clean !== "-" ? (
          <Link
            href={String(clean)}
            target="_blank"
            rel="noreferrer"
            underline="hover"
            sx={{
              fontWeight: 600,
              wordBreak: "break-word",
              color: "primary.main",
              transition: "color 0.2s",
              "&:hover": { color: "primary.dark" },
            }}
          >
            {clean}
          </Link>
        ) : (
          <Typography
            sx={{
              fontWeight: 600,
              wordBreak: "break-word",
              color: "text.primary",
              fontSize: "0.938rem",
            }}
          >
            {clean}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 4,
      height: "100%",
      bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
      border: "1px solid",
      borderColor: (theme) => alpha(theme.palette.divider, 0.08),
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
        boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.06)}`,
      },
    }}
  >
    <Box mb={2}>
      <Typography
        fontWeight={700}
        fontSize="1.05rem"
        sx={{ color: "text.primary", letterSpacing: "-0.01em" }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.25, fontSize: "0.82rem" }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    <Stack spacing={0.5}>{children}</Stack>
  </Paper>
);

const uniqueByPlatform = (arr: SocialLink[]) => {
  const seen = new Set<string>();
  return arr.filter((x) => {
    const k = String(x?.platform ?? "");
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const CompanyMyCompanyDetails = ({
  companyId,
  currentRole,
  onEdit,
  onCreate,
}: Props) => {
  const { data: company, loading } = useFetch<ICompanyData>(`companies/${companyId}`, "GET", {
    init: Boolean(companyId),
    cache: { enabled: false },
  });

  const canEdit = useMemo(
    () => currentRole === "ADMIN" || currentRole === "SUPER_ADMIN",
    [currentRole]
  );

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          borderRadius: 5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.divider, 0.1),
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <Box display="flex" gap={2} alignItems="center">
            <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 3 }} />
            <Box>
              <Skeleton variant="text" width={180} height={32} sx={{ borderRadius: 1.5 }} />
              <Skeleton variant="text" width={260} height={24} sx={{ borderRadius: 1.5, mt: 0.5 }} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={120} height={44} sx={{ borderRadius: 3 }} />
        </Box>

        <Divider sx={{ my: 3, borderColor: (theme) => alpha(theme.palette.divider, 0.08) }} />

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Paper>
    );
  }

  if (!companyId) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 5,
          bgcolor: "background.paper",
          border: "2px dashed",
          borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
        }}
      >
        <Box display="flex" gap={2.5} alignItems="flex-start">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
              color: "warning.dark",
            }}
          >
            <WarningAmberOutlined />
          </Box>

          <Box flex={1}>
            <Typography fontWeight={700} fontSize={19} sx={{ letterSpacing: "-0.01em" }}>
              Todavía no tenés una compañía asignada
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.75} sx={{ lineHeight: 1.6 }}>
              Cuando tengas una compañía, acá vas a ver los datos principales y accesos rápidos.
            </Typography>

            {canEdit && (
              <Box mt={2.5} display="flex" gap={1.5} flexWrap="wrap">
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<AddBusinessOutlined />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.25,
                    fontWeight: 600,
                    boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                    "&:hover": {
                      boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                    },
                  }}
                  onClick={() => onCreate?.()}
                >
                  Crear compañía
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.25,
                    fontWeight: 600,
                    borderWidth: 1.5,
                    "&:hover": { borderWidth: 1.5 },
                  }}
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </Box>
            )}
          </Box>

          <Chip
            label={roleLabel(currentRole)}
            size="small"
            sx={{
              borderRadius: 2.5,
              fontWeight: 600,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          />
        </Box>
      </Paper>
    );
  }

  if (!company) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 5,
          bgcolor: "background.paper",
          border: "2px dashed",
          borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
        }}
      >
        <Box display="flex" gap={2.5} alignItems="flex-start">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              color: "error.main",
            }}
          >
            <WarningAmberOutlined />
          </Box>

          <Box flex={1}>
            <Typography fontWeight={700} fontSize={19} sx={{ letterSpacing: "-0.01em" }}>
              No se pudo cargar la compañía
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.75} sx={{ lineHeight: 1.6 }}>
              Verificá la conexión o permisos. Si el problema persiste, revisá el endpoint.
            </Typography>

            <Box mt={2.5} display="flex" gap={1.5} flexWrap="wrap">
              <Button
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  px: 2.5,
                  py: 1.25,
                  fontWeight: 600,
                  borderWidth: 1.5,
                  "&:hover": { borderWidth: 1.5 },
                }}
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
              {canEdit && (
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<EditOutlined />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.25,
                    fontWeight: 600,
                    boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                    "&:hover": {
                      boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                    },
                  }}
                  onClick={() => onEdit?.(companyId)}
                >
                  Ir a editar
                </Button>
              )}
            </Box>
          </Box>

          <Chip
            label={roleLabel(currentRole)}
            size="small"
            sx={{
              borderRadius: 2.5,
              fontWeight: 600,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          />
        </Box>
      </Paper>
    );
  }

  const users = ((company as any)?.users ?? []) as any[];

  const socialRaw = (company as any)?.socialMedia;
  const socials: SocialLink[] = Array.isArray(socialRaw)
    ? uniqueByPlatform(
        socialRaw
          .filter(Boolean)
          .map((x: any) => ({
            platform: (x?.platform ?? SocialPlatform.OTHER) as SocialPlatform,
            url: String(x?.url ?? ""),
          }))
      )
    : [];

  const companyBalance = (company as any)?.companyWallet?.wallet?.balance;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.divider, 0.1),
        boxShadow: (theme) => `0 4px 40px ${alpha(theme.palette.common.black, 0.04)}`,
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
      >
        <Box display="flex" gap={2} alignItems="center">
          <Avatar
            src={(company as any).photoUrl ?? undefined}
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3.5,
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
              color: "primary.main",
              fontSize: "1.4rem",
              fontWeight: 700,
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            {!(company as any).photoUrl
              ? (company.name ? String(company.name)[0].toUpperCase() : <BusinessOutlined sx={{ fontSize: 28 }} />)
              : null}
          </Avatar>

          <Box>
            <Typography
              fontWeight={800}
              fontSize={{ xs: 20, sm: 24 }}
              sx={{ letterSpacing: "-0.02em", lineHeight: 1.2, color: "text.primary" }}
            >
              {company.name}
            </Typography>

            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label="Mi compañía"
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  border: "none",
                }}
              />
              <Chip
                size="small"
                label={roleLabel(currentRole)}
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  borderColor: (theme) => alpha(theme.palette.divider, 0.3),
                }}
              />

              <Chip
                size="small"
                label={`USD ${money(companyBalance)}`}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: "success.dark",
                  border: "none",
                }}
              />

              {(company as any)?.paymentType && (
                <Chip
                  size="small"
                  label={paymentLabel((company as any).paymentType)}
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    borderColor: (theme) => alpha(theme.palette.divider, 0.3),
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {canEdit && (
          <Tooltip title="Editar compañía" arrow>
            <Button
              variant="contained"
              disableElevation
              startIcon={<EditOutlined />}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                px: 2.5,
                py: 1.25,
                fontWeight: 600,
                boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                },
              }}
              onClick={() => onEdit?.(company.id)}
            >
              Editar
            </Button>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ my: 3, borderColor: (theme) => alpha(theme.palette.divider, 0.08) }} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Datos generales" subtitle="Información principal de la empresa">
            <InfoRow icon={<BadgeOutlined fontSize="small" />} label="RUT" value={(company as any).rut} />

            <InfoRow
              icon={<CreditCardOutlined fontSize="small" />}
              label="Balance disponible"
              value={`USD ${money(companyBalance)}`}
            />

            <InfoRow
              icon={<CreditCardOutlined fontSize="small" />}
              label="Tipo de pago"
              value={paymentLabel((company as any).paymentType)}
            />

            <InfoRow
              icon={<BusinessOutlined fontSize="small" />}
              label="Giro comercial"
              value={(company as any).commercialTour}
            />
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard title="Ubicación / Contacto" subtitle="Dirección y enlaces">
            <InfoRow
              icon={<LocationOnOutlined fontSize="small" />}
              label="Dirección"
              value={(company as any).address}
            />
            <InfoRow
              icon={<LocationOnOutlined fontSize="small" />}
              label="Ciudad / País"
              value={
                [(company as any).city ?? null, (company as any).country ?? null]
                  .filter(Boolean)
                  .join(", ") || "-"
              }
            />

            <InfoRow
              icon={<LanguageOutlined fontSize="small" />}
              label="Website"
              value={(company as any).website}
              isLink
            />

            <Box sx={{ p: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  fontSize: "0.68rem",
                  mb: 1,
                }}
              >
                Redes sociales
              </Typography>

              {!socials.length ? (
                <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>-</Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {socials.map((s, idx) => (
                    <Chip
                      key={`${s.platform}-${idx}`}
                      icon={platformIcon(s.platform)}
                      label={platformLabel[s.platform] ?? s.platform}
                      clickable={Boolean(s.url)}
                      component={s.url ? "a" : "div"}
                      href={s.url || undefined}
                      target={s.url ? "_blank" : undefined}
                      rel={s.url ? "noreferrer" : undefined}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        border: "1px solid",
                        borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                        bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                        },
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Usuarios */}
      <Box mt={3}>
        <SectionCard title="Usuarios" subtitle="Usuarios asociados a la compañía">
          {!users.length ? (
            <Typography variant="body2" sx={{ color: "text.secondary", p: 1.5 }}>
              Esta compañía todavía no tiene usuarios asociados.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {users.map((u) => (
                <Accordion
                  key={u.id}
                  defaultExpanded={false}
                  elevation={0}
                  disableGutters
                  sx={{
                    borderRadius: "16px !important",
                    border: "1px solid",
                    borderColor: (theme) => alpha(theme.palette.divider, 0.12),
                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.4),
                    overflow: "hidden",
                    transition: "all 0.2s ease-in-out",
                    "&:before": { display: "none" },
                    "&:hover": {
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                    "&.Mui-expanded": {
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                      boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{
                          color: "text.secondary",
                          transition: "transform 0.3s ease-in-out",
                        }}
                      />
                    }
                    sx={{
                      px: 2,
                      py: 1,
                      "& .MuiAccordionSummary-content": {
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
                      <Avatar
                        src={u.photoUrl ?? undefined}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2.5,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          color: "primary.main",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                        }}
                      >
                        {!u.photoUrl
                          ? (u.name ? String(u.name)[0].toUpperCase() : <PersonOutlineIcon fontSize="small" />)
                          : null}
                      </Avatar>

                      <Typography fontWeight={700} noWrap sx={{ maxWidth: 240 }}>
                        {u.name || "Sin nombre"}
                      </Typography>
                    </Stack>

                    <Chip
                      size="small"
                      label={userRoleLabel(u.type)}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        bgcolor: (theme) =>
                          u.type === "SUPER_ADMIN" || u.type === "ADMIN"
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha(theme.palette.grey[500], 0.1),
                        color: u.type === "SUPER_ADMIN" || u.type === "ADMIN" ? "primary.main" : "text.secondary",
                        border: "none",
                      }}
                    />
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <InfoRow icon={<PersonOutlineIcon fontSize="small" />} label="Nombre" value={u.name} />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <InfoRow icon={<MailOutlineIcon fontSize="small" />} label="Email" value={u.email} />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <InfoRow
                          icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
                          label="Rol"
                          value={userRoleLabel(u.type)}
                        />
                      </Grid>

                      {u.phone ? (
                        <Grid item xs={12} sm={6}>
                          <InfoRow icon={<BadgeOutlined fontSize="small" />} label="Teléfono" value={u.phone} />
                        </Grid>
                      ) : null}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}
        </SectionCard>
      </Box>
    </Paper>
  );
};

import { Box, Chip, Stack, Typography, alpha } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import { RuleScopeType, RuleType } from "@/admin/utils/interfaces/rule-user.interface"

const SCOPE_TYPE: RuleScopeType[] = ["BUNDLE", "COUNTRY"]
const TYPE: RuleType[] = ["INCLUSION", "EXCLUSION"]

interface Props {
  onChange: (key: keyof IRuleUserByFilter, value: any) => void
  ruleFilter: IRuleUserByFilter
}

export interface IRuleUserByFilter {
  scope_type: RuleScopeType | "all"
  type: RuleType | "all"
}

const sectionLabelSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  mb: 1.25,
}

const chipGroupSx = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 0.75,
}

const SCOPE_OPTIONS = [
  { value: "all", label: "Todos" },
  ...SCOPE_TYPE.map((v) => ({ value: v, label: v === "BUNDLE" ? "Bundle" : "País" })),
]

const TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "INCLUSION", label: "Inclusión", color: "#2e7d32" },
  { value: "EXCLUSION", label: "Exclusión", color: "#c62828" },
]

export const FilterRuleUser = ({ onChange, ruleFilter }: Props) => {
  return (
    <Box sx={{ px: 0.5, py: 0.5 }}>
      <Stack spacing={2.5}>

        {/* ── Sección 1: General ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <FilterListOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              General
            </Typography>
          </Box>

          <Stack spacing={2}>
            {/* Tipo de ámbito */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Tipo de ámbito
              </Typography>
              <Box sx={chipGroupSx}>
                {SCOPE_OPTIONS.map((opt) => {
                  const active = ruleFilter.scope_type === opt.value
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("scope_type", opt.value)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        borderRadius: "10px",
                        height: 30,
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        bgcolor: active
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : (theme) => alpha(theme.palette.text.secondary, 0.07),
                        color: active ? "primary.main" : "text.secondary",
                        border: "1.5px solid",
                        borderColor: active ? "primary.main" : "transparent",
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </Box>

            {/* Tipo */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Tipo
              </Typography>
              <Box sx={chipGroupSx}>
                {TYPE_OPTIONS.map((opt) => {
                  const active = ruleFilter.type === opt.value
                  const color = (opt as any).color || ""
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("type", opt.value)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        borderRadius: "10px",
                        height: 30,
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        bgcolor: active && color
                          ? `${color}18`
                          : active
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : (theme) => alpha(theme.palette.text.secondary, 0.07),
                        color: active && color ? color : active ? "primary.main" : "text.secondary",
                        border: "1.5px solid",
                        borderColor: active && color ? color : active ? "primary.main" : "transparent",
                        "&:hover": {
                          bgcolor: color ? `${color}14` : (theme: any) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          </Stack>
        </Box>

      </Stack>
    </Box>
  )
}

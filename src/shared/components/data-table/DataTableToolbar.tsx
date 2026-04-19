import { useState, memo, ReactNode } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  InputBase,
  Toolbar,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material"
import { alpha, styled } from "@mui/material/styles"

import DeleteIcon from "@mui/icons-material/Delete"
import FilterListIcon from "@mui/icons-material/FilterList"
import { SearchOutlined, EditOutlined, HelpOutline } from "@mui/icons-material"
import { useScreenSize } from "@/shared/hooks/useScreenSize"

interface EnhancedTableToolbarProps {
  numSelected?: number
  onChangeSearch?: (value: string) => void
  onEdit?: () => void
  onDelete?: () => void
  filterChildren?: ReactNode
  onApplyFilter?: () => void
  onResetFilter?: () => void
  title?: string
  description?: ReactNode
  childrenLeft?: ReactNode

  // ✅ NUEVAS PROPS
  showSearch?: boolean
  showFilterButton?: boolean

  searchPlaceholder?: string
}

export const DataTableToolbar = memo((props: EnhancedTableToolbarProps) => {
  const {
    numSelected = 0,
    filterChildren,
    onEdit,
    onDelete,
    onChangeSearch,
    onApplyFilter,
    onResetFilter,
    title,
    description,
    childrenLeft,

    // ✅ defaults
    showSearch = true,
    showFilterButton = true,
    searchPlaceholder = "Buscar…",
  } = props

  const { width } = useScreenSize()
  const [inputSearch, setinputSearch] = useState("")
  const [showFilter, setShowFilter] = useState(false)

  const [openTooltip, setOpenTooltip] = useState(false)

  const handleTooltipClose = () => setOpenTooltip(false)
  const handleTooltipOpen = () => setOpenTooltip(true)

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: "1 1 100%" }} color="inherit" variant="subtitle1" component="div">
          {numSelected} seleccionado
        </Typography>
      ) : (
        <Box sx={{ flex: "1 1 100%" }}>
          {childrenLeft}

          {title && (
            <ClickAwayListener onClickAway={handleTooltipClose}>
              <Typography sx={{ flex: "1 1 100%" }} variant="subtitle2" component="div" color="primary">
                {title}{" "}
                {description && (
                  <HtmlTooltip
                    onClose={handleTooltipClose}
                    open={openTooltip}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    arrow
                    placement={width > 761 ? "right-start" : "bottom"}
                    PopperProps={{ disablePortal: true }}
                    title={
                      <>
                        <Typography variant="subtitle2" component="div" color="primary" mb={"5px"}>
                          {title}
                        </Typography>
                        {description}
                      </>
                    }
                  >
                    <IconButton
                      size="small"
                      sx={{ fontSize: "1.05rem", padding: "0" }}
                      color="primary"
                      onClick={handleTooltipOpen}
                    >
                      <HelpOutline fontSize="inherit" />
                    </IconButton>
                  </HtmlTooltip>
                )}
              </Typography>
            </ClickAwayListener>
          )}

          {/* ✅ BUSCADOR CONTROLADO POR showSearch */}
          {showSearch !== false && onChangeSearch && (
            <Search>
              <SearchIconWrapper>
                <SearchOutlined sx={{ color: "#6E6E71" }} />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder={searchPlaceholder}
                inputProps={{ "aria-label": "search" }}
                onChange={(e) => {
                  setinputSearch(e.target.value)
                  onChangeSearch(e.target.value)
                }}
                value={inputSearch}
              />
            </Search>
          )}
        </Box>
      )}

      {numSelected > 0 ? (
        <>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton onClick={onEdit}>
                <EditOutlined fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip title="Delete">
              <IconButton onClick={onDelete}>
                <DeleteIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : (
        <>
          {/* ✅ BOTÓN FILTRO CONTROLADO POR showFilterButton */}
          {filterChildren && showFilterButton !== false && (
            <Tooltip title="Filtrar por rango de fechas">
              <IconButton onClick={() => setShowFilter(true)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}

      <Dialog
        open={showFilter}
        maxWidth="sm"
        fullWidth={true}
        BackdropProps={{ sx: { backgroundColor: "transparent" } }}
        onClose={() => setShowFilter(false)}
      >
        <DialogTitle id="responsive-dialog-title" padding={"16px 16px !important"}>
          Filtrar por:
        </DialogTitle>

        <Card elevation={0} sx={{ overflow: "auto" }}>
          <CardContent>{filterChildren}</CardContent>
        </Card>

        <DialogActions>
          <Box width="100%" display="flex" flexDirection="row" justifyContent="space-between">
            <Box>
              <Button
                autoFocus
                onClick={() => {
                  if (onResetFilter) onResetFilter()
                  setShowFilter(false)
                }}
                color="inherit"
                sx={{ textTransform: "capitalize", marginRight: 2 }}
              >
                Resetear
              </Button>
            </Box>

            <Box flex={1} justifyContent="flex-end" display="flex">
              <Button
                autoFocus
                onClick={() => setShowFilter(false)}
                color="secondary"
                sx={{ textTransform: "capitalize", marginRight: 2 }}
              >
                Cancelar
              </Button>

              <Button
                autoFocus
                variant="outlined"
                onClick={() => {
                  if (onApplyFilter) onApplyFilter()
                  setShowFilter(false)
                }}
                disableElevation
                color="primary"
                sx={{ textTransform: "capitalize" }}
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>
    </Toolbar>
  )
})

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}))

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, "8px"),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6E6E71",
  zIndex: 1,
}))
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    fontSize: "0.85rem",          // ✅ más chico (probá 0.8rem / 0.75rem)
    lineHeight: 1.2,              // ✅ opcional
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing("24px")})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    backgroundColor: "#F6F6F7",
    color: "#6E6E71",
    borderRadius: "4px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    [theme.breakpoints.up("md")]: {
      width: "40ch",
    },
  },
}))

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
  ["& .MuiTooltip-arrow "]: {
    color: "#dadde9",
  },
}))

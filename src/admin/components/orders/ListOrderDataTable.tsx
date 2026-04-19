import { useEffect, useMemo, useState } from "react"
import { Box, Button, Chip, Drawer, IconButton, Stack, Typography, Fade, Divider, alpha } from "@mui/material"
import { Visibility, ShoppingCart, TipsAndUpdates } from "@mui/icons-material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import logo2x from "@/assets/images/logo/esim-logo.svg"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { IOrdersListDataTable } from "@/admin/utils/interfaces/order-data.interfaces"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { FilterOrderDataTable, IDataOrderByFilter } from "./FilterOrderDataTable"

import { onFilterDataTable, onSearchDataTable } from "@/shared/helpers/hooks/useDataTableHelper"

interface Props {
  ordersList: IOrdersListDataTable[]
  resellerOptions: Array<{ value: string; label: string }>
  onShowOrder: (order: IOrdersListDataTable) => void
  loading?: boolean
  isSuperAdmin?: boolean
}

const initOrderFilter: IDataOrderByFilter = {
  channel: "all",
  state_order: "all",
  reseller: "all",

  order_date: "",

  salePrice: "",
  esimCost: "",
  marginPercent: "",
  marginMoney: "",
  quantity: "",
  totalPrice: "",
}
const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const formatUsdNoUs = (n: number) => {
  const num = Number.isFinite(n) ? n : 0
  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
  return `$ ${formatted}`
}

const normalize = (v: any) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")

const parseIntLoose = (raw: string) => {
  const t = String(raw ?? "").trim()
  if (!t) return null
  const normalized = t.replace(/\./g, "").replace(",", ".")
  const n = Number.parseFloat(normalized)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

const intBucket = (value: any) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return n >= 0 ? Math.floor(n) : Math.ceil(n)
}

const inBucket = (value: number, bucketInt: number) => {
  const min = bucketInt
  const max = bucketInt + 0.999999
  return value >= min && value <= max
}

const parseNumLoose = (raw: string) => {
  const t = String(raw ?? "").trim()
  if (!t) return null
  const normalized = t.replace(/\./g, "").replace(",", ".")
  const n = Number.parseFloat(normalized)
  return Number.isFinite(n) ? n : null
}

type IOrderRow = IOrdersListDataTable & {
  resellerName: string
  resellerWebsite: string
  resellerNameNorm: string
  resellerId: string

  salePrice: number
  esimCost: number

  marginAmount: number
  marginPct: number

  totalPrice: number
  quantity: number

  order_date: any

  salePriceText: string
  esimCostText: string
  marginPctText: string
  marginAmountText: string
  totalText: string
  totalPriceText: string
  quantityText: string
}

const getResellerName = (
  row: IOrdersListDataTable,
  resellerOptions: Array<{ value: string; label: string }>
) => {
  const resellerId =
    String((row as any).resellerId ?? "").trim() ||
    String((row as any).reseller_id ?? "").trim() ||
    String((row as any).resellerUserId ?? "").trim() ||
    String((row as any).resellerUser?.id ?? "").trim() ||
    "";

  const optionLabel =
    resellerOptions.find((r) => String(r.value) === resellerId)?.label ?? "";

  const v =
    String((row as any).resellerName ?? "").trim() ||
    String((row as any).reseller_name ?? "").trim() ||
    String((row as any).resellerUser?.name ?? "").trim() ||
    optionLabel.trim() ||
    String((row as any).userName ?? "").trim() ||
    "-";

  return v || "-";
};

const getResellerId = (row: IOrdersListDataTable) => {
  return (
    String((row as any).resellerId ?? "").trim() ||
    String((row as any).reseller_id ?? "").trim() ||
    String((row as any).resellerUserId ?? "").trim() ||
    String((row as any).resellerUser?.id ?? "").trim() ||
    String((row as any).userId ?? "").trim() ||
    ""
  );
};

const getResellerWebsite = (row: IOrdersListDataTable) => {
  const v =
    String((row as any).resellerWebsite ?? "").trim() ||
    String((row as any).reseller_website ?? "").trim() ||
    String((row as any).website ?? "").trim() ||
    "-"
  return v || "-"
}

const calcSalePriceUnit = (row: IOrdersListDataTable) => {
  const total = Number((row as any).total ?? 0)
  const products = (row as any).products
  const qtyFromProducts =
    Array.isArray(products) && products.length
      ? products.reduce((s: number, p: any) => s + Number(p.quantity ?? 0), 0)
      : 0
  const qty = Number((row as any).quantity ?? 0) || qtyFromProducts
  if (!qty) return 0
  return total / qty
}

const calcOriginalEsimCostUnit = (row: IOrdersListDataTable) => {
  const products = (row as any).products
  if (Array.isArray(products) && products.length) {
    const totalQty = products.reduce((s: number, p: any) => s + Number(p.quantity ?? 0), 0) || 0
    if (!totalQty) return 0

    const totalOriginal = products.reduce((s: number, p: any) => {
      const q = Number(p.quantity ?? 0)
      const c = Number(p.originalPrice ?? p.original_price ?? 0) || 0
      return s + q * c
    }, 0)

    return totalOriginal / totalQty
  }
  return 0
}

const calcQty = (row: IOrdersListDataTable) => {
  const products = (row as any).products
  const qtyFromProducts =
    Array.isArray(products) && products.length
      ? products.reduce((s: number, p: any) => s + Number(p.quantity ?? 0), 0)
      : 0
  return Number((row as any).quantity ?? 0) || qtyFromProducts || 0
}

const calcMargin = (salePriceUnit: number, esimOriginalCostUnit: number) => {
  const marginAmount = salePriceUnit - esimOriginalCostUnit
  const marginPct = esimOriginalCostUnit > 0 ? (marginAmount / esimOriginalCostUnit) * 100 : 0
  return { marginAmount, marginPct }
}

const hasMeaningfulNumber = (v: any) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0
}

const esimCostLabel = (row: IOrderRow) => {
  if (!hasMeaningfulNumber(row.esimCost)) return "No disponible"
  return formatUsdNoUs(Number(row.esimCost))
}

const marginWhy = (row: IOrderRow) => {
  if (!hasMeaningfulNumber(row.esimCost)) return "No disponible"
  return null
}

const marginPctLabel = (row: IOrderRow) => {
  const why = marginWhy(row)
  if (why) return why
  return `${Number(row.marginPct ?? 0).toFixed(0)}%`
}

const marginAmountLabel = (row: IOrderRow) => {
  const why = marginWhy(row)
  if (why) return why
  return formatUsdNoUs(Number(row.marginAmount ?? 0))
}

const modernButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  px: 2.5,
  py: 1,
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
  },
}

export const ListOrderDataTable = ({ ordersList, resellerOptions, onShowOrder, loading, isSuperAdmin }: Props) => {
  const [filterOrder, setFilterOrder] = useState<IDataOrderByFilter>(initOrderFilter)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const superAdminColumnIds = new Set(["salePrice", "esimCost", "marginPct", "marginAmount", "userName", "resellerName", "channel"])
  const activeHeadCells = isSuperAdmin
    ? headCells
    : headCells.filter((c) => !superAdminColumnIds.has(String(c.id)))

  function addDaysYmd(ymd: string, days: number) {
    const [y, m, d] = ymd.split("-").map(Number)
    const dt = new Date(y, (m || 1) - 1, d || 1)
    dt.setDate(dt.getDate() + days)

    const yy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, "0")
    const dd = String(dt.getDate()).padStart(2, "0")
    return `${yy}-${mm}-${dd}`
  }

  function formatDDMMYYYYSafe(v: any) {
    const ymd = String(v ?? "").trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      const [y, m, d] = ymd.split("-")
      return `${d}/${m}/${y}`
    }
    return formatterDateDDMMYYYY(v)
  }

  function ymdStart(ymd: string) {
    return `${ymd}T00:00:00`
  }

  function toYmd(v: any): string {
    if (!v) return ""

    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      const y = v.getFullYear()
      const m = String(v.getMonth() + 1).padStart(2, "0")
      const d = String(v.getDate()).padStart(2, "0")
      return `${y}-${m}-${d}`
    }

    const s0 = String(v).trim()
    if (!s0) return ""

    const s = s0.replace("T", " ").split(" ")[0]

    let m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`

    m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/)
    if (m) {
      const a = Number(m[1])
      const b = Number(m[2])
      const yyyy = m[3]

      const valid = (dd: number, mm: number) => mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31

      if (valid(a, b)) return `${yyyy}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`

      if (valid(b, a)) return `${yyyy}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`

      return ""
    }

    const asNum = Number(s0)
    if (Number.isFinite(asNum)) {
      const ms = asNum < 1e12 ? asNum * 1000 : asNum
      const d = new Date(ms)
      if (!Number.isNaN(d.getTime())) return toYmd(d)
    }

    const d = new Date(s0)
    if (!Number.isNaN(d.getTime())) return toYmd(d)

    return ""
  }

  function toYmdStable(v: any): string {
    if (!v) return ""

    const s = String(v).trim()
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
    if (m) return m[1]

    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      const y = v.getFullYear()
      const mm = String(v.getMonth() + 1).padStart(2, "0")
      const dd = String(v.getDate()).padStart(2, "0")
      return `${y}-${mm}-${dd}`
    }

    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return ""
    const y = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${y}-${mm}-${dd}`
  }

const ordersWithComputed = useMemo<IOrderRow[]>(() => {
  return ordersList.map((o) => {
    const salePrice = calcSalePriceUnit(o)
    const esimCost = calcOriginalEsimCostUnit(o)
    const { marginAmount, marginPct } = calcMargin(salePrice, esimCost)

    const totalVenta = Number((o as any).total ?? 0)
    const qty = calcQty(o)
    const orderDateRaw = (o as any).order_date ?? (o as any).created_at
    const orderDateYmd = toYmdStable(orderDateRaw)

    const resellerName = getResellerName(o, resellerOptions)

    return {
      ...o,
      resellerName,
      resellerNameNorm: normalize(resellerName),
      resellerWebsite: getResellerWebsite(o),
      resellerId: getResellerId(o),

      salePrice,
      esimCost,
      marginAmount,
      marginPct,
      totalPrice: totalVenta,
      quantity: qty,
      order_date: orderDateYmd,

      salePriceText: Number.isFinite(salePrice) ? salePrice.toFixed(2) : "",
      esimCostText: Number.isFinite(esimCost) ? esimCost.toFixed(2) : "",
      marginPctText: Number.isFinite(marginPct) ? marginPct.toFixed(2) : "",
      marginAmountText: Number.isFinite(marginAmount) ? marginAmount.toFixed(2) : "",
      totalText: Number.isFinite(totalVenta) ? totalVenta.toFixed(2) : "",
      totalPriceText: Number.isFinite(totalVenta) ? totalVenta.toFixed(2) : "",
      quantityText: Number.isFinite(qty) ? String(qty) : "",
    }
  })
}, [ordersList, resellerOptions])

  const numericOptions = useMemo(() => {
    const toNum = (v: any) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }

    const bucketInt = (n: number) => (n >= 0 ? Math.floor(n) : Math.ceil(n))

    const uniqSorted = (arr: number[]) =>
      Array.from(new Set(arr))
        .sort((a, b) => a - b)
        .map(String)

    const saleBuckets: number[] = []
    const costBuckets: number[] = []
    const marginMoneyBuckets: number[] = []
    const qtyInts: number[] = []
    const totalBuckets: number[] = []

    ;(ordersWithComputed ?? []).forEach((r: any) => {
      const sp = toNum(r.salePrice)
      if (sp !== null) saleBuckets.push(bucketInt(sp))

      const ec = toNum(r.esimCost)
      if (ec !== null) costBuckets.push(bucketInt(ec))

      const mm = toNum(r.marginAmount)
      if (mm !== null) marginMoneyBuckets.push(bucketInt(mm))

      const q = toNum(r.quantity)
      if (q !== null) qtyInts.push(Math.trunc(q))

      const tp = toNum(r.totalPrice)
      if (tp !== null) totalBuckets.push(bucketInt(tp))
    })

    return {
      salePriceOptions: uniqSorted(saleBuckets),
      esimCostOptions: uniqSorted(costBuckets),
      marginMoneyOptions: uniqSorted(marginMoneyBuckets),
      quantityOptions: uniqSorted(qtyInts),
      totalPriceOptions: uniqSorted(totalBuckets),
    }
  }, [ordersWithComputed])

  const ordersWithUiFiltersApplied = useMemo(() => {
    let result = ordersWithComputed

    if (filterOrder.channel && filterOrder.channel !== "all") {
      result = result.filter((r) => String(r.channel ?? "") === filterOrder.channel)
    }

    if (filterOrder.state_order && filterOrder.state_order !== "all") {
      result = result.filter((r: any) => String((r as any).state_order ?? "") === filterOrder.state_order)
    }

    const selRes = normalize(filterOrder.reseller)
    if (selRes && selRes !== "all") {
      result = result.filter((r) => normalize(r.resellerName).includes(selRes))
    }

    const sp = parseIntLoose(filterOrder.salePrice)
    if (sp !== null) result = result.filter((r) => inBucket(Number(r.salePrice ?? 0), sp))

    const ec = parseIntLoose(filterOrder.esimCost)
    if (ec !== null) result = result.filter((r) => inBucket(Number(r.esimCost ?? 0), ec))

    const mp = parseIntLoose(filterOrder.marginPercent)
    if (mp !== null) result = result.filter((r) => intBucket(r.marginPct) === mp)

    const mm = parseIntLoose(filterOrder.marginMoney)
    if (mm !== null) result = result.filter((r) => intBucket(r.marginAmount) === mm)

    const q = parseIntLoose(filterOrder.quantity)
    if (q !== null) result = result.filter((r) => Math.trunc(Number(r.quantity ?? 0)) === q)

    const tp = parseIntLoose(filterOrder.totalPrice)
    if (tp !== null) result = result.filter((r) => inBucket(Number(r.totalPrice ?? 0), tp))

    const od = toYmdStable(filterOrder.order_date)
    if (od) {
      result = result.filter((r: any) => toYmdStable(r.order_date ?? r.created_at) === od)
    }

    return result
  }, [ordersWithComputed, filterOrder])

  const {
    ListItemTable,
    ItemDataTable,
    onSearch,
    onSetFilter,
    onApplyFilter,
    pagination,
    DataTableHead,
    selected,
    rows,
    dataByFilter,
  } = useDataTable<IOrderRow>(activeHeadCells, ordersWithUiFiltersApplied, "created_at", {
    fieldsSearchExtra: [
      "resellerId",
      "resellerNameNorm",
      "salePrice",
      "salePriceText",
      "esimCost",
      "esimCostText",
      "marginPct",
      "marginPctText",
      "marginAmount",
      "marginAmountText",
      "total",
      "totalText",
      "resellerName",
      "resellerWebsite",
      "productId",
      "referenceId",
      "userSurname",
      "userEmail",
      "totalPrice",
      "totalPriceText",
      "quantity",
      "quantityText",
      "order_date",
    ] as any,
    showCheckbocHead: false,
  })

  useEffect(() => {
    onApplyFilter(dataByFilter ?? [], true)
  }, [ordersWithUiFiltersApplied])

  const rowsForExport = useMemo(() => {
    let result = ordersWithUiFiltersApplied.map((item: any, idx: number) => ({
      ...item,
      id_data_table: idx + 1,
    }))

    if (dataByFilter?.length) {
      result = onFilterDataTable(result as any, dataByFilter as any) as any
    }

    const q = (searchText || "").trim()
    if (q) {
      let fields: any[] = []
      activeHeadCells.forEach(({ id }) => fields.push(id))

      fields = [
        ...fields,
        "salePrice",
        "salePriceText",
        "esimCost",
        "esimCostText",
        "marginPct",
        "marginPctText",
        "marginAmount",
        "marginAmountText",
        "totalText",
        "resellerName",
        "resellerWebsite",
        "productId",
        "referenceId",
        "userSurname",
        "userEmail",
        "totalPrice",
        "totalPriceText",
        "quantity",
        "quantityText",
        "order_date",
      ]

      result = onSearchDataTable(q, fields as any, result as any, "id_data_table") as any
    }

    return result as IOrderRow[]
  }, [ordersWithUiFiltersApplied, dataByFilter, searchText])

  const handleDownloadPdf = async () => {
    try {
      if (!rowsForExport.length) return
      setIsDownloading(true)

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const marginX = 52
      const safeRight = pageWidth - marginX

      const logoUrl = typeof logo2x === "string" ? logo2x : (logo2x as any).src

      let logoDataUrl: string | null = null
      try {
        const blob = await fetch(logoUrl).then((r) => r.blob())
        logoDataUrl = await blobToDataURL(blob)
      } catch {
        logoDataUrl = null
      }

      const hr = (y: number) => {
        doc.setDrawColor(210)
        doc.setLineWidth(0.8)
        doc.line(marginX, y, safeRight, y)
      }

      const drawHeader = () => {
        const topY = 26

        if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)

        const textX = logoDataUrl ? marginX + 125 : marginX

        doc.setTextColor(0)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Listado de Ordenes", textX, topY + 16)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
        doc.text(`Registros: ${rowsForExport.length}`, textX, topY + 48)

        hr(topY + 64)
      }

      drawHeader()

      const head = [
        [
          "Bundle",
          "Cliente",
          "Fecha Orden",
          "N Orden",
          "Canal",
          "Reseller",
          "Precio Venta",
          "Costo eSIM",
          "Margen %",
          "Margen $",
          "Cantidad",
          "Total Venta",
        ],
      ]

      const body = rowsForExport.map((row) => {
        const cliente =
          row.channel === "RESELLER"
            ? "Compra reseller"
            : `${row.userName ?? ""} ${row.userSurname ?? ""}`.trim();

        const costTxt = hasMeaningfulNumber(row.esimCost) ? formatUsdNoUs(row.esimCost) : "Pendiente de registro"

        const marginPctTxt = hasMeaningfulNumber(row.esimCost)
          ? `${Number(row.marginPct ?? 0).toFixed(0)}%`
          : "No calculable (sin costo original)"

        const marginAmtTxt = hasMeaningfulNumber(row.esimCost)
          ? formatUsdNoUs(Number(row.marginAmount ?? 0))
          : "No calculable (sin costo original)"

        const qty = Number(row.quantity ?? 0)

        return [
          `${row.product_desp ?? ""}\n${row.productId ?? ""}`,
          `${cliente}\n${row.userEmail ?? ""}`,
          formatDDMMYYYYSafe((row as any).order_date ?? row.created_at),
          row.buy_order ?? "",
          row.channel ?? "",
          row.resellerName ?? "-",
          hasMeaningfulNumber(row.salePrice) ? formatUsdNoUs(row.salePrice) : "-",
          costTxt,
          marginPctTxt,
          marginAmtTxt,
          Number(qty ?? 0).toFixed(0),
          formatUsdNoUs(Number(row.total ?? 0)),
        ]
      })

      const TOP_TABLE_Y = 110

      autoTable(doc, {
        head,
        body,
        startY: TOP_TABLE_Y,
        margin: { left: marginX, right: marginX, top: TOP_TABLE_Y },
        theme: "grid",
        styles: {
          fontSize: 8.2,
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
        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      const fileName = `ordenes-${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(fileName)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSearch = (value: any) => {
    const v = typeof value === "string" ? value : String(value?.target?.value ?? "")
    setSearchText(v)
    onSearch(v)
  }

  const handleFilterChange = (field: keyof IDataOrderByFilter, value: string) => {
    setFilterOrder((prev) => {
      if (field === "order_date") {
        const ymd = toYmdStable(value)
        const nextDay = ymd ? addDaysYmd(ymd, 1) : ""
        onSetFilter("order_date" as any, "date-from", ymd ? ymdStart(ymd) : "")
        onSetFilter("order_date" as any, "date-to", nextDay ? ymdStart(nextDay) : "")
        return { ...prev, order_date: value }
      }
      if (field === "channel" || field === "state_order") {
        onSetFilter(field as any, "=", value)
        return { ...prev, [field]: value }
      }
      return { ...prev, [field]: value } as IDataOrderByFilter
    })
  }

  const handleReset = () => {
    setFilterOrder(initOrderFilter)
    setSearchText("")
    onSetFilter("order_date" as any, "date-from", "")
    onSetFilter("order_date" as any, "date-to", "")
    onSetFilter("channel" as any, "=", "all" as any)
    onSetFilter("state_order" as any, "=", "all" as any)
    onApplyFilter([], true)
  }

  const removeFilter = (key: keyof IDataOrderByFilter) => {
    handleFilterChange(key, initOrderFilter[key])
  }

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: keyof IDataOrderByFilter; label: string }> = []
    const stateLabels: Record<string, string> = {
      initialized: "Inicializados", paid: "Pagados", rejected: "Rechazados", canceled: "Cancelados",
    }
    if (filterOrder.channel && filterOrder.channel !== "all")
      chips.push({ key: "channel", label: `Canal: ${filterOrder.channel}` })
    if (filterOrder.state_order && filterOrder.state_order !== "all")
      chips.push({ key: "state_order", label: `Estado: ${stateLabels[filterOrder.state_order] ?? filterOrder.state_order}` })
    if (filterOrder.reseller && filterOrder.reseller !== "all") {
      const found = resellerOptions.find((r) => r.value === filterOrder.reseller)
      chips.push({ key: "reseller", label: `Reseller: ${found?.label ?? filterOrder.reseller}` })
    }
    if (filterOrder.order_date)
      chips.push({ key: "order_date", label: `Fecha: ${filterOrder.order_date.split("-").reverse().join("/")}` })
    if (filterOrder.salePrice)
      chips.push({ key: "salePrice", label: `Precio: $${filterOrder.salePrice}` })
    if (filterOrder.esimCost)
      chips.push({ key: "esimCost", label: `Costo: $${filterOrder.esimCost}` })
    if (filterOrder.marginPercent)
      chips.push({ key: "marginPercent", label: `Margen%: ${filterOrder.marginPercent}%` })
    if (filterOrder.marginMoney)
      chips.push({ key: "marginMoney", label: `Margen$: ${filterOrder.marginMoney}` })
    if (filterOrder.quantity)
      chips.push({ key: "quantity", label: `Cantidad: ${filterOrder.quantity}` })
    if (filterOrder.totalPrice)
      chips.push({ key: "totalPrice", label: `Total: $${filterOrder.totalPrice}` })
    return chips
  }, [filterOrder, resellerOptions])

  return (
    <Fade in timeout={400}>
      <Box sx={{ width: "100%", overflowX: "hidden" }}>
        <PaperDataTable>
          {/* Header con titulo y boton PDF */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              px: 3,
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(
                  theme.palette.background.paper,
                  1
                )} 100%)`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                <ShoppingCart sx={{ color: "white", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Listado de Ordenes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ordersWithComputed.length} ordenes registradas
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={handleDownloadPdf}
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              disabled={isDownloading || !rowsForExport.length}
              sx={{
                ...modernButtonSx,
                backgroundColor: "#dc2626",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(220, 38, 38, 0.5)",
                },
              }}
            >
              {isDownloading ? "Generando..." : "Descargar PDF"}
            </Button>
          </Box>

          <DataTableToolbar
            numSelected={selected.length}
            onChangeSearch={handleSearch}
            searchPlaceholder="Buscar por paquete, cliente, reseller..."
          />

          {/* ── Barra de filtros activos ── */}
          <Box
            sx={{
              px: 3,
              py: 1.25,
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              borderBottom: "1px solid",
              borderColor: "divider",
              minHeight: 52,
              bgcolor: activeFilterChips.length > 0
                ? (theme) => alpha(theme.palette.primary.main, 0.02)
                : "background.paper",
            }}
          >
            <Button
              size="small"
              variant={activeFilterChips.length > 0 ? "contained" : "outlined"}
              startIcon={<TuneOutlinedIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                px: 1.5,
                py: 0.6,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
                flexShrink: 0,
              }}
            >
              Filtros{activeFilterChips.length > 0 ? ` (${activeFilterChips.length})` : ""}
            </Button>

            {activeFilterChips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                size="small"
                onDelete={() => removeFilter(chip.key)}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 26,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  "& .MuiChip-deleteIcon": {
                    fontSize: 14,
                    color: "primary.main",
                    opacity: 0.7,
                    "&:hover": { opacity: 1 },
                  },
                }}
              />
            ))}

            {activeFilterChips.length > 0 && (
              <Button
                size="small"
                startIcon={<FilterListOffOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                onClick={handleReset}
                sx={{
                  textTransform: "none",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  borderRadius: 2,
                  px: 1,
                  "&:hover": { color: "error.main", bgcolor: (theme) => alpha(theme.palette.error.main, 0.06) },
                }}
              >
                Limpiar todo
              </Button>
            )}
          </Box>

          {/* ── Drawer de filtros ── */}
          <Drawer
            anchor="right"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: "100vw", sm: 440 },
                borderRadius: { xs: "20px 20px 0 0", sm: "20px 0 0 20px" },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                // altura parcial: centrado verticalmente
                height: "auto",
                maxHeight: "82vh",
                my: "auto",
                top: 0,
                bottom: 0,
                margin: "auto 0",
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 3,
                py: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                flexShrink: 0,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TuneOutlinedIcon sx={{ color: "white", fontSize: 22 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
                    Filtros
                  </Typography>
                  {activeFilterChips.length > 0 && (
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
                      {activeFilterChips.length} filtro{activeFilterChips.length > 1 ? "s" : ""} activo{activeFilterChips.length > 1 ? "s" : ""}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <IconButton
                onClick={() => setFilterDrawerOpen(false)}
                sx={{ color: "white", bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}
                size="small"
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Filtros activos (chips dentro del drawer) */}
            {activeFilterChips.length > 0 && (
              <Box sx={{ px: 3, py: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderBottom: "1px solid", borderColor: "divider", display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {activeFilterChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    size="small"
                    onDelete={() => removeFilter(chip.key)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      height: 24,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Contenido scrollable */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
              <FilterOrderDataTable
                orderFilter={filterOrder}
                resellerOptions={resellerOptions}
                salePriceOptions={numericOptions.salePriceOptions}
                esimCostOptions={numericOptions.esimCostOptions}
                marginMoneyOptions={numericOptions.marginMoneyOptions}
                quantityOptions={numericOptions.quantityOptions}
                totalPriceOptions={numericOptions.totalPriceOptions}
                onChange={handleFilterChange}
              />
            </Box>

            {/* Footer */}
            <Divider />
            <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, flexShrink: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleReset}
                disabled={activeFilterChips.length === 0}
                startIcon={<FilterListOffOutlinedIcon />}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Limpiar filtros
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterDrawerOpen(false)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}
              >
                Listo
              </Button>
            </Box>
          </Drawer>

          <Box
            sx={{
              px: 3,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: (theme) => alpha(theme.palette.info.main, 0.04),
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <TipsAndUpdates sx={{ fontSize: 18, color: "info.main" }} />
            <Typography variant="caption" color="text.secondary">
              Tip: puedes ordenar los datos haciendo click en las flechas de cada columna.
            </Typography>
          </Box>

          <DataTable
            DataTableHead={DataTableHead}
            pagination={pagination}
            loading={{ load: loading || false, cell: activeHeadCells.length }}
            tableProps={{
              sx: {
                tableLayout: "fixed",
                minWidth: 1200,
                width: "100%",
                "& th": {
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                  backgroundColor: (theme: any) => alpha(theme.palette.background.default, 0.6),
                },
                "& th, & td": {
                  textAlign: "left !important",
                  verticalAlign: "top",
                },
                "& td": { py: 1.25 },
                "& tbody tr": {
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
                  },
                },
                "& th:nth-of-type(1), & td:nth-of-type(1)": { width: 60 },
                "& th:nth-of-type(2), & td:nth-of-type(2)": { width: 260 },
                "& th:nth-of-type(3), & td:nth-of-type(3)": { width: 240 },
                "& th:nth-of-type(4), & td:nth-of-type(4)": { width: 120 },
                "& th:nth-of-type(5), & td:nth-of-type(5)": { width: 180 },
                "& th:nth-of-type(6), & td:nth-of-type(6)": { width: 90 },
                "& th:nth-of-type(7), & td:nth-of-type(7)": { width: 140 },
                "& th:nth-of-type(8), & td:nth-of-type(8)": { width: 120 },
                "& th:nth-of-type(9), & td:nth-of-type(9)": { width: 150 },
                "& th:nth-of-type(10), & td:nth-of-type(10)": { width: 140 },
                "& th:nth-of-type(11), & td:nth-of-type(11)": { width: 140 },
                "& th:nth-of-type(12), & td:nth-of-type(12)": { width: 90 },
                "& th:nth-of-type(13), & td:nth-of-type(13)": { width: 140 },
              },
            }}
          >
            {!loading && rows.length === 0 ? (
              <ListItemTable id_data_table={0} props={{ sx: { "& > *": { borderBottom: "unset" } } }}>
                <ItemDataTable
                  align="center"
                  colSpan={activeHeadCells.length}
                  sx={{
                    py: 6,
                    textAlign: "center !important",
                  }}
                >
                  <Typography fontWeight={600}>No hay datos registrados</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    No se encontraron ordenes con los filtros aplicados.
                  </Typography>
                </ItemDataTable>
              </ListItemTable>
            ) : (
              rows.map((row, idx) => {
                const labelId = `enhanced-table-checkbox-${idx}`
                const cliente =
                  row.channel === "RESELLER"
                    ? row.resellerName || "Compra reseller"
                    : `${row.userName ?? ""} ${row.userSurname ?? ""}`.trim();
                const noCost = !hasMeaningfulNumber(row.esimCost)

                return (
                  <ListItemTable
                    key={row.id_data_table}
                    id_data_table={row.id_data_table}
                    props={{ sx: { "& > *": { borderBottom: "unset" } } }}
                  >
                    <ItemDataTable align="left" sx={{ width: 60, whiteSpace: "nowrap" }}>
                      <IconButton
                        aria-label="visibility"
                        size="small"
                        onClick={() => onShowOrder(row)}
                        sx={{
                          p: 0.5,
                          borderRadius: 1.5,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                          },
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </ItemDataTable>

                    <ItemDataTable align="left" component="th" id={labelId} scope="row" sx={{ width: 260 }}>
                      <Typography sx={{ lineHeight: 1.25 }}>{row.product_desp || "-"}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                        {row.productId || "-"}
                      </Typography>
                    </ItemDataTable>

                    {isSuperAdmin && (
                      <ItemDataTable align="left" sx={{ width: 240 }}>
                        <Typography sx={{ lineHeight: 1.25 }}>{cliente || "-"}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                          {row.channel === "RESELLER" ? row.resellerEmail || "-" : row.userEmail || "-"}
                        </Typography>
                      </ItemDataTable>
                    )}

                    <ItemDataTable align="left" sx={{ width: 120, whiteSpace: "nowrap" }}>
                      {formatDDMMYYYYSafe((row as any).order_date)}
                    </ItemDataTable>

                    <ItemDataTable align="left" sx={{ width: 120, whiteSpace: "pre-line" }}>
                      {row.buy_order ? row.buy_order : "Sin N de orden\nEn el Carrito"}
                    </ItemDataTable>

                    {isSuperAdmin && (
                      <ItemDataTable align="left" sx={{ width: 90, whiteSpace: "nowrap" }}>
                        {row.channel || "-"}
                      </ItemDataTable>
                    )}

                    {isSuperAdmin && (
                      <ItemDataTable align="left" sx={{ width: 140 }}>
                        <Typography noWrap title={row.resellerName || ""}>
                          {row.resellerName || "-"}
                        </Typography>
                      </ItemDataTable>
                    )}

                    {isSuperAdmin && (
                      <ItemDataTable align="left" sx={{ width: 120, whiteSpace: "nowrap" }}>
                        {hasMeaningfulNumber(row.salePrice) ? formatUsdNoUs(Number(row.salePrice)) : "-"}
                      </ItemDataTable>
                    )}

                    {isSuperAdmin && (
                      <ItemDataTable align="left" sx={{ width: 150 }}>
                        <Typography sx={{ whiteSpace: "nowrap" }}>{esimCostLabel(row)}</Typography>
                        {noCost && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            Costo original no disponible
                          </Typography>
                        )}
                      </ItemDataTable>
                    )}

                    {isSuperAdmin && (
                      <ItemDataTable align="left" sx={{ width: 160 }}>
                        <Typography sx={{ whiteSpace: "nowrap" }}>{marginPctLabel(row)}</Typography>
                        {noCost && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            Requiere costo original
                          </Typography>
                        )}
                      </ItemDataTable>
                    )}

                    {isSuperAdmin && (
                      <ItemDataTable align="left" sx={{ width: 170 }}>
                        <Typography sx={{ whiteSpace: "nowrap" }}>{marginAmountLabel(row)}</Typography>
                        {noCost && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            Requiere costo original
                          </Typography>
                        )}
                      </ItemDataTable>
                    )}

                    <ItemDataTable align="left" sx={{ width: 90, whiteSpace: "nowrap" }}>
                      {Number(row.quantity ?? 0).toFixed(0)}
                    </ItemDataTable>

                    <ItemDataTable align="left" sx={{ width: 140, whiteSpace: "nowrap" }}>
                      {formatUsdNoUs(Number(row.total ?? 0))}
                    </ItemDataTable>
                  </ListItemTable>
                )
              })
            )}
          </DataTable>
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<IOrderRow>[] = [
  { id: "id", numeric: false, disablePadding: false, label: "" },
  { id: "product_desp", numeric: false, disablePadding: false, label: "Paquete" },
  { id: "userName", numeric: false, disablePadding: false, label: "Cliente" },
  { id: "order_date" as any, numeric: false, disablePadding: false, label: "Fecha Orden" },
  { id: "buy_order", numeric: true, disablePadding: false, label: "N Orden" },
  { id: "channel", numeric: false, disablePadding: false, label: "Canal" },
  { id: "resellerName", numeric: false, disablePadding: false, label: "Reseller" },
  { id: "salePrice", numeric: true, disablePadding: false, label: "Precio Venta" },
  { id: "esimCost", numeric: true, disablePadding: false, label: "Costo eSIM" },
  { id: "marginPct", numeric: true, disablePadding: false, label: "Margen %" },
  { id: "marginAmount", numeric: true, disablePadding: false, label: "Margen $" },
  { id: "quantity", numeric: true, disablePadding: false, label: "Cantidad" },
  { id: "total", numeric: true, disablePadding: false, label: "Total Venta" },
]
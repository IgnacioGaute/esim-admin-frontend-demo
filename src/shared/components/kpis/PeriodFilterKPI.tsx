import { useState, useCallback, useRef } from "react";
import { Box, ButtonBase, TextField, Typography, Paper, ClickAwayListener, Popper, Fade } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { IFilterDateKPI } from "./FilterDateKPI";
import {
  getDateCurrent,
  getDateMonthFromTo,
  getDateQuarter,
  getDateYear,
} from "@/shared/helpers/handligDateHelper";

// ─── Types ────────────────────────────────────────────────────────
type PeriodType = "day" | "week" | "month" | "quarter" | "year" | "period";

const TABS: { value: PeriodType; label: string }[] = [
  { value: "day",     label: "Día"       },
  { value: "week",    label: "Semana"    },
  { value: "month",   label: "Mes"       },
  { value: "quarter", label: "Trimestre" },
  { value: "year",    label: "Año"       },
  { value: "period",  label: "Período"   },
];

const ACCENT = "#6671E2";

const MONTHS_FULL = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const WEEKDAYS    = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

const QUARTERS = [
  { q: 1, label: "Q1", sub: "Ene – Mar", from: "-01-01", to: "-03-31" },
  { q: 2, label: "Q2", sub: "Abr – Jun", from: "-04-01", to: "-06-30" },
  { q: 3, label: "Q3", sub: "Jul – Sep", from: "-07-01", to: "-09-30" },
  { q: 4, label: "Q4", sub: "Oct – Dic", from: "-10-01", to: "-12-31" },
];

// ─── Utilities ────────────────────────────────────────────────────
function pad(n: number) { return n.toString().padStart(2, "0"); }
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplayDate(date: string | null, period: PeriodType): string {
  if (!date) return "Seleccionar";
  const d = new Date(date + "T00:00:00");
  switch (period) {
    case "day":
      return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    case "month":
      return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
    case "quarter":
      const q = Math.ceil((d.getMonth() + 1) / 3);
      return `Q${q} ${d.getFullYear()}`;
    case "year":
      return `${d.getFullYear()}`;
    default:
      return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  }
}

function formatDateRange(from: string | null, to: string | null): string {
  if (!from || !to) return "Seleccionar período";
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  return `${f.getDate()} ${MONTHS_SHORT[f.getMonth()]} - ${t.getDate()} ${MONTHS_SHORT[t.getMonth()]} ${t.getFullYear()}`;
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  return d.getUTCFullYear();
}

function getWeekRange(year: number, week: number): IFilterDateKPI {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (dow - 1) + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { from: fmtDate(monday), to: fmtDate(sunday) };
}

function getCurrentWeekRange(): IFilterDateKPI {
  const today = new Date();
  return getWeekRange(getISOWeekYear(today), getISOWeek(today));
}

// ─── NavBtn ────────────────────────────────────────────────────────
const NavBtn = ({ onClick, dir }: { onClick: () => void; dir: "left" | "right" }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      p: 0.75,
      borderRadius: 1.5,
      color: "text.secondary",
      "&:hover": { bgcolor: `${ACCENT}12`, color: ACCENT },
    }}
  >
    {dir === "left" ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
  </ButtonBase>
);

// ─── DayPicker ────────────────────────────────────────────────────
const DayPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: IFilterDateKPI) => void;
}) => {
  const todayStr = getDateCurrent();
  const init = new Date((value || todayStr) + "T00:00:00");
  const [viewYear,  setViewYear]  = useState(init.getFullYear());
  const [viewMonth, setViewMonth] = useState(init.getMonth());

  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset  = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const totalCells   = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const prevMonth = () =>
    viewMonth === 0 ? (setViewMonth(11), setViewYear(viewYear - 1)) : setViewMonth(viewMonth - 1);
  const nextMonth = () =>
    viewMonth === 11 ? (setViewMonth(0), setViewYear(viewYear + 1)) : setViewMonth(viewMonth + 1);

  return (
    <Box sx={{ width: 280, p: 2 }}>
      {/* Month nav */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <NavBtn dir="left"  onClick={prevMonth} />
        <Typography sx={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.875rem", color: "#151D48" }}>
          {MONTHS_FULL[viewMonth]} {viewYear}
        </Typography>
        <NavBtn dir="right" onClick={nextMonth} />
      </Box>

      {/* Weekday headers */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
        {WEEKDAYS.map((d) => (
          <Typography key={d} sx={{ textAlign: "center", fontSize: "0.68rem", color: "text.disabled", fontWeight: 600, py: 0.25 }}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* Day grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - startOffset + 1;
          if (dayNum < 1 || dayNum > daysInMonth) return <Box key={i} />;
          const dateStr   = `${viewYear}-${pad(viewMonth + 1)}-${pad(dayNum)}`;
          const isSelected = value === dateStr;
          const isToday    = todayStr === dateStr;
          return (
            <ButtonBase
              key={i}
              onClick={() => onChange({ from: dateStr, to: dateStr })}
              sx={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: "50%",
                fontSize: "0.78rem",
                fontWeight: isSelected ? 700 : 400,
                bgcolor: isSelected ? ACCENT : "transparent",
                color: isSelected ? "white" : isToday ? ACCENT : "text.primary",
                border: isToday && !isSelected ? `1.5px solid ${ACCENT}` : "1.5px solid transparent",
                transition: "all 0.12s",
                "&:hover": { bgcolor: isSelected ? ACCENT : `${ACCENT}18` },
              }}
            >
              {dayNum}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── WeekPicker ────────────────────────────────────────────────────
const WeekPicker = ({
  value,
  onChange,
}: {
  value: IFilterDateKPI | null;
  onChange: (v: IFilterDateKPI) => void;
}) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const selWeek     = value ? getISOWeek(new Date(value.from + "T00:00:00"))     : null;
  const selWeekYear = value ? getISOWeekYear(new Date(value.from + "T00:00:00")) : null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const totalCells  = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const rows = Array.from({ length: totalCells / 7 }, (_, ri) =>
    Array.from({ length: 7 }, (_, ci) => {
      const dayNum = ri * 7 + ci - startOffset + 1;
      const d = new Date(viewYear, viewMonth, dayNum);
      return { day: dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null, week: getISOWeek(d), weekYear: getISOWeekYear(d) };
    })
  );

  const prevMonth = () =>
    viewMonth === 0 ? (setViewMonth(11), setViewYear(viewYear - 1)) : setViewMonth(viewMonth - 1);
  const nextMonth = () =>
    viewMonth === 11 ? (setViewMonth(0), setViewYear(viewYear + 1)) : setViewMonth(viewMonth + 1);

  return (
    <Box sx={{ width: 320, p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <NavBtn dir="left"  onClick={prevMonth} />
        <Typography sx={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.875rem", color: "#151D48" }}>
          {MONTHS_FULL[viewMonth]} {viewYear}
        </Typography>
        <NavBtn dir="right" onClick={nextMonth} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "28px repeat(7, 1fr)", mb: 0.5 }}>
        <Box />
        {WEEKDAYS.map((d) => (
          <Typography key={d} sx={{ textAlign: "center", fontSize: "0.68rem", color: "text.disabled", fontWeight: 600 }}>
            {d}
          </Typography>
        ))}
      </Box>

      {rows.map((row, ri) => {
        const firstCell  = row[0];
        const isSelected = selWeek !== null && firstCell.week === selWeek && firstCell.weekYear === selWeekYear;
        return (
          <Box
            key={ri}
            onClick={() => onChange(getWeekRange(firstCell.weekYear, firstCell.week))}
            sx={{
              display: "grid",
              gridTemplateColumns: "28px repeat(7, 1fr)",
              borderRadius: 1.5,
              py: "3px",
              cursor: "pointer",
              bgcolor: isSelected ? `${ACCENT}18` : "transparent",
              "&:hover": { bgcolor: isSelected ? `${ACCENT}28` : "grey.100" },
              transition: "background 0.12s",
            }}
          >
            <Typography sx={{ fontSize: "0.63rem", color: isSelected ? ACCENT : "text.disabled", fontWeight: 700, textAlign: "center", pt: "2px" }}>
              {firstCell.week}
            </Typography>
            {row.map((cell, ci) => (
              <Typography
                key={ci}
                sx={{
                  textAlign: "center",
                  fontSize: "0.78rem",
                  color: cell.day ? (isSelected ? ACCENT : "text.primary") : "text.disabled",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {cell.day ?? ""}
              </Typography>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

// ─── MonthPicker ────────────────────────────────────────────────────
const MonthPicker = ({
  value,
  onChange,
}: {
  value: IFilterDateKPI | null;
  onChange: (v: IFilterDateKPI) => void;
}) => {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const selYear  = value ? parseInt(value.from.split("-")[0]) : null;
  const selMonth = value ? parseInt(value.from.split("-")[1]) - 1 : null;
  const nowYear  = new Date().getFullYear();
  const nowMonth = new Date().getMonth();

  return (
    <Box sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <NavBtn dir="left"  onClick={() => setViewYear(viewYear - 1)} />
        <Typography sx={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.875rem", color: "#151D48" }}>
          {viewYear}
        </Typography>
        <NavBtn dir="right" onClick={() => setViewYear(viewYear + 1)} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
        {MONTHS_SHORT.map((m, i) => {
          const isSelected   = selYear === viewYear && selMonth === i;
          const isCurrent    = nowYear === viewYear && nowMonth === i;
          const lastDay      = new Date(viewYear, i + 1, 0).getDate();
          return (
            <ButtonBase
              key={m}
              onClick={() => onChange({ from: `${viewYear}-${pad(i + 1)}-01`, to: `${viewYear}-${pad(i + 1)}-${pad(lastDay)}` })}
              sx={{
                py: 1,
                borderRadius: 2,
                fontSize: "0.82rem",
                fontWeight: isSelected ? 700 : isCurrent ? 600 : 400,
                bgcolor: isSelected ? ACCENT : "transparent",
                color:   isSelected ? "white" : isCurrent ? ACCENT : "text.primary",
                border:  isCurrent && !isSelected ? `1.5px solid ${ACCENT}` : "1.5px solid transparent",
                transition: "all 0.12s",
                "&:hover": { bgcolor: isSelected ? ACCENT : `${ACCENT}18` },
              }}
            >
              {m}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── QuarterPicker ────────────────────────────────────────────────────
const QuarterPicker = ({
  value,
  onChange,
}: {
  value: IFilterDateKPI | null;
  onChange: (v: IFilterDateKPI) => void;
}) => {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const selYear = value ? parseInt(value.from.split("-")[0]) : null;
  const selQ    = value ? Math.ceil(parseInt(value.from.split("-")[1]) / 3) : null;
  const nowQ    = Math.ceil((new Date().getMonth() + 1) / 3);
  const nowYear = new Date().getFullYear();

  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <NavBtn dir="left"  onClick={() => setViewYear(viewYear - 1)} />
        <Typography sx={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: "0.875rem", color: "#151D48" }}>
          {viewYear}
        </Typography>
        <NavBtn dir="right" onClick={() => setViewYear(viewYear + 1)} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        {QUARTERS.map((q) => {
          const isSelected = selYear === viewYear && selQ === q.q;
          const isCurrent  = nowYear === viewYear && nowQ === q.q;
          return (
            <ButtonBase
              key={q.q}
              onClick={() => onChange({ from: `${viewYear}${q.from}`, to: `${viewYear}${q.to}` })}
              sx={{
                py: 2,
                px: 1,
                borderRadius: 3,
                flexDirection: "column",
                alignItems: "center",
                bgcolor:    isSelected ? ACCENT : isCurrent ? `${ACCENT}12` : `${ACCENT}07`,
                border:     isCurrent && !isSelected ? `1.5px solid ${ACCENT}` : "1.5px solid transparent",
                transition: "all 0.12s",
                "&:hover":  { bgcolor: isSelected ? ACCENT : `${ACCENT}22` },
              }}
            >
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: isSelected ? "white" : ACCENT, lineHeight: 1 }}>
                {q.label}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: isSelected ? "rgba(255,255,255,0.8)" : "text.secondary", mt: 0.5 }}>
                {q.sub}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── YearPicker ────────────────────────────────────────────────────
const YEAR_START = 2024;

const YearPicker = ({
  value,
  onChange,
}: {
  value: IFilterDateKPI | null;
  onChange: (v: IFilterDateKPI) => void;
}) => {
  const nowYear = new Date().getFullYear();
  const years = Array.from({ length: nowYear - YEAR_START + 1 }, (_, i) => YEAR_START + i);
  const selYear = value ? parseInt(value.from.split("-")[0]) : null;

  return (
    <Box sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
        {years.map((year) => {
          const isSelected = selYear === year;
          const isCurrent  = nowYear === year;
          return (
            <ButtonBase
              key={year}
              onClick={() => onChange({ from: `${year}-01-01`, to: `${year}-12-31` })}
              sx={{
                py: 1.25,
                borderRadius: 2,
                fontSize: "0.88rem",
                fontWeight: isSelected ? 700 : isCurrent ? 600 : 400,
                bgcolor: isSelected ? ACCENT : "transparent",
                color:   isSelected ? "white" : isCurrent ? ACCENT : "text.primary",
                border:  isCurrent && !isSelected ? `1.5px solid ${ACCENT}` : "1.5px solid transparent",
                transition: "all 0.12s",
                "&:hover": { bgcolor: isSelected ? ACCENT : `${ACCENT}18` },
              }}
            >
              {year}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── PeriodPicker ────────────────────────────────────────────────────
const PeriodPicker = ({ onChange }: { onChange: (v: IFilterDateKPI) => void }) => {
  const [from, setFrom] = useState("");
  const [to,   setTo]   = useState("");
  const canApply = !!from && !!to && from <= to;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, width: 340 }}>
      <TextField
        label="Desde"
        type="date"
        size="small"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        label="Hasta"
        type="date"
        size="small"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <ButtonBase
        onClick={() => canApply && onChange({ from, to })}
        sx={{
          px: 2.5,
          py: 1,
          borderRadius: 2,
          bgcolor:    canApply ? ACCENT : "grey.200",
          color:      canApply ? "white" : "text.disabled",
          fontSize:   "0.82rem",
          fontWeight: 700,
          transition: "all 0.15s",
          "&:hover": { bgcolor: canApply ? "#5560d0" : "grey.200" },
        }}
      >
        Aplicar
      </ButtonBase>
    </Box>
  );
};

// ─── Main component ────────────────────────────────────────────────
interface Props {
  onChange: (date: IFilterDateKPI | null) => void;
  defaultPeriod?: PeriodType;
}

export const PeriodFilterKPI = ({ onChange, defaultPeriod = "day" }: Props) => {
  const [selected, setSelected] = useState<PeriodType>(defaultPeriod);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const defaultMonthVal = getDateMonthFromTo();

  // Per-picker current selection
  const [dayVal,     setDayVal]     = useState<string>(getDateCurrent());
  const [weekVal,    setWeekVal]    = useState<IFilterDateKPI | null>(null);
  const [monthVal,   setMonthVal]   = useState<IFilterDateKPI | null>(defaultPeriod === "month" ? defaultMonthVal : null);
  const [quarterVal, setQuarterVal] = useState<IFilterDateKPI | null>(null);
  const [yearVal,    setYearVal]    = useState<IFilterDateKPI | null>(null);
  const [periodVal,  setPeriodVal]  = useState<IFilterDateKPI | null>(null);

  const getDisplayText = useCallback(() => {
    switch (selected) {
      case "day":
        return formatDisplayDate(dayVal, "day");
      case "week":
        return weekVal ? formatDateRange(weekVal.from, weekVal.to) : "Seleccionar semana";
      case "month":
        return monthVal ? formatDisplayDate(monthVal.from, "month") : "Seleccionar mes";
      case "quarter":
        return quarterVal ? formatDisplayDate(quarterVal.from, "quarter") : "Seleccionar trimestre";
      case "year":
        return yearVal ? formatDisplayDate(yearVal.from, "year") : "Seleccionar año";
      case "period":
        return periodVal ? formatDateRange(periodVal.from, periodVal.to) : "Seleccionar período";
      default:
        return "Seleccionar";
    }
  }, [selected, dayVal, weekVal, monthVal, quarterVal, yearVal, periodVal]);

  const handleTabSelect = useCallback(
    (period: PeriodType) => {
      setSelected(period);
      switch (period) {
        case "day":
          onChange({ from: dayVal, to: dayVal });
          break;
        case "week": {
          const v = weekVal ?? getCurrentWeekRange();
          if (!weekVal) setWeekVal(v);
          onChange(v);
          break;
        }
        case "month": {
          const v = monthVal ?? getDateMonthFromTo();
          if (!monthVal) setMonthVal(v);
          onChange(v);
          break;
        }
        case "quarter": {
          const v = quarterVal ?? getDateQuarter();
          if (!quarterVal) setQuarterVal(v);
          onChange(v);
          break;
        }
        case "year": {
          const v = yearVal ?? getDateYear();
          if (!yearVal) setYearVal(v);
          onChange(v);
          break;
        }
        case "period":
          break;
      }
    },
    [dayVal, weekVal, monthVal, quarterVal, yearVal, onChange]
  );

  const handlePickerChange = (val: IFilterDateKPI) => {
    switch (selected) {
      case "day":
        setDayVal(val.from);
        break;
      case "week":
        setWeekVal(val);
        break;
      case "month":
        setMonthVal(val);
        break;
      case "quarter":
        setQuarterVal(val);
        break;
      case "year":
        setYearVal(val);
        break;
      case "period":
        setPeriodVal(val);
        break;
    }
    onChange(val);
    if (selected !== "period") {
      setOpen(false);
    }
  };

  const renderPicker = () => {
    switch (selected) {
      case "day":
        return <DayPicker value={dayVal} onChange={handlePickerChange} />;
      case "week":
        return <WeekPicker value={weekVal} onChange={handlePickerChange} />;
      case "month":
        return <MonthPicker value={monthVal} onChange={handlePickerChange} />;
      case "quarter":
        return <QuarterPicker value={quarterVal} onChange={handlePickerChange} />;
      case "year":
        return <YearPicker value={yearVal} onChange={handlePickerChange} />;
      case "period":
        return <PeriodPicker onChange={(val) => { handlePickerChange(val); setOpen(false); }} />;
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.5,
        p: 1,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* ── Tab strip ── */}
      <Box sx={{ display: "inline-flex", bgcolor: "grey.100", borderRadius: 2.5, p: "4px", gap: "2px" }}>
        {TABS.map((tab) => {
          const isActive = selected === tab.value;
          return (
            <ButtonBase
              key={tab.value}
              onClick={() => handleTabSelect(tab.value)}
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontSize: "0.78rem",
                fontWeight: isActive ? 700 : 500,
                bgcolor: isActive ? "white" : "transparent",
                color: isActive ? ACCENT : "text.secondary",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
                "&:hover": { bgcolor: isActive ? "white" : `${ACCENT}12`, color: isActive ? ACCENT : ACCENT },
              }}
            >
              {tab.label}
            </ButtonBase>
          );
        })}
      </Box>

      {/* ── Date selector button ── */}
      <ButtonBase
        ref={anchorRef}
        onClick={() => setOpen(!open)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.75,
          borderRadius: 2,
          border: "1px solid",
          borderColor: open ? ACCENT : "divider",
          bgcolor: open ? `${ACCENT}08` : "transparent",
          transition: "all 0.15s",
          "&:hover": { borderColor: ACCENT, bgcolor: `${ACCENT}08` },
        }}
      >
        <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#151D48" }}>
          {getDisplayText()}
        </Typography>
        <KeyboardArrowDownIcon 
          sx={{ 
            fontSize: 18, 
            color: "text.secondary",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s"
          }} 
        />
      </ButtonBase>

      {/* ── Dropdown picker ── */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              sx={{
                mt: 1,
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Box>{renderPicker()}</Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Paper>
  );
};

import React, { useEffect, useMemo, useState } from "react"
import { Box, MenuItem, TextField } from "@mui/material"

type CountryOpt = { iso2: string; name: string; dial: string; flag: string }

const COUNTRY_OPTIONS: CountryOpt[] = [
  { iso2: "AR", name: "Argentina", dial: "54", flag: "🇦🇷" },
  { iso2: "CL", name: "Chile", dial: "56", flag: "🇨🇱" },
  { iso2: "UY", name: "Uruguay", dial: "598", flag: "🇺🇾" },
  { iso2: "PY", name: "Paraguay", dial: "595", flag: "🇵🇾" },
  { iso2: "BO", name: "Bolivia", dial: "591", flag: "🇧🇴" },
  { iso2: "BR", name: "Brasil", dial: "55", flag: "🇧🇷" },
  { iso2: "PE", name: "Perú", dial: "51", flag: "🇵🇪" },
  { iso2: "CO", name: "Colombia", dial: "57", flag: "🇨🇴" },
  { iso2: "MX", name: "México", dial: "52", flag: "🇲🇽" },
  { iso2: "US", name: "USA", dial: "1", flag: "🇺🇸" },
  { iso2: "ES", name: "España", dial: "34", flag: "🇪🇸" },
]

function onlyDigits(v: string) {
  return String(v ?? "").replace(/\D+/g, "")
}

function splitE164(value: string) {
  const v = String(value ?? "").trim()
  if (!v.startsWith("+")) return null

  const digits = onlyDigits(v)
  if (!digits) return null

  const sorted = [...COUNTRY_OPTIONS].sort((a, b) => b.dial.length - a.dial.length)
  const found = sorted.find((c) => digits.startsWith(c.dial))
  if (!found) return null

  return { iso2: found.iso2, dial: found.dial, national: digits.slice(found.dial.length) }
}

function isOnlyDial(e164: string, dial: string) {
  const digits = onlyDigits(e164)
  return digits === String(dial) // ej: "+54" => "54"
}

type Props = {
  label?: string
  value?: string | null // "+549..."
  onChange: (nextE164: string | null) => void
  defaultCountryIso2?: string
  disabled?: boolean
  error?: boolean
  helperText?: React.ReactNode
}

export function PhoneField({
  label = "Teléfono",
  value,
  onChange,
  defaultCountryIso2 = "AR",
  disabled,
  error,
  helperText,
}: Props) {
  const defaultCountry = useMemo(() => {
    return COUNTRY_OPTIONS.find((c) => c.iso2 === defaultCountryIso2) ?? COUNTRY_OPTIONS[0]
  }, [defaultCountryIso2])

  const [countryIso2, setCountryIso2] = useState<string>(defaultCountry.iso2)
  const country = useMemo(() => {
    return COUNTRY_OPTIONS.find((c) => c.iso2 === countryIso2) ?? defaultCountry
  }, [countryIso2, defaultCountry])

  const [national, setNational] = useState<string>("")

  const flagUrl = (iso2: string, size: 20 | 40 = 20) =>
    `https://flagcdn.com/w${size}/${iso2.toLowerCase()}.png`

  // ✅ IMPORTANT: si viene value como "+54" (solo prefijo), lo tratamos como vacío
  useEffect(() => {
    if (!value) {
      setCountryIso2(defaultCountry.iso2)
      setNational("")
      return
    }

    const parsed = splitE164(value)
    if (parsed) {
      setCountryIso2(parsed.iso2)

      // si es solo prefijo => vacío
      if (!parsed.national) {
        setNational("")
        return
      }

      setNational(parsed.national)
      return
    }

    setCountryIso2(defaultCountry.iso2)
    setNational(onlyDigits(value))
  }, [value, defaultCountry.iso2])

  // ✅ commit final: NUNCA guardar "+dial" sin número nacional
  const commit = (nextCountryIso2: string, nextNational: string) => {
    const c = COUNTRY_OPTIONS.find((x) => x.iso2 === nextCountryIso2) ?? defaultCountry
    const nat = onlyDigits(nextNational)

    if (!nat) {
      onChange(null) // <-- esto permite que "required" dispare
      return
    }

    onChange(`+${c.dial}${nat}`)
  }

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <TextField
        select
        label="País"
        size="small"
        value={countryIso2}
        disabled={disabled}
        onChange={(e) => {
          const next = String(e.target.value)
          setCountryIso2(next)
          commit(next, national)
        }}
        sx={{ width: { xs: "45%", sm: 240 } }}
        InputLabelProps={{ shrink: true }}
        SelectProps={{
          renderValue: (val) => {
            const c = COUNTRY_OPTIONS.find((x) => x.iso2 === val) ?? defaultCountry
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  component="img"
                  src={flagUrl(c.iso2, 20)}
                  alt={c.name}
                  sx={{ width: 20, height: 15, borderRadius: 0.5, boxShadow: 1 }}
                  loading="lazy"
                />
                <span>{c.name}</span>
              </Box>
            )
          },
        }}
      >
        {COUNTRY_OPTIONS.map((c) => (
          <MenuItem key={c.iso2} value={c.iso2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src={flagUrl(c.iso2, 20)}
                alt={c.name}
                sx={{ width: 20, height: 15, borderRadius: 0.5, boxShadow: 1 }}
                loading="lazy"
              />
              <span>
                {c.name} (+{c.dial})
              </span>
            </Box>
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Código"
        size="small"
        value={`+${country.dial}`}
        disabled
        InputLabelProps={{ shrink: true }}
        inputProps={{ readOnly: true }}
        sx={{ width: 110 }}
      />

      <TextField
        label={label}
        size="small"
        value={national}
        disabled={disabled}
        onChange={(e) => {
          const next = onlyDigits(e.target.value)
          setNational(next)
          commit(countryIso2, next)
        }}
        onBlur={() => {
          // ✅ si quedó vacío, aseguramos null (por si algún form guarda "+dial" viejo)
          if (!onlyDigits(national)) onChange(null)
          // (opcional) si tenés un trigger de validación externo, podés llamarlo acá
        }}
        InputLabelProps={{ shrink: true }}
        error={error}
        helperText={helperText}
        fullWidth
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
      />
    </Box>
  )
}
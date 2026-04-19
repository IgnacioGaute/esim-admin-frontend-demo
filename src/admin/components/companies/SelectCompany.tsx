import { Autocomplete, TextField } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useFetch } from "@/shared/hooks"
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface"

type Props = {
  value: string
  onChange: (companyId: string) => void
  error?: string // string | undefined (como ya lo tenías)
  label?: string
  disabled?: boolean
}

export const SelectCompany = ({
  value,
  onChange,
  error,
  label = "Selección de Compañía",
  disabled = false,
}: Props) => {
  const { data, loading, onFetch } = useFetch<ICompanyData[]>("companies", "GET", {
    init: true,
    cache: { enabled: true },
  })

  const companies = Array.isArray(data) ? data : []

  const selected = useMemo(() => {
    return companies.find((c) => String(c.id) === String(value)) ?? null
  }, [companies, value])

  return (
    <Autocomplete
      options={companies}
      value={selected}
      loading={loading}
      disabled={disabled}
      isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
      getOptionLabel={(o) => o?.name ?? "-"}
      onChange={(_, newVal) => onChange(String(newVal?.id ?? ""))}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={Boolean(error)}
          helperText={error || ""}
        />
      )}
    />
  )
}
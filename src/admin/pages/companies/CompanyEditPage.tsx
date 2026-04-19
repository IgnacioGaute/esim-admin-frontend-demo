import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/shared/store/store"

import { BoxLoading } from "@/shared/components/BoxLoading"
import { useFetch, useNotiAlert } from "@/shared/hooks"
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav"
import { CompanyFormNewAndEdit } from "@/admin/components"
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface"
import { CompanyFormValues } from "@/admin/utils/interfaces/company-user-data.interface"
import { CompanyWalletHistory } from "@/admin/components/companies/CompanyWalletHistory"
import { refreshMe } from "@/shared/store/slices/auth/authThunks"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER"

type ExistingUserOption = {
  id: string
  name: string
  email: string
  type: Role
}

export const CompanyEditPage = () => {
  const { companyId } = useParams<{ companyId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { snackBarAlert } = useNotiAlert()
  const dispatch = useDispatch<AppDispatch>()

  const me = useSelector((s: RootState) => s.auth.me)

  const [loading, setLoading] = useState(false)
  const { onFetch: uploadFile } = useFetch("/upload-file", "POST", { init: false })
  const [walletExpanded, setWalletExpanded] = useState(
    searchParams.get("walletHistory") === "open"
  )

  const hasAutoScrolledRef = useRef(false)

  const { data, loading: loadDetail, onFetch, clearCache } = useFetch<ICompanyData & { users?: any[] }>(
    `/companies/${companyId}`,
    "GET",
    { init: companyId !== undefined, cache: { enabled: false } }
  )

  const { data: existingUsers, loading: loadingExistingUsers } =
    useFetch<ExistingUserOption[]>(
      companyId ? `/users/available/list?companyId=${companyId}` : "/users/available/list",
      "GET",
      { init: true, cache: { enabled: false } }
    )

  const existingUsersToPick = useMemo(() => {
    const assignedIds = new Set((data?.users ?? []).map((u: any) => u.id))
    return (existingUsers ?? []).filter((u) => !assignedIds.has(u.id))
  }, [existingUsers, data?.users])

  useEffect(() => {
    const shouldOpen = searchParams.get("walletHistory") === "open"
    setWalletExpanded(shouldOpen)
  }, [searchParams])

  useEffect(() => {
    const shouldOpen = searchParams.get("walletHistory") === "open"

    if (!shouldOpen) return
    if (!walletExpanded) return
    if (loadDetail) return
    if (hasAutoScrolledRef.current) return

    const runScroll = () => {
      const el = document.getElementById("company-wallet-history")
      if (!el) return

      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })

      hasAutoScrolledRef.current = true
    }

    const t = window.setTimeout(runScroll, 500)
    return () => window.clearTimeout(t)
  }, [searchParams, walletExpanded, loadDetail])

  const onEdit = async (values: CompanyFormValues, photoFile?: File | null) => {
    if (!companyId) return

    const payload: any = {
      name: values.name,
      rut: values.rut ?? null,
      address: values.address ?? null,
      city: values.city ?? null,
      country: values.country ?? null,
      commercialTour: values.commercialTour ?? null,
      paymentType: values.paymentType ?? null,
      website: values.website ?? null,
      socialMedia: values.socialMedia ?? null,
      photoUrl: (values as any).photoUrl ?? null,
      amount: Number((values as any).amount ?? 0),
      users: (values.users ?? []).map((u: any) => {
        const id = String(u.id ?? "").trim()
        const hasAnyCreateFields =
          String(u.name ?? "").trim() !== "" ||
          String(u.email ?? "").trim() !== "" ||
          String(u.password ?? "").trim() !== "" ||
          String(u.type ?? "").trim() !== ""

        const phone = String(u.phone ?? "").trim()
        const phoneOut = phone.length ? phone : null

        if (id && !hasAnyCreateFields) {
          return phoneOut ? { id, phone: phoneOut } : { id }
        }

        const clean: any = {
          ...(id ? { id } : {}),
          name: u.name,
          email: u.email,
          phone: phoneOut,
          type: u.type,
          amount: Number(u.amount ?? 0),
        }

        if (u.password && String(u.password).trim() !== "") clean.password = u.password

        return clean
      }).filter(Boolean),
    }

    setLoading(true)

    if (photoFile) {
      const fd = new FormData()
      fd.append("file", photoFile)
      const { ok: uploadOk, data: uploadData } = await uploadFile("/upload-file", "POST", { data: fd })
      if (uploadOk) payload.photoUrl = (uploadData as any)?.url ?? null
    }

    const { ok } = await onFetch(`/companies/${companyId}`, "PATCH", { data: payload })
    setLoading(false)

    if (!ok) return

    await dispatch(refreshMe())

    snackBarAlert("La empresa se ha actualizado correctamente", { variant: "success" })
    clearCache()
    navigate(MENU_MAIN_HISTORY_NAV("companies"))
  }

  if (loadDetail) {
    return (
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <BoxLoading isLoading showGif positionContainer="absolute" />
      </div>
    )
  }

  return (
    <>
      <CompanyFormNewAndEdit
        onBack={() => navigate(MENU_MAIN_HISTORY_NAV("companies"))}
        onSubmit={onEdit}
        title="Editar Empresa"
        dataForm={data as any}
        loading={loading || loadingExistingUsers}
        showInputBalance
        existingUsers={existingUsersToPick ?? []}
      />

      <CompanyWalletHistory
        companyId={companyId || ""}
        companyName={data?.name}
        userName={me?.name}
        expanded={walletExpanded}
        onExpandedChange={(next) => {
          setWalletExpanded(next)

          const nextParams = new URLSearchParams(searchParams)
          if (next) nextParams.set("walletHistory", "open")
          else nextParams.delete("walletHistory")
          setSearchParams(nextParams, { replace: true })
        }}
      />
    </>
  )
}
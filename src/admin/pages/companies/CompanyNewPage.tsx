import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/shared/store/store"

import { useFetch, useNotiAlert } from "@/shared/hooks"
import { CompanyFormNewAndEdit } from "@/admin/components"
import { CompanyFormValues } from "@/admin/utils/interfaces/company-user-data.interface"
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav"
import { refreshMe } from "@/shared/store/slices/auth/authThunks"

type ExistingUserOption = {
  id: string
  name: string
  email: string
  type: "SUPER_ADMIN" | "ADMIN" | "SELLER"
}

export const CompanyNewPage = () => {
  const navigate = useNavigate()
  const { snackBarAlert } = useNotiAlert()
  const dispatch = useDispatch<AppDispatch>()

  const [loading, setLoading] = useState(false)

  const { onFetch } = useFetch("companies", "POST", { init: false })
  const { onFetch: uploadFile } = useFetch("/upload-file", "POST", { init: false })

  const { data: existingUsers, loading: loadingExistingUsers } =
    useFetch<ExistingUserOption[]>("/users/available/list", "GET", {
      init: true,
      cache: { enabled: false },
    })

  const onCreate = async (values: CompanyFormValues, photoFile?: File | null) => {
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

    const { ok } = await onFetch("companies", "POST", { data: payload })
    setLoading(false)

    if (!ok) return

    dispatch(refreshMe())

    snackBarAlert("La empresa se ha creado correctamente", { variant: "success" })
    navigate(MENU_MAIN_HISTORY_NAV("companies"))
  }

  return (
    <CompanyFormNewAndEdit
      onBack={() => navigate(MENU_MAIN_HISTORY_NAV("companies"))}
      onSubmit={onCreate}
      title="Agregar Empresa"
      loading={loading || loadingExistingUsers}
      showInputBalance
      existingUsers={existingUsers ?? []}
    />
  )
}

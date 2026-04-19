import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useFetch, useNotiAlert } from "@/shared/hooks"
import { UserFormNewAndEdit } from "@/admin/components/users/UserFormNewAndEdit"
import { IFormUser, IUserData } from "@/admin/utils/interfaces/user-data.interface"
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav"

export const UserNewPage = () => {
  const navigate = useNavigate()
  const { snackBarAlert } = useNotiAlert()

  const { data: me, loading: loadingMe } = useFetch<IUserData & { amount?: number }>(
    "users/me",
    "GET",
    { init: true, cache: { enabled: false } }
  )

  const currentCompanyId = useMemo(
    () => String((me as any)?.company?.id ?? (me as any)?.companyId ?? ""),
    [me]
  )

  const currentCompanyName = useMemo(
    () => String((me as any)?.company?.name ?? ""),
    [me]
  )

  const [loading, setLoading] = useState(false)
  const { onFetch } = useFetch("/users", "POST", { init: false })
  const { onFetch: uploadFile } = useFetch("/upload-file", "POST", { init: false })

  const onCreate = async (values: IFormUser & { amount?: number; companyId?: string }, photoFile?: File | null) => {
    const payload: any = {
      ...values,
      amount: values?.amount ? Number(values.amount) : undefined,
    }

    setLoading(true)

    if (photoFile) {
      const fd = new FormData()
      fd.append("file", photoFile)
      const { ok: uploadOk, data: uploadData } = await uploadFile("/upload-file", "POST", { data: fd })
      if (uploadOk) payload.photoUrl = (uploadData as any)?.url ?? null
    }

    const { ok } = await onFetch("/users", "POST", { data: payload })
    setLoading(false)

    if (!ok) return

    snackBarAlert("El usuario se ha creado correctamente", { variant: "success" })
    navigate(MENU_MAIN_HISTORY_NAV("users"))
  }

  return (
    <UserFormNewAndEdit
      onBack={() => navigate(MENU_MAIN_HISTORY_NAV("users"))}
      onSubmit={onCreate}
      loading={loading || loadingMe}
      showInputBalance={true}
      currentRole={((me as any)?.type as any) || "SELLER"}
      currentCompanyId={currentCompanyId}
      currentCompanyName={currentCompanyName}
      showCompanyField={true}
    />
  )
}

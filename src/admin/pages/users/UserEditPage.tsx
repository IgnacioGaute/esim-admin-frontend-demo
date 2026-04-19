import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Box } from "@mui/material"

import { useFetch, useNotiAlert } from "@/shared/hooks"
import { BoxLoading } from "@/shared/components/BoxLoading"
import { IFormUser, IUserData } from "@/admin/utils/interfaces/user-data.interface"
import { UserFormNewAndEdit } from "../../components/users/UserFormNewAndEdit"
import { extractDataUserCompanyHelper } from "@/admin/utils/helpers/extractDataUserCompanyHelper"
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav"
import { UserWalletHistory } from "../../components/users/UserWalletHistory"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER" | "CORPORATE"

export const UserEditPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { snackBarAlert } = useNotiAlert()

  const [loading, setLoading] = useState(false)
  const { onFetch: uploadFile } = useFetch("/upload-file", "POST", { init: false })

  // ✅ IMPORTANTÍSIMO: usar users/me (trae company)
  const { data: me, loading: loadingMe } = useFetch<IUserData & { amount?: number }>(
    "users/me",
    "GET",
    { init: true, cache: { enabled: false } }
  )

  const currentRole = ((me as any)?.type as Role) || "SELLER"

  const currentCompanyId = useMemo(
    () => String((me as any)?.company?.id ?? (me as any)?.companyId ?? ""),
    [me]
  )

  const currentCompanyName = useMemo(
    () => String((me as any)?.company?.name ?? ""),
    [me]
  )

  const {
    data,
    loading: loadDetail,
    onFetch,
    clearCache,
  } = useFetch<IUserData & { amount?: number }>(
    userId ? `/users/${userId}` : "",
    "GET",
    {
      init: Boolean(userId),
      cache: { enabled: false },
    }
  )

  const dataForm = useMemo(() => {
    if (!data) return undefined
    // ✅ este helper debería dejarte company.name para mostrar
    return extractDataUserCompanyHelper(data) as IUserData
  }, [data])

  const onEdit = async (values: IFormUser & { amount?: number; companyId?: string }, photoFile?: File | null) => {
    if (!userId) return

    const { name, email, type, password, phone, amount, companyId } = values

    setLoading(true)

    let photoUrl: string | null = null
    if (photoFile) {
      const fd = new FormData()
      fd.append("file", photoFile)
      const { ok: uploadOk, data: uploadData } = await uploadFile("/upload-file", "POST", { data: fd })
      if (uploadOk) photoUrl = (uploadData as any)?.url ?? null
    }

    const payload: any = {
      name,
      email,
      phone,
      type,
      password: password && password.trim() !== "" ? password : undefined,
      amount: amount ? Number(amount) : undefined,
      ...(photoUrl ? { photoUrl } : {}),
    }

    // ✅ SOLO super admin puede cambiar company
    if (currentRole === "SUPER_ADMIN") {
      payload.companyId = companyId || undefined
    }

    const { ok } = await onFetch<IUserData, any>(`/users/${userId}`, "PATCH", {
      data: payload,
    })

    setLoading(false)

    if (!ok) return

    snackBarAlert("El usuario se ha actualizado correctamente", { variant: "success" })
    clearCache()
    navigate(MENU_MAIN_HISTORY_NAV("users"))
  }

  if (loadDetail || loadingMe) {
    return (
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <BoxLoading isLoading showGif position="absolute" />
      </div>
    )
  }

  return (
    <>
      <UserFormNewAndEdit
        onBack={() => navigate(MENU_MAIN_HISTORY_NAV("users"))}
        onSubmit={onEdit}
        title="Editar Usuario"
        dataForm={dataForm}
        loading={loading}
        // ✅ si querés card de balance solo lectura: ponelo true y el componente decide por rol
        showInputBalance={true}
        currentRole={currentRole}
        // ✅ PARA QUE NO APAREZCA VACÍO
        currentCompanyId={currentCompanyId}
        currentCompanyName={currentCompanyName}
        showCompanyField={true}
      />

      <Box mt={4}>
        <UserWalletHistory
          resellerId={userId!}
          userName={`${data?.name ?? ""}`.trim()}
          userEmail={data?.email ?? ""}
        />
      </Box>
    </>
  )
}
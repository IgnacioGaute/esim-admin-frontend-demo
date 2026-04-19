// MyAccountPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { useFetch, useNotiAlert } from '@/shared/hooks'
import { BoxLoading } from '@/shared/components/BoxLoading'
import { IFormUser, IUserData } from '@/admin/utils/interfaces/user-data.interface'
import { UserFormNewAndEdit } from '@/admin/components/users/UserFormNewAndEdit'
import { extractDataUserCompanyHelper } from '@/admin/utils/helpers/extractDataUserCompanyHelper'
import { refreshMe } from '@/shared/store/slices/auth/authThunks'
import type { AppDispatch } from '@/shared/store/store'

export const MyAccountPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { snackBarAlert } = useNotiAlert()
  const [loadingUpdate, setLoadingUpdate] = useState(false)

  const {
    data: meDetail,
    loading: loadingDetail,
    onFetch: onFetchUser,
    clearCache,
  } = useFetch<IUserData & { amount?: number }>('users/me', 'GET', {
    init: true,
    cache: { enabled: false },
  })

  const { onFetch: uploadFile } = useFetch('/upload-file', 'POST', { init: false })

  const onEdit = async (values: IFormUser & { amount?: number }, photoFile?: File | null) => {
    if (!meDetail?.id) return

    const { name, email, password, phone } = values

    setLoadingUpdate(true)

    let photoUrl: string | null = null
    if (photoFile) {
      const fd = new FormData()
      fd.append('file', photoFile)
      const { ok: uploadOk, data: uploadData } = await uploadFile('/upload-file', 'POST', { data: fd })
      if (uploadOk) photoUrl = (uploadData as any)?.url ?? null
    }

    const { ok } = await onFetchUser<IUserData, any>('users/me', 'PATCH', {
      data: {
        name,
        email,
        password,
        phone,
        ...(photoUrl ? { photoUrl } : {}),
      },
    })

    setLoadingUpdate(false)

    if (!ok) return

    snackBarAlert('Tu perfil se ha actualizado correctamente', {
      variant: 'success',
    })
    clearCache()
    await dispatch(refreshMe())
    navigate(-1)
  }

  if (loadingDetail || !meDetail) {
    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <BoxLoading isLoading showGif position="absolute" />
      </div>
    )
  }

  return (
    <UserFormNewAndEdit
      onBack={() => navigate(-1)}
      onSubmit={onEdit}
      title="Mi cuenta"
      dataForm={extractDataUserCompanyHelper(meDetail) as IUserData}
      loading={loadingUpdate}
      showInputBalance={false}
      showCompanyField={false}
      showTypeField={false}
      currentRole={meDetail.type}
    />
  )
}

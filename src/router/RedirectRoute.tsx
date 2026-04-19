import { useEffect, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserAccess, useAuth } from '@/shared/hooks'
import { BoxLoading } from '@/shared/components/BoxLoading'
import { AccessError } from '@/shared/components/AccessError'

export const RedirectRoute = () => {
  const { initModule, err, isLoadingAccess } = useUserAccess(true)
  const { onNotAuthenticate } = useAuth()
  const { search } = useLocation()

  const queryPath = useMemo(() => {
    const params = new URLSearchParams(search)
    return params.get('path') || undefined
  }, [search])

  useEffect(() => {
    if (err && (err.type === '401' || err.type === 'MODULE_NOT_FOUND')) {
      const t = setTimeout(() => {
        onNotAuthenticate()
      }, 5000)

      return () => clearTimeout(t)
    }
  }, [err, onNotAuthenticate])

  if (isLoadingAccess) {
    return (
      <BoxLoading
        isLoading
        isTransparent
        positionContainer="fixed"
        title="Por favor espere un momento, comprobando acceso..."
        showGif={false}
      />
    )
  }

  if (initModule) {
    return <Navigate to={queryPath || initModule} replace />
  }

  if (err) {
    return <AccessError message={err.msg} />
  }

  return (
    <BoxLoading
      isLoading
      isTransparent
      positionContainer="fixed"
      title="Por favor espere un momento, comprobando acceso..."
      showGif={false}
    />
  )
}
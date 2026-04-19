import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  addModulesAccessUser,
  IAddModulesAccesUser,
  removeModulesAccesUser,
  useAppDispatch,
  useAppSelector,
} from '../store'
import { useFetch } from './useFetch'
import { IUsersType, IUserAccess } from '../interfaces/user'
import { getUserAccessHelper } from '../helpers/userAccessHelper'
import { AccessDenid } from '../components/AccessDenid'

export const useUserAccess = (initConsult: boolean = false) => {
  const dispatch = useAppDispatch()
  const { admin, store } = useAppSelector((state) => state.userAccess)

  const [attempt, setAttempt] = useState(initConsult)
  const [resolved, setResolved] = useState(!initConsult)
  const [err, setErr] = useState<{
    type: 'MODULE_NOT_FOUND' | 'ERR_API_ROL' | '401'
    msg: string
  } | null>(null)

  const {
    data: user,
    error,
    loading,
  } = useFetch<{ type: keyof IUsersType }>('auth/me', 'get', { init: attempt })

  const initModule = useMemo(() => {
    if (admin.length > 0) {
      return `/admin/${admin[0].module}`
    }

    if (store.length > 0) {
      return `/store${store[0].module === 'store' ? '' : `/${store[0].module}`}`
    }

    return undefined
  }, [admin, store])

  const addAccessUser = (access: IAddModulesAccesUser) => dispatch(addModulesAccessUser(access))
  const removeAccessUser = () => dispatch(removeModulesAccesUser())

  useEffect(() => {
    if (user) {
      setAttempt(false)

      const modulesAccess = getUserAccessHelper(user.type)

      if (modulesAccess == null) {
        setErr({
          type: 'MODULE_NOT_FOUND',
          msg: 'No se han encontrado módulos asignados a su usuario. Le cerraremos la sesión para que pueda volver a intentarlo más tarde.',
        })
        setResolved(true)
        return
      }

      addAccessUser(modulesAccess)
      setResolved(true)
      return
    }

    if (error) {
      setAttempt(false)

      if (error.handlingErr().code === 401) {
        setErr({
          type: '401',
          msg: 'Su sesión ha expirado, redirigiendo...',
        })
        setResolved(true)
        return
      }

      setErr({
        type: 'ERR_API_ROL',
        msg: 'Estamos teniendo problemas con su acceso, por favor inténtelo de nuevo o inténtelo más tarde.',
      })
      setResolved(true)
    }
  }, [user, error])

  useEffect(() => {
    setAttempt(initConsult)
    setResolved(!initConsult)

    return () => {
      setAttempt(false)
    }
  }, [initConsult])

  const GuardModuleAccess = (props: { children: ReactNode; variant: keyof IUserAccess }) => {
    const { children, variant } = props
    const { pathname } = useLocation()
    const navigate = useNavigate()

    const isAccessUser = useMemo(() => {
      let arrPathName = pathname.trim().split('/')
      arrPathName.shift()

      if (arrPathName[0] === 'admin') {
        arrPathName.shift()
      }

      const moduleAccessCurrent = getModuleAccessUser(variant).find(
        (item) => item.module === arrPathName[0]
      )

      if (moduleAccessCurrent) {
        const subModulesAccess = moduleAccessCurrent.subModule
        let accessChildren = true

        subModulesAccess.some((subModule) => {
          const newPathName = arrPathName.join('/')

          let constructPathName = subModule !== 'index' ? `/${subModule}` : ''
          accessChildren = false

          const subModuleParts = subModule.split('/')
          const currentPathParts = arrPathName.slice(1)

          if (subModuleParts.length === currentPathParts.length) {
            const resolvedParts = subModuleParts.map((part, index) => {
              if (part.startsWith(':')) {
                return currentPathParts[index]
              }
              return part
            })

            constructPathName = `/${resolvedParts.join('/')}`
          }

          constructPathName = `${moduleAccessCurrent.module}${constructPathName}`

          if (constructPathName === newPathName) {
            accessChildren = true
            return true
          }
        })

        return accessChildren
      }

      return false
    }, [pathname, variant])

    if (!isAccessUser) return <AccessDenid onBack={() => navigate(-1)} />

    return children
  }

  const getModuleAccessUser = (variant: keyof IUserAccess) => {
    switch (variant) {
      case 'store':
        return store
      default:
        return admin
    }
  }

  return {
    access: {
      admin,
      store,
    },
    initModule,
    err,
    isLoadingAccess: initConsult ? loading || attempt || !resolved : false,

    addAccessUser,
    removeAccessUser,

    GuardModuleAccess,
  }
}
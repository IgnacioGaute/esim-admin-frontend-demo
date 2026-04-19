import { useEffect, useMemo, useState } from "react"
import { Box, Skeleton } from "@mui/material"
import { useFetch } from "@/shared/hooks/useFetch"
import { IUsersType } from "@/shared/interfaces/user"
import {
  IDataResendEmailByBundle,
  IOrderData,
  IOrderDetail,
  IOrdersListDataTable,
  moduleOrdersHelper,
} from "@/admin/utils"
import { ListOrderDataTable, OrderDetail } from "@/admin/components/orders"
import { IDataBundle } from "@/admin/utils/interfaces/bundle-data.interface"
import { useNotiAlert } from "@/shared"
import { fetchApiHelper } from "@/shared/helpers/fetchApiHelper"

type IUserMini = {
  id: string
  name?: string
  surname?: string
  email?: string
  type?: "ADMIN" | "SELLER" | "SUPER_ADMIN"
}

const OrderPageSkeleton = () => {
  return (
    <Box>
      <Box
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          p: 3,
          backgroundColor: "background.paper",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="rounded" width={420} height={52} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="1.1fr 1.1fr 1fr 1fr 1fr 1fr 120px"
          gap={2}
          mb={2}
        >
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Box>

        {[1, 2, 3, 4, 5].map((item) => (
          <Box
            key={item}
            display="grid"
            gridTemplateColumns="1.1fr 1.1fr 1fr 1fr 1fr 1fr 120px"
            gap={2}
            alignItems="center"
            py={2}
            borderTop="1px solid"
            borderColor="divider"
          >
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Box display="flex" justifyContent="center" gap={1}>
              <Skeleton variant="circular" width={22} height={22} />
              <Skeleton variant="circular" width={22} height={22} />
            </Box>
          </Box>
        ))}

        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={3} mt={3}>
          <Skeleton variant="text" width={110} height={30} />
          <Skeleton variant="text" width={90} height={30} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Box>
      </Box>
    </Box>
  )
}

export const OrderPage = () => {
  const [orderId, setOrderId] = useState<string>("")
  const [bundles, setBundles] = useState<IDataBundle[]>([])
  const [loadBundles, setLoadBundles] = useState(false)

  const { snackBarAlert } = useNotiAlert()

  // ✅ órdenes
  const { data, loading } = useFetch<IOrderData[]>("/orders", "GET", { init: true })

  // ✅ user logueado
  const { data: user } = useFetch<{ type: keyof IUsersType }>("auth/me", "get", { init: true })

  // ✅ detalle orden
  const { data: order, loading: loadingOrderDetail } = useFetch<IOrderDetail>(`/orders/${orderId}`, "GET", {
    init: orderId !== "",
  })

  // ✅ USERS: traer NORMAL + RESELLER
  const { data: usersNormal, loading: loadingUsersNormal } = useFetch<IUserMini[]>(
    "/users",
    "GET",
    { init: true, instance: "main" }
  )

  const { data: usersReseller, loading: loadingUsersReseller } = useFetch<IUserMini[]>(
    "/users",
    "GET",
    { init: true, instance: "storeApi" }
  )

  // ✅ unir y armar options
  const resellerOptions = useMemo(() => {
    const normal = Array.isArray(usersNormal) ? usersNormal : []
    const reseller = Array.isArray(usersReseller) ? usersReseller : []

    const all = [...normal, ...reseller]

    const map = new Map<string, IUserMini>()
    all.forEach((u: any) => {
      const id = String(u?.id ?? u?._id ?? "").trim()
      const email = String(u?.email ?? "").trim().toLowerCase()
      const key = id || email
      if (!key) return
      if (!map.has(key)) map.set(key, u)
    })

    const list = Array.from(map.values())

    const toEmail = (u: any) => String(u?.email ?? "").trim()
    const toName = (u: any) => String(u?.name ?? "").trim()

    const toLabel = (u: any) => {
      const name = toName(u) || "Sin nombre"
      const email = toEmail(u) || "-"
      return `${name} (${email})`
    }

    const sorted = list.sort((a, b) => toLabel(a).localeCompare(toLabel(b)))

    return [
      { value: "all", label: "Todos" },
      ...sorted.map((u: any) => {
        const name = `${String(u?.name ?? "").trim()} ${String(u?.surname ?? "").trim()}`.trim()
        const email = String(u?.email ?? "").trim()

        const value = (name || "sin nombre").toLowerCase()
        const label = `${name || "Sin nombre"} (${email || "-"})`

        return { value, label }
      }),
    ]
  }, [usersNormal, usersReseller])

  const loadingResellers = loadingUsersNormal || loadingUsersReseller

  // ✅ map orders para la tabla
  const ordersList = useMemo<IOrdersListDataTable[]>(() => {
    if (data && Array.isArray(data)) {
      const listAux: IOrderData[] = []

      data.forEach((order) => {
        if (order.channel === "WEB" || order?.isByReseller) {
          if (order.products?.length > 0) {
            let qt = 0
            let amount = 0
            let countProducts = 1

            order.products.forEach((item, idx) => {
              qt += item.quantity
              amount += item.amount * item.quantity
              countProducts = idx + 1
            })

            order.product_name = order.products[0].name
            order.productId = countProducts === 1 ? order.products[0].productId : "--- --- ---"
            order.product_desp = countProducts === 1 ? order.products[0].description : `${countProducts} Bundle`
            order.product_price = countProducts === 1 ? order.products[0].amount : 0
            order.total = amount
            order.quantity = qt
          }
        }

        if (order.channel === "APP") {
          order.total = order.quantity * order.product_price
        }

        if (order.product_desp !== null && order.product_name !== null) {
          const exists = listAux.find((v) => v.id === order.id)
          if (!exists) listAux.push(order)
        }
      })

      return moduleOrdersHelper().unionByListExtractData(listAux)
    }

    return []
  }, [data])

  // ✅ bundles
  const getBundlesByReferenceIds = async (referenceIds: string[]) => {
    setLoadBundles(true)

    const { ok, data } = await fetchApiHelper<IDataBundle[], { referenceIds: string[] }>(
      "/esims/esims-by-reference",
      "POST",
      { data: { referenceIds } }
    )

    if (ok && data) setBundles(data)
    setLoadBundles(false)
  }

  const resendEmailByBundle = async (body: IDataResendEmailByBundle) => {
    setLoadBundles(true)

    const { ok, data } = await fetchApiHelper<boolean, IDataResendEmailByBundle>(
      "/orders/resend-email/bundle-by-order",
      "POST",
      { data: { ...body } }
    )

    setLoadBundles(false)

    if (ok && data) {
      snackBarAlert("Se ha reenviado correctamente el correo con la orden y el bundle", {
        variant: "success",
      })
      return
    }

    snackBarAlert("Ocurrio un error inesperado en el reenvio del correo", { variant: "error" })
  }

  useEffect(() => {
    if (!order) return

    const referenceIds: string[] =
      order?.referencesIds && order.referencesIds.length > 0
        ? order.referencesIds
        : order?.referenceId
          ? [order.referenceId]
          : []

    if (referenceIds.length > 0) getBundlesByReferenceIds(referenceIds)
    else setBundles([])
  }, [order])

  const isPageLoading = loading || loadingResellers

  if (isPageLoading) {
    return <OrderPageSkeleton />
  }
  console.log(ordersList)

  return (
    <div>
      <ListOrderDataTable
        ordersList={ordersList}
        resellerOptions={resellerOptions}
        onShowOrder={(value) => setOrderId(value.id)}
        loading={false}
        isSuperAdmin={user?.type === "SUPER_ADMIN"}
      />

      <OrderDetail
        loading={loadingOrderDetail}
        opened={orderId !== ""}
        onClose={() => setOrderId("")}
        order={order}
        bundles={bundles}
        loadBundles={loadBundles}
        showDetailClient={user?.type === "SUPER_ADMIN"}
        onResendBundle={resendEmailByBundle}
      />
    </div>
  )
}
// @/admin/pages/payments/PaymentsPage.tsx

import { useMemo, useState } from "react"
import { Box, Skeleton } from "@mui/material"
import { useFetch } from "@/shared/hooks"
import { BoxLoading } from "@/shared/components/BoxLoading"
import { ICompanyTopup } from "@/admin/utils/interfaces/company-topup.interface"
import { ListCompanyTopupDataTable } from "@/admin/components/companies/topup/ListCompanyTopupDataTable"


const PaymentsPageSkeleton = () => {
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
          <Skeleton variant="rounded" width={180} height={40} />
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="1.2fr 1fr 1fr 1fr 1fr 1fr 160px"
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
            gridTemplateColumns="1.2fr 1fr 1fr 1fr 1fr 1fr 160px"
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
            <Skeleton variant="rounded" width={120} height={30} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export const PaymentsPage = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const url = useMemo(() => `/company-topups`, [refreshKey])

    const { data, loading } = useFetch<{ ok: boolean; data: ICompanyTopup[] }>(url, "GET", {
    init: true,
    cache: { enabled: false },
    })

  if (loading) {
    return <PaymentsPageSkeleton />
  }


  return (
    <>
        <ListCompanyTopupDataTable
        paymentsList={data?.data || []}
        loading={false}
        onRefresh={() => setRefreshKey((prev) => prev + 1)}
        />

      <BoxLoading
        isLoading={false}
        position="fixed"
        title=""
      />
    </>
  )
}

export default PaymentsPage
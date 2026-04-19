import { useMemo, useState } from "react"
import { Box, Skeleton } from "@mui/material"
import { useFetch } from "@/shared/hooks"
import { BoxLoading } from "@/shared/components/BoxLoading"

import { ListPartnerDataTable } from "@/admin/components/partners/ListPartnerDataTable"
import { DetailPartnerRequest } from "@/admin/components/partners/DetailPartnerRequest"
import { IPartnerData } from "@/admin/utils/interfaces/partners.interface"

const PartnerPageSkeleton = () => {
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
          gridTemplateColumns="1.2fr 1fr 1fr 1fr 120px"
          gap={2}
          mb={2}
        >
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
            gridTemplateColumns="1.2fr 1fr 1fr 1fr 120px"
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

export const PartnerPage = () => {
  const [selectedPartner, setSelectedPartner] = useState<IPartnerData | null>(null)

  const urlPartners = useMemo(() => `/requests`, [])

  const { data, loading, onRefresh } = useFetch<IPartnerData[]>(urlPartners, "GET", {
    init: true,
  })

  if (loading) {
    return <PartnerPageSkeleton />
  }

  return (
    <>
      <ListPartnerDataTable
        partnersList={data || []}
        loading={false}
        onShowPartner={(value) => {
          setSelectedPartner(value)
        }}
      />

      <DetailPartnerRequest
        opened={selectedPartner !== null}
        partner={selectedPartner}
        onClose={() => setSelectedPartner(null)}
        onConfirmed={() => {
          onRefresh()
        }}
      />

      <BoxLoading isLoading={false} position="fixed" title="" />
    </>
  )
}
import { useMemo, useState } from "react"
import { Box, Skeleton } from "@mui/material"
import { useFetch } from "@/shared/hooks"
import { IUsersType } from "@/shared/interfaces/user"
import { BoxLoading } from "@/shared/components/BoxLoading"
import { ListTransactionDataTable, DetailTransaction } from "@/admin/components/transactions"
import { ITransactionData, ITransactionDetailWalletData } from "@/admin/utils/interfaces"

const TransactionPageSkeleton = () => {
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
          gridTemplateColumns="1.2fr 1fr 1fr 1fr 1fr 120px"
          gap={2}
          mb={2}
        >
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
            gridTemplateColumns="1.2fr 1fr 1fr 1fr 1fr 120px"
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

export const TransactionPage = () => {
  const [walletId, setWalletId] = useState<string>("")

  const { data: user } = useFetch<{ type: keyof IUsersType }>("auth/me", "get", { init: true })

  const urlTransaction = useMemo(() => `/wallets/transactions`, [])

  const { data, loading } = useFetch<ITransactionData[]>(urlTransaction, "GET", { init: true })

  const { data: detail, loading: loadDetail } = useFetch<ITransactionDetailWalletData>(
    `/wallets/${walletId}?isExactWallet=true`,
    "GET",
    { init: walletId !== "" }
  )

  if (loading) {
    return <TransactionPageSkeleton />
  }

  return (
    <>
      <ListTransactionDataTable
        transactionsList={data || []}
        loading={false}
        onShowTransaction={(value) => {
          if (user?.type === "SUPER_ADMIN") setWalletId(value.walletId)
        }}
       isSuperAdmin={user?.type === "SUPER_ADMIN"}
      />

      <DetailTransaction
        opened={walletId !== ""}
        onClose={() => setWalletId("")}
        loading={loadDetail}
        detail={detail}
      />

      <BoxLoading
        isLoading={false}
        position="fixed"
        title=""
      />
    </>
  )
}
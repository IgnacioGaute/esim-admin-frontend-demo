// @/admin/hooks/useCompanyTopupActions.ts

import { useFetch } from "@/shared/hooks"

export const useCompanyTopupActions = () => {
  const { onFetch, isFetching } = useFetch<any>("", "POST", {
    init: false,
    showMessageError: true,
  })

  const confirmBankTransfer = async (topupId: string) => {
    return await onFetch(`/company-topups/${topupId}/confirm-bank-transfer`, "POST")
  }

  const rejectBankTransfer = async (topupId: string, reason: string) => {
    return await onFetch(`/company-topups/${topupId}/reject-bank-transfer`, "POST", {
      data: { reason },
    })
  }

  return {
    confirmBankTransfer,
    rejectBankTransfer,
    loadingAction: isFetching,
  }
}

export default useCompanyTopupActions
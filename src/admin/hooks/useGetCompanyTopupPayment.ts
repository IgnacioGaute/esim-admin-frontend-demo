import { useFetch } from "@/shared/hooks"

export interface ICompanyTopupPayment {
  id: string
  companyId: string
  amountUsd: number
  amountClp: number
  status: string
  sessionId: string
  buyOrder?: string | null
  provider?: "webpay" | "khipu" | "bank_transfer" | null
  bankTransferReference?: string | null
  bankTransferReceiptUrl?: string | null
  company?: {
    id: string
    name?: string
  }
}

const useGetCompanyTopupPayment = (sessionId?: string, topupId?: string) => {
  const shouldInit = Boolean(sessionId && topupId)
  const endpoint = shouldInit
    ? `company-topups/payment/${sessionId}?topupId=${topupId}`
    : ""

  const { data, loading, error, onFetch } = useFetch<{
    ok?: boolean
    data?: ICompanyTopupPayment
  }>(
    endpoint,
    "GET",
    {
      init: shouldInit,
      cache: { enabled: false },
    }
  )

  const refetchTopup = async () => {
    if (!endpoint) return null
    return await onFetch(endpoint, "GET")
  }

  return {
    topup: (data as any)?.data ?? null,
    loadingTopup: loading,
    errorTopup: error,
    refetchTopup,
  }
}

export default useGetCompanyTopupPayment
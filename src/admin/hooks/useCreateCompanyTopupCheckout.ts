import { useFetch } from "@/shared/hooks"

interface CreateCompanyTopupCheckoutPayload {
  companyId: string
  amount: number
}

interface CreateCompanyTopupCheckoutResponse {
  ok?: boolean
  message?: string
  data?: {
    url_access: string
    topupId?: string
    sessionId?: string
  }
  url_access?: string
}

const useCreateCompanyTopupCheckout = () => {
  const { onFetch, isFetching } = useFetch<CreateCompanyTopupCheckoutResponse>(
    "",
    "POST",
    {
      init: false,
      showMessageError: true,
    }
  )

  const createCheckout = async (payload: CreateCompanyTopupCheckoutPayload) => {
    return await onFetch("/company-topups/checkout", "POST", {
      data: payload,
    })
  }

  return {
    createCheckout,
    loadingCheckout: isFetching,
  }
}

export default useCreateCompanyTopupCheckout
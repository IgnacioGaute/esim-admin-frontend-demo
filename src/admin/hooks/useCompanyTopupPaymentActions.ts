import { useFetch } from "@/shared/hooks"

interface IWebpayTopupResponse {
  ok?: boolean
  data?: {
    topupId: string
    provider: "webpay"
    status: string
    sessionId: string
    url: string
    token: string
  }
}

interface IKhipuTopupResponse {
  ok?: boolean
  data?: {
    topupId: string
    provider: "khipu"
    status: string
    sessionId: string
    paymentUrl: string
    paymentId?: string
  }
}

interface IBankTransferTopupResponse {
  ok?: boolean
  data?: {
    topupId: string
    provider: "bank_transfer"
    status: string
    sessionId: string
    amountUsd: number
    amountClp: number
    reference: string
    bankData: {
      bankName: string
      accountHolder: string
      accountType: string
      accountNumber: string
      rut: string
      email: string
    }
  }
}

const useCompanyTopupPaymentActions = () => {
  const { onFetch, isFetching } = useFetch<any>("", "GET", {
    init: false,
    showMessageError: true,
  })

  const startWebpay = async (sessionId: string, topupId: string) => {
    return await onFetch(
      `company-topups/payment/webpay/${sessionId}/${topupId}`,
      "GET"
    )
  }

  const startKhipu = async (sessionId: string, topupId: string) => {
    return await onFetch(
      `company-topups/payment/khipu/${sessionId}/${topupId}`,
      "GET"
    )
  }

  const startBankTransfer = async (sessionId: string, topupId: string) => {
    return await onFetch(
      `company-topups/payment/bank-transfer/${sessionId}/${topupId}`,
      "GET"
    )
  }

  const uploadBankReceipt = async (
    topupId: string,
    file: File,
    note?: string
  ) => {
    const formData = new FormData()
    formData.append("file", file)
    if (note?.trim()) formData.append("note", note.trim())

    return await onFetch(
      `company-topups/${topupId}/upload-bank-receipt`,
      "POST",
      {
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
  }

  return {
    startWebpay,
    startKhipu,
    startBankTransfer,
    uploadBankReceipt,
    loadingPaymentAction: isFetching,
  }
}

export default useCompanyTopupPaymentActions
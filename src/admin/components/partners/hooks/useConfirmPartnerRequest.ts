import { useFetch } from "@/shared/hooks"

const useConfirmPartnerRequest = () => {
  const { onFetch, isFetching } = useFetch<any>(
    "",
    "PATCH",
    {
      init: false,
      showMessageError: true,
    }
  )

  const confirmPartnerRequest = async (id: string, comment: string) => {
    return await onFetch(`/requests/confirm/${id}`, "PATCH", {
      data: { comments: comment },
    })
  }

  return {
    confirmPartnerRequest,
    loadingConfirm: isFetching,
  }
}

export default useConfirmPartnerRequest
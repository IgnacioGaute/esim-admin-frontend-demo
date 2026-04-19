import { useFetch } from "@/shared/hooks"

const useRejectedPartnerRequest = () => {
  const { onFetch, isFetching } = useFetch<any>(
    "",
    "PATCH",
    {
      init: false,
      showMessageError: true,
    }
  )

  const rejectedPartnerRequest = async (id: string, comment: string) => {
    return await onFetch(`/requests/rejected/${id}`, "PATCH", {
      data: { comments: comment },
    })
  }

  return {
    rejectedPartnerRequest,
    loadingRejected: isFetching,
  }
}

export default useRejectedPartnerRequest
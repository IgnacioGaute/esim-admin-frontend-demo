import { useFetch } from "@/shared/hooks"

const useUpdatePartnerComment = () => {
  const { onFetch, isFetching } = useFetch<any>(
    "",
    "PATCH",
    {
      init: false,
      showMessageError: true,
    }
  )

  const updatePartnerComment = async (id: string, comment: string) => {
    return await onFetch(`/requests/comments/${id}`, "PATCH", {
      data: { comments: comment },
    })
  }

  return {
    updatePartnerComment,
    loadingUpdateComment: isFetching,
  }
}

export default useUpdatePartnerComment
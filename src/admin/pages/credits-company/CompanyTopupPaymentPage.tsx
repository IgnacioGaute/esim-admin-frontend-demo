import { Alert, Box } from "@mui/material"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { LayerCardForm } from "@/admin/components"
import CompanyTopupPaymentMethods from "@/admin/components/companies/topup/CompanyTopupPaymentMethods"
import useGetCompanyTopupPayment from "@/admin/hooks/useGetCompanyTopupPayment"
import { useFetch } from "@/shared"
import { IUserData } from "@/admin/utils"

export const CompanyTopupPaymentPage = () => {
  const navigate = useNavigate()
  const { sessionId = "" } = useParams<{ sessionId: string }>()
  const [searchParams] = useSearchParams()
  const topupId = searchParams.get("topupId") ?? ""

  const { topup, loadingTopup } = useGetCompanyTopupPayment(sessionId, topupId)
  const { data: me, loading: loadingMe } = useFetch<IUserData & { amount?: number }>(
    "users/me",
    "GET",
    { init: true, cache: { enabled: false } }
  );


  return (
    <LayerCardForm
      title="Pago de recarga"
      loading={loadingTopup}
      onBack={() => navigate(-1)}
    >
      <Box pt={2.5} width="100%">
        {!topup ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            No se encontró la recarga.
          </Alert>
        ) : (
          <CompanyTopupPaymentMethods
            companyId={topup.companyId}
            sessionId={topup.sessionId}
            topupId={topup.id}
            amountUsd={Number(topup.amountUsd)}
            amountClp={Number(topup.amountClp)}
            companyName={me?.company.name}
          />
        )}
      </Box>
    </LayerCardForm>
  )
}

export default CompanyTopupPaymentPage
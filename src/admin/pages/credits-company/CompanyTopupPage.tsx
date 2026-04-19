import { LayerCardForm } from "@/admin/components"
import CompanyTopupForm from "@/admin/components/companies/topup/CompanyTopupForm"
import { useFetch } from "@/shared/hooks"
import { IUserData } from "@/admin/utils"
import { Alert, Box } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"

export const CompanyTopupPage = () => {
  const navigate = useNavigate()
  const { companyId: companyIdParam } = useParams<{ companyId?: string }>()

  const { data: me, loading: loadingMe } = useFetch<IUserData & { amount?: number }>(
    "users/me",
    "GET",
    { init: true, cache: { enabled: false } }
  )

  const companyId =
    companyIdParam ||
    (me as any)?.company?.id ||
    (me as any)?.companyId ||
    ""

  return (
      <Box pt={2.5} width="100%">
        {!loadingMe && !companyId ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            No se encontró la compañía asociada al usuario.
          </Alert>
        ) : (
          <CompanyTopupForm
            companyId={companyId}
            onBack={() => navigate(-1)}
          />
        )}
      </Box>
  )
}

export default CompanyTopupPage
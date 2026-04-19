import { useState } from 'react';
import { Box, Typography } from "@mui/material";
import { BoxLoading } from '@/shared/components/BoxLoading';
import { FormLogin } from "../components/FormLogin";

import { useAuth, NavigateLink, ButtonGoogle, useNotiAlert } from '@/shared';
import { ISignInForm, signInService } from "../utils";

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { onAuthenticate } = useAuth();
  const { snackBarAlert } = useNotiAlert();

  

  const onSubmit = async(dataForm: ISignInForm) => {
    setIsLoading(true);

    const { ok, data, msgErr } = await signInService.onSignIn(dataForm);

    setTimeout(() => {
      setIsLoading(false);
    }, 800);

    if( ok && data ){
      onAuthenticate(data.access_token, data.expires_at, data.user.type);
      return;
    }

    snackBarAlert(msgErr!, { variant: 'error', showClose: true })
    
  }

  return (

    <>
      <Box width='100%'>
        <Box mb={4} textAlign='center'>
          <Typography
            component='h3'
            variant='h6'
          >Iniciar sesión en eSIM Demo</Typography>
        </Box>
        <FormLogin 
          onSubmit={onSubmit}
        />
      </Box>
      <BoxLoading 
        isLoading={isLoading}
        borderRadius={'8px'}
        title='Iniciando sesión... Espere por favor'
      />
    </>
  )
}

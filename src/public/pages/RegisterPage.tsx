import { useState } from 'react';
import { Box, CardContent, Grid, Card, Typography } from "@mui/material"
import { ArrowBack } from "@mui/icons-material";

import { BoxLoading, ButtonGoogle, NavigateLink, useNotiAlert } from "@/shared";

import { ContentStepRegister, FormRegister } from "../components/sign-up";

import { signUpService, TypeSignUpData } from '../utils';

import Logo2x from '@/assets/images/logo/logo-2x.png';


export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { snackBarAlert } = useNotiAlert();
  
  const onSubmit = async(dataForm: TypeSignUpData) => {
    setIsLoading(true);

    const { ok, msgErr } = await signUpService.onSignUp(dataForm);

    setTimeout(() => {
      setIsLoading(false);
    }, 800);

    if( ok ){
      return snackBarAlert('Cuenta creada!, en un par de horas, estaremos aceptando tu solicitud', { variant: 'success' })
    }
    
    snackBarAlert(msgErr!, { variant: 'error', showClose: true })
  }

  return (
    <Box width='100%' maxWidth='768px' margin='0 auto' py={2.5} >
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card elevation={0} variant='outlined'>
            <CardContent>
              <BackHeader />
              <ContentStepRegister />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card elevation={0} variant='outlined' sx={{position: 'relative'}}>
            <CardContent> 
              <Box mb={3} textAlign='center' pt={2}>
                <Typography
                  component='h1'
                  variant='h5'
                  mb={2}
                >Crear cuenta</Typography>
                <Box textAlign='center' mb={3.5}>
                 <ButtonGoogle isSignIn={false} />
                </Box>
                <Box display='flex' alignItems='center' flexDirection='row' justifyContent='space-between'>
                  <Box width='40%' height={'1.3px'} bgcolor='#4b5563b3' />
                  <Typography component='span' variant='body2'>O</Typography>
                  <Box width='40%' height={'1.3px'} bgcolor='#4b5563b3' />
                </Box>
              </Box>
              <FormRegister onSubmit={onSubmit} />
            </CardContent>
            <BoxLoading 
              isLoading={isLoading}
              borderRadius={'4px'}
              title='Creando tu cuenta... Espere por favor'
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const BackHeader = () => (
  <Box display='flex' flexDirection='row' alignItems='center' pb={2.5}>
    <Box mr={1}>
      <NavigateLink
        to='/sign-in'
      >
       <ArrowBack fontSize='large' />
      </NavigateLink>
    </Box>
    <Box flex={1}>
      <Box textAlign='left' height='4rem'>
        <img src={Logo2x} alt="eSIM Demo Logo" className="image-size-maxFull"/>
      </Box>
    </Box>
  </Box>
)


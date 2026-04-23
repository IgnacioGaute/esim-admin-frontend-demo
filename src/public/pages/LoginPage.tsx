import { useState } from 'react';
import { Box, Typography, styled, keyframes } from '@mui/material';
import { TronLoading } from '@/shared/components/tron';
import { FormLogin } from '../components/FormLogin';
import { useTronTheme } from '@/theme/TronThemeContext';

import { useAuth, useNotiAlert } from '@/shared';
import { ISignInForm, signInService } from '../utils';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Title = styled(Typography)<{ $color: string }>(({ $color }) => ({
  color: '#E8E8E8',
  fontSize: '18px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  animation: `${fadeIn} 0.6s ease-out`,
  '& span': {
    color: $color,
    textShadow: `0 0 20px rgba(${hexToRgb($color)}, 0.5)`,
  },
}));

const Subtitle = styled(Typography)({
  color: 'rgba(232, 232, 232, 0.5)',
  fontSize: '12px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginTop: '8px',
  animation: `${fadeIn} 0.6s ease-out 0.1s both`,
});

const FormContainer = styled(Box)({
  animation: `${fadeIn} 0.6s ease-out 0.2s both`,
});

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { onAuthenticate } = useAuth();
  const { snackBarAlert } = useNotiAlert();
  const { identity } = useTronTheme();

  const onSubmit = async (dataForm: ISignInForm) => {
    setIsLoading(true);

    const { ok, data, msgErr } = await signInService.onSignIn(dataForm);

    setTimeout(() => {
      setIsLoading(false);
    }, 800);

    if (ok && data) {
      onAuthenticate(data.access_token, data.expires_at, data.user.type);
      return;
    }

    snackBarAlert(msgErr!, { variant: 'error', showClose: true });
  };

  return (
    <>
      <Box width="100%">
        <Box mb={4} textAlign="center">
          <Title component="h3" variant="h6" $color={identity.primary}>
            Iniciar sesion en <span>eSIM</span>
          </Title>
          <Subtitle>Sistema de Administracion</Subtitle>
        </Box>
        <FormContainer>
          <FormLogin onSubmit={onSubmit} />
        </FormContainer>
      </Box>
      {isLoading && (
        <TronLoading
          message="AUTENTICANDO"
          subMessage="Verificando credenciales..."
          fullScreen
        />
      )}
    </>
  );
};

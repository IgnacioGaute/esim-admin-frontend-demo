import { Button, ButtonProps } from '@mui/material';
import IconGoogleSvg from '@/assets/images/icons/icon-google.svg';


interface Props extends ButtonProps{
    isSignIn?: boolean;
}

export const ButtonGoogle = ({
    isSignIn = true,
    ...props
}:Props) => {
  return (
    <Button
        variant='outlined'
        type='button'
        size='medium'
        sx={{
            textTransform: 'none',
            padding: '8px 20px', 
            borderRadius: 40
        }}
        startIcon={<img src={IconGoogleSvg} className='icon-google-size' />}
        {...props}
    >
        {`${ isSignIn ? 'Iniciar sesión' : 'Regístrate'}`} con Google
    </Button>
  )
}

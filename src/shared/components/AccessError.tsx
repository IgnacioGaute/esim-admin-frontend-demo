import { Box, Avatar, Typography, Button } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import AccessErrorIMG from '@/assets/images/icons/error.png'


interface Props{
    message: string;
}

export const AccessError = ({
    message
}: Props) => {
  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} >
        <Avatar 
            variant="square"
            src={AccessErrorIMG}
            sx={{
                width: 64,
                height: 64,
                mb: 2
            }}
        />
        <Typography
            variant='subtitle2'
            textAlign='center'
            margin={'0 auto'}
            maxWidth='320px'
            pb={3}
        >{message}</Typography>
        {/*<Button
            variant='outlined'
            color='secondary'
            size='medium'
            startIcon={<ArrowBack />}
            onClick={onBack}
        >
            Volver
        </Button>*/}
    </Box>
  )
}

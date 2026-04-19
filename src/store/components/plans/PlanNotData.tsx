import { ReactNode } from 'react';
import { Flag } from '@mui/icons-material';
import { Avatar, Box, Button, Typography } from '@mui/material';
import Travel from '@/assets/images/icons/travel.png';






interface Props{
    message: ReactNode;
    onShowCountry?: () => void;
}

export const PlanNotData = ({
    message,
    onShowCountry
}:Props) => {
  return (
    <Box py={5} display='flex' alignItems='center' justifyContent='center' flexDirection='column' width='100%'>
        <Avatar 
            src={Travel}
            sx={{
            height: 140,
            width: 140,
            mb: '15px'
            }}
        />
        <Typography textAlign='center' maxWidth='380px' mb={2}>
            {message}
        </Typography>
        {
            onShowCountry &&
            <Button
                variant='outlined'
                color='secondary'
                size='medium'
                sx={{ textTransform: 'capitalize'}}
                endIcon={<Flag />}
                onClick={onShowCountry}
            >
                Ver paises populares
            </Button>
        }
    </Box>
  )
}

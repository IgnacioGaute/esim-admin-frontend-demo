import { Avatar, Box, Typography } from '@mui/material'
import Cart0 from '@/assets/images/icons/carro-vacio.png';

export const ItemCeroCart = () => {
  return (
    <Box height='100%' width='100%' display='flex' alignItems='center' justifyContent='center' flexDirection='column'>
        <Avatar 
            src={Cart0}
            sx={{ mb: 2, height: 60, width: 60 }}
        />
        <Typography
            variant='subtitle2'
            textAlign='center'
            margin={'0 auto'}
            maxWidth='320px'
            color='secondary'
        >Aun no tienes paquetes de datos agregados al carrito de compras.</Typography>
    </Box>
  )
}

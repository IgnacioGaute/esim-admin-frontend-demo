import { ReactNode } from "react";
import { Box } from "@mui/material";

import Logo2x from '@/assets/images/logo/esim-logo.svg';
import { stylesLayout } from './Layout.style';


interface Props{
    children: ReactNode;
    type?: 'primary' | 'secondary';
}

export const PrimaryLayout = ({
    children,
    type = 'primary'
}:Props) => {
    const styles = stylesLayout();

    return (
        <Box component='section' sx={[styles.main, type == 'primary' && styles.primary]} >
            {
                type == 'primary' ? 
                <Box sx={[styles.card]} className='shadow-1'>
                    <Box mb={2} textAlign='center' height='5rem'>
                        <img src={Logo2x} alt="eSIM Demo Logo" className="image-size-maxFull"/>
                    </Box>
                    { children }
                </Box>
                : children
            }
        </Box>
    )
}

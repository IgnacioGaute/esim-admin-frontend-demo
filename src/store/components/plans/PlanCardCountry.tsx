import React from 'react'
import { StyledCard } from '../StyledCard'
import { Avatar, Box, Typography } from '@mui/material'
import { ICountryData } from '@/store/utils'


interface Props extends ICountryData{
    onSelectCountry: () => void;
}

export const PlanCardCountry = ({
    onSelectCountry,
    ...props
}: Props) => {
  return (
    <StyledCard>
        <Box component='a' onClick={onSelectCountry} display='flex' flexDirection='row' alignItems='center'  width='100%'>
            <Avatar 
                src={props.flag}
                sx={{
                    mr: 1.5,
                    width: 36,
                    height: 36
                }}
            />
            <Box flex={1}>
                <Typography variant='subtitle1' component='h6' fontWeight='500'>
                    { props.name }                   
                </Typography>
            </Box>
        </Box>
    </StyledCard>
  )
}

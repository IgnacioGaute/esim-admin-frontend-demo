import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import React, { ReactNode } from 'react'

interface ItemDetailAccordionProps{
    label: string;
    expanded: boolean;
    handleChange: ((event: React.SyntheticEvent, expanded: boolean) => void);
    children?: ReactNode;
    msgNotData?: boolean;
}

export const ItemDetailAccordion = ({
    expanded,
    label,
    handleChange,
    children,
    msgNotData = false
}:ItemDetailAccordionProps) => (
    <Accordion expanded={expanded} onChange={handleChange} elevation={0} sx={{
        marginBottom: 2,
        backgroundColor: '#FAFBFF',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        ':before': {
            display: 'none'
        },
        '& .MuiButtonBase-root': {
            padding: '0px 8px',
            minHeight: '38px'
        }
    }}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            sx={{
                '& .MuiAccordionSummary-content': {
                    margin: 0
                }
            }}
        >
            <Typography component='span' variant='body2' fontWeight='400' flex={1}>
                {label}:
            </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{padding: '0px 12px'}}>
            { children }
            { msgNotData && <Typography mb={2} variant='body2' component='h5' color='red'>No hay más datos.</Typography> }
        </AccordionDetails>
    </Accordion>
)

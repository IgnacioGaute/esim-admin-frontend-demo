import { ReactNode } from "react";
import { Alert, AlertProps, Box, Skeleton, Typography } from "@mui/material";


interface ItemDetailProps{
    label: string;
    description?: string | ReactNode;
    component?: 'box' | 'alert';
    alertProps?: AlertProps;
    loading?: boolean;
    showLabel?: boolean;
    mb?: number;
}

export const ItemDetail = ({
    label,
    description,
    component = 'alert',
    alertProps,
    loading,
    showLabel = true,
    mb = 2
}: ItemDetailProps) => {

    const DivComponent = ({ children }: { children?: ReactNode }) => {
        if( loading ) return (
            <Skeleton 
                sx={{
                    padding: '5px 7px',
                    minWidth: '100px',
                }}
            />
        )

        if ( component == 'alert' ){
            return (
                <Alert
                    sx={{
                        padding: '5px 7px',
                        minWidth: '100px',
                        justifyContent: 'center',
                        '& .MuiAlert-message': {
                            padding: 0
                        }
                    }}
                    {...alertProps}   
                    icon={false}
                >
                    {children}
                </Alert>
            )
        }

        return (
            <Box display='flex' alignItems='center' textTransform='uppercase'>
                {children}
            </Box>
        )
    }

    return (
        <Box display='flex' width='100%' flexDirection='row' alignItems='center' mb={mb}>
            { showLabel && <Typography component='span' variant='body2' fontWeight='300' flex={1}>{label}:</Typography> }
            <DivComponent children={description} />
        </Box>
    )
}
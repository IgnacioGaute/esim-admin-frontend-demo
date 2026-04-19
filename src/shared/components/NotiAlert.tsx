import { forwardRef, ReactNode, useCallback, useMemo } from 'react'
import { SnackbarProvider, useSnackbar, SnackbarContent  } from 'notistack';
import { Alert, AlertColor } from '@mui/material';
import { IAlertStackProps } from '../interfaces/noti-alert';


interface Props {
    children: ReactNode;
}

export const NotiAlert = ({
    children
}: Props) => {

    return (
        <SnackbarProvider 
            maxSnack={3} 
            autoHideDuration={3500} 
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            Components={{
                success: AlertStack,
                error: AlertStack,
                warning: AlertStack,
                info: AlertStack
            }}
        >
            { children }
        </SnackbarProvider>
    )
}


  
const AlertStack = forwardRef<HTMLDivElement, IAlertStackProps>(
    ({ id, ...props }, ref) => {

      const { closeSnackbar } = useSnackbar();
  
      const handleDismiss = useCallback(() => {
        closeSnackbar(id);
      }, [id, closeSnackbar]);

      const variant = useMemo<AlertColor>(() => {
        switch (props.variant) {
            case 'success':
                return 'success'
            case 'error':
                return 'error'
            case 'warning':
                return 'warning'         
            default:
                return 'info'
        }

      }, [props.variant])
  
      return (
        <SnackbarContent ref={ref} style={{
                maxWidth: '380px'
            }}
            className='shadow-1' 
        >
          <Alert 
            {...props.propsAlert} 
            severity={variant}
            onClose={props.showClose ? handleDismiss : undefined}
            style={{width: '100%'}}
           >{props.message}</Alert>
        </SnackbarContent>
      );
    }
);
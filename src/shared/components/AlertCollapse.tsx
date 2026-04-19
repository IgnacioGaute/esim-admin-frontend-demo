import { Collapse, Alert, IconButton, AlertTitle, AlertProps } from '@mui/material';
import CloseOutlined  from '@mui/icons-material/CloseOutlined';

interface Props {
    show: boolean;
    description: string;
    onClosed?: () => void;
    typeAlert?: TAlertCollapse;
    showTitle?: {
        show: boolean;
        title?: string;
    };
    showIcon?: boolean;
    aletProps?: AlertProps
}

type TAlertCollapse = 'success' | 'info' | 'warning' | 'error';

export const AlertCollapse = ({
    show,
    onClosed,
    description,
    showTitle,
    typeAlert = 'info',
    showIcon = false,
    aletProps
}: Props) => {
  return (
    <Collapse in={show}>
        <Alert
          action={
            onClosed &&
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClosed}
            >
              <CloseOutlined fontSize="inherit" />
            </IconButton>
          } 
          severity={typeAlert}
          {...aletProps}
        >
          { showTitle?.show && <AlertTitle>{showTitle?.title || typeAlert}</AlertTitle> }
          { description }
        </Alert>
    </Collapse>
  )
}

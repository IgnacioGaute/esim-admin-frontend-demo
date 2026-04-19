import { Dialog, Card, CardContent, Typography, DialogActions, Button, Alert } from "@mui/material";
import { DeleteOutlineOutlined  } from "@mui/icons-material";

interface Props{
    onClose: () => void;
    opened: boolean;
    title: string;
    desp?: string;
    onConfirm: () => void;
}

export const ModalConfirmDelete = ({
    onClose,
    onConfirm,
    opened,
    title,
    desp
}: Props) => {
  return (
    <Dialog
        open={opened}
        onClose={onClose}
        maxWidth='xs'
        fullWidth={true}
    >
        <Card elevation={0} sx={{overflow: 'auto'}}>
            <CardContent>
                <Typography
                    variant='h6'
                    component='h1'
                    fontWeight='500'
                >
                 { title }
                </Typography>
                {
                    desp &&
                    <Alert
                        severity='warning'
                        icon={false}
                        sx={{mt: 2.5}}
                    >{ desp } </Alert>
                }
            </CardContent>
        </Card>
        <DialogActions>
            <Button 
                variant='outlined'
                color='primary'
                sx={{textTransform: 'capitalize',  minWidth: '110px'}}
                onClick={onClose}
                disableElevation
            >
                Cancelar
            </Button>
            <Button 
                variant='contained'
                color='secondary'
                startIcon={<DeleteOutlineOutlined fontSize='small'/>}
                sx={{textTransform: 'capitalize', ml:1.5, minWidth: '110px'}}
                onClick={onConfirm}
                disableElevation
            >
                Eliminar
            </Button>
        </DialogActions>
    </Dialog>
  )
}

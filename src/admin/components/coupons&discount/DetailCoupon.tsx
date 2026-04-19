
import { useState } from "react";
import { Dialog, Box, Card, CardContent, Grid, Typography, IconButton, DialogActions, Button } from "@mui/material";
import { CloseOutlined, DeleteOutlineOutlined, EditNoteOutlined } from "@mui/icons-material";
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper";
import { ModalConfirmDelete } from '@/shared/components/ModalConfirmDelete';
import { ICouponData } from "@/admin/utils/interfaces/coupon-data.interface";
import { ItemDetail } from "../ItemDetail";




interface Props{
    opened: boolean;
    onClose: () => void;
    onEdit: (couponId: string) => void;
    onDelete: (couponId: string) => void;
    loading: boolean;
    coupon?: ICouponData;
}

export const DetailCoupon = ({
    onClose,
    onEdit,
    onDelete,
    opened,
    loading,
    coupon
}: Props) => {
    const [showDelete, setShowDelete] = useState(false);


    return (
        <Dialog
            open={opened}
            onClose={onClose}
            maxWidth='md'
            fullWidth={true}
        >
            <Card elevation={0} sx={{overflow: 'auto'}}>
                <CardContent>
                    <Box mb={2.5} display='flex' alignItems='center' flexDirection='row' width='100%'>
                    <Typography component='h1' variant='h6' fontWeight='500' flex={1}>Detalle de cupon</Typography>
                    <IconButton onClick={onClose}>
                            <CloseOutlined fontSize='small' />
                        </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <ItemDetail loading={loading} label='Fecha Creado' description={coupon?.created_at && formatterDateDDMMYYYY(coupon.created_at) || '--/--/--'} alertProps={{severity: 'success'}} />
                            <ItemDetail loading={loading} label='Fecha Actualizado' description={coupon?.updated_at && formatterDateDDMMYYYY(coupon.updated_at) || '--/--/--'} alertProps={{severity: 'info'}} />
                            <ItemDetail loading={loading} label='Código' description={coupon?.code || '-- -- --'} component='box' />
                        </Grid>
                        <Grid item xs={12} md={6}>
                        <ItemDetail loading={loading} label='% Descuento' description={coupon?.discount_percent+'%'} component='box' />
                        <ItemDetail loading={loading} label='Cantidad' description={''+coupon?.count} component='box' />
                        <ItemDetail loading={loading} label='Cantidad Usada' description={''+coupon?.used_count} component='box' />
                        <ItemDetail loading={loading} label='Habilitado' description={coupon?.enabled ? coupon.enabled ? 'SI' : 'NO' : '--'} alertProps={{severity:  coupon?.enabled ? 'success' : 'error', variant:'filled' }} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <DialogActions>
                {
                    coupon && !loading &&
                    <>
                        <Button 
                            variant='outlined' 
                            color='secondary'
                            startIcon={<DeleteOutlineOutlined fontSize='small'/>}
                            sx={{textTransform: 'capitalize', mr:1.5, minWidth: '110px'}}
                            onClick={() => setShowDelete(true)}
                            disableElevation
                        >
                            Eliminar
                        </Button>
                        <Button 
                            variant='contained' 
                            color='info'
                            startIcon={<EditNoteOutlined fontSize='large' />}
                            sx={{textTransform: 'capitalize', minWidth: '110px'}}
                            onClick={() => onEdit(coupon.id)}
                            disableElevation
                        >
                            Editar
                        </Button>
                    </>
                }
            </DialogActions>
            <ModalConfirmDelete 
                opened={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => {
                    setShowDelete(false);
                    onDelete(coupon!.id)
                }}
                title="¿Está seguro de eliminar este cupón?"
                desp="Si elimina el cupón, no podrá acceder a su información más adelante."
            />
        </Dialog>
    )
}

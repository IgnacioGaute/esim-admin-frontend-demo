import React, { ReactNode, useState } from 'react'
import { 
    Dialog, 
    Box, 
    Card, 
    CardContent,
    Typography, 
    IconButton,
    Tabs, 
    Tab 
} from "@mui/material";
import { CloseOutlined, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { IDataResendEmailByBundle, IOrderDetail } from '@/admin/utils/interfaces/order-data.interfaces';
import { DetailBundlesOrder, DetailClientOrder, DetailGeneralOrder } from './detail-order';
import { IDataBundle } from '@/admin/utils/interfaces/bundle-data.interface';
import { formatterDateDDMMYYYY } from '@/shared';



interface Props{
    opened: boolean;
    onClose: () => void;
    loading: boolean;
    order?: IOrderDetail;
    bundles: IDataBundle[];
    loadBundles: boolean;
    showDetailClient?: boolean;
    onResendBundle: (body: IDataResendEmailByBundle) => void;
}

export const OrderDetail = ({
    order,
    opened,
    onClose,
    loading,
    loadBundles,
    bundles,
    showDetailClient = true,
    onResendBundle
}: Props) => {
    const [value, setValue] = useState(0);
    const arryValue = !showDetailClient  ? [0, 1] : [0, 1, 2];

    const handleChangeValue = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const getDataBundleAndOrderByResendEmail = (dataBundle: IDataBundle, order: IOrderDetail) => {
        const { reference, rspUrl, matchingId, iccid, bundles, bundle } = dataBundle;
        onResendBundle({
            reference,
            rspUrl,
            matchingId,
            iccid,
            bundle,
            orderId: order?.buy_order || '',
            description: bundles[0].description,
            dateOrder: formatterDateDDMMYYYY(order.created_at),
            lang: order?.lang || 'es',
            email: order.user!.email
        })
    }

  return (
    <Dialog
        open={opened}
        onClose={onClose}
        maxWidth='lg'
        fullWidth={true}
    >
        <Card elevation={0} sx={{overflow: 'auto'}}>
            <CardContent>
                <Box mb={2} display='flex' alignItems='center' flexDirection='row' width='100%'>
                  <Typography component='h1' variant='h6' fontWeight='500' flex={1}>Detalle de orden</Typography>
                   <IconButton onClick={onClose}>
                        <CloseOutlined fontSize='small' />
                    </IconButton>
                </Box>
                <Tabs value={value} onChange={handleChangeValue} aria-label="Tabs detail order">
                    <Tab label='General' id='tab-general' aria-controls='tabpanel-general' />
                    { showDetailClient && <Tab label='Cliente' id='tab-client' aria-controls='tabpanel-client' /> }
                    <Tab label='Bundles' id='tab-bundles' aria-controls='tabpanel-bundles' /> 
                </Tabs>
                <Box paddingTop={3}>
                    <div role="tabpanel" id='tab-general' hidden={value !== 0} aria-labelledby='tabpanel-general'>
                        { value === arryValue[value] && <DetailGeneralOrder order={order} loading={loading} /> }
                    </div>
                    { showDetailClient &&
                        <div role="tabpanel" id='tab-client' hidden={value !== 1} aria-labelledby='tabpanel-client'>
                            { value === arryValue[value] && <DetailClientOrder loading={loading} user={order?.user} /> }
                        </div>
                    }
                    <div role="tabpanel" id='tab-bundles' hidden={value !== arryValue[!showDetailClient ? 1 : 2]} aria-labelledby='tabpanel-bundles'>
                        {value === arryValue[value] && <DetailBundlesOrder 
                        onResendEmail={values => getDataBundleAndOrderByResendEmail(values, order!)} 
                        data={bundles} 
                        loading={loadBundles}  
                        /> }
                    </div>
                </Box>
            </CardContent>
        </Card>
    </Dialog>
  )
}




import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useFetch, useNotiAlert } from '@/shared/hooks';
import { NavigateLink } from '@/shared/components/NavigateLink';
import { ListNotificationPush } from '@/admin/components/marketing/notification-push';
import { IDataNotificationPush } from '@/admin/utils';



export const NotificationPushPage = () => {
  const { snackBarAlert } = useNotiAlert();
  const [loadDelete, setLoadDelete] = useState(false);
  const { data, loading, onRefresh, onFetch } = useFetch<IDataNotificationPush[]>('/notifications-push', 'GET', { init: true });

  const onDeleteCoupon = async(id: string) => {
    setLoadDelete(true);
   
    const { ok } = await onFetch(`/notifications-push/${id}`, 'DELETE');

    setLoadDelete(false);

    if( !ok ) return;

    snackBarAlert('La notificacion se ha eliminado correctamente', { variant: 'success' })
    onRefresh();
  } 

  return (
    <>
      <Box display='flex' width='100%' justifyContent='flex-end' mb={2.5}>
        <NavigateLink to='notification-push/new' uiLink={{
          component: 'span',
          underline: 'none',
        }} >
          <Button variant='contained' disableElevation sx={{ textTransform: 'capitalize' }}>
            Crear Notificación
          </Button>
        </NavigateLink>
      </Box>
      <ListNotificationPush 
        loading={loading}
        notificationList={data || []}
        onDelete={onDeleteCoupon}
      />
    </>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useFetch, useNotiAlert } from '@/shared/hooks';
import { NotificationPushForm } from '@/admin/components/marketing/notification-push'
import { IFormNotificationPush } from '@/admin/utils/interfaces/notification-push.interface';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';



export const NotificationPushNewPage = () => {
  const navigate = useNavigate();

  const [notification, setNotification] = useState<IFormNotificationPush | undefined>();
  const { snackBarAlert } = useNotiAlert();
  const { data, loading, clearCache, error } = useFetch<string, IFormNotificationPush>('/notifications-push', 'post', { 
    init: notification !== undefined, 
    body: notification,
    cache: { enabled: false }
});


useEffect(() => {
  if( data ){
    snackBarAlert(data, { variant: 'success' });
    clearCache();
    navigate(MENU_MAIN_HISTORY_NAV('marketing'))
  }

  if( error ){
    setNotification(undefined);
  }

  return () => {
    if( data ) return clearCache();
  }
}, [data, error])

  return (
    <NotificationPushForm 
      onBack={() => navigate(MENU_MAIN_HISTORY_NAV('marketing'))}
      onSubmit={(values) => {
        setNotification(values)
      }}
      loading={loading}
    />
  )
}

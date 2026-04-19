import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { CouponFormEditAndNew } from '@/admin/components/coupons&discount/CouponFormEditAndNew';
import { ICouponData, IFormCoupon } from '@/admin/utils/interfaces/coupon-data.interface';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';


export const CouponDiscountNewPage = () => {
    const navigate = useNavigate();

    const [coupon, setCoupon] = useState<IFormCoupon | undefined>();
    const { data, loading, clearCache, error } = useFetch<ICouponData, IFormCoupon>('/coupons/create', 'post', { 
        init: coupon !== undefined, 
        body: coupon,
        cache: { enabled: false }
    });
    const { snackBarAlert } = useNotiAlert();

    useEffect(() => {
      if( data ){
        snackBarAlert('El cupón se ha creado correctamente', { variant: 'success' });
        clearCache();
        navigate(MENU_MAIN_HISTORY_NAV('coupons'))
      }

      if( error ){
        setCoupon(undefined);
      }
    
      return () => {
        if( data ) clearCache();
      }
    }, [data, error])
    

    return (
        <>
            <CouponFormEditAndNew 
                onBack={() => navigate(MENU_MAIN_HISTORY_NAV('coupons'))}
                onSubmit={(values) => {
                   setCoupon(values)
                }}
                loading={loading}
            />
        </>
    )
}

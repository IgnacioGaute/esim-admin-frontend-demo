import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading } from '@/shared/components/BoxLoading';
import { ICouponData, IFormCoupon } from '@/admin/utils/interfaces/coupon-data.interface';
import { CouponFormEditAndNew } from '@/admin/components/coupons&discount/CouponFormEditAndNew';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';



export const CouponDiscountEditPage = () => {
    const { couponId } = useParams<{couponId: string}>();
    const navigate = useNavigate();

    const { data: detailCoupon, loading: loadCoupon, onFetch, clearCache } = useFetch<ICouponData>(`/coupons/${couponId}`, 'GET', { 
        init: couponId !== undefined, 
        cache: { enabled: false }
    });

    const [loading, setLoading] = useState(false);
    const { snackBarAlert } = useNotiAlert();

    const onEdit = async(values: IFormCoupon) => {
        const { discount_percent, code, count, enabled } = values;
        setLoading(true);

        const { ok } = await onFetch<ICouponData, IFormCoupon>(`/coupons/${couponId}`, 'PATCH', { data: {
            discount_percent, 
            code, 
            count, 
            enabled
        } });

        setLoading(false);

        if( !ok ) return;

        snackBarAlert('El cupón se ha actualizado correctamente', { variant: 'success' });
        clearCache();
        navigate(MENU_MAIN_HISTORY_NAV('coupons'))
    }
    
    if( loadCoupon ){
        return(
            <div style={{position: 'relative', height: '100%', width: '100%'}}>
                <BoxLoading
                    isLoading
                    showGif
                    position='absolute'
                />
            </div>
        )
    }

    return (
        <CouponFormEditAndNew 
            onBack={() => navigate(MENU_MAIN_HISTORY_NAV('coupons'))}
            onSubmit={onEdit}
            dataForm={detailCoupon}
            title='Editar cupón'
            loading={loading}
        />
    )   
}

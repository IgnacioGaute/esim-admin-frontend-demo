import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store';
import { changeDataStoreCart, changeValueOpenCart } from '../store/slices/store';
import { IStoreCartItem } from '../interfaces/store';


export const useStoreCart = <T extends object>() => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.storeCart);

    const dataCart = useMemo(() => {
        return cart.data as IStoreCartItem<T>[];
    }, [cart.data]);

    const onDispatchChangeDataCart = (data: IStoreCartItem<T>[]) => {
        dispatch( changeDataStoreCart(data) );
    }

    const onDispatchOpenModalCart = (value: boolean) => {
        dispatch( changeValueOpenCart(value) );
    }

    return {
        dataCart,
        openModalCart: cart.openCart,
        onDispatchChangeDataCart,
        onDispatchOpenModalCart
    }
}

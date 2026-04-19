import { useMemo } from 'react';
import { useStoreCart, useNotiAlert } from '@/shared/hooks'
import { IStoreCartItem } from '@/shared/interfaces/store';
import { IBundleData, ICountryData } from '../utils/interfaces'

export const useCart = () => {
  const { dataCart, onDispatchChangeDataCart, onDispatchOpenModalCart, openModalCart } = useStoreCart<TypeDataCart>();
  const { snackBarAlert } = useNotiAlert();

  const totalCart = useMemo(() => {
    let total = 0;

    if( dataCart.length > 0 ){
      dataCart.forEach(item => {
        const itemTotal = item.quantity * item.item.price;
        total = total + itemTotal;
      })
    }

    return total;
  }, [dataCart])

  const addNewItem = (newItem: TypeDataCart, quantity: number, action: '+' | '-' | 'none' = 'none') => {
    const isCurrentItem = getItem(newItem._id);
    let newItems: IStoreCartItem<TypeDataCart>[] = dataCart;

    if( isCurrentItem ){
      quantity = action == 'none' ? quantity + isCurrentItem.quantity : quantity;
      let newItemsAux: IStoreCartItem<TypeDataCart>[] = [];

      newItems.map(item => {
        let auxItem = item;
        if( item.item._id == isCurrentItem.item._id ){
          auxItem = {
            ...isCurrentItem,
            quantity
          };
        }

        newItemsAux.push(auxItem);
      });

      newItems = newItemsAux;
    }else{
      newItems = [...newItems, { item: newItem, quantity }];
    }

    

    if( action == 'none' ){
      snackBarAlert('Item agregado al carrito', { variant: 'success', showClose: true })
    }
    onDispatchChangeDataCart(newItems);
  }

  const removeItem = (removeItem: TypeDataCart, stop: boolean = false) => {
    let newItems: IStoreCartItem<TypeDataCart>[] = [];

    dataCart.forEach(item => {
      if( item.item._id !== removeItem._id ){
        newItems.push(item);
      }
    })

    if( !stop ){
      onDispatchChangeDataCart(newItems);
      snackBarAlert('Item eliminado del carrito', { variant: 'error', showClose: true })
    }

    return newItems;
  }

  const removeAllItems = () => {
    onDispatchChangeDataCart([])
    snackBarAlert('Se ha eliminado todos los items del carrito', { variant: 'error' })
  };

  const getItem = (_id: string) => {
    return dataCart.find(data => data.item._id == _id)
  }

  const checkedGetItem = (_id: string) => {
    return getItem(_id) !== undefined;
  }

  return {
    itemsCart: dataCart,
    totalCart,
    countCart: dataCart.length,
    openModalCart,

    //func
    addNewItem,
    removeItem,
    getItem,
    checkedGetItem,
    removeAllItems,
    onChangeModalCart: onDispatchOpenModalCart
  }
}

type TypeDataCart = IBundleData & {
    country: ICountryData
};
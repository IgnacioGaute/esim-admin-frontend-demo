
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStoreCartData, IStoreCartItem } from '@/shared/interfaces/store';

// Inicializamos los valores del estado por defecto.
const initialState: IStoreCartData = { 
    data: [],
    openCart: false
};

export const storeCartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {

        // change data store cart
        changeDataStoreCart: ( state, action: PayloadAction<IStoreCartItem[]> ) => {
            state.data = action.payload;
        },
        changeValueOpenCart: (state, action: PayloadAction<boolean>) => {
            state.openCart = action.payload;
        }
    }
});

// Action creators are generated for each case reducer function
export const { changeDataStoreCart, changeValueOpenCart } = storeCartSlice.actions;
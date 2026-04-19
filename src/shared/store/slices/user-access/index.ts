import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserAccess, IUserModulesAccess, IUsersType } from '@/shared/interfaces/user';

// Inicializamos los valores del estado por defecto.
const initialState: IUserAccess = { 
    admin: [],
    store: []
};



export const userAccessSlice = createSlice({
    name: 'userAccess',
    initialState,
    reducers: {

        // agregar access al usuario
        addModulesAccessUser: ( state, action: PayloadAction<IAddModulesAccesUser> ) => {
            const { admin, store } = action.payload;
            
            if( admin ){
                state.admin = admin;
            }

            if( store ){
                state.store = store;
            }
        },

        // vaciar accesos del usuario
        removeModulesAccesUser: (state) => {
            state.admin = [];
            state.store = [];
        },
    }
});

// Action creators are generated for each case reducer function
export const { addModulesAccessUser, removeModulesAccesUser  } = userAccessSlice.actions;
export interface IAddModulesAccesUser{
    admin?: IUserModulesAccess[],
    store?: IUserModulesAccess[]
}
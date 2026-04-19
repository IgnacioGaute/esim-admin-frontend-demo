
import { ReactNode } from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { DrawerHeaderPrimary, ToolBarPrimary } from '@/shared/components';
import { useAuth, useFetch, useScreenSize } from '@/shared/hooks';
import { IUsersType } from '@/shared/interfaces/user';
import { USER_TYPE_CONST } from '@/shared/helpers/const';
import { getDescriptionBundle } from '../utils/functions/getDescriptionBundle';
import { DrawerCart, ItemCart } from '../components';
import { useCart } from '../hooks';



interface Props{
    children: ReactNode;
}

export const StoreLayout = ({
    children
}: Props) => {
    const navigate = useNavigate();
    const { width } = useScreenSize();
    const { onNotAuthenticate } = useAuth();
    const { 
        countCart, 
        totalCart, 
        itemsCart,
        removeAllItems,
        removeItem,
        addNewItem,
        openModalCart,
        onChangeModalCart
    } = useCart();
    const { data: user, loading } = useFetch<{ name: string; type: keyof IUsersType; id: string }>('auth/me', 'get', { init: true });
  return (
    <Box sx={{ display: 'flex' }}>
        <ToolBarPrimary 
            openDrawer={false}
            drawerWidth={0}
            title={'Tienda'}
            cart={{
                count: countCart,
                handleCarOpen: () => onChangeModalCart(true)
            }}
            user={{
                loading,
                name: user?.name,
                rol: USER_TYPE_CONST[user?.type || 'SUPER_ADMIN'],
            }}
            onBack={() => navigate(-1)}
            onLogOut={onNotAuthenticate}
        />
        <DrawerCart 
            open={openModalCart}
            onClose={() => onChangeModalCart(false)}
            isMobile={width <= 580 ? true : false}
            countCart={countCart}
            total={totalCart}
            onRemoveItems={removeAllItems}
            onCheckout={()=> {
                onChangeModalCart(false)
                navigate('checkout')
            }}
        >
            {
                itemsCart.map(({ item, quantity }, idx) => (
                    <ItemCart 
                        key={idx}
                        img={item.country.flag}
                        countryName={item.country.name}
                        description={getDescriptionBundle(item)}
                        price={item.price}
                        quantity={quantity}
                        handleChangeQuantity={(action) => {

                            if( action == '-' ){
                                const qt = quantity === 1 ? 1 :  quantity - 1;
                                addNewItem(item, qt, '-');
                                return;
                            }

                            addNewItem(item, quantity + 1, '+');
                        }}
                        onRemove={() => removeItem(item)}
                    />
                ))
            }
        </DrawerCart>
        <Box width='100%' minHeight='100vh'>
            <DrawerHeaderPrimary />
            { children }
        </Box>
    </Box>
  )
}

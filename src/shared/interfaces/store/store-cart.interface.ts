export interface IStoreCartData{
    data: Array<IStoreCartItem>;
    openCart: boolean;
}

export interface IStoreCartItem<T = object>{
    item: T;
    quantity: number;
}
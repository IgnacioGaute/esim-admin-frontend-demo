export interface ResellerOrderUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type?: string;
}

export interface IOrderData {
  id: string;
  buy_order: null | string;
  state_order: TypeStateOrder;
  productId: string | string[];
  product_name: string;
  referenceId: null | string;
  lang: string;
  referencesIds: string[];
  type: string;
  channel: TypeChannelOrder;
  discount_code: null | string;
  action: string;
  product_desp: string;
  product_price: number;
  products: OrderProduct[];
  payment_type: null | string;
  total: number;
  quantity: number;
  sub_total: number;
  payment_result: null | string;
  exchange_rate: OrderExchangeRate | null;
  created_at: Date;
  updated_at: Date;
  user: UserOrder | null;

  isByReseller?: boolean;

  resellerUser?: ResellerOrderUser | null;
  resellerUserId?: string | null;
}

export interface IOrdersListDataTable extends IOrderData {
  userName: string;
  userSurname: string;
  userEmail: string;

  resellerName?: string;
  resellerEmail?: string;
  resellerId?: string;
}

export interface IOrderDetail extends IOrderData {
    discount?:      DiscountOrder;
}

export interface OrderExchangeRate {
    from:   string;
    to:     string;
    amount: number;
    date:   Date;
    result: number;
    rate:   number;
}

export interface OrderProduct {
    flag:        string;
    name:        string;
    amount:      number;
    quantity:    number;
    productId:   string;
    description: string;
}

export type TypeStateOrder =
  | 'completed'
  | 'initialized'
  | 'rejected'
  | 'pending';

export type TypeChannelOrder = 'APP' | 'WEB' | 'RESELLER';

export interface UserOrder {
    id:                    string;
    name:                  string;
    surname:               string;
    code_nro_phone:        string;
    nro_phone:             string;
    email:                 string;
    password:              string;
    access_token_checkout: null;
    esims:                 EsimOrder[];
    created_at: Date;
    updated_at: Date;
}

export interface EsimOrder {
    id:                     string;
    name:                   null;
    esimProviderId:         string;
    price:                  number;
    country:                string;
    countryFlag:            string;
    esimProviderReference:  string;
    esimProviderBundleName: string;
    qrUrl:                  null | string;
    created_at:             Date;
    updated_at:             Date;
}

export interface DiscountOrder {
    id:               string;
    code:             string;
    discount_percent: number;
}

export interface IDataResendEmailByBundle{
    email: string;
    matchingId: string;
    rspUrl: string;
    iccid: string;
    bundle: string;
    reference: string;
    orderId: string;
    description?: string;
    dateOrder?: string;
    lang?: string;
}

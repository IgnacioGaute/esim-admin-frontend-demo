export interface ICheckoutDataSend {
    esims:      string[],
    products:   ICheckputProduct[];
    lang:       "en" | "es",
    channel:    "RESELLER",
    action:     "NEW",
    type:       "ESIM"
}

export interface ICheckputProduct{
    name:       string;
    quantity:   number;
    price:      number;
}
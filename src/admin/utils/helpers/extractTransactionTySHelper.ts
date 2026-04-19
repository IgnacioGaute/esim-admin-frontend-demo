import { ITransactionStatus, ITransactionType } from "../interfaces";

export const TRANSACTION_TYPE_RESP : ITransactionType =  {
    ADD_BALANCE:    "Balance Agregado",
    BUY_ESIM:       "Plan/País",
    SUBTRACT_BALANCE: "Balance Descontado"
}

export const TRANSACTION_STATUS_RESP: ITransactionStatus = {
    PENDING:    "Pendiente",
    COMPLETED:  "Completado",
    FAILED:     "Fallido",
    CANCELLED:  "Cancelado"
}
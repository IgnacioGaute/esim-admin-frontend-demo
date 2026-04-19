export interface IChoicePool{
    id: string;
    name: string;
    provider: string;
    imsiFrom: string;
    imsiTo: string;
    idPool: string;
    availableQuantity: number;
    amountUsed: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface IFormChoicePool{
    name: string;
    provider: string;
    imsiFrom: string;
    imsiTo: string;
    idPool: string;
}
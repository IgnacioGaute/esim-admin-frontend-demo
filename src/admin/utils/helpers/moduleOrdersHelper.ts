import { IOrderData, IOrdersListDataTable } from "../interfaces";

export const moduleOrdersHelper = () => {
    
    const unionByListExtractData = (data: IOrderData[]) : IOrdersListDataTable[]=> {
        let newDataArr : IOrdersListDataTable[] = [];
        data.forEach((item) => {
            const { user, ...rest } = item;
            newDataArr.push({
                ...rest,
                userName: user?.name || '',
                userSurname: user?.surname || '',
                userEmail: user?.email || '',
                user
            })
        })
    
        return newDataArr
    } 

    return {
        unionByListExtractData
    }
}

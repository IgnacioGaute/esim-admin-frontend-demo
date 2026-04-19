import { IUserData } from "../interfaces/user-data.interface";

export const extractDataUserCompanyHelper = (data: IUserData[] | IUserData) : IUserData | IUserData[]  => {
    
    if( Array.isArray(data) ){
        let newDataArr : IUserData[] = [];
        data.forEach((userCompany) => {
            const { company, ...rest } = userCompany;
            newDataArr.push({
                ...rest,
                company,
                companyName: company?.name,
                
            })
        })

        return newDataArr;
    }

    const { company, password, ...rest } = data as IUserData;

    return {
        ...rest,
        company,
        companyName: company?.name || "",
        password: ''
    }
}


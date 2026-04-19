

export const filterDataHelper = <T extends object>(data: T[]) => {

    const fromTo = (property: keyof T, from: any, to: any = undefined,) => {
        if( to ){
            return data.filter(item => item[property] > from && item[property] <= to);
        }

        return data.filter(item => item[property] > from);
    }

    const byValue = (property: keyof T, value: string | number | boolean) => {
        return data.filter(item => item[property] == value);
    }

    const isEmpity = (property: keyof T) => {
        return data.filter(item => {
            if( item[property] ){
                if( Array.isArray(item[property]) && item[property].length == 0 ){
                    return;
                }

                return item
            }
        })
    }

    return {
        fromTo,
        byValue,
        isEmpity
    }
}
  

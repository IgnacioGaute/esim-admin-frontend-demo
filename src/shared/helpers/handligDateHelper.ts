export const formatterDateDDMMYYYY = (value: Date | string, separator?: '/' | '-' ) => {
    separator = separator || '/';
    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return  `${day}`.padStart(2, '0')+`${separator}`+`${month}`.padStart(2,'0')+`${separator}`+year;
}

export const getDateMonthFromTo = (date: Date = new Date()) : { from: string; to: string } => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const firtsDay = '01';
    const lastDay = new Date(year, month, 0).getDate();

    return {
        from: `${year}-${month.toString().padStart(2,'0')}-${firtsDay}`,
        to: `${year}-${month.toString().padStart(2,'0')}-${lastDay.toString().padStart(2,'0')}`
    }
}

export const getDateCurrent = () => {
    const date: Date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate()

    return `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
}

export const getDateYesterday = () => {
    const date: Date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();

    if( day == 1 ){
        const prevMonthDate = new Date(year, month - 1, 0);
        month = prevMonthDate.getMonth();
        day = prevMonthDate.getDate();
    }else{
        day = day - 1
    }

    month = month + 1;

    return `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
}

export const getDateQuarter = (): { from: string; to: string } => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const quarter = Math.floor(month / 3);
    const fromMonth = quarter * 3 + 1;
    const toMonth = fromMonth + 2;
    const lastDay = new Date(year, toMonth, 0).getDate();

    return {
        from: `${year}-${fromMonth.toString().padStart(2, '0')}-01`,
        to: `${year}-${toMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
    };
};

export const getDateYear = (): { from: string; to: string } => {
    const year = new Date().getFullYear();
    return {
        from: `${year}-01-01`,
        to: `${year}-12-31`
    };
};

export const getDateLast7Days = () => {
    const currentDate = new Date(); 
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekYear = lastWeekDate.getFullYear();
    const lastWeekMonth = lastWeekDate.getMonth() + 1;
    const lastWeekDay = lastWeekDate.getDate();

    return {
        from: `${lastWeekYear}-${lastWeekMonth.toString().padStart(2,'0')}-${lastWeekDay.toString().padStart(2)}`,
        to: `${currentYear}-${currentMonth.toString().padStart(2,'0')}-${currentDay.toString().padStart(2,'0')}`
    }
}
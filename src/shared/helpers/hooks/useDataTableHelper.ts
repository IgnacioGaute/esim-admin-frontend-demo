import { IDataByFilterDataTable, DataTableOrder } from "@/shared/interfaces/hooks";

export function descendingComparatorDataTable<T extends Object>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
}
  
export function getComparatorDataTable<T extends Object>(order: DataTableOrder, orderBy: keyof T) : (
    a: T,
    b: T,
  ) => number {
    return order === 'desc'
      ? (a, b) => descendingComparatorDataTable(a, b, orderBy)
      : (a, b) => -descendingComparatorDataTable(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
export function stableSortDataTable<T extends Object>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
          return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}


export const onSearchDataTable = <T extends object>(value: string, fields: Array<keyof T>,  data: T[] = [], field: keyof T) => {
  let newRows: Array<T> = [];

  fields.map((field) => {
    const result = searchPartialDataTable<T>(data, field, value);

    if( result.length > 0 ) {
      newRows = result;
      return;
    };
  })

  let auxRows: T[] = [];
  const mapaUnicos: any = {};

  newRows.forEach(objeto => {
    const valor = objeto[field];
    if (!mapaUnicos[valor]) {
      mapaUnicos[valor] = true;
      auxRows.push(objeto);
    }
  });

  return newRows = auxRows;
};


const searchPartialDataTable = <T extends object>(data: T[], field: keyof T, search: string) => {
  return data.filter(objeto => {
    
    if( typeof objeto[field] == 'string' && objeto[field].toLowerCase().includes(search.toLowerCase())){
      
      return objeto[field];
    }else if( typeof objeto[field] == 'number' && objeto[field].toString().toLowerCase().includes(search) ){
      return objeto[field];
    }
  });
}

const toNumberSafe = (v: any): number | null => {
  if (v === "" || v === null || typeof v === "undefined") return null
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."))
  return Number.isFinite(n) ? n : null
}

export const applyFilterCompare = <T extends object>(
  data: T[],
  field: keyof T,
  action: ">" | ">=" | "<" | "<=",
  value: string | number
) => {
  const filterNum = toNumberSafe(value)
  if (filterNum === null) return data

  return data.filter((item: any) => {
    const rowNum = toNumberSafe(item[field])
    if (rowNum === null) return false

    switch (action) {
      case ">":
        return rowNum > filterNum
      case ">=":
        return rowNum >= filterNum
      case "<":
        return rowNum < filterNum
      case "<=":
        return rowNum <= filterNum
      default:
        return true
    }
  })
}


export const onFilterDataTable = <T extends object>(
  data: T[],
  dataFilter: IDataByFilterDataTable<T>[]
) => {
  let auxData: T[] = data

  dataFilter.forEach((obj) => {
    if ((typeof obj.value === "string" || typeof obj.value === "number") && obj.value !== "") {
      switch (obj.action) {
        case "date-from":
          auxData = applyFilterDateFrom<T>(auxData, obj.field, obj.value as string)
          break

        case "date-to":
          auxData = applyFilterDateTo<T>(auxData, obj.field, obj.value as string)
          break

        case ">":
        case ">=":
        case "<":
        case "<=":
          auxData = applyFilterCompare<T>(auxData, obj.field, obj.action, obj.value)
          break

        case "=":
        default:
          auxData = applyFilterSame<T>(auxData, obj.field, obj.value)
          break
      }
    } else if (typeof obj.value === "boolean") {
      auxData = applyFilterSame<T>(auxData, obj.field, obj.value)
    }
  })

  return auxData
}

const applyFilterSame = <T extends object>(data: T[], key: keyof T, value: any) => {
  return data.filter(obj => obj[key] == value);
}

const applyFilterDateFrom = <T extends object>(data: T[], key: keyof T, dateFrom: string) => {
  return data.filter(obj => obj[key] && typeof obj[key] == 'string' && new Date(obj[key]).getTime() >= new Date(dateFrom).getTime());
}

const applyFilterDateTo= <T extends object>(data: T[], key: keyof T, dateTo: string) => {
  return data.filter(obj => obj[key] && typeof obj[key] == 'string' && new Date(obj[key]).getTime() <= new Date(dateTo).getTime() );
}
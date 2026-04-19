import * as data from '@/assets/mooks/user-accesss.json';
import { IUserAccess } from '../interfaces/user/user-access.interface';

interface IModulesAccessUserByRol{
    [key: string]: IUserAccess 
}

const DATA_USER_ACCESS = (<IModulesAccessUserByRol>data);

export const getUserAccessHelper = (rol: string) : IUserAccess | null => {
    return DATA_USER_ACCESS[rol] as IUserAccess | null
}
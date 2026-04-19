
export interface IUserAccess {
    admin: IUserModulesAccess[];
    store: IUserModulesAccess[];
}

export interface IUserModulesAccess {
    module:    string;
    subModule: string[];
}
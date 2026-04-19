import { AxiosError } from "axios";

export interface IApiEsimError{
    statusCode:  number;
    message:     string;
    errs?:        {
        message: string | string[],
    };
    timestamp?:  Date;
    path?:       string;
}

export interface HandlingErr {
    code: number;
    message: string;
    msgErrs: string[];

    extra?: {
        timestamp?:  Date;
        path?:       string;
    }
}


export class errFetchApiHelper {
    axiosError: AxiosError<IApiEsimError>;

    constructor(axiosErrr: AxiosError<IApiEsimError>){
        this.axiosError = axiosErrr;
    }

    handlingErr = () => {
        const { response, message, status } = this.axiosError;
        let code: number = response?.status || status || 500;
        let msg: string = message;
        let msgErrs: string[] = [];
        let extra: { timestamp?:  Date; path?: string; } | undefined;

        if( response?.data ){
            const { errs, message, statusCode, path, timestamp } = response.data;
            msg = message;
            code = statusCode;
            extra = { path, timestamp };

            if( errs ){
                msg = typeof errs.message == 'string' ? errs.message : message;
                msgErrs = Array.isArray(errs.message) ? errs.message : msgErrs;
            }

        }
        
        return {
            code,
            message: msg,
            msgErrs,
            extra
        }
    }

    toMessage = () => {
        const { message, msgErrs} = this.handlingErr();

        return msgErrs.length > 0 ? msgErrs[0] : message;
    }

    toArrayMessage = () => {
        const { msgErrs} = this.handlingErr();

        return msgErrs;
    }
}
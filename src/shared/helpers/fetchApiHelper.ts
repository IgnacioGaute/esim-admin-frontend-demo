import { AxiosError, AxiosRequestConfig, Method } from "axios";
import { InstanceApi, instanceApiConfig } from "@/config/apiConfig";
import { errFetchApiHelper } from "./errFetchApiHelper";
import { apiService } from "../services/ApiService";


export const fetchApiHelper = async<T = any, D = any>(url: string, method: Method, config?: AxiosRequestConfig<D>, instance?: keyof InstanceApi) : Promise<IResponseFetchApi<T>> => {
    let typeInstance: keyof InstanceApi = instance || 'main';

    const { api } = new apiService(instanceApiConfig[typeInstance]);

    try {
        const isFormData = typeof FormData !== 'undefined' && config?.data instanceof FormData;

        const { data } = await api<T>(url, {
            ...config,
            method,
            ...(isFormData && {
                transformRequest: [(data: any, headers: Record<string, any>) => {
                    delete headers['Content-Type'];
                    if (headers.post) delete headers.post['Content-Type'];
                    return data;
                }],
            }),
        });

        return {
            ok: true,
            data,
            message: 'Successful!'
        };

    } catch (error) {

        if( error instanceof AxiosError ){
            const err = new errFetchApiHelper(error);

            return {
                ok: false,
                error: err,
                message: err.handlingErr().message
            }
        }

        return {
            ok: false,
            message: 'Error 500, try again later.'
        }
    }

}

export interface IResponseFetchApi<T = any>{
    ok: boolean;
    message: string; 
    data?: T, 
    error?: errFetchApiHelper;
}
import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { authService } from "./";

export class apiService{

    api: AxiosInstance;

    constructor(apiInstance: AxiosInstance){
        this.api = apiInstance;

        this.api.interceptors.request.use(async(config : InternalAxiosRequestConfig) => {
            config = authService.configAuthReq(config);

            return config;
        })
    }


}
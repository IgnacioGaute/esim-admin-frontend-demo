import { InternalAxiosRequestConfig } from "axios";
import { cookiesService } from "./CookieService";
import { envConfig } from "@/config";

class AuthService{
    keyCookie: string = envConfig.NAME_COOKIE_AUTH;
    tokeType: string = 'Bearer';

    authUser = (token: string, expires_at: Date) => {
        return cookiesService.save(this.keyCookie, token, { expires: new Date(expires_at) });; 
    }

    isAuth = () => {
        return cookiesService.get(this.keyCookie) ? true : false;
    }

    getToken = () => {
        return cookiesService.get(this.keyCookie)
    }

    configAuthReq = (config: InternalAxiosRequestConfig) : InternalAxiosRequestConfig => {
       const token = this.getToken();

        if( token )
            config.headers.Authorization = `${this.tokeType} ${token}`;

        return config
    }


    onLogout = () => {
        return cookiesService.remove(this.keyCookie);
    }
}

export const authService = new AuthService();
import Cookies from 'js-cookie';

class CookiesService{

    save = (name: string, value: string, options?: Cookies.CookieAttributes) => {
       return Cookies.set(name, value, options);
    }

    get = (name: string) => {
        return Cookies.get(name);
    }

    remove = (name:string, options?: Cookies.CookieAttributes) => {
        return Cookies.remove(name, options)
    }

}

export const cookiesService = new CookiesService();

interface IEnvironment {
    URL_API:            string;
    URL_API_STORE:      string;
    NAME_COOKIE_AUTH:   string;
}

const { 
    VITE_URL_API,
    VITE_URL_API_STORE,
    VITE_NAME_COOKIE_AUTH
} = import.meta.env;

export const envConfig: IEnvironment = {
    URL_API: VITE_URL_API,
    NAME_COOKIE_AUTH: VITE_NAME_COOKIE_AUTH,
    URL_API_STORE: VITE_URL_API_STORE
}
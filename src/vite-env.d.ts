/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_URL_API: string;
    readonly VITE_URL_API_STORE: string;
    readonly VITE_NAME_COOKIE_AUTH: string;
}

interface ImportMeta {  
    readonly env: ImportMetaEnv
}

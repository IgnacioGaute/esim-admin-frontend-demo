import axios, { AxiosInstance } from 'axios';
import { envConfig } from './envConfig';

const esimApi = axios.create({
  baseURL: envConfig.URL_API,
  headers:{
    'Content-Type': 'application/json'
  } 
});

const esimStoreApi = axios.create({
  baseURL: envConfig.URL_API_STORE,
  headers:{
    'Content-Type': 'application/json'
  } 
});



export interface InstanceApi {
  main: AxiosInstance;
  storeApi: AxiosInstance;
}

export const instanceApiConfig : InstanceApi = {
  main: esimApi,
  storeApi: esimStoreApi
}
import { useState, useEffect, useMemo } from "react";
import { AxiosRequestConfig, Method } from "axios";
import { errFetchApiHelper, fetchApiHelper } from "../helpers";
import { InstanceApi } from "@/config/apiConfig";
import { useNotiAlert } from "./useNotiAlert";
import { useCache } from "./useCache";
import { useAuth } from "./useAuth";

export const useFetch = <T extends any, D = any, P = any>(
  url: string,
  method: Method,
  options: {
    init: boolean;
    instance?: keyof InstanceApi;
    params?: P;
    body?: D;
    cache?: {
      enabled?: boolean;
      expire?: number;
    };
    configAxios?: AxiosRequestConfig;
    showMessageError?: boolean;
  }
) => {
  const {
    init,
    instance,
    params,
    body,
    cache,
    configAxios,
    showMessageError = true,
  } = options;

  const enabledCache = cache?.enabled ?? true;
  const expireCache = cache?.expire ?? 157;

  const key = useMemo(() => {
    let arrString: string[] = [];
    let newKey: string = url;

    if (url.includes('/')) {
      arrString = url.split('/');
      arrString = arrString.filter((value) => value !== '');
      newKey = arrString.join('-');

      if (params) {
        for (const clave in params) {
          newKey = newKey + `${clave}=${params[clave]}`;
        }
      }
    }

    return method + '-' + newKey;
  }, [url, params, method]);

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<errFetchApiHelper | undefined>();

  const { getCache, setCache, deleteCache, clearCache } = useCache();
  const { status } = useAuth();
  const { snackBarAlert } = useNotiAlert();

  const onFetch = async <T = any, D = any>(
    url: string,
    method: Method,
    config?: AxiosRequestConfig<D>,
    instance?: keyof InstanceApi
  ) => {
    setIsFetching(true);

    const respFetch = await fetchApiHelper<T, D>(url, method, config, instance);

    setIsFetching(false);

    if (!respFetch.ok) {
      const msgError: string = respFetch.error?.toMessage() || respFetch.message;

      if (showMessageError && msgError) {
        snackBarAlert(msgError, { variant: 'error', showClose: true });
      }

      setError(respFetch.error);
    }

    return respFetch;
  };

  const onInit = async (isRefresh: boolean = false) => {
    setLoading(true);

    if (!isRefresh && enabledCache && getCache(key) !== undefined) {
      setData(getCache(key));
      setLoading(false);
      return;
    }

    const { ok, data } = await onFetch<T, D>(
      url,
      method,
      { ...configAxios, params, data: body },
      instance
    );

    if (ok && data) {
      if (getCache(key) !== undefined) {
        deleteCache(key);
      }

      if (enabledCache) {
        setCache(key, data, expireCache);
      }

      setData(data);
      setError(undefined);
    }

    setLoading(false);
  };

  const onRefresh = () => {
    onInit(true);
  };

  useEffect(() => {
    if (init) {
      onInit();
    }
  }, [key, body, init]);

  useEffect(() => {
    if (status === 'not-authenticated') clearCache();
  }, [status]);

  return {
    data,
    loading,
    isFetching,
    error,

    onFetch,
    onRefresh,
    clearCache,
    deleteCache: () => deleteCache(key),
  };
};
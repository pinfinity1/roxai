// frontend/src/lib/api/custom-instance.ts
import Axios, { AxiosRequestConfig, AxiosError } from "axios";
import { getSession } from "next-auth/react";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

AXIOS_INSTANCE.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;

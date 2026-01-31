// frontend/src/lib/api/custom-instance.ts
import Axios, { AxiosRequestConfig, AxiosError } from "axios";
import { getSession } from "next-auth/react";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

AXIOS_INSTANCE.interceptors.request.use(
  async (config) => {
    // ✅ چک می‌کنیم که آیا در محیط مرورگر (کلاینت) هستیم یا نه
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    // نکته: در سمت سرور (مثل فایل auth.ts) چون هنوز لاگین نکرده‌ایم
    // و اندپوینت login هم نیازی به توکن ندارد، این بخش رد می‌شود و مشکلی ایجاد نمی‌کند.

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

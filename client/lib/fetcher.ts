import axios, { AxiosError, AxiosResponse } from "axios";

import { environment } from "./environments";
import { getError } from "./errors";

export type QueryResponse<T> = [error: string | null, data: T | null];

export const refreshTokens = async () => {
  await axios.post(`${environment.apiUrl}/refresh`, undefined, {
    withCredentials: true,
  });
};

const handleRequest = async (
  request: () => Promise<AxiosResponse>
): Promise<AxiosResponse> => {
  try {
    return await request();
  } catch (error) {
    if (error instanceof AxiosError && error?.response?.status === 401) {
      try {
        await refreshTokens();
        return await request();
      } catch (innerError) {
        throw getError(innerError as AxiosError);
      }
    }

    throw getError(error as AxiosError);
  }
};

export const fetcher = async <T>(url: string): Promise<QueryResponse<T>> => {
  try {
    const request = () => axios.get(url, { withCredentials: true });
    const { data } = await handleRequest(request);
    return [null, data];
  } catch (error) {
    return [error as string | null, null];
  }
};

export const poster = async <T>(
  url: string,
  payload?: unknown
): Promise<QueryResponse<T>> => {
  try {
    const request = () => axios.post(url, payload, { withCredentials: true });
    const { data } = await handleRequest(request);
    return [null, data];
  } catch (error) {
    return [error as string | null, null];
  }
};

import axios, { AxiosResponse } from "axios";
import { IncomingMessage, ServerResponse } from "http";
import { environment } from "./environments";

import { getError } from "./errors";
import { QueryResponse } from "./fetcher";

const SET_COOKIE_HEADER = "set-cookie";

const refreshTokens = async (req: IncomingMessage, res: ServerResponse) => {
  console.log("-----refreshTokens");

  const response = await axios.post(
    `${environment.apiUrl}/refresh`,
    undefined,
    {
      headers: { cookie: req.headers.cookie! },
    }
  );
  console.log("refresh response", { response });

  const cookies = response.headers[SET_COOKIE_HEADER];

  //@ts-ignore
  req.headers.cookie = cookies;
  console.log("refreshTokens", { cookies });

  //@ts-ignore
  res.setHeader(SET_COOKIE_HEADER, cookies);
};

const handleRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
  request: () => Promise<AxiosResponse>
) => {
  try {
    return await request();
  } catch (error) {
    console.log("error");

    //@ts-ignore
    if (error?.response?.status === 401) {
      try {
        console.log("---error 401 try to refresh tokens");

        await refreshTokens(req, res);
        return await request();
      } catch (innerError) {
        //@ts-ignore
        throw getError(innerError);
      }
    }
    //@ts-ignore

    throw getError(error);
  }
};

export const fetcherSSR = async <T>(
  req: IncomingMessage,
  res: ServerResponse,
  url: string
): Promise<QueryResponse<T>> => {
  try {
    const request = () => {
      console.log("-----fetcherSSR url", url);

      // get cookie from request and pass it to axios
      return axios.get(url, { headers: { cookie: req.headers.cookie! } });
    };
    const { data } = await handleRequest(req, res, request);
    console.log("fetcherSSR", { data });

    return [null, data];
  } catch (error) {
    //@ts-ignore
    return [error, null];
  }
};

/**
 * 1 - client request page to next server
 * 2 - next server fetcher intercept cookies from request and pass it to axios
 */

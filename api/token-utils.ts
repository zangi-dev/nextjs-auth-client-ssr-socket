import {
  AccessTokenPayload,
  Cookies,
  RefreshTokenPayload,
  UserDocument,
} from "@shared";
import { CookieOptions, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

enum TokenExpiration {
  Access = 5 * 60,
  Refresh = 7 * 24 * 60 * 60,
}

function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, accessTokenSecret as Secret, {
    expiresIn: TokenExpiration.Access,
  });
}

function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, refreshTokenSecret as Secret, {
    expiresIn: TokenExpiration.Refresh,
  });
}

export function buildTokens(user: UserDocument) {
  const accessPayload: AccessTokenPayload = { userId: user.id };
  const refreshPayload: RefreshTokenPayload = {
    userId: user.id,
    version: user.tokenVersion,
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = refreshPayload && signRefreshToken(refreshPayload);

  return { accessToken, refreshToken };
}

const isProduction = process.env.NODE_ENV === "production";

const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  domain: process.env.BASE_DOMAIN,
  path: "/",
};

const accessTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Access * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...defaultCookieOptions,
  maxAge: TokenExpiration.Refresh * 1000,
};

export function setTokens(res: Response, access: string, refresh: string) {
  res.cookie(Cookies.AccessToken, access, accessTokenCookieOptions);
  res.cookie(Cookies.RefreshToken, refresh, refreshTokenCookieOptions);
}

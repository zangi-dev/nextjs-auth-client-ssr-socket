import { Cookies } from "@shared";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { databaseClient } from "./database";
import { getGitHubUser } from "./github-adapter";
import {
  buildTokens,
  clearTokens,
  refreshTokens,
  setTokens,
  verifyRefreshToken,
} from "./token-utils";
import { createUser, getUserByGitHubId, getUserById } from "./user-service";

// import { Cookies } from "@shared";

// import { authMiddleware } from "./auth-middleware";
// import { config } from "./config";
// import { databaseClient } from "./database";

const app = express();

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(cookieParser());

app.get("/", (req, res) => res.send("api is healthy"));

app.get("/github", async (req, res) => {
  const { code } = req.query;
  const gitHubUser = await getGitHubUser(code as string);
  let user = await getUserByGitHubId(gitHubUser.id);
  if (!user) user = await createUser(gitHubUser.name, gitHubUser.id);

  const { accessToken, refreshToken } = await buildTokens(user!);
  setTokens(res, accessToken, refreshToken);

  res.redirect(`${process.env.CLIENT_URL}/me`);
});

app.post("/refresh", async (req, res) => {
  try {
    const current = verifyRefreshToken(req.cookies[Cookies.RefreshToken]);
    const user = await getUserById(current!.userId);
    console.log("user", user);

    const { accessToken, refreshToken } = await refreshTokens(
      current!,
      user?.tokenVersion!
    );
    setTokens(res, accessToken, refreshToken!);
  } catch (error) {
    clearTokens(res);
  }
});

app.post("/logout", (req, res) => {});

app.post("/logout-all", async (req, res) => {});

app.get("/me", async (req, res) => {});

async function main() {
  await databaseClient.connect();
  app.listen(3000);
  console.log("api is listening on port 3000");
}

main();

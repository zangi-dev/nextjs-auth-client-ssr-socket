// import {Logout} from 'components/logout'
import { fetcher } from "lib/fetcher";
import Router from "next/router";
import { useUser } from "context/user-context";
import { useEffect, useLayoutEffect } from "react";

import { UserDocument } from "@shared";
import { environment } from "lib/environments";
import { Logout } from "components/logout";

export default function Me() {
  const { user, setUser } = useUser();
  console.log("user", user);

  const getMe = async () => {
    const [error, user] = await fetcher<UserDocument>(
      `${environment.apiUrl}/me`
    );
    console.log("user and error", user, error);

    if (!error && user) setUser(user);
    else Router.push("/");
  };

  useEffect(() => {
    if (!user) getMe();
  });

  return (
    <main className="flex items-center justify-center h-full">
      <div className="space-y-4 text-center">
        <h1 className="px-4 py-2 text-lg font-medium bg-gray-200 rounded">
          Client side authentication
        </h1>
        {user ? <p>Hi, {user.name} 👋</p> : <p>Loading...</p>}
        <Logout />
      </div>
    </main>
  );
}

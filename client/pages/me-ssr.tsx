import { Logout } from "components/logout";
import { useUser } from "context/user-context";
import { environment } from "lib/environments";
import { fetcherSSR } from "lib/fetcher-ssr";
import { GetServerSideProps } from "next";
import { FC } from "react";

const MeSSR: FC = () => {
  const { user } = useUser();
  console.log("user", user);

  return (
    <main className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <h1 className="px-4 py-2 text-lg font-medium bg-gray-200 rounded">
          Server side authentication
        </h1>
        <p>Hi, {user!.name} 👋</p>
        <Logout />
      </div>
    </main>
  );
};

export default MeSSR;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const [error, user] = await fetcherSSR(req, res, `${environment.apiUrl}/me`);

  if (!user) return { redirect: { statusCode: 307, destination: "/" } };
  return { props: { user } };
};

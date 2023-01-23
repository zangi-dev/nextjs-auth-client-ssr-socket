import type { AppProps } from "next/app";
import { Navigation } from "components/navigation";
import "tailwindcss/tailwind.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="h-screen">
      <Navigation />
      <Component {...pageProps} />
    </div>
  );
}

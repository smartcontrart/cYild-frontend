import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "@/components/global/providers";
import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/global/footer";
import { Navbar } from "@/components/global/navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Yild Finance</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta
          name="description"
          content="Yild Finance is an advanced DeFi platform that automates Uniswap V3 liquidity provision, optimizing yield strategies for effortless passive income. Maximize your earnings with automated LP management."
        />
        <meta property="og:image" content="/y.png" />
      </Head>
      <Providers>
        <Toaster />
        <div className={`flex flex-col min-h-screen bg-background `}>
          <header className="border-b">
            <Navbar />
          </header>
          <main className="w-full lg:w-7xl mx-auto px-4 py-8 grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </Providers>
    </>
  );
}

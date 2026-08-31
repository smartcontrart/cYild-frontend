import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "@/components/global/providers";
import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/global/footer";
import { Navbar } from "@/components/global/navbar";
import { CityBars } from "@/components/brand/city-bars";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Yild</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta
          name="description"
          content="Yild farms tokenized stocks on Robinhood Chain. Pick a ticker. Farm the range."
        />
        <meta property="og:image" content="/y.png" />
      </Head>
      <Providers>
        <Toaster />
        <div className="page-texture flex min-h-screen flex-col bg-background text-foreground">
          <header className="site-header relative overflow-hidden border-b-[3px] border-border">
            <div className="absolute inset-0 hidden sm:block">
              <CityBars />
            </div>
            <Navbar />
          </header>
          <main className="mx-auto w-full max-w-6xl grow px-4 py-8">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </Providers>
    </>
  );
}

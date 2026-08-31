import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Archivo, Archivo_Black, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/global/providers";
import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/global/footer";
import { Navbar } from "@/components/global/navbar";
import { cn } from "@/utils/shadcn";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-archivo",
  display: "block",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "block",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "block",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Yild</title>
        <link rel="icon" type="image/png" href="/logo_yild.png" />
        <link rel="apple-touch-icon" href="/logo_yild.png" />
        <meta
          name="description"
          content="Yild farms tokenized stocks on Robinhood Chain. Deposit. Forget. Print."
        />
        <meta property="og:image" content="/logo_yild.png" />
        <meta name="twitter:image" content="/logo_yild.png" />
      </Head>
      <Providers>
        <Toaster />
        <div
          className={cn(
            archivo.variable,
            archivoBlack.variable,
            jetbrainsMono.variable,
            archivo.className,
            "page-texture flex min-h-screen flex-col bg-background text-foreground",
          )}
        >
          <header className="site-header relative border-b-[3px] border-border">
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

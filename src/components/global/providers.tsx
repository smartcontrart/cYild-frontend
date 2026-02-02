import * as React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { createConfig, http, WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/toaster";
import { arbitrum, base } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not defined");
}

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Yild Finance",
    walletConnectProjectId: projectId,
    chains: [arbitrum, base],
    ssr: true,
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
      [arbitrum.id]: http(),
    },
  }),
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConnectKitProvider>{mounted && children}</ConnectKitProvider>
        </NextThemesProvider>
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

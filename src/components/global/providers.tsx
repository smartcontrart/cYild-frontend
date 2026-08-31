import * as React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { createConfig, http, useSwitchChain, WagmiProvider } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { Toaster } from "@/components/ui/toaster";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { robinhood } from "@/utils/robinhood-chain";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not defined");
}

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Yild",
    walletConnectProjectId: projectId,
    chains: [robinhood],
    ssr: true,
    enableFamily: false,
    multiInjectedProviderDiscovery: true,
    connectors: [
      injected({ shimDisconnect: true }),
      walletConnect({
        projectId,
        showQrModal: false,
      }),
      coinbaseWallet({
        appName: "Yild",
      }),
    ],
    transports: {
      [robinhood.id]: http(
        process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ||
          "https://rpc.mainnet.chain.robinhood.com",
      ),
    },
  }),
);

const queryClient = new QueryClient();

function ThemedConnectKit({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const { switchChain } = useSwitchChain();
  const mode = resolvedTheme === "light" ? "light" : "dark";

  return (
    <ConnectKitProvider
      theme="auto"
      mode={mode}
      onConnect={() => {
        switchChain({ chainId: robinhood.id });
      }}
      options={{
        enforceSupportedChains: false,
        walletConnectCTA: "link",
        overlayBlur: 4,
        initialChainId: robinhood.id,
      }}
      customTheme={{
        "--ck-font-family": "cal, sans-serif",
        "--ck-accent-color": "#D8FF2A",
        "--ck-accent-text-color": "#0A0A0A",
        "--ck-border-radius": "0px",
        ...(mode === "dark"
          ? {
              "--ck-body-background": "#141414",
              "--ck-body-color": "#F6F3E8",
              "--ck-primary-button-background": "#161616",
              "--ck-primary-button-hover-background": "#1f1f1f",
              "--ck-primary-button-color": "#F6F3E8",
              "--ck-secondary-button-background": "#161616",
              "--ck-secondary-button-color": "#F6F3E8",
            }
          : {
              "--ck-body-background": "#F6F3E8",
              "--ck-body-color": "#0A0A0A",
            }),
      }}
    >
      {children}
    </ConnectKitProvider>
  );
}

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
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemedConnectKit>{mounted && children}</ThemedConnectKit>
        </NextThemesProvider>
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

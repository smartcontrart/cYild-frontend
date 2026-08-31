"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Cog, Home, Menu, X } from "lucide-react";
import { ThemeSwitch } from "./theme-switch";
import { NetworkSwitch } from "./network-switch";
import CustomWalletButton from "./custom-wallet-button";
import { SwitchRobinhoodButton } from "./switch-robinhood-button";
import { AccountingUnitDialog } from "./accounting-unit-dialog";
import { useAccountingUnitDialogStore } from "@/hooks/store/use-accounting-unit-dialog-store";
import { cn } from "@/utils/shadcn";
import { motion, AnimatePresence } from "framer-motion";
import { YildMark } from "@/components/brand/yild-mark";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const setAccountingUnitOpen = useAccountingUnitDialogStore(
    (state) => state.setOpen,
  );

  const openAccountingUnit = () => {
    setMobileMenuOpen(false);
    setAccountingUnitOpen(true);
  };

  return (
    <div className="relative w-full">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex flex-row items-center gap-6">
          <Link href="/" className="hover:cursor-pointer">
            <div className="flex flex-row items-center gap-2 text-yild-ink dark:text-yild-lime">
              <YildMark className="h-10 w-10" />
              <div className="text-3xl font-black tracking-tight">YILD</div>
            </div>
          </Link>
          <div className="hidden md:block">
            <NavLinks />
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">
          <div className="hidden md:flex flex-row items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Update accounting unit"
              onClick={openAccountingUnit}
            >
              <Cog />
            </Button>
            <ThemeSwitch />
            <NetworkSwitch />
          </div>

          <CustomWalletButton />
          <SwitchRobinhoodButton />

          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <Menu className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t-[3px] border-border bg-yild-lime dark:bg-card md:hidden"
          >
            <div className="flex flex-col gap-3 px-4 py-4">
              <NavLinks onLinkClick={() => setMobileMenuOpen(false)} />
              <div className="flex flex-row items-center gap-2 border-t-[3px] border-border pt-3">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Update accounting unit"
                  onClick={openAccountingUnit}
                >
                  <Cog />
                </Button>
                <ThemeSwitch />
                <NetworkSwitch />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AccountingUnitDialog />
    </div>
  );
};

interface NavLinksProps {
  onLinkClick?: () => void;
}

const NavLinks = ({ onLinkClick }: NavLinksProps) => {
  const pathname = usePathname();
  const links = [{ title: "Home", href: "/", icon: Home }];

  const isActive = (href: string) => {
    if (!pathname) return;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <section className="flex flex-col gap-2 md:flex-row md:items-center">
      {links.map((link) => (
        <Button
          key={link.href}
          asChild
          variant="outline"
          className={cn(
            "w-full justify-start md:w-auto",
            isActive(link.href) &&
              "bg-yild-ink text-yild-lime hover:bg-yild-ink hover:text-yild-lime dark:bg-yild-lime dark:text-yild-ink dark:hover:bg-yild-lime dark:hover:text-yild-ink",
          )}
        >
          <Link href={link.href} onClick={onLinkClick}>
            <link.icon />
            {link.title}
          </Link>
        </Button>
      ))}
    </section>
  );
};

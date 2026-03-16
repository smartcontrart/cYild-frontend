"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Cog, Home, Droplets, Menu, X } from "lucide-react";
import { ThemeSwitch } from "./theme-switch";
import { NetworkSwitch } from "./network-switch";
import CustomWalletButton from "./custom-wallet-button";
import { cn } from "@/utils/shadcn";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <nav className="w-full lg:w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex flex-row gap-8 items-center">
          <Link href="/" className="hover:cursor-pointer">
            <div className="flex flex-row gap-2 text-center items-center font-black text-4xl">
              <div>YILD</div>
            </div>
          </Link>
          <div className="hidden md:block">
            <NavLinks />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-row gap-2 items-center">
          {/* Desktop-only controls */}
          <div className="hidden md:flex flex-row gap-2 items-center">
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <Cog />
              </Button>
            </Link>
            <ThemeSwitch />
            <NetworkSwitch />
          </div>

          <CustomWalletButton />

          {/* Mobile hamburger */}
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

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t bg-background"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <NavLinks onLinkClick={() => setMobileMenuOpen(false)} />

              <div className="border-t pt-3 flex flex-row gap-2 items-center">
                <ThemeSwitch />
                <NetworkSwitch />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface NavLinksProps {
  onLinkClick?: () => void;
}

const NavLinks = ({ onLinkClick }: NavLinksProps) => {
  const pathname = usePathname();
  const links = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Open Position",
      href: "/positions/new",
      icon: Droplets,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Cog,
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return;
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <section className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
            isActive(link.href)
              ? "bg-primary/20 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          )}
        >
          <link.icon className="h-3.5 w-3.5" />
          {link.title}
        </Link>
      ))}
    </section>
  );
};

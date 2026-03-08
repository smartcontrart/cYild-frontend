"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Cog, Coins, Home, Droplets } from "lucide-react";
import { ThemeSwitch } from "./theme-switch";
import { NetworkSwitch } from "./network-switch";
import CustomWalletButton from "./custom-wallet-button";
import { cn } from "@/utils/shadcn";

export const Navbar = () => {
  return (
    <nav className="w-full lg:w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex flex-row gap-8">
        <Link href="/" className="hover:cursor-pointer hidden md:block">
          <div className=" flex flex-row gap-2 text-center items-center font-black text-4xl">
            <div>YILD</div>
          </div>
        </Link>
        <NavLinks />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <Link href="/settings">
          <Button variant="outline" size="icon">
            <Cog />
          </Button>
        </Link>
        <ThemeSwitch />
        <NetworkSwitch />
        <CustomWalletButton />
      </div>
    </nav>
  );
};

const NavLinks = () => {
  const pathname = usePathname();
  const links = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Provide Liquidity",
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
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <section className="flex items-center gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
            isActive(link.href)
              ? "bg-secondary text-foreground"
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

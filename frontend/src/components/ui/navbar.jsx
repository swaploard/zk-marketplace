"use client";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import UserMenu from "./userMenu"
import { Switch } from "./switch";

function Navbar(props) {
  return (
    <nav className="flex items-center justify-between px-6 h-20 border-b border-gray-800 bg-white dark:bg-black">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-blue-500 dark:text-gray-400 text-xl font-semibold">OpenSea</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/drops" className="text-blue-500 dark:text-gray-400 hover:text-gray-300">
            Drops
          </Link>
          <Link href="/stats" className="text-blue-500 dark:text-gray-400 hover:text-gray-300">
            Stats
          </Link>
          <Link href="/create" className="text-blue-500 dark:text-gray-400 hover:text-gray-300">
            Create
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-xl px-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search"
            className="w-full  text-gray-400 bg-slate-50 dark:bg-gray-900 dark:border-gray-700 pl-10 h-10 focus:ring-2 focus:ring-blue-500 rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <ConnectButton
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            chainStatus="icon"
            showBalance={true}
          />
        </div>
        <UserMenu/>
        <Button
          variant="ghost"
          size="icon"
          className="text-blue-500 dark:text-gray-400 hover:text-white"
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;

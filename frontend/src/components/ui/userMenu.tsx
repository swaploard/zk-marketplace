import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Switch } from "./switch";
import useUserStore, { IUserStore } from "@/store/userSlice";

export default function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const { setTheme } = useTheme();
  const { user } = useUserStore((state: IUserStore) => state);

  const handleSetTheme = () => {
    if (!mounted) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
    setMounted(!mounted);
  };

  return (
    <DropdownMenu open={open} className="border border-gray-600">
      <DropdownMenuTrigger asChild onMouseEnter={() => setOpen(true)}>
        <div className="bg-bgNav rounded-xl bg-opacity-50">
          {user?.profileImage ? (
            <Image
              src={user.profileImage}
              width={30}
              height={30}
              alt="profile image"
              className="rounded-xl m-1.5"
            />
          ) : (
            <User className="h-5 w-5 text-blue-500 dark:text-gray-400 m-2.5" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-white dark:bg-black border border-gray-600"
        onMouseLeave={() => setOpen(false)}
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className=" ">
            <Link href="/user/profile">Profile </Link>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/user/update">Settings</Link>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          Night mode
          <DropdownMenuShortcut>
            <Switch checked={mounted} onCheckedChange={handleSetTheme} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/Button";
import { UserCircleIcon, ArrowRightOnRectangleIcon, UserIcon } from "@heroicons/react/24/outline";

interface ProfileMenuProps {
  user?: { name: string; avatarUrl?: string };
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email?: string;
    avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    authService.getProfile().then((user) => {
      if (user) {
        setCurrentUser({
          name: user.firstName + (user.middleName ? " " + user.middleName : ""),
          email: user.email,
        });
      }
    });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-200 md:w-auto md:px-3 md:gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground md:mr-2">
            <span className="text-sm font-medium">
              {currentUser?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-medium capitalize">
              {currentUser?.name || "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentUser?.email || ""}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none capitalize">
              {currentUser?.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/profile")}
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile Management</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => authService.logout()}
        >
          <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, FileText, Settings, LogOut, Users, SlidersHorizontal, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn, getAvatarColor } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    display_name?: string | null;
  };
  userRole?: "owner" | "member";
}

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

export function AppShell({ children, user, userRole }: AppShellProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const workspaceId = params?.workspaceId as string | undefined;

  const navItems = [
    {
      id: "new-decision",
      label: t("nav.newDecision"),
      icon: Sparkles,
      href: workspaceId ? `/w/${workspaceId}/new-decision` : "#",
    },
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
      href: workspaceId ? `/w/${workspaceId}/dashboard` : "#",
    },
    {
      id: "impacts",
      label: t("nav.impacts"),
      icon: FileText,
      href: workspaceId ? `/w/${workspaceId}/impacts` : "#",
      disabled: true, // Coming soon
    },
  ];

  const workspaceActions = [
    {
      id: "members",
      label: t("members.title"),
      icon: Users,
      href: workspaceId ? `/w/${workspaceId}/members` : "#",
      ownerOnly: true,
    },
    {
      id: "settings",
      label: t("workspace.settings"),
      icon: Settings,
      href: workspaceId ? `/w/${workspaceId}/settings` : "#",
      ownerOnly: true,
    },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--background)" }}>
      {/* Sidebar */}
      <aside
        className="w-60 border-r border-border/50 flex flex-col h-screen sticky top-0"
        style={{ backgroundColor: "var(--card)" }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {t("common.appName")}
            </span>
          </Link>
        </div>

        {/* Workspace Selector */}
        <WorkspaceSelector />

        {/* Navigation */}
        <nav className="flex-1 p-2 flex flex-col">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.disabled && (
                  <span
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Workspace Actions - only for owners */}
          {userRole === "owner" && (
            <div className="mt-auto pt-2 border-t border-border/50 space-y-1">
              <p
                className="px-3 py-1 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                {t("workspace.title")}
              </p>
              {workspaceActions.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

      </aside>

      {/* Main Area with Header */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header with User Menu */}
        <header
          className="h-14 border-b px-6 flex items-center justify-end sticky top-0 z-10"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className="text-white text-xs font-medium"
                    style={{ backgroundColor: getAvatarColor(user.id) }}
                  >
                    {getInitials(user.display_name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user.display_name || "Account"}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/preferences">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {t("preferences.title")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("auth.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import type { Database } from "@/types/database";

type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

interface Workspace {
  id: string;
  name: string;
  role: WorkspaceRole;
  member_count: number;
  created_at: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WorkspaceSelector() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const currentWorkspaceId = params?.workspaceId as string | undefined;

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_user_workspaces");

    if (error) {
      console.error("Error loading workspaces:", error);
      return;
    }

    setWorkspaces(data || []);
    setIsLoading(false);
  }

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  const handleSelectWorkspace = (workspaceId: string) => {
    if (workspaceId === currentWorkspaceId) return;
    startTransition(() => {
      router.push(`/w/${workspaceId}/dashboard`);
    });
  };

  const handleWorkspaceCreated = async (workspaceId: string) => {
    // Refresh workspaces list
    const supabase = createClient();
    const { data: updatedWorkspaces } = await supabase.rpc("get_user_workspaces");
    if (updatedWorkspaces) {
      setWorkspaces(updatedWorkspaces);
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 border-b border-border/50">
        <div className="w-full h-9 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="p-3 border-b border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-9 px-2"
              disabled={isPending}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {currentWorkspace ? getInitials(currentWorkspace.name) : "?"}
                  </span>
                </div>
                <span className="text-sm font-medium truncate">
                  {currentWorkspace?.name || t("workspace.title")}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>{t("workspace.switchTo")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleSelectWorkspace(workspace.id)}
                className="cursor-pointer"
              >
                {workspace.id === currentWorkspaceId ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <span className="w-4 h-4 mr-2" />
                )}
                <span className="flex-1 truncate">{workspace.name}</span>
                {workspace.id === currentWorkspaceId && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded ml-2"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {t("workspace.current")}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsCreateDialogOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("workspace.create")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </>
  );
}

"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

interface Workspace {
  id: string;
  name: string;
  role: WorkspaceRole;
  member_count: number;
  created_at: string;
}

export default function WorkspaceSettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isSaving, startSaving] = useTransition();

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [isDeleting, startDeleting] = useTransition();

  // Leave dialog state
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isLeaving, startLeaving] = useTransition();

  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  async function loadWorkspace() {
    const supabase = createClient();
    const { data: workspaces } = await supabase.rpc("get_user_workspaces");
    const ws = workspaces?.find((w) => w.id === workspaceId);

    if (!ws) {
      router.push("/workspaces");
      return;
    }

    // Only owners can access settings
    if (ws.role !== "owner") {
      router.push(`/w/${workspaceId}/dashboard`);
      return;
    }

    setWorkspace(ws);
    setWorkspaceName(ws.name);
    setIsLoading(false);
  }

  async function handleRename() {
    if (!workspaceName.trim() || workspaceName === workspace?.name) return;

    startSaving(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("rename_workspace", {
        p_workspace_id: workspaceId,
        p_new_name: workspaceName.trim(),
      });

      if (error) {
        console.error("Error renaming workspace:", error);
        return;
      }

      loadWorkspace();
    });
  }

  async function handleDelete() {
    if (deleteConfirmName !== workspace?.name) return;

    startDeleting(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_workspace", {
        p_workspace_id: workspaceId,
      });

      if (error) {
        console.error("Error deleting workspace:", error);
        return;
      }

      router.push("/workspaces");
    });
  }

  async function handleLeave() {
    startLeaving(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("leave_workspace", {
        p_workspace_id: workspaceId,
      });

      if (error) {
        console.error("Error leaving workspace:", error);
        if (error.message.includes("last owner")) {
          alert(t("workspace.leaveLastOwnerError"));
        }
        return;
      }

      router.push("/workspaces");
    });
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="flex-1 flex flex-col">

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Page Title */}
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {t("workspace.settingsTitle")}
          </h1>

          {/* Rename Section */}
          <section
            className="border rounded-lg p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <h2
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {t("workspace.rename")}
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {t("workspace.renameDescription")}
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="workspace-name" className="sr-only">
                  {t("workspace.name")}
                </Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={t("workspace.namePlaceholder")}
                />
              </div>
              <Button
                onClick={handleRename}
                disabled={!workspaceName.trim() || workspaceName === workspace.name || isSaving}
              >
                {isSaving ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: "var(--error)" }}
          >
            <div
              className="px-6 py-3 border-b"
              style={{ borderColor: "var(--error)", backgroundColor: "var(--error-soft)" }}
            >
              <h2
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: "var(--error-text)" }}
              >
                <AlertTriangle className="w-4 h-4" />
                {t("workspace.dangerZone")}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Leave Workspace */}
              {workspace.member_count > 1 && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t("workspace.leave")}
                    </h3>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {t("workspace.leaveDescription")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsLeaveDialogOpen(true)}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("workspace.leave")}
                  </Button>
                </div>
              )}

              {/* Delete Workspace */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t("workspace.delete")}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {t("workspace.deleteDescription")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  {t("workspace.delete")}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {t("workspace.delete")}
            </DialogTitle>
            <DialogDescription>
              {t("workspace.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">{t("workspace.deleteTypeName")}</Label>
              <Input
                id="delete-confirm"
                placeholder={workspace.name}
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmName("");
              }}
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirmName !== workspace.name || isDeleting}
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("workspace.leave")}</DialogTitle>
            <DialogDescription>{t("workspace.leaveConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLeaveDialogOpen(false)}
              disabled={isLeaving}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={isLeaving}
            >
              {isLeaving ? t("common.loading") : t("workspace.leave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

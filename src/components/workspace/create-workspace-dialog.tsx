"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkspaceCreated?: (workspaceId: string) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onWorkspaceCreated,
}: CreateWorkspaceDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isCreating, startCreating] = useTransition();

  const handleCreate = () => {
    if (!name.trim()) return;

    startCreating(async () => {
      const supabase = createClient();
      const { data: workspaceId, error } = await supabase.rpc("create_workspace", {
        workspace_name: name.trim(),
      });

      if (error) {
        console.error("Error creating workspace:", error);
        return;
      }

      onOpenChange(false);
      setName("");

      if (workspaceId) {
        onWorkspaceCreated?.(workspaceId);
        router.push(`/w/${workspaceId}/dashboard`);
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.createTitle")}</DialogTitle>
          <DialogDescription>{t("workspace.createDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">{t("workspace.name")}</Label>
            <Input
              id="workspace-name"
              placeholder={t("workspace.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? t("common.loading") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

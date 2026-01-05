"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Shield, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";

/**
 * Pagina /workspaces
 * - Se l'utente ha workspace → redirect al primo
 * - Se non ne ha → mostra UI per crearne uno
 */
export default function WorkspacesPage() {
  const t = useTranslations("workspace");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasWorkspaces, setHasWorkspaces] = useState<boolean | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    checkWorkspaces();
  }, []);

  async function checkWorkspaces() {
    const supabase = createClient();
    const { data: workspaces } = await supabase.rpc("get_user_workspaces");

    if (workspaces && workspaces.length > 0) {
      // Redirect al primo workspace
      router.replace(`/w/${workspaces[0].id}/dashboard`);
    } else {
      setHasWorkspaces(false);
      setLoading(false);
    }
  }

  const handleWorkspaceCreated = (workspaceId: string) => {
    router.push(`/w/${workspaceId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // L'utente non ha workspace
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header semplice */}
      <header className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Decision Trail
          </span>
        </div>
      </header>

      {/* Empty state */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <Shield className="w-8 h-8 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            {t("empty.title")}
          </h1>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            {t("empty.description")}
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("create")}
          </Button>
        </div>
      </main>

      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { workspaceId } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  // Verify user has access to this workspace
  const { data: workspaces } = await supabase.rpc("get_user_workspaces");
  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  if (!currentWorkspace) {
    redirect("/workspaces");
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: "var(--info-soft)" }}
        >
          <FileText className="w-6 h-6" style={{ color: "var(--info)" }} />
        </div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {t("impact.empty.title")}
        </h3>
        <p
          className="text-sm mb-6 max-w-md"
          style={{ color: "var(--text-secondary)" }}
        >
          {t("impact.empty.description")}
        </p>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          {t("impact.empty.cta")}
          <span
            className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--text-tertiary)",
            }}
          >
            Soon
          </span>
        </Button>
      </div>
    </div>
  );
}

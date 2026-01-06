import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewDecisionWorkspace } from "@/components/new-decision/new-decision-workspace";

interface NewDecisionPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function NewDecisionPage({ params }: NewDecisionPageProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Verify user has access to this workspace
  const { data: workspaces } = await supabase.rpc("get_user_workspaces");
  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  if (!currentWorkspace) {
    redirect("/workspaces");
  }

  return <NewDecisionWorkspace workspaceId={workspaceId} />;
}

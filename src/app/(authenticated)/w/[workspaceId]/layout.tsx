import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Get user's role in current workspace
  const { data: workspaces } = await supabase.rpc("get_user_workspaces");
  const currentWorkspace = workspaces?.find((w) => w.id === workspaceId);

  if (!currentWorkspace) {
    redirect("/workspaces");
  }

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email || "",
        display_name: profile?.display_name,
      }}
      userRole={currentWorkspace.role}
    >
      {children}
    </AppShell>
  );
}

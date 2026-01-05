import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Placeholder layout - will be replaced with full AppShell later
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

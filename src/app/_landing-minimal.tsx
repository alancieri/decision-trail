import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LandingMinimal() {
  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");
  const tWorkspace = await getTranslations("workspace");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="h-10 w-10 text-primary" strokeWidth={2.5} />
          <span className="text-2xl font-semibold text-neutral-900">
            {tCommon("appName")}
          </span>
        </div>

        <Link href={user ? "/workspaces" : "/auth/login"}>
          <Button size="lg" className="px-8">
            {user ? tWorkspace("goToDashboard") : tAuth("login")}
          </Button>
        </Link>
      </div>
    </div>
  );
}

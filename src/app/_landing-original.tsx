import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, CheckCircle, FileText, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAvatarColor } from "@/lib/utils";

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

export default async function LandingOriginal() {
  const t = await getTranslations();
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  // Get profile if logged in
  let profile: { display_name: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" strokeWidth={2.5} />
            <span className="text-xl font-semibold text-slate-800">
              {t("common.appName")}
            </span>
          </div>
          {user ? (
            <Link href="/workspaces" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {t("nav.dashboard")}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className="text-white text-xs font-medium"
                  style={{ backgroundColor: getAvatarColor(user.id) }}
                >
                  {getInitials(profile?.display_name, user.email || "")}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button>{t("auth.login")}</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="py-24 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-800 mb-6">
              Make impact visible
              <br />
              <span className="text-primary">before it becomes a problem.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Decision Trail ti aiuta a tracciare decisioni, cambiamenti e
              incidenti, valutandone l&apos;impatto sull&apos;ISMS in modo
              strutturato e difendibile in audit.
            </p>
            <Link href={user ? "/workspaces" : "/auth/login"}>
              <Button size="lg" className="px-8">
                {user ? t("workspace.goToDashboard") : t("auth.login")}
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold text-center text-slate-800 mb-12">
              Un metodo strutturato per ogni valutazione
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8 text-primary" />}
                title="7 aree ISMS"
                description="Valuta sistematicamente ogni area: asset, dati, accessi, processi, rischi, documentazione, persone."
              />
              <FeatureCard
                icon={<FileText className="h-8 w-8 text-primary" />}
                title="Traccia le azioni"
                description="Non dimenticare mai un'azione. Ogni valutazione genera task tracciabili fino alla chiusura."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Multi-workspace"
                description="Gestisci più clienti o progetti in workspace separati. Perfetto per consulenti ISO 27001."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-slate-800 mb-4">
              Pronto per iniziare?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Crea il tuo primo Impact in meno di un minuto.
            </p>
            <Link href={user ? "/workspaces" : "/auth/login"}>
              <Button size="lg" className="px-8">
                {user ? t("workspace.goToDashboard") : t("auth.login")}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-500">
              Decision Trail © {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-sm text-slate-500">{t("common.tagline")}</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, PenLine, Brain, FileCheck, Wrench, KeyRound, Truck, AlertTriangle, Ban, Zap, Sparkles, ClipboardCheck, UserCheck, ArrowRight } from "lucide-react";
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

export default async function LandingFull() {
  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");
  const tNav = await getTranslations("nav");
  const tWorkspace = await getTranslations("workspace");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

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
    <div className="min-h-screen bg-white">
      {/* Early Access Banner - temporarily hidden
      <div className="bg-neutral-900 text-white text-sm py-2 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <span className="font-medium">Decision Trail is in early access.</span>
          {" "}We&apos;re actively developing based on real-world feedback.{" "}
          <a
            href="mailto:hello@mydecisiontrail.com"
            className="underline underline-offset-2 hover:text-white/80 transition-colors"
          >
            Get in touch
          </a>
        </div>
      </div>
      */}

      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" strokeWidth={2.5} />
            <span className="text-base font-semibold text-neutral-900">
              {tCommon("appName")}
            </span>
          </div>
          {user ? (
            <Link href="/workspaces" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-sm text-neutral-600">
                {tNav("dashboard")}
              </span>
              <Avatar className="w-7 h-7">
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
              <Button size="sm">{tAuth("login")}</Button>
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          {/* Vibrant gradient mesh background - warm/energetic tones */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 90% 60% at 15% 35%, rgba(251, 146, 60, 0.18) 0%, transparent 55%),
                radial-gradient(ellipse 70% 50% at 85% 15%, rgba(168, 85, 247, 0.12) 0%, transparent 55%),
                radial-gradient(ellipse 60% 40% at 70% 85%, rgba(236, 72, 153, 0.10) 0%, transparent 50%),
                radial-gradient(ellipse 50% 35% at 5% 70%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)
              `,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                Make impact visible{" "}
                <span className="text-primary">before it becomes a problem.</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-neutral-600 leading-relaxed max-w-2xl">
                Decision Trail helps you capture everyday decisions, changes, and incidents — and reason about their <strong>potential security & compliance impact</strong> before they escalate.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link href={user ? "/workspaces" : "/auth/login"}>
                  <Button className="px-6">
                    {user ? tWorkspace("goToDashboard") : tAuth("login")}
                  </Button>
                </Link>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  See how it works →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem - Dark */}
        <section className="bg-neutral-900 py-20 lg:py-32 relative overflow-hidden">
          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                Most security & compliance issues don&apos;t start as incidents.
              </h2>
              <p className="mt-4 text-base text-neutral-400 max-w-2xl mx-auto">
                They start as <strong className="text-neutral-300">small decisions</strong> that seem harmless at the time:
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DarkCard icon={<Wrench className="h-5 w-5" />} text="Swapping a tool or vendor without documenting the security implications" />
              <DarkCard icon={<KeyRound className="h-5 w-5" />} text="Changing an access rule to unblock someone quickly" />
              <DarkCard icon={<Truck className="h-5 w-5" />} text="Onboarding a new supplier without a proper risk assessment" />
              <DarkCard icon={<AlertTriangle className="h-5 w-5" />} text="Skipping a control &quot;just this once&quot; to meet a deadline" />
            </div>
            <p className="mt-10 text-base text-neutral-500 leading-relaxed text-center max-w-2xl mx-auto">
              Without a clear trail of reasoning, these decisions become <strong className="text-neutral-400">hard to explain</strong> — especially months later, during audits, reviews, or when something goes wrong.
            </p>
          </div>
        </section>

        {/* What DT does - White */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          {/* Dot pattern background - neutral */}
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23cbd5e1'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 leading-tight">
                  Decision Trail creates a <span className="text-primary">reasoning trail</span>, not just a log.
                </h2>
                <p className="mt-4 text-base text-neutral-600 leading-relaxed">
                  Every decision leaves a trace. Decision Trail helps you make that trace <strong>meaningful</strong>, <strong>structured</strong>, and <strong>ready</strong> for when it matters most.
                </p>
              </div>
              <div className="space-y-6">
                <FeatureItem
                  icon={<Zap className="h-4 w-4" />}
                  title="Capture in real-time"
                  description="Log decisions, changes, and near-misses as they happen — before context is lost and memory fades."
                />
                <FeatureItem
                  icon={<Sparkles className="h-4 w-4" />}
                  title="AI-assisted reasoning"
                  description="Get intelligent help identifying potential impact areas, surfacing the right questions, and structuring your thinking."
                />
                <FeatureItem
                  icon={<ClipboardCheck className="h-4 w-4" />}
                  title="Auditable by design"
                  description="Keep a clear, timestamped trail of why something was decided — ready for internal reviews, external audits, or future reference."
                />
                <FeatureItem
                  icon={<UserCheck className="h-4 w-4" />}
                  title="Human in control"
                  description="Nothing is automatic or enforced. You review, adjust, and decide what gets documented. The AI assists — you decide."
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works - Light gray */}
        <section id="how-it-works" className="bg-neutral-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
                How it works
              </h2>
              <p className="mt-4 text-base text-neutral-600 max-w-2xl mx-auto">
                From decision to documentation in three simple steps. No complex workflows, no steep learning curve.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <StepCard
                number="01"
                icon={<PenLine className="h-5 w-5" />}
                title="Describe what happened"
                description="Write a short, free-text description of a decision, change, or event. Use your own words — no forms to fill."
              />
              <StepCard
                number="02"
                icon={<Brain className="h-5 w-5" />}
                title="Get guided reasoning"
                description="The AI helps you rephrase the situation, ask the right questions, and highlight areas that may require attention."
              />
              <StepCard
                number="03"
                icon={<FileCheck className="h-5 w-5" />}
                title="Decide and document"
                description="Review the AI suggestions, make your own adjustments, and save the reasoning trail. You stay in control."
              />
            </div>
          </div>
        </section>

        {/* Who it's for - White */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          {/* Subtle radial gradient - neutral */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 60% 40% at 90% 50%, rgba(148, 163, 184, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse 50% 30% at 10% 80%, rgba(100, 116, 139, 0.08) 0%, transparent 50%)
              `,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 leading-tight">
                  Built for people who make <span className="text-primary">decisions that matter</span>
                </h2>
                <p className="mt-4 text-base text-neutral-600 leading-relaxed">
                  If you&apos;re responsible for choices that could impact security, compliance, or operational risk — Decision Trail fits naturally into your workflow.
                </p>
              </div>
              <div>
                <p className="text-base text-neutral-600 leading-relaxed mb-6">
                  Decision Trail is designed for:
                </p>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <span className="font-semibold text-neutral-900">CTOs and Technical Leads</span>
                      <p className="text-sm text-neutral-600 mt-0.5">Making architecture decisions, vendor choices, and technical trade-offs every day.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <span className="font-semibold text-neutral-900">Security & Compliance Managers</span>
                      <p className="text-sm text-neutral-600 mt-0.5">Maintaining compliance, preparing for audits, and tracking security-relevant changes.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-semibold">→</span>
                    <div>
                      <span className="font-semibold text-neutral-900">Security-conscious startup teams</span>
                      <p className="text-sm text-neutral-600 mt-0.5">Moving fast without losing track of decisions that could matter later.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What it's NOT - Dark */}
        <section className="bg-neutral-900 py-20 lg:py-32 relative overflow-hidden">
          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                What Decision Trail is <span className="text-red-400">not</span>
              </h2>
              <p className="mt-4 text-base text-neutral-400 max-w-2xl mx-auto">
                We believe in being clear about what we don&apos;t do.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <DarkCard icon={<Ban className="h-5 w-5" />} text="Not a certification tool — we don't issue or manage ISO 27001 or SOC 2 certifications" variant="negative" />
              <DarkCard icon={<Ban className="h-5 w-5" />} text="Not an automated compliance engine — we don't auto-generate policies or controls for you" variant="negative" />
              <DarkCard icon={<Ban className="h-5 w-5" />} text="Not a replacement for human judgment — the AI assists your thinking, but you make the decisions" variant="negative" />
            </div>
            <p className="mt-10 text-base text-neutral-500 italic leading-relaxed text-center max-w-2xl mx-auto">
              Decision Trail <strong className="text-neutral-400 not-italic">supports thinking</strong> — it does not replace responsibility.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-24 bg-neutral-50 border-t border-neutral-200">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
              Ready to build your reasoning trail?
            </h2>
            <p className="mt-4 text-base text-neutral-600 max-w-xl mx-auto">
              Start capturing decisions today. No credit card required, no complex setup — just sign in and begin documenting what matters.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={user ? "/workspaces" : "/auth/login"}>
                <Button size="lg" className="px-8">
                  {user ? tWorkspace("goToDashboard") : "Get started for free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a
                href="mailto:hello@mydecisiontrail.com"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Have questions? Get in touch
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 lg:py-16 bg-neutral-900 text-neutral-400">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-white">Decision Trail</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Making security & compliance impact visible before it becomes a problem. Document decisions, track reasoning, stay audit-ready.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                </li>
                <li>
                  <Link href={user ? "/workspaces" : "/auth/login"} className="hover:text-white transition-colors">
                    {user ? "Dashboard" : "Get started"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Use Cases</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="hover:text-white transition-colors cursor-default">Vendor changes</span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-default">Access decisions</span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-default">Incident response</span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-default">Audit preparation</span>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="mailto:hello@mydecisiontrail.com" className="hover:text-white transition-colors">Contact us</a>
                </li>
                <li>
                  <a href="mailto:security@mydecisiontrail.com" className="hover:text-white transition-colors">Security</a>
                </li>
                <li>
                  <a href="mailto:hello@mydecisiontrail.com?subject=Feature request" className="hover:text-white transition-colors">Request a feature</a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} Decision Trail. All rights reserved.
            </p>
            <p className="text-sm">
              Built with care for security teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-600 leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="text-xs font-medium text-neutral-400">{number}</span>
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
    </div>
  );
}

function DarkCard({
  icon,
  text,
  variant = "default",
}: {
  icon: React.ReactNode;
  text: string;
  variant?: "default" | "negative";
}) {
  return (
    <div className="rounded-xl p-5 border border-neutral-800 bg-neutral-800/50 backdrop-blur-sm">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-lg mb-4 ${
          variant === "negative"
            ? "bg-red-500/10 text-red-400"
            : "bg-neutral-700 text-neutral-300"
        }`}
      >
        {icon}
      </div>
      <p className="text-sm text-neutral-300 leading-relaxed">{text}</p>
    </div>
  );
}

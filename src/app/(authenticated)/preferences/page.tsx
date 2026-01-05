"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Settings, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { setLocaleCookie, locales, languageLabels, type Locale } from "@/lib/locale";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: string | null;
  created_at: string;
  updated_at: string;
}

export default function PreferencesPage() {
  const t = useTranslations();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("it");
  const [isSaving, startSaving] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_current_profile");

    if (error || !data || data.length === 0) {
      router.push("/workspaces");
      return;
    }

    const profileData = data[0] as Profile;
    setProfile(profileData);
    setDisplayName(profileData.display_name || "");
    setSelectedLocale((profileData.locale as Locale) || "it");
    setIsLoading(false);
  }

  async function handleSave() {
    if (!profile) return;

    startSaving(async () => {
      setSaveSuccess(false);
      const supabase = createClient();
      const { error } = await supabase.rpc("update_profile", {
        p_display_name: displayName.trim() || undefined,
        p_locale: selectedLocale,
      });

      if (error) {
        console.error("Error updating profile:", error);
        return;
      }

      // Set cookie for immediate effect
      setLocaleCookie(selectedLocale);

      setSaveSuccess(true);
      loadProfile();

      // If locale changed, reload to apply new language
      if (selectedLocale !== profile.locale) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  }

  const hasChanges =
    displayName !== (profile?.display_name || "") ||
    selectedLocale !== (profile?.locale || "it");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <header
        className="h-14 border-b px-6 flex items-center gap-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Button>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("preferences.title")}
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {profile.email}
              </p>
            </div>
          </div>

          {/* Display Name Section */}
          <section
            className="border rounded-lg p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {t("preferences.displayName")}
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {t("preferences.displayNameDescription")}
            </p>
            <div className="flex-1">
              <Label htmlFor="display-name" className="sr-only">
                {t("preferences.displayName")}
              </Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("preferences.displayNamePlaceholder")}
              />
            </div>
          </section>

          {/* Language Section */}
          <section
            className="border rounded-lg p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {t("preferences.language")}
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {t("preferences.languageDescription")}
            </p>
            <Select
              value={selectedLocale}
              onValueChange={(value) => setSelectedLocale(value as Locale)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {languageLabels[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? t("common.loading") : t("common.save")}
            </Button>
            {saveSuccess && (
              <p className="text-sm" style={{ color: "var(--success)" }}>
                {t("preferences.saved")}
              </p>
            )}
          </div>

          {/* Account Info */}
          <section
            className="border rounded-lg p-6"
            style={{ borderColor: "var(--border)" }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              {t("preferences.accountInfo")}
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("auth.email")}
                </Label>
                <p className="mt-1" style={{ color: "var(--text-primary)" }}>
                  {profile.email}
                </p>
              </div>
              <div>
                <Label className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {t("preferences.memberSince")}
                </Label>
                <p className="mt-1" style={{ color: "var(--text-primary)" }}>
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

"use client";

import { CheckIcon, CopyIcon, GoogleLogoIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { saveIntegrationSettingsAction } from "@/app/actions/integrations";
import { PasswordInput } from "@/components/common/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IntegrationSettingsSummary } from "@/lib/integration-settings";
import { IntegrationCard } from "./integration-card";
import { ENV_OVERRIDE_NOTE } from "./integration-status-badge";

type Google = IntegrationSettingsSummary["google"];

const REDIRECT_URI_TEMPLATE = "{your_domain}/api/auth/callback/google";
const RESTART_NOTE =
  "Changes here take effect after the app restarts — the login page reads Google credentials once at server startup, not per request.";

interface Props {
  bare?: boolean;
  googleOAuthLive?: boolean;
  initial: Google;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (configured: boolean) => void;
  open?: boolean;
  resolvedConfigured?: boolean;
}

export function GoogleOAuthSettingsForm({
  bare = false,
  initial,
  onSaved,
  open,
  onOpenChange,
  googleOAuthLive = false,
  resolvedConfigured = false,
}: Props) {
  const [clientId, setClientId] = useState(initial.clientId);
  const [clientSecret, setClientSecret] = useState("");
  const [hasClientSecret, setHasClientSecret] = useState(
    initial.hasClientSecret
  );
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [copied, setCopied] = useState(false);

  const dbConfigured = !!(clientId && hasClientSecret);
  const usingEnv = !dbConfigured && resolvedConfigured;
  const effectivelyConfigured = dbConfigured || resolvedConfigured;

  async function copyRedirectUri() {
    await navigator.clipboard.writeText(REDIRECT_URI_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function save(google: Record<string, unknown>, message: string) {
    const result = await saveIntegrationSettingsAction({ google });
    if ("error" in result) {
      toast.error(result.error);
      return false;
    }
    toast.success(message);
    return true;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const ok = await save(
        { clientId, clientSecret: clientSecret || undefined },
        "Google sign-in settings saved."
      );
      if (ok) {
        if (clientSecret) {
          setHasClientSecret(true);
        }
        setClientSecret("");
        onSaved?.(!!(clientId && (hasClientSecret || clientSecret)));
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const ok = await save(
        { clientId: "", clientSecret: "" },
        "Google sign-in settings removed."
      );
      if (ok) {
        setClientId("");
        setClientSecret("");
        setHasClientSecret(false);
        onSaved?.(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <IntegrationCard
      bare={bare}
      description='Enables the "Continue with Google" button on sign-in.'
      icon={<GoogleLogoIcon className="size-4.5" />}
      note={usingEnv ? ENV_OVERRIDE_NOTE : RESTART_NOTE}
      onOpenChange={onOpenChange}
      onRemove={handleRemove}
      onSave={handleSave}
      open={open}
      removing={removing}
      saving={saving}
      status={
        effectivelyConfigured
          ? googleOAuthLive
            ? "configured"
            : "restart-required"
          : "not-configured"
      }
      title="Google OAuth"
      usingEnv={usingEnv}
      value="google"
    >
      <div className="mb-4 space-y-1.5">
        <Label>Authorized redirect URI</Label>
        <p className="text-xs text-base-content/60">
          Add this URL to your Google Cloud OAuth client&rsquo;s
          &ldquo;Authorized redirect URIs&rdquo;, with {"{your_domain}"}{" "}
          replaced by this app&rsquo;s URL — Google sign-in fails with a
          redirect_uri_mismatch error otherwise.
        </p>
        <div className="flex items-center gap-2 rounded-md border border-base-300 bg-base-200 px-3 py-2">
          <code className="flex-1 break-all text-xs text-base-content">
            {REDIRECT_URI_TEMPLATE}
          </code>
          <button
            className="shrink-0 text-base-content/60 hover:text-base-content"
            onClick={copyRedirectUri}
            type="button"
          >
            {copied ? (
              <CheckIcon className="size-4 text-success" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="google-client-id">Client ID</Label>
          <Input
            disabled={saving}
            id="google-client-id"
            onChange={(e) => setClientId(e.target.value)}
            value={clientId}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="google-client-secret">Client secret</Label>
          <PasswordInput
            disabled={saving}
            id="google-client-secret"
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder={
              hasClientSecret ? "Saved — leave blank to keep" : "Not set"
            }
            value={clientSecret}
          />
        </div>
      </div>
    </IntegrationCard>
  );
}

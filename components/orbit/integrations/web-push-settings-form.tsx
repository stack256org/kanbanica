"use client";

import { BellIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { saveIntegrationSettingsAction } from "@/app/actions/integrations";
import { PasswordInput } from "@/components/common/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IntegrationSettingsSummary } from "@/lib/integration-settings";
import { IntegrationCard } from "./integration-card";
import { ENV_OVERRIDE_NOTE } from "./integration-status-badge";

type WebPush = IntegrationSettingsSummary["webPush"];

interface Props {
  bare?: boolean;
  initial: WebPush;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (configured: boolean) => void;
  open?: boolean;
  resolvedConfigured?: boolean;
}

export function WebPushSettingsForm({
  bare = false,
  initial,
  onSaved,
  open,
  onOpenChange,
  resolvedConfigured = false,
}: Props) {
  const [publicKey, setPublicKey] = useState(initial.publicKey);
  const [subject, setSubject] = useState(initial.subject);
  const [privateKey, setPrivateKey] = useState("");
  const [hasPrivateKey, setHasPrivateKey] = useState(initial.hasPrivateKey);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const dbConfigured = !!(publicKey && subject && hasPrivateKey);
  const usingEnv = !dbConfigured && resolvedConfigured;
  const effectivelyConfigured = dbConfigured || resolvedConfigured;

  async function save(webPush: Record<string, unknown>, message: string) {
    const result = await saveIntegrationSettingsAction({ webPush });
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
        { publicKey, subject, privateKey: privateKey || undefined },
        "Web Push settings saved."
      );
      if (ok) {
        if (privateKey) {
          setHasPrivateKey(true);
        }
        setPrivateKey("");
        onSaved?.(!!(publicKey && subject && (hasPrivateKey || privateKey)));
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
        { publicKey: "", subject: "", privateKey: "" },
        "Web Push settings removed."
      );
      if (ok) {
        setPublicKey("");
        setSubject("");
        setPrivateKey("");
        setHasPrivateKey(false);
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
      description="Browser/desktop push notifications. Generate a key pair with `npx web-push generate-vapid-keys`."
      icon={<BellIcon className="size-4.5" />}
      note={usingEnv ? ENV_OVERRIDE_NOTE : undefined}
      onOpenChange={onOpenChange}
      onRemove={handleRemove}
      onSave={handleSave}
      open={open}
      removing={removing}
      saving={saving}
      status={effectivelyConfigured ? "configured" : "not-configured"}
      title="Web Push"
      usingEnv={usingEnv}
      value="webPush"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="webpush-public-key">Public key</Label>
          <Input
            disabled={saving}
            id="webpush-public-key"
            onChange={(e) => setPublicKey(e.target.value)}
            value={publicKey}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="webpush-subject">Subject</Label>
          <Input
            disabled={saving}
            id="webpush-subject"
            onChange={(e) => setSubject(e.target.value)}
            placeholder="mailto:you@example.com"
            value={subject}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="webpush-private-key">Private key</Label>
        <PasswordInput
          disabled={saving}
          id="webpush-private-key"
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder={
            hasPrivateKey ? "Saved — leave blank to keep" : "Not set"
          }
          value={privateKey}
        />
      </div>
    </IntegrationCard>
  );
}

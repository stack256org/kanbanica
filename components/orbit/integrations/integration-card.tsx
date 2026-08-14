"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  type IntegrationStatus,
  IntegrationStatusBadge,
  UsingEnvBadge,
} from "./integration-status-badge";

export type { IntegrationStatus };

interface Props {
  bare?: boolean;
  children: ReactNode;
  description: string;
  icon: ReactNode;
  note?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onRemove?: () => void;
  onSave: () => void;
  onTest?: () => void;
  open?: boolean;
  removing?: boolean;
  saving: boolean;
  status: IntegrationStatus;
  testing?: boolean;
  title: string;
  usingEnv?: boolean;
  value: string;
}

export function IntegrationCard({
  bare = false,
  value,
  title,
  description,
  icon,
  status,
  note,
  saving,
  removing,
  testing,
  usingEnv,
  open,
  onOpenChange,
  onSave,
  onRemove,
  onTest,
  children,
}: Props) {
  const controlled = open !== undefined;

  const body = (
    <div className="space-y-5">
      <div className="space-y-4">{children}</div>

      {note && (
        <p className="rounded-md bg-base-200/40 px-3 py-2 text-xs text-base-content/60">
          {note}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-base-300 pt-4">
        {(status === "configured" || status === "restart-required") &&
        !usingEnv &&
        onRemove ? (
          <Button
            className="text-error hover:text-error"
            disabled={saving || removing || testing}
            onClick={onRemove}
            size="sm"
            type="button"
            variant="ghost"
          >
            {removing ? "Removing…" : "Remove"}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {onTest && (
            <Button
              disabled={saving || removing || testing}
              onClick={onTest}
              size="sm"
              type="button"
              variant="outline"
            >
              {testing ? "Testing…" : "Test Connection"}
            </Button>
          )}
          <Button
            disabled={saving || removing || testing}
            onClick={onSave}
            size="sm"
            type="button"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (bare) {
    return (
      <div className="overflow-hidden rounded-xl border border-base-300 bg-elevated">
        <div className="flex items-center gap-3.5 px-5 py-4 sm:px-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-base-content">
                {title}
              </h3>
              <IntegrationStatusBadge status={status} />
              {usingEnv && <UsingEnvBadge />}
            </div>
            <p className="mt-0.5 text-xs font-normal text-base-content/60">
              {description}
            </p>
          </div>
        </div>
        <div className="border-t border-base-300 px-5 pt-5 pb-5 sm:px-6">
          {body}
        </div>
      </div>
    );
  }

  return (
    <Accordion
      collapsible
      onValueChange={onOpenChange && ((next) => onOpenChange(next === value))}
      type="single"
      {...(controlled
        ? { value: open ? value : undefined }
        : { defaultValue: value })}
    >
      <AccordionItem
        className="overflow-hidden rounded-xl border border-base-300 bg-elevated"
        value={value}
      >
        <AccordionTrigger className="items-center px-5 py-4 hover:no-underline sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-base-content">
                  {title}
                </h3>
                <IntegrationStatusBadge status={status} />
                {usingEnv && <UsingEnvBadge />}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs font-normal text-base-content/60">
                {description}
              </p>
            </div>
            <span className="hidden shrink-0 text-xs font-medium text-primary sm:inline">
              {status === "not-configured" ? "Configure" : "Edit"}
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="border-t border-base-300 px-5 pt-5 sm:px-6">
          {body}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

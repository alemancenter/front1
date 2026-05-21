import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { PolicyAuditRun } from "@/lib/api/services/content-audit";

export function statusBadge(status: PolicyAuditRun["status"]) {
  switch (status) {
    case "completed":
      return {
        label: "مكتمل",
        variant: "success" as const,
        icon: CheckCircle2,
      };
    case "failed":
      return { label: "فشل", variant: "error" as const, icon: XCircle };
    default:
      return {
        label: "قيد التشغيل",
        variant: "warning" as const,
        icon: Loader2,
      };
  }
}

export function riskVariant(risk: string) {
  if (
    [
      "unsafe_markup",
      "dangerous_external_link",
      "sexual_content",
      "hate",
    ].includes(risk)
  ) {
    return "error" as const;
  }
  if (
    ["violence", "gambling", "drugs_or_medicine", "macro_file"].includes(risk)
  ) {
    return "warning" as const;
  }
  return "info" as const;
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function splitCompositeId(compositeId: string): {
  countryCode: string;
  id: string;
} {
  const idx = compositeId.indexOf(":");
  if (idx > 0) {
    return {
      countryCode: compositeId.slice(0, idx),
      id: compositeId.slice(idx + 1),
    };
  }
  return { countryCode: "jo", id: compositeId };
}

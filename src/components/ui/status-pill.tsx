import type { RiskLevel } from "@/types/core";

const riskClasses: Record<RiskLevel, string> = {
  low: "border-teal-200 bg-teal-50 text-teal-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-800",
};

export function StatusPill({
  children,
  tone = "low",
}: {
  children: React.ReactNode;
  tone?: RiskLevel;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${riskClasses[tone]}`}
    >
      {children}
    </span>
  );
}

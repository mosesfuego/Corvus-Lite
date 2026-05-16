import { jobStages } from "@/lib/demo/shop-data";
import type { JobStage } from "@/types/core";
import { Check, Circle, TriangleAlert } from "lucide-react";

export function JobFlow({
  currentStage,
  hasIssue,
}: {
  currentStage: JobStage;
  hasIssue?: boolean;
}) {
  const currentIndex = jobStages.indexOf(currentStage);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex min-w-[980px] items-center gap-2">
        {jobStages.map((stage, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isBlocked = isCurrent && hasIssue;

          return (
            <div className="flex flex-1 items-center gap-2" key={stage}>
              <div
                className={`flex min-h-16 flex-1 flex-col justify-center rounded-lg border px-3 py-2 ${
                  isBlocked
                    ? "border-red-200 bg-red-50 text-red-800"
                    : isCurrent
                      ? "border-teal-300 bg-teal-50 text-teal-900"
                      : isComplete
                        ? "border-slate-200 bg-slate-100 text-slate-700"
                        : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                <div className="mb-1">
                  {isBlocked ? (
                    <TriangleAlert size={15} />
                  ) : isComplete ? (
                    <Check size={15} />
                  ) : (
                    <Circle size={15} />
                  )}
                </div>
                <span className="text-xs font-semibold leading-tight">{stage}</span>
              </div>
              {index < jobStages.length - 1 ? (
                <div className="h-px w-5 bg-slate-300" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

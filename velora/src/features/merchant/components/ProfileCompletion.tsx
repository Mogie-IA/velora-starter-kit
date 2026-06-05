"use client";

import { CheckCircle2 } from "lucide-react";
import type { ProfileCompletion } from "../completion";

export function ProfileCompletionMeter({
  completion,
}: {
  completion: ProfileCompletion;
}) {
  const { percent, filledCount, totalCount, missing, isComplete } = completion;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-label-md font-semibold text-[#1a1b21]">
          Profile completion
        </p>
        <span className="text-label-sm tabular-nums text-[#484556]">
          {filledCount}/{totalCount}
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-[#eeedf5] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: isComplete
              ? "#007d51"
              : "linear-gradient(135deg, #6d4aff 0%, #4f46e5 100%)",
          }}
        />
      </div>

      {isComplete ? (
        <div className="flex items-center gap-1.5 mt-2.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#007d51]" />
          <span className="text-label-sm text-[#007d51]">
            Your storefront profile is complete.
          </span>
        </div>
      ) : (
        <p className="text-label-sm text-[#797588] mt-2.5">
          Add {missing.slice(0, 3).join(", ").toLowerCase()}
          {missing.length > 3 ? ", and more" : ""} to polish your checkout.
        </p>
      )}
    </div>
  );
}

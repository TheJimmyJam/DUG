"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { claimJobAction } from "./actions";

export function ClaimJobButton({ jobId }: { jobId: string }) {
  const [pending, start] = useTransition();
  const { toast } = useToast();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="primary"
        className="w-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await claimJobAction(jobId);
            if (res.ok) {
              toast({
                kind: "success",
                title: "Job claimed",
                message: "Submit your analysis when you're ready.",
              });
            } else {
              toast({
                kind: "error",
                title: "Couldn't claim job",
                message: res.error,
              });
            }
          })
        }
      >
        {pending ? "Claiming…" : "Claim this job"}
      </Button>
      <p className="text-xs text-[var(--color-muted)]">
        Once claimed, you have 14 days to submit your analysis.
      </p>
    </div>
  );
}

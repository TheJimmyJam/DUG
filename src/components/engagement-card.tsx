import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SPECIALTIES_BY_SLUG } from "@/lib/specialties";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Clock, Briefcase, User } from "lucide-react";

export type JobCardData = {
  id: string;
  title: string;
  summary: string;
  primary_specialty: string;
  job_type: string;
  requester_type: string | null;
  difficulty: number;
  budget_cents: number | null;
  budget_type: "hourly" | "flat" | "volunteer";
  status: string;
  estimated_hours: number | null;
  created_at: string;
};

const JOB_TYPE_LABEL: Record<string, string> = {
  renewal_review:        "Renewal review",
  second_look:           "Second look",
  new_business_advisory: "New business advisory",
  audit:                 "Coverage audit",
  program_design:        "Program design",
  pre_broker_consult:    "Pre-broker consult",
  coverage_dispute:      "Coverage dispute",
  ai_benchmark:          "AI benchmarking",
  pricing_review:        "Pricing review",
  risk_assessment:       "Risk assessment",
  other:                 "Other",
};

const REQUESTER_LABEL: Record<string, string> = {
  carrier:            "Carrier",
  mga:                "MGA",
  reinsurer:          "Reinsurer",
  broker:             "Broker",
  agent:              "Agent",
  risk_manager:       "Risk manager",
  insured_commercial: "Commercial insured",
  insured_personal:   "Individual",
  tech_ai:            "Tech / AI",
  other:              "Other",
};

// Channel tags that are interesting to surface (non-carrier ones stand out)
const NOTABLE_REQUESTERS = new Set([
  "risk_manager", "insured_commercial", "insured_personal", "tech_ai", "reinsurer",
]);

export function JobCard({ job }: { job: JobCardData }) {
  const spec = SPECIALTIES_BY_SLUG[job.primary_specialty];
  const budgetLabel =
    job.budget_type === "volunteer"
      ? "Portfolio (no pay)"
      : job.budget_cents != null
        ? `${formatCurrency(job.budget_cents)} ${job.budget_type === "hourly" ? "/ hr" : "flat"}`
        : "Negotiable";

  const statusVariant =
    job.status === "open"    ? "success"
    : job.status === "claimed"  ? "warning"
    : job.status === "completed"? "primary"
    : "default";

  const requesterLabel = job.requester_type ? REQUESTER_LABEL[job.requester_type] : null;
  const isNotable = job.requester_type ? NOTABLE_REQUESTERS.has(job.requester_type) : false;

  return (
    <Link href={`/engagements/${job.id}`} className="block group">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
              <Badge variant="primary">{spec?.label ?? job.primary_specialty}</Badge>
              {requesterLabel && (
                <Badge variant={isNotable ? "accent" : "default"} className="inline-flex items-center gap-1">
                  <User className="h-2.5 w-2.5" />
                  {requesterLabel}
                </Badge>
              )}
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(job.created_at)}
              </span>
            </div>
            <Badge variant={statusVariant as never}>{job.status}</Badge>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-tight group-hover:text-[var(--color-primary)]">
            {job.title}
          </h3>
          <p className="mt-1.5 text-sm text-[var(--color-muted)] line-clamp-2">
            {job.summary}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-fg)]">{budgetLabel}</span>
            {job.estimated_hours != null && <span>~{job.estimated_hours}h</span>}
            <span>Complexity {job.difficulty}/5</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

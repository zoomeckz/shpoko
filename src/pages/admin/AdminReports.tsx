import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, ExternalLink, Flag, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listAccounts } from "@/lib/adminApi";
import { findLesson, type Exercise } from "@/data/course";
import { describeExercise } from "@/lib/exerciseSummary";
import { REPORT_REASONS } from "@/components/course/ReportProblem";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { cn } from "@/lib/utils";
import { AdminLayout } from "./AdminLayout";

interface Report {
  id: string;
  user_id: string;
  lesson_id: string;
  exercise_index: number;
  exercise: Exercise;
  reason: string;
  message: string | null;
  status: "open" | "resolved";
  created_at: string;
  resolved_at: string | null;
}

type Filter = "open" | "resolved" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

const reasonLabel = (id: string) => REPORT_REASONS.find((r) => r.id === id)?.label ?? id;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("content_reports").select("*").order("created_at", { ascending: false });
    if (error) {
      setError(
        /content_reports/.test(error.message)
          ? "Reports aren't set up yet. Run the latest SQL migration in Supabase first."
          : error.message
      );
    } else {
      setReports((data ?? []) as unknown as Report[]);
    }
    setLoading(false);
    // Names come from the admin function; the reports still show without them.
    listAccounts()
      .then((accounts) => setNames(Object.fromEntries(accounts.map((a) => [a.id, a.username]))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      open: reports.filter((r) => r.status === "open").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
      all: reports.length,
    }),
    [reports]
  );
  const shown = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const setStatus = async (report: Report, status: Report["status"]) => {
    const resolved_at = status === "resolved" ? new Date().toISOString() : null;
    const { error } = await supabase.from("content_reports").update({ status, resolved_at }).eq("id", report.id);
    if (error) return toast.error(error.message);
    setReports((list) => list.map((r) => (r.id === report.id ? { ...r, status, resolved_at } : r)));
    toast.success(status === "resolved" ? "Marked as resolved" : "Reopened");
  };

  const remove = async (report: Report) => {
    if (!window.confirm("Delete this report? This can't be undone.")) return;
    const { error } = await supabase.from("content_reports").delete().eq("id", report.id);
    if (error) return toast.error(error.message);
    setReports((list) => list.filter((r) => r.id !== report.id));
  };

  return (
    <AdminLayout
      title="Reports"
      description="Problems learners flagged inside lessons."
      actions={
        <DuoButton variant="white" size="md" onClick={load} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </DuoButton>
      }
    >
      <div role="tablist" aria-label="Report status" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition-colors",
              filter === f.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
            <span className="rounded-md bg-muted px-1.5 text-xs text-foreground">{loading ? "…" : counts[f.id]}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border-2 border-error/40 bg-error/10 px-4 py-3 font-bold text-error">{error}</div>
      )}

      {!error && !loading && shown.length === 0 && (
        <div className="mt-6 duo-card px-6 py-12 text-center">
          <Flag className="mx-auto w-10 h-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-extrabold text-foreground">
            {filter === "open" ? "No open reports" : "Nothing here"}
          </p>
          <p className="mt-1 font-semibold text-muted-foreground">
            Learners can flag a problem with the flag button at the top of any lesson.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {shown.map((report) => {
          const found = findLesson(report.lesson_id);
          const what = describeExercise(report.exercise);
          const open = expanded === report.id;
          return (
            <article key={report.id} className={cn("duo-card p-4 sm:p-5", report.status === "resolved" && "opacity-70")}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide",
                    report.status === "open" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                  )}
                >
                  {report.status}
                </span>
                <span className="text-sm font-extrabold text-foreground">{reasonLabel(report.reason)}</span>
                <span className="ml-auto text-sm font-semibold text-muted-foreground">
                  {names[report.user_id] ?? "Learner"} · {formatDate(report.created_at)}
                </span>
              </div>

              {report.message && (
                <p className="mt-3 rounded-xl bg-muted px-3 py-2 font-semibold text-foreground whitespace-pre-wrap break-words">
                  “{report.message}”
                </p>
              )}

              <p className="mt-3 text-sm font-bold text-muted-foreground">
                {found ? `Unit ${found.unit.unit} · ${found.lesson.title}` : report.lesson_id} · exercise {report.exercise_index + 1}
                {found?.lesson.exercises ? ` of ${found.lesson.exercises.length}` : ""}
              </p>
              <p className="mt-1 font-bold text-foreground break-words">
                <span className="text-primary">{what.kind}:</span> {what.text}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {report.status === "open" ? (
                  <DuoButton size="sm" variant="success" onClick={() => setStatus(report, "resolved")}>
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Resolve
                  </DuoButton>
                ) : (
                  <DuoButton size="sm" variant="white" onClick={() => setStatus(report, "open")}>
                    <RotateCcw className="w-4 h-4" />
                    Reopen
                  </DuoButton>
                )}
                {found && (
                  <DuoButton asChild size="sm" variant="white">
                    <Link to={`/course/${report.lesson_id}?preview=1`} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Open lesson
                    </Link>
                  </DuoButton>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : report.id)}
                  aria-expanded={open}
                  className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-extrabold text-muted-foreground hover:bg-muted"
                >
                  Details
                  <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(report)}
                  aria-label="Delete report"
                  className="ml-auto rounded-xl p-2 text-muted-foreground hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {open && (
                <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-muted p-3 text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                  {JSON.stringify(report.exercise, null, 2)}
                </pre>
              )}
            </article>
          );
        })}
      </div>
    </AdminLayout>
  );
}

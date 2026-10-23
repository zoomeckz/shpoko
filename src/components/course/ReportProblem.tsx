import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Exercise } from "@/data/course";
import type { Json } from "@/integrations/supabase/types";
import { DuoButton } from "@/components/duolingo/DuoButton";

export const REPORT_REASONS = [
  { id: "answer", label: "My answer should be accepted" },
  { id: "bulgarian", label: "The Bulgarian is wrong" },
  { id: "unclear", label: "Something is confusing" },
  { id: "typo", label: "There's a typo" },
  { id: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

/** Bottom sheet for flagging a problem with the exercise on screen. */
export function ReportProblemSheet({
  open,
  onClose,
  lessonId,
  exerciseIndex,
  exercise,
}: {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  exerciseIndex: number;
  exercise: Exercise;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Start fresh each time the sheet opens.
  useEffect(() => {
    if (open) {
      setReason(null);
      setMessage("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const send = async () => {
    if (!reason) return;
    setSending(true);
    const { error } = await supabase.from("content_reports").insert({
      lesson_id: lessonId,
      exercise_index: exerciseIndex,
      exercise: exercise as unknown as Json,
      reason,
      message: message.trim() || null,
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't send your report. Please try again.");
      return;
    }
    toast.success("Thanks! Your report was sent.");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-h-[90vh] overflow-y-auto bg-background border-t-2 border-border"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-[600px] mx-auto px-6 py-8">
              <h2 id="report-title" className="text-2xl font-extrabold text-foreground">
                Report a problem
              </h2>
              <p className="mt-1 font-semibold text-muted-foreground">What's wrong with this exercise?</p>

              <div className="mt-5 space-y-2" role="radiogroup" aria-label="Problem">
                {REPORT_REASONS.map((r) => {
                  const selected = reason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setReason(r.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        )}
                      >
                        {selected && <Check className="w-4 h-4" strokeWidth={4} />}
                      </span>
                      {r.label}
                    </button>
                  );
                })}
              </div>

              <label htmlFor="report-message" className="mt-5 block text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                Tell us more (optional)
              </label>
              <textarea
                id="report-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                rows={3}
                placeholder="For example: “This should also accept …”"
                className="mt-2 w-full rounded-2xl border-2 border-border bg-card px-4 py-3 font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <DuoButton variant="ghost" size="lg" onClick={onClose}>
                  Cancel
                </DuoButton>
                <DuoButton size="lg" disabled={!reason || sending} onClick={send}>
                  {sending ? "Sending…" : "Send report"}
                </DuoButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

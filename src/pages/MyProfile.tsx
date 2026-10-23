import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, CalendarPlus, Check, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { GOAL_OPTIONS, useDailyXp } from "@/hooks/useDailyXp";
import {
  ACHIEVEMENTS,
  currentStreak,
  levelFor,
  syncAchievements,
  type Achievement,
  type AchievementState,
} from "@/lib/achievements";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { DailyGoalCard } from "@/components/profile/DailyGoalCard";
import { Switch } from "@/components/ui/switch";
import shpokoMascot from "@/assets/shpoko-mascot.webp";
import { useI18n, useT, type TFunction } from "@/i18n";
import { achievementText } from "@/lib/achievementText";

const AVATAR_COLORS = ["bg-primary", "bg-accent-strong", "bg-warning", "bg-success", "bg-info"];
const DEFAULT_REMINDER = "19:00";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-extrabold text-foreground">{children}</h2>
);

function StatCard({ icon, value, label, dim = false }: { icon: string; value: string; label: string; dim?: boolean }) {
  return (
    <div className="duo-card flex items-center gap-3 px-4 py-3">
      <span className={cn("text-2xl", dim && "grayscale opacity-50")} aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xl font-extrabold text-foreground leading-tight">{value}</p>
        <p className="text-sm font-bold text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}

/** Bars for XP per day over the last week, with the daily goal as a line. */
function WeekChart({ days, goal }: { days: { day: string; xp: number }[]; goal: number }) {
  const { t, locale } = useI18n();
  const max = Math.max(goal, ...days.map((d) => d.xp), 1);
  const goalPct = (goal / max) * 100;
  return (
    <div className="duo-card p-5">
      <div className="relative h-40 flex items-end gap-2 sm:gap-3">
        <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-warning/60" style={{ bottom: `${goalPct}%` }}>
          <span className="absolute right-0 -top-6 text-xs font-extrabold text-warning">{t("profile.goalLine", { xp: goal })}</span>
        </div>
        {days.map((d, i) => {
          const pct = (d.xp / max) * 100;
          const met = d.xp >= goal;
          return (
            <div key={d.day} className="relative flex-1 h-full flex flex-col justify-end items-center">
              {d.xp > 0 && <span className="mb-1 text-xs font-extrabold text-muted-foreground">{d.xp}</span>}
              <motion.div
                className={cn("w-full max-w-[44px] rounded-t-lg", met ? "bg-warning" : "bg-primary", d.xp === 0 && "bg-muted")}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, d.xp > 0 ? 4 : 2)}%` }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 140, damping: 20 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {days.map((d, i) => (
          <span
            key={d.day}
            className={cn(
              "flex-1 text-center text-xs font-extrabold uppercase",
              i === days.length - 1 ? "text-primary" : "text-muted-foreground"
            )}
          >
            {i === days.length - 1
              ? t("profile.today")
              : new Date(`${d.day}T12:00:00`).toLocaleDateString(locale, { weekday: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}

function AchievementRow({ achievement, level, value }: { achievement: Achievement; level: number; value: number | null }) {
  const t = useT();
  const text = achievementText(t, achievement);
  const maxed = level >= achievement.tiers.length;
  const next = achievement.tiers[Math.min(level, achievement.tiers.length - 1)];
  const oneOff = achievement.tiers.length === 1;
  const progress = maxed ? 100 : value === null ? 0 : Math.min(100, (value / next) * 100);
  const colors = {
    orange: "bg-[#ff9600]",
    yellow: "bg-warning",
    blue: "bg-primary",
    green: "bg-success",
    pink: "bg-accent-strong",
    purple: "bg-[#a560e8]",
  }[achievement.color];

  return (
    <li className="flex items-center gap-4 px-4 py-4 sm:px-5">
      <div className="relative shrink-0">
        <span
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-[0_4px_0_0_rgba(0,0,0,0.25)]",
            level > 0 ? colors : "bg-muted grayscale opacity-60"
          )}
          aria-hidden="true"
        >
          {achievement.icon}
        </span>
        {!oneOff && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-background border-2 border-border px-1.5 text-[10px] font-extrabold uppercase text-foreground">
            {t("profile.level", { n: level })}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-extrabold text-foreground">{text.title}</p>
          {!maxed && !oneOff && value !== null && (
            <span className="text-sm font-extrabold text-muted-foreground tabular-nums">
              {Math.min(value, next)}/{next}
            </span>
          )}
        </div>
        <p className="font-semibold text-muted-foreground">
          {maxed ? (oneOff ? text.describe(next) : t("profile.allLevels", { desc: text.describe(next) })) : text.describe(next)}
        </p>
        {!oneOff && (
          <div className="mt-2 h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", maxed ? "bg-warning" : colors)}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        )}
        {oneOff && level > 0 && (
          <p className="mt-1 flex items-center gap-1 text-sm font-extrabold text-success">
            <Check className="w-4 h-4" strokeWidth={3} /> {t("profile.unlocked")}
          </p>
        )}
      </div>
    </li>
  );
}

/** A repeating calendar event, since the site can't send notifications itself. */
function downloadReminder(time: string, t: TFunction) {
  const [h, m] = time.split(":").map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);
  if (start.getTime() < Date.now()) start.setDate(start.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  // Floating local time, so the reminder stays at this hour wherever the learner is.
  const local = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(h)}${pad(m)}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const site = window.location.origin;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shpoko//Daily reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:shpoko-daily-reminder@${window.location.hostname}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local}`,
    "DURATION:PT10M",
    "RRULE:FREQ=DAILY",
    `SUMMARY:${t("ics.summary")}`,
    `DESCRIPTION:${t("ics.description")} ${site}`,
    `URL:${site}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${t("ics.alarm")}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "shpoko-reminder.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function GuestProfile() {
  const t = useT();
  return (
    <div className="duo-card mt-8 p-8 text-center">
      <img src={shpokoMascot} alt="" className="mx-auto w-28 h-28 object-contain" />
      <h1 className="mt-4 text-2xl font-extrabold text-foreground">{t("profile.guestTitle")}</h1>
      <p className="mt-2 font-semibold text-muted-foreground">
        {t("profile.guestBody")}
      </p>
      <div className="mt-6 flex flex-col gap-3 max-w-xs mx-auto">
        <DuoButton asChild size="lg" fullWidth>
          <Link to="/auth?mode=signup">{t("common.createProfile")}</Link>
        </DuoButton>
        <DuoButton asChild variant="white" size="lg" fullWidth>
          <Link to="/auth">{t("common.logIn")}</Link>
        </DuoButton>
      </div>
    </div>
  );
}

export default function MyProfile() {
  const { t, locale } = useI18n();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const { units } = useCourseAccess();
  const { byDay, today, goal } = useDailyXp(7);
  const [achievements, setAchievements] = useState<AchievementState | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER);

  useEffect(() => {
    if (!user) return;
    syncAchievements(user.id).then(setAchievements);
  }, [user, profile?.xp]);

  useEffect(() => {
    if (profile?.reminder_time) setReminderTime(profile.reminder_time.slice(0, 5));
  }, [profile?.reminder_time]);

  const lessonTotal = useMemo(() => units.filter((u) => !u.bonus).reduce((n, u) => n + u.lessons.length, 0), [units]);

  const saveProfile = async (changes: { daily_goal?: number; reminder_time?: string | null }) => {
    if (!user) return false;
    const { error } = await supabase.from("profiles").update(changes).eq("id", user.id);
    if (error) {
      toast.error(t("profile.saveFailed"));
      return false;
    }
    await refreshProfile();
    return true;
  };

  const chooseGoal = async (xp: number) => {
    if (await saveProfile({ daily_goal: xp })) {
      setEditingGoal(false);
      toast.success(t("profile.goalSet", { xp }));
    }
  };

  const remindersOn = !!profile?.reminder_time;
  const toggleReminders = (on: boolean) => saveProfile({ reminder_time: on ? `${reminderTime}:00` : null });
  const changeReminderTime = (time: string) => {
    setReminderTime(time);
    if (remindersOn && time) saveProfile({ reminder_time: `${time}:00` });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/25 border-t-primary animate-spin" />
      </div>
    );
  }

  const streak = profile ? currentStreak(profile.streak, profile.last_activity_date) : 0;
  const longest = Math.max(profile?.longest_streak ?? 0, profile?.streak ?? 0);
  const name = profile?.username ?? "Learner";
  const avatarColor = AVATAR_COLORS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale, { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-24 lg:pb-10">
          <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {!user || !profile ? (
              <GuestProfile />
            ) : (
              <div className="space-y-10">
                {/* Header */}
                <section className="flex flex-col sm:flex-row items-center sm:items-end gap-5 border-b-2 border-border pb-8 text-center sm:text-left">
                  <span
                    className={cn(
                      "w-28 h-28 shrink-0 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-[0_6px_0_0_rgba(0,0,0,0.25)]",
                      avatarColor
                    )}
                    aria-hidden="true"
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-3xl font-extrabold text-foreground break-words">{name}</h1>
                    {joined && <p className="mt-1 font-bold text-muted-foreground">{t("profile.joined", { date: joined })}</p>}
                    <p className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-border px-3 py-1 text-sm font-extrabold text-foreground">
                      {/* Drawn, because Windows shows flag emojis as plain letters */}
                      <span className="inline-flex w-5 h-3.5 flex-col overflow-hidden rounded-[3px]" aria-hidden="true">
                        <span className="flex-1 bg-white" />
                        <span className="flex-1 bg-[#00966e]" />
                        <span className="flex-1 bg-[#d62612]" />
                      </span>
                      {t("profile.learning")}
                    </p>
                  </div>
                </section>

                {/* Statistics */}
                <section>
                  <SectionTitle>{t("profile.stats")}</SectionTitle>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <StatCard icon="🔥" value={String(streak)} label={t("profile.streak")} dim={streak === 0} />
                    <StatCard icon="⚡" value={String(profile.xp)} label={t("profile.totalXp")} />
                    <StatCard
                      icon="📘"
                      value={achievements ? `${achievements.stats.lessons}/${lessonTotal}` : "…"}
                      label={t("profile.lessons")}
                    />
                    <StatCard icon="🏅" value={String(longest)} label={t("profile.longest")} dim={longest === 0} />
                  </div>
                </section>

                {/* Daily goal */}
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <SectionTitle>{t("goal.title")}</SectionTitle>
                    <button
                      type="button"
                      onClick={() => setEditingGoal((v) => !v)}
                      className="text-sm font-extrabold uppercase tracking-wide text-primary hover:brightness-110"
                      aria-expanded={editingGoal}
                    >
                      {editingGoal ? t("profile.done") : t("profile.change")}
                    </button>
                  </div>
                  <DailyGoalCard today={today} goal={goal} showTitle={false} className="mt-4" />
                  {editingGoal && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2"
                      role="radiogroup"
                      aria-label={t("goal.title")}
                    >
                      {GOAL_OPTIONS.map((o) => (
                        <button
                          key={o.xp}
                          type="button"
                          role="radio"
                          aria-checked={goal === o.xp}
                          onClick={() => chooseGoal(o.xp)}
                          className={cn(
                            "rounded-2xl border-2 px-3 py-3 text-center transition-colors",
                            goal === o.xp
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          )}
                        >
                          <span className="block font-extrabold">{t(o.label)}</span>
                          <span className="block text-sm font-bold text-muted-foreground">{t("goal.perDay", { xp: o.xp })}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </section>

                {/* This week */}
                <section>
                  <SectionTitle>{t("profile.thisWeek")}</SectionTitle>
                  <div className="mt-4">
                    <WeekChart days={byDay} goal={goal} />
                  </div>
                </section>

                {/* Reminders */}
                <section>
                  <SectionTitle>{t("profile.reminders")}</SectionTitle>
                  <div className="duo-card mt-4 p-5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-primary shrink-0" />
                        <div>
                          <p className="font-extrabold text-foreground">{t("profile.reminderTitle")}</p>
                          <p className="text-sm font-semibold text-muted-foreground">{t("profile.reminderSub")}</p>
                        </div>
                      </div>
                      <Switch checked={remindersOn} onCheckedChange={toggleReminders} aria-label={t("profile.reminderTitle")} />
                    </div>
                    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-3", !remindersOn && "opacity-50")}>
                      <label className="flex items-center gap-3 font-bold text-foreground">
                        {t("profile.remindAt")}
                        <input
                          type="time"
                          value={reminderTime}
                          disabled={!remindersOn}
                          onChange={(e) => changeReminderTime(e.target.value)}
                          className="rounded-xl border-2 border-border bg-card px-3 py-2 font-extrabold text-foreground focus:outline-none focus:border-primary"
                        />
                      </label>
                      <DuoButton
                        variant="white"
                        size="md"
                        disabled={!remindersOn}
                        onClick={() => downloadReminder(reminderTime, t)}
                        className="sm:ml-auto"
                      >
                        <CalendarPlus className="w-4 h-4" />
                        {t("profile.addCalendar")}
                      </DuoButton>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {t("profile.reminderNote")}
                    </p>
                  </div>
                </section>

                {/* Achievements */}
                <section>
                  <SectionTitle>{t("profile.achievements")}</SectionTitle>
                  <ul className="duo-card mt-4 divide-y-2 divide-border overflow-hidden">
                    {ACHIEVEMENTS.map((a) => (
                      <AchievementRow
                        key={a.id}
                        achievement={a}
                        level={achievements?.levels[a.id] ?? 0}
                        value={a.stat && achievements ? a.stat(achievements.stats) : null}
                      />
                    ))}
                  </ul>
                  {achievements && (
                    <p className="mt-3 text-center text-sm font-bold text-muted-foreground">
                      {t("profile.unlockedCount", {
                        n: ACHIEVEMENTS.filter((a) => (achievements.levels[a.id] ?? 0) > 0 || levelFor(a, achievements.stats) > 0).length,
                        total: ACHIEVEMENTS.length,
                      })}
                    </p>
                  )}
                </section>

                <div className="lg:hidden">
                  <DuoButton variant="ghost" size="lg" fullWidth className="text-error hover:bg-error/10" onClick={signOut}>
                    <LogOut className="w-5 h-5" />
                    {t("common.logOut")}
                  </DuoButton>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Edit, Eye, EyeOff, Flame, RefreshCw, Search, Trash2, User, UserPlus, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DuoButton } from "@/components/duolingo/DuoButton";
import { cn } from "@/lib/utils";
import { course } from "@/data/course";
import { callAdmin, listAccounts, type AccessInput, type AdminAccount } from "@/lib/adminApi";
import { AdminLayout } from "./AdminLayout";

const fieldClass =
  "w-full h-12 rounded-2xl border-2 border-border bg-muted px-4 font-semibold text-foreground outline-none focus:border-primary focus:bg-card transition-colors";

// The admin panel is in English, so dates are too.
const LOCALE = "en-GB";

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(LOCALE, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** "in 3 days", "2 hours ago"… */
const relative = (iso: string) => {
  const diff = Date.parse(iso) - Date.now();
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 3600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3600_000), "hour");
  return rtf.format(Math.round(diff / 86_400_000), "day");
};

const isExpired = (a: AdminAccount) => !!a.access?.expires_at && Date.parse(a.access.expires_at) <= Date.now();

const unitLabel = (id: string) => {
  const u = course.find((x) => x.id === id);
  return u ? `Unit ${u.unit}` : id;
};

function Badge({ children, tone }: { children: React.ReactNode; tone: "gold" | "blue" | "pink" | "red" | "grey" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap",
        tone === "gold" && "bg-warning/15 text-warning",
        tone === "blue" && "bg-primary/15 text-primary",
        tone === "pink" && "bg-accent-strong/15 text-accent-strong",
        tone === "red" && "bg-error/15 text-error",
        tone === "grey" && "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Create / edit dialog ---------- */

type ExpiryChoice = "keep" | "never" | "1h" | "1d" | "7d" | "30d" | "custom";
const EXPIRY_OPTIONS: { value: ExpiryChoice; label: string; ms?: number }[] = [
  { value: "never", label: "Never" },
  { value: "1h", label: "1 hour", ms: 3600_000 },
  { value: "1d", label: "1 day", ms: 86_400_000 },
  { value: "7d", label: "7 days", ms: 7 * 86_400_000 },
  { value: "30d", label: "30 days", ms: 30 * 86_400_000 },
  { value: "custom", label: "Pick a date" },
];

const randomPassword = () => {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

/** "YYYY-MM-DDTHH:mm" in local time, for <input type="datetime-local">. */
const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function AccountDialog({
  account,
  open,
  onClose,
  onSaved,
}: {
  /** null = create a new account */
  account: AdminAccount | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const creating = !account;
  const isOwner = !!account?.is_owner;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [allUnits, setAllUnits] = useState(true);
  const [units, setUnits] = useState<string[]>([]);
  const [unlockAll, setUnlockAll] = useState(false);
  const [expiry, setExpiry] = useState<ExpiryChoice>("never");
  const [customExpiry, setCustomExpiry] = useState("");
  const [note, setNote] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ login: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Fill the form whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    const a = account?.access;
    setUsername(account?.username ?? "");
    setPassword(creating ? randomPassword() : "");
    setShowPassword(true);
    setAllUnits(!a?.units?.length);
    setUnits(a?.units ?? course.map((u) => u.id));
    setUnlockAll(a?.unlock_all ?? false);
    setExpiry(creating ? "7d" : "keep");
    setCustomExpiry(toLocalInput(new Date(Date.now() + 7 * 86_400_000)));
    setNote(a?.note ?? "");
    setDisabled(a?.disabled ?? false);
    setXp(account?.xp ?? 0);
    setLevel(account?.level ?? 1);
    setStreak(account?.streak ?? 0);
    setCreated(null);
    setCopied(false);
  }, [open, account, creating]);

  const expiresAt = (): string | null | undefined => {
    if (expiry === "keep") return undefined;
    if (expiry === "never") return null;
    if (expiry === "custom") return customExpiry ? new Date(customExpiry).toISOString() : null;
    const ms = EXPIRY_OPTIONS.find((o) => o.value === expiry)?.ms ?? 0;
    return new Date(Date.now() + ms).toISOString();
  };

  const toggleUnit = (id: string) => setUnits((u) => (u.includes(id) ? u.filter((x) => x !== id) : [...u, id]));

  const save = async () => {
    if (!allUnits && units.length === 0) {
      toast.error("Pick at least one unit, or choose all units.");
      return;
    }
    const access: AccessInput = {
      expiresAt: expiresAt(),
      units: allUnits ? null : units,
      unlockAll,
      note,
      disabled,
    };
    setSaving(true);
    try {
      if (creating) {
        const res = await callAdmin<{ ok: true; login: string }>("create", { username, password, access });
        toast.success("Account created");
        setCreated({ login: res.login, password });
        onSaved();
      } else {
        const changes: Record<string, unknown> = {};
        if (username.trim() !== account.username) changes.username = username;
        if (xp !== account.xp) changes.xp = xp;
        if (level !== account.level) changes.level = level;
        if (streak !== account.streak) changes.streak = streak;
        if (password) changes.password = password;
        if (!isOwner) changes.access = access;
        await callAdmin("update", { userId: account.id, ...changes });
        toast.success("Account saved");
        onSaved();
        onClose();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const copyLogin = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(`Username: ${created.login}\nPassword: ${created.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-2xl border-2 max-h-[90vh] overflow-y-auto">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">Account ready 🎉</DialogTitle>
              <DialogDescription className="font-semibold">
                Share these details. They log in on the normal login page with their username.
              </DialogDescription>
            </DialogHeader>
            <div className="duo-card p-4 font-mono text-lg text-foreground space-y-1">
              <p>Username: <strong>{created.login}</strong></p>
              <p>Password: <strong>{created.password}</strong></p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              The password isn't shown again. You can always set a new one by editing the account.
            </p>
            <DialogFooter className="gap-2">
              <DuoButton variant="white" onClick={copyLogin}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </DuoButton>
              <DuoButton onClick={onClose}>Done</DuoButton>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">{creating ? "Create account" : `Edit ${account.username}`}</DialogTitle>
              <DialogDescription className="font-semibold">
                {creating
                  ? "A username and password, no email needed. You can change everything later."
                  : account.login
                    ? `Logs in with the username “${account.login}”.`
                    : account.email ?? ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-1">
              {/* Login */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="acc-username" className="font-bold">Username</Label>
                  <input
                    id="acc-username"
                    className={fieldClass}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Tester 1"
                    autoComplete="off"
                  />
                  <p className="text-xs font-semibold text-muted-foreground">3–20 letters, numbers or spaces.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acc-password" className="font-bold">{creating ? "Password" : "New password"}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        id="acc-password"
                        type={showPassword ? "text" : "password"}
                        className={cn(fieldClass, "pr-12")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={creating ? "At least 6 characters" : "Leave empty to keep the current one"}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <DuoButton type="button" variant="white" size="lg" className="px-4" onClick={() => setPassword(randomPassword())} aria-label="Generate a password">
                      <Wand2 className="w-4 h-4" />
                    </DuoButton>
                  </div>
                </div>
              </div>

              {/* Access */}
              {isOwner ? (
                <p className="rounded-2xl bg-warning/10 px-4 py-3 text-sm font-bold text-warning">
                  This is the owner account. It always has full access.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="font-extrabold text-foreground">What can they access?</p>
                    <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-border px-4 py-3 cursor-pointer">
                      <span className="font-bold text-foreground">All units (including new ones)</span>
                      <Switch checked={allUnits} onCheckedChange={setAllUnits} />
                    </label>
                    {!allUnits && (
                      <div className="space-y-2 pl-1">
                        {course.map((u) => (
                          <label key={u.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 accent-[hsl(var(--primary))]"
                              checked={units.includes(u.id)}
                              onChange={() => toggleUnit(u.id)}
                            />
                            <span className="font-semibold text-foreground">
                              Unit {u.unit} · {u.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-border px-4 py-3 cursor-pointer">
                      <span>
                        <span className="block font-bold text-foreground">Unlock every lesson</span>
                        <span className="block text-xs font-semibold text-muted-foreground">Skip the normal order. Progress still saves.</span>
                      </span>
                      <Switch checked={unlockAll} onCheckedChange={setUnlockAll} />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="font-extrabold text-foreground">How long does it last?</p>
                    {!creating && (
                      <p className="text-sm font-semibold text-muted-foreground">
                        Now:{" "}
                        {account.access?.expires_at
                          ? `${isExpired(account) ? "expired" : "expires"} ${formatDateTime(account.access.expires_at)} (${relative(account.access.expires_at)})`
                          : "never expires"}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(creating ? EXPIRY_OPTIONS : [{ value: "keep" as const, label: "Keep as is" }, ...EXPIRY_OPTIONS]).map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setExpiry(o.value)}
                          className={cn(
                            "rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition-colors",
                            expiry === o.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    {expiry === "custom" && (
                      <input
                        type="datetime-local"
                        className={fieldClass}
                        value={customExpiry}
                        onChange={(e) => setCustomExpiry(e.target.value)}
                        aria-label="Expiry date and time"
                      />
                    )}
                    {expiry !== "keep" && expiry !== "never" && (
                      <p className="text-xs font-semibold text-muted-foreground">
                        When the time runs out they're logged out and can't log back in.
                      </p>
                    )}
                  </div>

                  {!creating && (
                    <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-border px-4 py-3 cursor-pointer">
                      <span>
                        <span className="block font-bold text-foreground">Disabled</span>
                        <span className="block text-xs font-semibold text-muted-foreground">Blocks the login right away.</span>
                      </span>
                      <Switch checked={disabled} onCheckedChange={setDisabled} />
                    </label>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="acc-note" className="font-bold">Note (only you see this)</Label>
                    <input
                      id="acc-note"
                      className={fieldClass}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. For Anna's class"
                    />
                  </div>
                </>
              )}

              {!creating && (
                <div className="space-y-1.5">
                  <p className="font-extrabold text-foreground">Progress</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      ["XP", xp, setXp, 0],
                      ["Level", level, setLevel, 1],
                      ["Streak", streak, setStreak, 0],
                    ] as const).map(([label, value, set, min]) => (
                      <div key={label} className="space-y-1">
                        <Label className="text-xs font-bold text-muted-foreground">{label}</Label>
                        <input
                          type="number"
                          min={min}
                          className={fieldClass}
                          value={value}
                          onChange={(e) => set(Math.max(min, parseInt(e.target.value) || min))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <DuoButton variant="white" onClick={onClose} disabled={saving}>
                Cancel
              </DuoButton>
              <DuoButton onClick={save} disabled={saving}>
                {saving ? "Saving…" : creating ? "Create account" : "Save"}
              </DuoButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Filters and sorting ---------- */

type FilterId = "all" | "email" | "username" | "temporary" | "expired" | "disabled" | "admins";
const FILTERS: { id: FilterId; label: string; test: (u: AdminAccount) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "email", label: "Email accounts", test: (u) => !u.login },
  { id: "username", label: "Username accounts", test: (u) => !!u.login },
  { id: "temporary", label: "Temporary", test: (u) => !!u.access?.expires_at && !isExpired(u) },
  { id: "expired", label: "Expired", test: (u) => isExpired(u) },
  { id: "disabled", label: "Disabled", test: (u) => !!u.access?.disabled },
  { id: "admins", label: "Admins", test: (u) => u.is_admin },
];

type SortId = "newest" | "oldest" | "name" | "xp" | "active" | "expiry";
const time = (v: string | null | undefined) => (v ? Date.parse(v) : 0);
const SORTS: { id: SortId; label: string; compare: (a: AdminAccount, b: AdminAccount) => number }[] = [
  { id: "newest", label: "Newest", compare: (a, b) => time(b.created_at) - time(a.created_at) },
  { id: "oldest", label: "Oldest", compare: (a, b) => time(a.created_at) - time(b.created_at) },
  { id: "name", label: "Name A–Z", compare: (a, b) => a.username.localeCompare(b.username) },
  { id: "xp", label: "Most XP", compare: (a, b) => b.xp - a.xp },
  {
    id: "active",
    label: "Recently active",
    compare: (a, b) => time(b.last_activity_date ?? b.last_sign_in_at) - time(a.last_activity_date ?? a.last_sign_in_at),
  },
  {
    id: "expiry",
    label: "Expires soonest",
    // Accounts without an end date go last.
    compare: (a, b) => (time(a.access?.expires_at) || Infinity) - (time(b.access?.expires_at) || Infinity),
  },
];

/* ---------- Page ---------- */

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("newest");
  const [dialog, setDialog] = useState<{ open: boolean; account: AdminAccount | null }>({ open: false, account: null });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await listAccounts();
      setUsers(rows);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const query = searchQuery.trim().toLowerCase();
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.id, users.filter(f.test).length])) as Record<FilterId, number>,
    [users]
  );
  const filteredUsers = useMemo(() => {
    const test = FILTERS.find((f) => f.id === filter)!.test;
    const compare = SORTS.find((s) => s.id === sort)!.compare;
    return users
      .filter(test)
      .filter(
        (u) =>
          !query ||
          u.username.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.login?.toLowerCase().includes(query) ||
          u.access?.note?.toLowerCase().includes(query)
      )
      .sort(compare);
  }, [users, query, filter, sort]);

  const handleDelete = async (user: AdminAccount) => {
    if (!confirm(`Delete ${user.username}? Their login and all their progress are removed for good.`)) return;
    try {
      await callAdmin("delete", { userId: user.id });
      toast.success("Account deleted");
      fetchUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete the account");
    }
  };

  const temporary = users.filter((u) => u.access?.expires_at && !isExpired(u)).length;

  return (
    <AdminLayout
      title="Users"
      description={
        loading ? "Loading…" : `${users.length.toLocaleString()} accounts · ${temporary} temporary`
      }
      actions={
        <>
          <DuoButton variant="white" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </DuoButton>
          <DuoButton size="sm" onClick={() => setDialog({ open: true, account: null })}>
            <UserPlus className="w-4 h-4" />
            Create account
          </DuoButton>
        </>
      }
    >
      {/* Account-type tabs */}
      <div role="tablist" aria-label="Account type" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-sm font-extrabold transition-colors",
              filter === f.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-md px-1.5 text-xs",
                filter === f.id ? "bg-primary/20" : "bg-muted text-muted-foreground"
              )}
            >
              {loading ? "…" : counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Search and sort */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            placeholder="Search by username, email or note"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(fieldClass, "pl-12")}
            aria-label="Search users"
          />
        </div>
        <label className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-muted-foreground whitespace-nowrap">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className={cn(fieldClass, "w-auto pr-8 cursor-pointer")}
            aria-label="Sort accounts"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!loading && (filter !== "all" || query) && (
        <p className="mt-3 text-sm font-bold text-muted-foreground">
          Showing {filteredUsers.length} of {users.length}
          {(filter !== "all" || query) && (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="ml-2 font-extrabold text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {loadError && (
        <div className="mt-6 rounded-2xl border-2 border-error/40 bg-error/10 px-5 py-4 font-bold text-error">{loadError}</div>
      )}

      <div className="duo-card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-border text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Access</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3 text-right">XP</th>
                <th className="px-5 py-3">Last active</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-bold text-muted-foreground">Loading accounts…</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-bold text-muted-foreground">No accounts found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const a = user.access;
                  const expired = isExpired(user);
                  return (
                    <tr key={user.id} className={cn("hover:bg-muted/60 transition-colors", (user.banned || expired) && "opacity-60")}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center overflow-hidden">
                            {user.profile_picture ? (
                              <img src={user.profile_picture} alt="" className="w-10 h-10 object-cover" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-foreground truncate">{user.username}</span>
                              {user.is_owner ? <Badge tone="gold">Owner</Badge> : user.is_admin && <Badge tone="gold">Admin</Badge>}
                              {user.login && <Badge tone="blue">Username login</Badge>}
                              {a?.disabled && <Badge tone="red">Disabled</Badge>}
                              {expired && <Badge tone="red">Expired</Badge>}
                            </span>
                            <span className="block text-sm font-semibold text-muted-foreground truncate">
                              {user.login ? `Logs in as “${user.login}”` : user.email ?? "No email"}
                              {a?.note && ` · ${a.note}`}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {user.is_owner ? (
                            <Badge tone="grey">Everything</Badge>
                          ) : (
                            <>
                              <Badge tone="grey">{a?.units?.length ? a.units.map(unitLabel).join(", ") : "All units"}</Badge>
                              {a?.unlock_all && <Badge tone="pink">All lessons open</Badge>}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold whitespace-nowrap">
                        {a?.expires_at ? (
                          <span className={expired ? "text-error" : "text-warning"} title={formatDateTime(a.expires_at)}>
                            {expired ? `Expired ${relative(a.expires_at)}` : relative(a.expires_at)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-extrabold text-warning">
                        {user.xp.toLocaleString()}
                        {user.streak > 0 && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-sm text-foreground">
                            {user.streak}
                            <Flame className="w-3.5 h-3.5 text-warning" />
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-muted-foreground whitespace-nowrap">
                        {formatDate(user.last_activity_date ?? user.last_sign_in_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDialog({ open: true, account: user })}
                            aria-label={`Edit ${user.username}`}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {!user.is_owner && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              aria-label={`Delete ${user.username}`}
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-error/10 hover:text-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AccountDialog
        open={dialog.open}
        account={dialog.account}
        onClose={() => setDialog({ open: false, account: null })}
        onSaved={fetchUsers}
      />
    </AdminLayout>
  );
}

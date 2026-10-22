// Admin-only account management: list, create, update and delete accounts.
// Runs with the service role key, so every request is checked to come from
// the site owner or a user with the "admin" role before anything happens.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, type User } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const OWNER_EMAIL = "sam.nowroozi@gmail.com";
// Username-only accounts log in with "<login>@shpoko.invalid". The .invalid
// top-level domain is reserved and never receives email, so these addresses
// can't be used to reset passwords or take over accounts.
const LOGIN_DOMAIN = "shpoko.invalid";
// Bans last "forever" (100 years); "none" lifts them.
const FOREVER = "876000h";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const USERNAME_RE = /^[a-zA-Z0-9 ]{3,20}$/;
const loginFor = (username: string) => username.trim().toLowerCase().replace(/\s+/g, "-");
const emailFor = (username: string) => `${loginFor(username)}@${LOGIN_DOMAIN}`;
const isManagedEmail = (email?: string | null) => !!email && email.endsWith(`@${LOGIN_DOMAIN}`);

interface AccessInput {
  expiresAt?: string | null;
  units?: string[] | null;
  unlockAll?: boolean;
  disabled?: boolean;
  note?: string | null;
}

const validUsername = (u: unknown): string => {
  const name = String(u ?? "").trim().replace(/\s{2,}/g, " ");
  if (!USERNAME_RE.test(name)) {
    throw new HttpError(400, "Usernames need 3–20 characters: letters, numbers and spaces only.");
  }
  return name;
};

const validPassword = (p: unknown): string => {
  const pw = String(p ?? "");
  if (pw.length < 6) throw new HttpError(400, "Passwords need at least 6 characters.");
  if (pw.length > 72) throw new HttpError(400, "Passwords can be at most 72 characters.");
  return pw;
};

const validExpiry = (v: unknown): string | null => {
  if (v === null || v === undefined || v === "") return null;
  const t = Date.parse(String(v));
  if (Number.isNaN(t)) throw new HttpError(400, "That expiry date isn't valid.");
  return new Date(t).toISOString();
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // --- Who is calling? ---
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: callerData } = await admin.auth.getUser(token);
    const caller = callerData?.user;
    if (!caller) throw new HttpError(401, "Please log in again.");

    const callerIsOwner = caller.email?.toLowerCase() === OWNER_EMAIL;
    let callerIsAdmin = callerIsOwner;
    if (!callerIsAdmin) {
      const { data } = await admin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();
      callerIsAdmin = !!data;
    }
    if (!callerIsAdmin) throw new HttpError(403, "Admins only.");

    const body = await req.json().catch(() => ({}));

    // Keeps the login blocked while an account is disabled or expired, and open otherwise.
    const syncBan = async (userId: string, access: { disabled?: boolean; expires_at?: string | null }) => {
      const expired = !!access.expires_at && Date.parse(access.expires_at) < Date.now();
      const { error } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: access.disabled || expired ? FOREVER : "none",
      });
      if (error) throw new HttpError(400, error.message);
    };

    const protectOwner = async (userId: string) => {
      if (userId === caller.id) throw new HttpError(400, "You can't do that to your own account here.");
      const { data } = await admin.auth.admin.getUserById(userId);
      if (data?.user?.email?.toLowerCase() === OWNER_EMAIL) throw new HttpError(400, "The owner account can't be changed here.");
    };

    switch (body.action) {
      // ---------- List every account with its access rules ----------
      case "list": {
        const users: User[] = [];
        for (let page = 1; ; page++) {
          const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
          if (error) throw new HttpError(500, error.message);
          users.push(...data.users);
          if (data.users.length < 1000) break;
        }
        const [{ data: profiles }, { data: access }, { data: roles }] = await Promise.all([
          admin.from("profiles").select("id, username, xp, level, streak, created_at, last_activity_date, profile_picture"),
          admin.from("account_access").select("*"),
          admin.from("user_roles").select("user_id").eq("role", "admin"),
        ]);
        const adminIds = new Set((roles ?? []).map((r) => r.user_id));
        const now = Date.now();

        const rows = [];
        for (const u of users) {
          const p = profiles?.find((x) => x.id === u.id);
          const a = access?.find((x) => x.user_id === u.id) ?? null;
          const expired = !!a?.expires_at && Date.parse(a.expires_at) < now;
          let banned = !!u.banned_until && Date.parse(u.banned_until) > now;
          // Accounts whose timer ran out get blocked the next time anyone lists them.
          if (expired && !banned) {
            await syncBan(u.id, a);
            banned = true;
          }
          rows.push({
            id: u.id,
            username: p?.username ?? u.user_metadata?.username ?? "(no profile)",
            email: isManagedEmail(u.email) ? null : u.email ?? null,
            login: isManagedEmail(u.email) ? u.email!.split("@")[0] : null,
            xp: p?.xp ?? 0,
            level: p?.level ?? 1,
            streak: p?.streak ?? 0,
            created_at: p?.created_at ?? u.created_at,
            last_activity_date: p?.last_activity_date ?? null,
            last_sign_in_at: u.last_sign_in_at ?? null,
            profile_picture: p?.profile_picture ?? null,
            banned,
            is_admin: adminIds.has(u.id) || u.email?.toLowerCase() === OWNER_EMAIL,
            is_owner: u.email?.toLowerCase() === OWNER_EMAIL,
            access: a,
          });
        }
        return json({ users: rows });
      }

      // ---------- Create a username + password account ----------
      case "create": {
        const username = validUsername(body.username);
        const password = validPassword(body.password);
        const input: AccessInput = body.access ?? {};
        const expiresAt = validExpiry(input.expiresAt);

        const { data: clash } = await admin.from("profiles").select("id").ilike("username", username).maybeSingle();
        if (clash) throw new HttpError(409, "That username is already taken.");

        const { data: created, error } = await admin.auth.admin.createUser({
          email: emailFor(username),
          password,
          email_confirm: true,
          user_metadata: { username, managed: true },
        });
        if (error || !created.user) {
          const taken = /already|exists|registered/i.test(error?.message ?? "");
          throw new HttpError(taken ? 409 : 400, taken ? "That username is already taken." : error?.message ?? "Couldn't create the account.");
        }

        const row = {
          user_id: created.user.id,
          managed: true,
          expires_at: expiresAt,
          units: input.units && input.units.length ? input.units : null,
          unlock_all: !!input.unlockAll,
          disabled: !!input.disabled,
          note: input.note?.trim() || null,
        };
        const { error: accessError } = await admin.from("account_access").upsert(row);
        if (accessError) {
          // Don't leave a half-made account behind.
          await admin.auth.admin.deleteUser(created.user.id);
          throw new HttpError(500, accessError.message);
        }
        if (row.disabled || (expiresAt && Date.parse(expiresAt) < Date.now())) await syncBan(created.user.id, row);
        return json({ ok: true, id: created.user.id, login: loginFor(username) });
      }

      // ---------- Edit an account ----------
      case "update": {
        const userId = String(body.userId ?? "");
        if (!userId) throw new HttpError(400, "Missing account.");
        const { data: target } = await admin.auth.admin.getUserById(userId);
        if (!target?.user) throw new HttpError(404, "That account doesn't exist anymore.");
        const isOwnerTarget = target.user.email?.toLowerCase() === OWNER_EMAIL;

        // Profile numbers and username
        const profile: Record<string, unknown> = {};
        if (body.username !== undefined) profile.username = validUsername(body.username);
        for (const key of ["xp", "level", "streak"] as const) {
          if (body[key] !== undefined) {
            const n = Math.max(key === "level" ? 1 : 0, Math.floor(Number(body[key]) || 0));
            profile[key] = n;
          }
        }
        if (Object.keys(profile).length) {
          if (profile.username) {
            const { data: clash } = await admin.from("profiles").select("id").ilike("username", String(profile.username)).neq("id", userId).maybeSingle();
            if (clash) throw new HttpError(409, "That username is already taken.");
          }
          const { error } = await admin.from("profiles").update(profile).eq("id", userId);
          if (error) throw new HttpError(400, error.message);
        }

        // Username accounts log in with their username, so keep the login in step.
        if (profile.username && isManagedEmail(target.user.email)) {
          const { error } = await admin.auth.admin.updateUserById(userId, { email: emailFor(String(profile.username)), email_confirm: true });
          if (error) throw new HttpError(400, error.message);
        }

        if (body.password) {
          const { error } = await admin.auth.admin.updateUserById(userId, { password: validPassword(body.password) });
          if (error) throw new HttpError(400, error.message);
        }

        if (body.access !== undefined) {
          if (isOwnerTarget) throw new HttpError(400, "The owner account always has full access.");
          if (userId === caller.id && body.access?.disabled) throw new HttpError(400, "You can't disable your own account.");
          const input: AccessInput = body.access ?? {};
          const { data: existing } = await admin.from("account_access").select("*").eq("user_id", userId).maybeSingle();
          const row = {
            user_id: userId,
            managed: existing?.managed ?? isManagedEmail(target.user.email),
            expires_at: input.expiresAt !== undefined ? validExpiry(input.expiresAt) : existing?.expires_at ?? null,
            units: input.units !== undefined ? (input.units && input.units.length ? input.units : null) : existing?.units ?? null,
            unlock_all: input.unlockAll !== undefined ? !!input.unlockAll : existing?.unlock_all ?? false,
            disabled: input.disabled !== undefined ? !!input.disabled : existing?.disabled ?? false,
            note: input.note !== undefined ? input.note?.trim() || null : existing?.note ?? null,
          };
          const { error } = await admin.from("account_access").upsert(row);
          if (error) throw new HttpError(400, error.message);
          await syncBan(userId, row);
        }
        return json({ ok: true });
      }

      // ---------- Delete an account completely ----------
      case "delete": {
        const userId = String(body.userId ?? "");
        if (!userId) throw new HttpError(400, "Missing account.");
        await protectOwner(userId);
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) throw new HttpError(400, error.message);
        return json({ ok: true });
      }

      default:
        throw new HttpError(400, "Unknown action.");
    }
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    const message = e instanceof Error ? e.message : String(e);
    console.error("[admin-accounts]", status, message);
    return json({ error: message }, status);
  }
});

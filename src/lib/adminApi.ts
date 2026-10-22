import { supabase } from "@/integrations/supabase/client";

export interface AccessRules {
  expires_at: string | null;
  units: string[] | null;
  unlock_all: boolean;
  disabled: boolean;
  managed: boolean;
  note: string | null;
}

export interface AdminAccount {
  id: string;
  username: string;
  /** Real email, or null for username-only accounts. */
  email: string | null;
  /** What a username-only account types to log in. */
  login: string | null;
  xp: number;
  level: number;
  streak: number;
  created_at: string;
  last_activity_date: string | null;
  last_sign_in_at: string | null;
  profile_picture: string | null;
  banned: boolean;
  is_admin: boolean;
  is_owner: boolean;
  access: AccessRules | null;
}

export interface AccessInput {
  expiresAt?: string | null;
  units?: string[] | null;
  unlockAll?: boolean;
  disabled?: boolean;
  note?: string | null;
}

/** Calls the admin-accounts edge function and returns its JSON, or throws a readable error. */
export async function callAdmin<T = { ok: true }>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-accounts", { body: { action, ...payload } });
  if (error) {
    // The function answers errors as { error: "..." }; dig the message out if we can.
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      try {
        const body = await context.json();
        if (body?.error) message = body.error;
      } catch {
        // keep the generic message
      }
    }
    if (/Failed to send a request|not found|404/i.test(message)) {
      message = "The admin service isn't set up yet. The admin-accounts function needs to be deployed.";
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const listAccounts = () => callAdmin<{ users: AdminAccount[] }>("list").then((r) => r.users);

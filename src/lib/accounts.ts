/**
 * Username-only accounts (created by an admin) log in with an internal address
 * "<login>@shpoko.invalid". The .invalid domain is reserved and never receives
 * email. Keep in sync with supabase/functions/admin-accounts.
 */
export const LOGIN_DOMAIN = "shpoko.invalid";

export const loginFor = (username: string) => username.trim().toLowerCase().replace(/\s+/g, "-");

/** Turns what someone typed in the login box into the address Supabase expects. */
export const loginEmailFor = (identifier: string) => {
  const value = identifier.trim();
  return value.includes("@") ? value : `${loginFor(value)}@${LOGIN_DOMAIN}`;
};

export const isUsernameAccountEmail = (email?: string | null) => !!email && email.endsWith(`@${LOGIN_DOMAIN}`);

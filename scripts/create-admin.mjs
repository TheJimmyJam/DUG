#!/usr/bin/env node
/**
 * Create or update an admin user.
 *
 * Usage:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD='...' ADMIN_HANDLE=foo \
 *     ADMIN_DISPLAY_NAME='Foo Bar' \
 *     NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/create-admin.mjs
 *
 * Idempotent — re-running updates the existing user's password and admin flag.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const handle = process.env.ADMIN_HANDLE;
const displayName = process.env.ADMIN_DISPLAY_NAME ?? handle;

if (!url || !serviceKey || !email || !password || !handle) {
  console.error(
    "ERROR: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_HANDLE required",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Look up existing user
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
  let userId;
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) {
    userId = existing.id;
    // Reset password + ensure email confirmed
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { handle, display_name: displayName },
    });
    if (error) throw new Error(`update ${email}: ${error.message}`);
    console.log(`Updated existing user ${email} (${userId})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { handle, display_name: displayName },
    });
    if (error) throw new Error(`create ${email}: ${error.message}`);
    userId = data.user.id;
    console.log(`Created user ${email} (${userId})`);
  }

  // The handle the trigger picked might collide with a desired handle —
  // force the desired handle, display name, role, admin flag.
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      handle,
      display_name: displayName,
      role: "both",
      is_admin: true,
      is_verified: true,
    })
    .eq("id", userId);
  if (profileErr) throw new Error(`profile ${email}: ${profileErr.message}`);
  console.log(`  · profile set: handle=${handle}, role=both, is_admin=true`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

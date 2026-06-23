import { createClient } from "@/lib/supabase/server";

export async function getCarrierUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("carrier_users")
    .select("carrier_id, email, id")
    .eq("auth_id", userId)
    .single();
  return data;
}

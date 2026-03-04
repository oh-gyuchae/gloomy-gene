import { getSupabaseClient } from "@/lib/supabase";
import { AppData } from "@/lib/types";

export async function ensureRemoteUserId(options?: { allowAnonymous?: boolean }) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    return session.user.id;
  }

  if (!options?.allowAnonymous) {
    return null;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user?.id) {
    return null;
  }

  return data.user.id;
}

export async function loadRemoteAppData(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("app_snapshots")
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.payload) {
    return null;
  }

  return data.payload as AppData;
}

export async function saveRemoteAppData(userId: string, payload: AppData) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) {
    return;
  }

  const { error } = await supabase.from("app_snapshots").upsert(
    {
      user_id: userId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return;
  }
}

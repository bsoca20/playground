import { createClient } from "@/lib/supabase/client";
import type { YearSelections } from "@/lib/types";

export type SessionPayload = {
  teamName?: string;
  selections?: YearSelections;
  confirmedYears?: number[];
  currentYearIndex?: number;
  unlockedYearIndex?: number;
  boardroomNotes?: string;
  boardroomMessages?: unknown[];
  facilitatorMessages?: unknown[];
  facilitatorEvents?: string[];
  launchClosed?: boolean;
  decision2019Pop?: "accept" | "reject" | null;
  decision2019Price?: "accept_200" | "propose" | "no_launch" | null;
  decision2019ProposedPrice?: string;
  caseLost?: boolean;
  updatedAt?: string;
};

export async function getSessionState(sessionCode: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("session_state")
    .select("*")
    .eq("session_code", sessionCode)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function upsertStudentState(
  sessionCode: string,
  userName: string,
  payload: SessionPayload
) {
  const supabase = createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("session_state")
    .select("id")
    .eq("session_code", sessionCode)
    .eq("user_role", "student")
    .eq("user_name", userName)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing?.id) {
    const { error } = await supabase
      .from("session_state")
      .update({
        payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("session_state")
    .insert({
      session_code: sessionCode,
      user_role: "student",
      user_name: userName,
      payload,
    });

  if (error) throw error;
}
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbSession = {
  session_code: string;
  unlocked_year: number;
  active_events: string[];
  case_closed: boolean;
  updated_at: string;
};

export type DbTeam = {
  team_key: string;
  session_code: string;
  team_name: string;
  created_at: string;
};

export type DbTeamState = {
  team_key: string;
  selections: Record<number, Array<{ actionId: string; level: string }>>;
  confirmed_years: number[];
  decision_2019_pop: string | null;
  decision_2019_price: string | null;
  decision_2019_proposed_price: string | null;
  case_lost: boolean;
  updated_at: string;
};

export type DbBoardroomMessage = {
  id: string;
  session_code: string;
  team_key: string;
  year: number;
  target: string;
  note: string;
  created_at: string;
};

export type DbFacilitatorMessage = {
  id: string;
  session_code: string;
  year: number;
  target: string;
  title: string;
  body: string;
  created_at: string;
};

// ─── Session ──────────────────────────────────────────────────────────────────

export async function getOrCreateSession(sessionCode: string): Promise<DbSession> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_code", sessionCode)
    .single();

  if (data && !error) return data;

  const { data: created } = await supabase
    .from("sessions")
    .insert({ session_code: sessionCode, unlocked_year: 2017, active_events: [], case_closed: false })
    .select()
    .single();

  return created!;
}

export async function updateSession(sessionCode: string, patch: Partial<Omit<DbSession, "session_code" | "updated_at">>) {
  await supabase
    .from("sessions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("session_code", sessionCode);
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function registerTeam(teamKey: string, sessionCode: string, teamName: string): Promise<void> {
  await supabase.from("teams").upsert({ team_key: teamKey, session_code: sessionCode, team_name: teamName });
  await supabase.from("team_state").upsert({
    team_key: teamKey,
    selections: {},
    confirmed_years: [],
    decision_2019_pop: null,
    decision_2019_price: null,
    decision_2019_proposed_price: null,
    case_lost: false,
  });
}

export async function updateTeamName(teamKey: string, teamName: string): Promise<void> {
  await supabase.from("teams").update({ team_name: teamName }).eq("team_key", teamKey);
}

export async function getTeamsForSession(sessionCode: string): Promise<DbTeam[]> {
  const { data } = await supabase.from("teams").select("*").eq("session_code", sessionCode);
  return data || [];
}

// ─── Team state ───────────────────────────────────────────────────────────────

export async function getTeamState(teamKey: string): Promise<DbTeamState | null> {
  const { data } = await supabase.from("team_state").select("*").eq("team_key", teamKey).single();
  return data || null;
}

export async function updateTeamState(teamKey: string, patch: Partial<Omit<DbTeamState, "team_key" | "updated_at">>): Promise<void> {
  await supabase
    .from("team_state")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("team_key", teamKey);
}

// ─── Boardroom messages ───────────────────────────────────────────────────────

export async function sendBoardroomMessage(sessionCode: string, teamKey: string, year: number, target: string, note: string): Promise<void> {
  await supabase.from("boardroom_messages").insert({ session_code: sessionCode, team_key: teamKey, year, target, note });
}

export async function getBoardroomMessages(sessionCode: string): Promise<DbBoardroomMessage[]> {
  const { data } = await supabase
    .from("boardroom_messages")
    .select("*")
    .eq("session_code", sessionCode)
    .order("created_at", { ascending: true });
  return data || [];
}

// ─── Facilitator messages ─────────────────────────────────────────────────────

export async function sendFacilitatorMessage(sessionCode: string, year: number, target: string, title: string, body: string): Promise<void> {
  await supabase.from("facilitator_messages").insert({ session_code: sessionCode, year, target, title, body });
}

export async function getFacilitatorMessages(sessionCode: string): Promise<DbFacilitatorMessage[]> {
  const { data } = await supabase
    .from("facilitator_messages")
    .select("*")
    .eq("session_code", sessionCode)
    .order("created_at", { ascending: true });
  return data || [];
}

// ─── 2019 decisions reset ─────────────────────────────────────────────────────

export async function reset2019Decisions(teamKey: string): Promise<void> {
  await supabase.from("team_state").update({
    decision_2019_pop: null,
    decision_2019_price: null,
    decision_2019_proposed_price: null,
    case_lost: false,
    updated_at: new Date().toISOString(),
  }).eq("team_key", teamKey);
}

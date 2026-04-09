import { createClient } from "@/lib/supabase/client";

export function subscribeToSessionState(
  sessionCode: string,
  onChange: () => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`session-state-${sessionCode}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "session_state",
        filter: `session_code=eq.${sessionCode}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
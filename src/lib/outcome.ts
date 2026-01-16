// Outcome-related utility functions
export async function updatePauseOutcome(sessionId: string, outcome: "resisted" | "partially" | "gave_in") {
  const { error } = await supabase.from("pause_sessions").update({ outcome }).eq("id", sessionId);

  if (error) throw error;
}

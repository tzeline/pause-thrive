export async function createPauseSession({
  userId,
  goalId,
  aiThought,
  suggestedAction,
}: {
  userId: string;
  goalId: string;
  aiThought: string;
  suggestedAction: string;
}) {
  const { data, error } = await supabase
    .from("pause_sessions")
    .insert({
      user_id: userId,
      goal_id: goalId,
      ai_thought: aiThought,
      suggested_action: suggestedAction,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Goal-related utility functions
// src/lib/goals.ts
import { supabase } from "@/integrations/supabase/client";

export async function getActiveGoal(userId: string) {
  const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId).eq("is_active", true).single();

  if (error) throw error;
  return data;
}

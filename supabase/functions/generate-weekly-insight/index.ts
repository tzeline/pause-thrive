import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Get date range for the past week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);

    // Check if insight already exists for this week
    const { data: existingInsight } = await supabase
      .from("weekly_insights")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_start", weekStart.toISOString().split("T")[0])
      .lte("week_end", weekEnd.toISOString().split("T")[0])
      .maybeSingle();

    if (existingInsight) {
      return new Response(JSON.stringify(existingInsight), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch sessions from the past week
    const { data: sessions } = await supabase
      .from("emergency_sessions")
      .select("outcome, created_at, ai_reappraisal")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", weekEnd.toISOString())
      .order("created_at", { ascending: true });

    // Fetch user's goal
    const { data: goals } = await supabase
      .from("goals")
      .select("title, why_it_matters")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1);

    const goal = goals?.[0];
    const sessionCount = sessions?.length || 0;
    const resistedCount = sessions?.filter(s => s.outcome === "resisted" || s.outcome === "partially_resisted").length || 0;

    // Analyze patterns (time of day)
    const hourCounts: Record<string, number> = {};
    sessions?.forEach(s => {
      const hour = new Date(s.created_at).getHours();
      const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
      hourCounts[period] = (hourCounts[period] || 0) + 1;
    });
    const peakTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Generate AI insight
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a compassionate psychology-based coach generating a weekly insight for someone working on self-control. Your tone is:
- Warm and supportive
- Non-judgmental
- Focused on growth and learning
- Celebrating awareness and effort, not just success

Generate a brief weekly summary with 4 parts (each 1-2 sentences max):
1. patterns: Observed patterns from their week
2. strengths: What they did well or strengths they showed
3. awareness_signs: Signs of increased awareness or growth
4. suggestion: One gentle focus for next week

Return as JSON: {"patterns": "...", "strengths": "...", "awareness_signs": "...", "suggestion": "..."}`;

    const userPrompt = `User's goal: ${goal?.title || "improve self-control"}
Why it matters: ${goal?.why_it_matters || "personal growth"}
Sessions this week: ${sessionCount}
Times resisted/partially: ${resistedCount}
Peak activity time: ${peakTime || "varied"}
${sessionCount === 0 ? "Note: No emergency sessions this week - this could mean they're doing well, or haven't engaged yet." : ""}

Generate a supportive, personalized weekly insight.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
    });

    let insight = {
      patterns: peakTime ? `You showed up most in the ${peakTime}.` : "Every moment of awareness matters.",
      strengths: sessionCount > 0 ? "You demonstrated commitment by engaging with your goals." : "Taking time to reflect shows self-awareness.",
      awareness_signs: "Noticing urges is the first step to changing patterns.",
      suggestion: "Try pausing once a day, even when not tempted, to build the habit.",
    };

    if (response.ok) {
      try {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          insight = { ...insight, ...parsed };
        }
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    // Save the insight
    const { data: savedInsight, error: saveError } = await supabase
      .from("weekly_insights")
      .insert({
        user_id: user.id,
        week_start: weekStart.toISOString().split("T")[0],
        week_end: weekEnd.toISOString().split("T")[0],
        patterns: insight.patterns,
        strengths: insight.strengths,
        awareness_signs: insight.awareness_signs,
        suggestion: insight.suggestion,
        sessions_count: sessionCount,
        resisted_count: resistedCount,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(JSON.stringify(savedInsight), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

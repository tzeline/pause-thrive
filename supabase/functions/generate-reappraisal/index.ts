import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, why } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a compassionate, supportive coach helping someone resist a temptation. Generate a short (1-2 sentences) cognitive reappraisal message that:
- Is warm and non-judgmental
- Helps them see the situation differently
- Reminds them of long-term benefits vs short-term urges
- Uses "you" language
Keep it under 50 words. No quotes around the message.`;

    const userPrompt = `The person's goal: "${goal}"${why ? `\nWhy it matters to them: "${why}"` : ""}
Generate a supportive reappraisal message to help them pause and choose wisely.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ message: "This urge is temporary. Your future self will thank you for pausing." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "This urge is temporary. Your future self will thank you for pausing.";

    return new Response(JSON.stringify({ message }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: "This urge is temporary. Your future self will thank you for pausing." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

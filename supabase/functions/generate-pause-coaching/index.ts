import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PauseCoachingRequest {
  goal: string;
  whyItMatters?: string;
  triggerDescription?: string;
  temptationBehavior?: string;
  desiredAlternative?: string;
}

interface PauseCoachingResponse {
  goalReminder: string;
  motivation: string;
  alternatives: string[];
  closingLine: string;
}

const motivationTypes = [
  "concrete_benefit",
  "future_outcome",
  "identity_based",
  "gentle_contrast",
] as const;

const closingLines = [
  "You're allowed to choose differently right now.",
  "This moment counts — even small pauses matter.",
  "You have the power to decide what happens next.",
  "One breath at a time, you're getting stronger.",
  "Your future self is cheering you on right now.",
  "Every pause is proof that you're in control.",
  "You don't have to be perfect — just present.",
  "This urge will pass. You won't.",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal, whyItMatters, triggerDescription, temptationBehavior, desiredAlternative } = 
      await req.json() as PauseCoachingRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify(getFallbackResponse(goal, desiredAlternative)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Randomly select motivation type for variety
    const motivationType = motivationTypes[Math.floor(Math.random() * motivationTypes.length)];
    
    const systemPrompt = `You are a warm, compassionate inner coach helping someone pause during a moment of temptation. Your tone is supportive, non-judgmental, and empowering — like a kind friend, not an authority figure.

CRITICAL RULES:
- NEVER quote the user's onboarding text verbatim
- NEVER use guilt, shame, or pressure
- Keep each response section SHORT (1-2 sentences max)
- Be warm and human, not clinical or preachy
- Sound like an encouraging inner voice

You will generate a JSON response with these exact fields:
1. "goalReminder": A brief, grounding reminder of their goal (rephrase naturally, don't repeat verbatim)
2. "motivation": A personalized motivational message based on the type: "${motivationType}"
   - concrete_benefit: Focus on an immediate benefit of resisting
   - future_outcome: Paint a picture of where they're heading
   - identity_based: Remind them of who they're becoming
   - gentle_contrast: Softly contrast giving in vs. staying aligned
3. "alternatives": An array of 3-4 short, practical alternatives (include their preferred alternative paraphrased, plus 2-3 additional ideas like delay strategies, breathing, small actions)
4. "closingLine": One empowering sentence reinforcing their agency

Respond ONLY with valid JSON, no markdown or extra text.`;

    const userContext = `User's goal: "${goal}"
${whyItMatters ? `Why it matters to them: "${whyItMatters}"` : ""}
${triggerDescription ? `When they usually feel tempted: "${triggerDescription}"` : ""}
${temptationBehavior ? `What they usually do when tempted: "${temptationBehavior}"` : ""}
${desiredAlternative ? `What they'd rather do instead: "${desiredAlternative}"` : ""}

Generate supportive pause coaching for this person right now.`;

    console.log("Generating pause coaching with motivation type:", motivationType);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext },
        ],
        temperature: 0.8, // Add variety
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(getFallbackResponse(goal, desiredAlternative)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify(getFallbackResponse(goal, desiredAlternative)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from AI
    let coaching: PauseCoachingResponse;
    try {
      // Clean up potential markdown wrapping
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      coaching = JSON.parse(cleanContent);
      
      // Validate structure
      if (!coaching.goalReminder || !coaching.motivation || !Array.isArray(coaching.alternatives) || !coaching.closingLine) {
        throw new Error("Invalid coaching structure");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify(getFallbackResponse(goal, desiredAlternative)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully generated pause coaching");
    
    return new Response(
      JSON.stringify(coaching),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-pause-coaching:", error);
    return new Response(
      JSON.stringify(getFallbackResponse()),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getFallbackResponse(goal?: string, desiredAlternative?: string): PauseCoachingResponse {
  const randomClosing = closingLines[Math.floor(Math.random() * closingLines.length)];
  
  return {
    goalReminder: goal 
      ? `You're working toward something meaningful: ${goal.toLowerCase()}.`
      : "You have a goal that matters to you — hold onto that right now.",
    motivation: "This urge is temporary, but your commitment to growth is lasting. The discomfort of waiting will pass; the pride of choosing wisely stays.",
    alternatives: [
      desiredAlternative || "Take a short walk or stretch",
      "Take 3 slow, deep breaths",
      "Wait just 5 minutes before deciding",
      "Drink a glass of water mindfully",
    ],
    closingLine: randomClosing,
  };
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ThankYouRequest {
  messageId: string;
  appreciationMessage?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const { messageId, appreciationMessage }: ThankYouRequest = await req.json();

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: "Message ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate appreciation message length to mitigate abuse
    if (appreciationMessage && appreciationMessage.length > 500) {
      return new Response(
        JSON.stringify({ error: "Appreciation message too long (max 500 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the friend message and verify ownership
    const { data: message, error: messageError } = await supabase
      .from("friend_messages")
      .select("friend_name, friend_email, user_id")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      console.error("Message fetch error:", messageError);
      return new Response(
        JSON.stringify({ error: "Message not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user owns this message
    if (message.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if friend provided an email
    if (!message.friend_email) {
      console.log("No email provided for this friend message");
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "No email provided" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user's display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();

    const userName = profile?.display_name || "Your friend";

    const safeFriendName = escapeHtml(message.friend_name ?? "");
    const safeUserName = escapeHtml(userName);
    const safeAppreciation = appreciationMessage ? escapeHtml(appreciationMessage) : "";

    // Send the thank you email
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">💜 Your message made a difference!</h1>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Hi ${safeFriendName},
        </p>
        
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          <strong>${safeUserName}</strong> wanted to thank you for the supportive message you sent. Your words helped them during a challenging moment.
        </p>
        
        ${appreciationMessage ? `
          <div style="background: #f8f4ff; border-left: 4px solid #8b5cf6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #333; font-size: 16px; font-style: italic; margin: 0;">
              "${safeAppreciation}"
            </p>
            <p style="color: #666; font-size: 14px; margin: 8px 0 0 0;">
              — ${safeUserName}
            </p>
          </div>
        ` : `
          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <span style="font-size: 32px;">❤️</span>
            <p style="color: #16a34a; font-size: 14px; margin: 8px 0 0 0;">
              ${safeUserName} sent you a heart
            </p>
          </div>
        `}
        
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Thank you for being there when it mattered most.
        </p>
        
        <p style="color: #888; font-size: 14px; margin-top: 40px;">
          Sent with 💜 from the Pause app
        </p>
      </div>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Pause App <onboarding@resend.dev>",
      to: [message.friend_email],
      subject: `${userName.replace(/[\r\n]/g, "")} thanked you for your support 💜`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

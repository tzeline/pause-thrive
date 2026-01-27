import { useState } from "react";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MessageReactionProps {
  messageId: string;
  userId: string;
  friendName: string;
  hasFriendEmail?: boolean;
  hasReacted?: boolean;
  onReact?: () => void;
}

export function MessageReaction({ messageId, userId, friendName, hasFriendEmail, hasReacted, onReact }: MessageReactionProps) {
  const [showAppreciation, setShowAppreciation] = useState(false);
  const [appreciation, setAppreciation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reacted, setReacted] = useState(hasReacted);

  const sendThankYouEmail = async (appreciationMessage?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await supabase.functions.invoke("send-thank-you-email", {
        body: { messageId, appreciationMessage },
      });

      if (response.error) {
        console.error("Error sending thank you email:", response.error);
      } else if (response.data?.emailSent) {
        console.log("Thank you email sent successfully");
      }
    } catch (error) {
      console.error("Failed to send thank you email:", error);
    }
  };

  const handleQuickReact = async (type: "thank_you" | "heart") => {
    setSubmitting(true);
    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: userId,
      reaction_type: type,
      notify_friend: hasFriendEmail || false,
    });
    
    if (!error) {
      setReacted(true);
      
      // Send email notification if friend provided email
      if (hasFriendEmail) {
        await sendThankYouEmail();
        toast.success(`${friendName} will receive your thanks by email!`);
      } else {
        toast.success(type === "thank_you" ? "Thank you sent!" : "Heart sent!");
      }
      
      onReact?.();
    }
    setSubmitting(false);
  };

  const handleSendAppreciation = async () => {
    if (!appreciation.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: userId,
      reaction_type: "thank_you",
      appreciation_message: appreciation.trim(),
      notify_friend: hasFriendEmail || false,
    });
    
    if (!error) {
      setReacted(true);
      
      // Send email notification if friend provided email
      if (hasFriendEmail) {
        await sendThankYouEmail(appreciation.trim());
        toast.success(`Your personal message to ${friendName} has been sent!`);
      } else {
        toast.success(`Your message to ${friendName} has been noted!`);
      }
      
      setShowAppreciation(false);
      setAppreciation("");
      onReact?.();
    }
    setSubmitting(false);
  };

  if (reacted) {
    return (
      <span className="text-xs text-success flex items-center gap-1">
        <Heart className="h-3 w-3 fill-current" />
        Thanked
      </span>
    );
  }

  if (showAppreciation) {
    return (
      <div className="mt-2 space-y-2">
        <Textarea
          placeholder={`Write a short thank you to ${friendName}...`}
          value={appreciation}
          onChange={(e) => setAppreciation(e.target.value)}
          rows={2}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSendAppreciation}
            disabled={!appreciation.trim() || submitting}
          >
            <Send className="h-3 w-3 mr-1" />
            Send
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAppreciation(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => handleQuickReact("heart")}
        disabled={submitting}
      >
        <Heart className="h-3 w-3 mr-1" />
        React
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => setShowAppreciation(true)}
        disabled={submitting}
      >
        <Send className="h-3 w-3 mr-1" />
        Thank
      </Button>
    </div>
  );
}

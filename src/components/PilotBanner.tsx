import { useState } from "react";
import { X, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PilotBannerProps {
  userId: string;
  onDismiss?: () => void;
}

export function PilotBanner({ userId, onDismiss }: PilotBannerProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    
    const { error } = await supabase.from("pilot_feedback").insert({
      user_id: userId,
      feature: "general",
      feedback_text: feedback.trim(),
    });

    setSubmitting(false);
    if (!error) {
      toast.success("Thank you for your feedback!");
      setFeedback("");
      setShowFeedback(false);
      setDismissed(true);
      onDismiss?.();
    } else {
      toast.error("Failed to send feedback");
    }
  };

  return (
    <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 animate-float-up">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-medium">Pilot Features Active</p>
          <p className="text-xs text-muted-foreground mt-1">
            You're trying our new premium features. Your feedback shapes what we build next.
          </p>
          
          {showFeedback ? (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="What feels helpful? What feels unnecessary?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitFeedback}
                  disabled={!feedback.trim() || submitting}
                >
                  {submitting ? "Sending..." : "Send"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeedback(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs"
              onClick={() => setShowFeedback(true)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Share feedback
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

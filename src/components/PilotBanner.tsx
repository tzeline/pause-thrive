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
    
    try {
      const { error } = await supabase.from("pilot_feedback").insert({
        user_id: userId,
        feature: "general",
        feedback_text: feedback.trim(),
      });

      if (error) throw error;
      
      toast.success("Thank you! Your feedback helps shape this app.");
      setFeedback("");
      setShowFeedback(false);
      setDismissed(true);
      onDismiss?.();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast.error("Couldn't send feedback right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-float-up">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-medium">You're part of the pilot</p>
          <p className="text-xs text-muted-foreground mt-1">
            Thank you for testing early. Your experience helps us improve.
          </p>
          
          {showFeedback ? (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="What's working? What feels off? All feedback is welcome."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitFeedback}
                  disabled={!feedback.trim() || submitting}
                >
                  {submitting ? "Sending..." : "Send feedback"}
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

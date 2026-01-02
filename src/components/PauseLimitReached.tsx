import { Heart, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PauseLimitReachedProps {
  resetDate: string;
  onClose: () => void;
}

export function PauseLimitReached({ resetDate, onClose }: PauseLimitReachedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="text-center space-y-8 animate-float-up">
            {/* Warm icon */}
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-12 w-12 text-primary" />
            </div>

            {/* Acknowledgment */}
            <div className="space-y-4">
              <h1 className="font-display text-2xl text-foreground">
                You've used all your pauses for today
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                You're showing up for yourself, and that matters.
              </p>
            </div>

            {/* Explanation card */}
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft space-y-4">
              <div className="flex items-center gap-3 justify-center">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="text-foreground font-medium">Want unlimited support?</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Unlock unlimited pauses in moments of temptation. 
                Your support helps us continue developing tools that truly help.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 w-full pt-4">
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/subscribe")}
              >
                Unlock Unlimited Pauses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full text-muted-foreground"
                onClick={onClose}
              >
                Return to Dashboard
              </Button>
            </div>

            {/* Reset info */}
            <p className="text-sm text-muted-foreground">
              Pauses reset {resetDate.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

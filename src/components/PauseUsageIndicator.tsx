import { Leaf } from "lucide-react";
import { FREE_PAUSE_LIMIT_VALUE } from "@/hooks/usePauseLimit";

interface PauseUsageIndicatorProps {
  pausesUsed: number;
  pausesRemaining: number;
  isSubscribed: boolean;
}

export function PauseUsageIndicator({ 
  pausesUsed, 
  pausesRemaining, 
  isSubscribed 
}: PauseUsageIndicatorProps) {
  if (isSubscribed) return null;
  
  // Only show when approaching limit (1 or fewer remaining)
  if (pausesRemaining > 1) return null;

  const isLastPause = pausesRemaining === 1;

  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/30 shadow-soft animate-float-up">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          {isLastPause ? (
            <p className="text-sm text-foreground">
              You have <span className="font-medium">1 pause</span> remaining today.
            </p>
          ) : (
            <p className="text-sm text-foreground">
              You've used most of your pauses today.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            You're showing up for yourself.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Lightbulb } from "lucide-react";

export interface PauseCoachingData {
  goalReminder: string;
  motivation: string;
  alternatives: string[];
  closingLine: string;
}

interface PauseCoachingProps {
  coaching: PauseCoachingData;
  isLoading: boolean;
  onContinue: () => void;
}

export function PauseCoaching({ coaching, isLoading, onContinue }: PauseCoachingProps) {
  if (isLoading) {
    return (
      <div className="text-center space-y-8 animate-float-up">
        <div className="w-20 h-20 rounded-full bg-highlight/10 flex items-center justify-center mx-auto animate-breathe">
          <Sparkles className="h-10 w-10 text-highlight" />
        </div>
        <div className="animate-pulse space-y-4">
          <p className="text-muted-foreground">Preparing something just for you...</p>
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted/50 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6 animate-float-up max-w-md mx-auto">
      {/* Goal Reminder Section */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Lightbulb className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg text-foreground font-medium leading-relaxed">
          {coaching.goalReminder}
        </p>
      </div>

      {/* Motivation Section */}
      <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-highlight mt-0.5 shrink-0" />
          <p className="text-foreground leading-relaxed text-left">
            {coaching.motivation}
          </p>
        </div>
      </div>

      {/* Alternatives Section */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Try one of these instead:</p>
        <div className="grid gap-2">
          {coaching.alternatives.map((alt, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-success/5 border border-success/20 text-left flex items-center gap-3"
            >
              <Heart className="h-4 w-4 text-success shrink-0" />
              <span className="text-sm text-foreground">{alt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Closing Line */}
      <p className="text-muted-foreground italic pt-2">
        {coaching.closingLine}
      </p>

      {/* Continue Button */}
      <Button size="lg" className="w-full" onClick={onContinue}>
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

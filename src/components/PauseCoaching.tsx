import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Lightbulb, Target } from "lucide-react";

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

type CoachingStep = "goal" | "motivation" | "alternatives" | "closing";

export function PauseCoaching({ coaching, isLoading, onContinue }: PauseCoachingProps) {
  const [step, setStep] = useState<CoachingStep>("goal");

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

  const nextStep = () => {
    if (step === "goal") setStep("motivation");
    else if (step === "motivation") setStep("alternatives");
    else if (step === "alternatives") setStep("closing");
    else onContinue();
  };

  return (
    <div className="text-center space-y-6 animate-float-up max-w-md mx-auto">
      {/* Step: Goal Reminder */}
      {step === "goal" && (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your goal</p>
            <p className="text-xl text-foreground font-medium leading-relaxed">
              {coaching.goalReminder}
            </p>
          </div>
          <Button size="lg" className="w-full" onClick={nextStep}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step: Motivation */}
      {step === "motivation" && (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-highlight/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-highlight" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Remember</p>
            <p className="text-lg text-foreground leading-relaxed">
              {coaching.motivation}
            </p>
          </div>
          <Button size="lg" className="w-full" onClick={nextStep}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step: Alternatives */}
      {step === "alternatives" && (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Lightbulb className="h-8 w-8 text-success" />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Try one of these instead</p>
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
          <Button size="lg" className="w-full" onClick={nextStep}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step: Closing */}
      {step === "closing" && (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-accent" />
          </div>
          <p className="text-xl text-foreground font-medium italic leading-relaxed">
            {coaching.closingLine}
          </p>
          <Button size="lg" className="w-full" onClick={nextStep}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

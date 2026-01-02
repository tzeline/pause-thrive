import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Target, Lightbulb, ArrowRight, Check } from "lucide-react";
import { FullPageLoading } from "@/components/LoadingSpinner";
import { SafetyFooter } from "@/components/SafetyFooter";

const Onboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Goal data
  const [goalTitle, setGoalTitle] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");

  // Temptation pattern data
  const [triggerDescription, setTriggerDescription] = useState("");
  const [temptationBehavior, setTemptationBehavior] = useState("");
  const [desiredAlternative, setDesiredAlternative] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleGoalSubmit = () => {
    if (!goalTitle.trim()) {
      toast({
        title: "Please enter your goal",
        description: "What would you like to achieve?",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handlePatternSubmit = async () => {
    if (!triggerDescription.trim() || !temptationBehavior.trim() || !desiredAlternative.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "This helps us support you better.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the goal
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .insert({
          user_id: user!.id,
          title: goalTitle,
          why_it_matters: whyItMatters || null,
          time_horizon: timeHorizon || null,
        })
        .select()
        .single();

      if (goalError) throw goalError;

      // Create the temptation pattern
      const { error: patternError } = await supabase
        .from("temptation_patterns")
        .insert({
          goal_id: goal.id,
          user_id: user!.id,
          trigger_description: triggerDescription,
          temptation_behavior: temptationBehavior,
          desired_alternative: desiredAlternative,
        });

      if (patternError) throw patternError;

      // Mark onboarding as complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user!.id);

      if (profileError) throw profileError;

      toast({
        title: "You're all set!",
        description: "Your journey begins now.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Something didn't save right now",
        description: "Please try again. Your progress won't be lost.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return <FullPageLoading />;
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className="w-8 h-0.5 bg-muted" />
          <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {step === 1 && (
            <div className="space-y-8 animate-float-up">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl text-foreground mb-2">
                  Define Your Goal
                </h1>
                <p className="text-muted-foreground">
                  What meaningful goal are you working toward?
                </p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-foreground">
                    My goal is to...
                  </Label>
                  <Input
                    id="goal"
                    placeholder="e.g., Exercise regularly, eat healthier..."
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="why" className="text-foreground flex items-center gap-2">
                    Why it matters
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="why"
                    placeholder="This goal is important to me because..."
                    value={whyItMatters}
                    onChange={(e) => setWhyItMatters(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horizon" className="text-foreground flex items-center gap-2">
                    Time horizon
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="horizon"
                    placeholder="e.g., 3 months, 1 year..."
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(e.target.value)}
                  />
                </div>

                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={handleGoalSubmit}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-float-up">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-highlight/10 mb-4">
                  <Lightbulb className="h-8 w-8 text-highlight" />
                </div>
                <h1 className="font-display text-3xl text-foreground mb-2">
                  Know Your Pattern
                </h1>
                <p className="text-muted-foreground">
                  Understanding when you're tempted helps us help you
                </p>
              </div>

              {/* Goal reminder */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Your goal:</p>
                <p className="font-medium text-foreground">{goalTitle}</p>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="trigger" className="text-foreground">
                    When does temptation usually hit?
                  </Label>
                  <Textarea
                    id="trigger"
                    placeholder="e.g., After work when I'm tired, late at night..."
                    value={triggerDescription}
                    onChange={(e) => setTriggerDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="behavior" className="text-foreground">
                    What do you usually do when tempted?
                  </Label>
                  <Textarea
                    id="behavior"
                    placeholder="e.g., I reach for my phone, I eat junk food..."
                    value={temptationBehavior}
                    onChange={(e) => setTemptationBehavior(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternative" className="text-foreground">
                    What would you rather do instead?
                  </Label>
                  <Textarea
                    id="alternative"
                    placeholder="e.g., Take a short walk, drink water..."
                    value={desiredAlternative}
                    onChange={(e) => setDesiredAlternative(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="calm"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handlePatternSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        Complete
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

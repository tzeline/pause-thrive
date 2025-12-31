import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Target, Save, RotateCcw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Goal {
  id: string;
  title: string;
  why_it_matters: string | null;
  time_horizon: string | null;
}

interface TemptationPattern {
  id: string;
  trigger_description: string;
  temptation_behavior: string;
  desired_alternative: string;
}

const Goals = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [pattern, setPattern] = useState<TemptationPattern | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [goalTitle, setGoalTitle] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [triggerDescription, setTriggerDescription] = useState("");
  const [temptationBehavior, setTemptationBehavior] = useState("");
  const [desiredAlternative, setDesiredAlternative] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchGoalAndPattern();
    }
  }, [user]);

  const fetchGoalAndPattern = async () => {
    if (!user) return;

    setIsLoading(true);

    // Fetch active goal
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1);

    if (goals && goals.length > 0) {
      const activeGoal = goals[0];
      setGoal(activeGoal);
      setGoalTitle(activeGoal.title);
      setWhyItMatters(activeGoal.why_it_matters || "");
      setTimeHorizon(activeGoal.time_horizon || "");

      // Fetch temptation pattern for this goal
      const { data: patterns } = await supabase
        .from("temptation_patterns")
        .select("*")
        .eq("goal_id", activeGoal.id)
        .eq("user_id", user.id)
        .limit(1);

      if (patterns && patterns.length > 0) {
        const activePattern = patterns[0];
        setPattern(activePattern);
        setTriggerDescription(activePattern.trigger_description);
        setTemptationBehavior(activePattern.temptation_behavior);
        setDesiredAlternative(activePattern.desired_alternative);
      }
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user || !goal) return;

    if (!goalTitle.trim()) {
      toast({
        title: "Goal title required",
        description: "Please enter what you want to achieve.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update goal
      const { error: goalError } = await supabase
        .from("goals")
        .update({
          title: goalTitle,
          why_it_matters: whyItMatters || null,
          time_horizon: timeHorizon || null,
        })
        .eq("id", goal.id);

      if (goalError) throw goalError;

      // Update pattern if exists
      if (pattern && triggerDescription && temptationBehavior && desiredAlternative) {
        const { error: patternError } = await supabase
          .from("temptation_patterns")
          .update({
            trigger_description: triggerDescription,
            temptation_behavior: temptationBehavior,
            desired_alternative: desiredAlternative,
          })
          .eq("id", pattern.id);

        if (patternError) throw patternError;
      }

      toast({
        title: "Changes saved",
        description: "Your goal has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user || !goal) return;

    setIsSaving(true);

    try {
      // Deactivate current goal
      await supabase
        .from("goals")
        .update({ is_active: false })
        .eq("id", goal.id);

      // Reset onboarding so user goes through setup again
      await supabase
        .from("profiles")
        .update({ onboarding_completed: false })
        .eq("id", user.id);

      toast({
        title: "Goal reset",
        description: "You can now set a new goal.",
      });

      navigate("/onboarding");
    } catch (error: any) {
      toast({
        title: "Error resetting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-calm">
        <div className="animate-breathe">
          <Target className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl text-foreground">Your Goal</h1>
            <p className="text-sm text-muted-foreground">Edit or reset your journey</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-auto w-full space-y-6">
          {/* Goal Section */}
          <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft space-y-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Target className="h-5 w-5" />
              <span className="font-medium">Goal Details</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">My goal is to...</Label>
              <Input
                id="goal"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g., Exercise regularly..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="why" className="flex items-center gap-2">
                Why it matters
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="why"
                value={whyItMatters}
                onChange={(e) => setWhyItMatters(e.target.value)}
                placeholder="This goal is important to me because..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horizon" className="flex items-center gap-2">
                Time horizon
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="horizon"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                placeholder="e.g., 3 months..."
              />
            </div>
          </div>

          {/* Temptation Pattern Section */}
          {pattern && (
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft space-y-4">
              <div className="flex items-center gap-2 text-highlight mb-2">
                <span className="font-medium">Temptation Pattern</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">When does temptation hit?</Label>
                <Textarea
                  id="trigger"
                  value={triggerDescription}
                  onChange={(e) => setTriggerDescription(e.target.value)}
                  placeholder="e.g., After work when I'm tired..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="behavior">What do you usually do?</Label>
                <Textarea
                  id="behavior"
                  value={temptationBehavior}
                  onChange={(e) => setTemptationBehavior(e.target.value)}
                  placeholder="e.g., I reach for my phone..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternative">What would you rather do?</Label>
                <Textarea
                  id="alternative"
                  value={desiredAlternative}
                  onChange={(e) => setDesiredAlternative(e.target.value)}
                  placeholder="e.g., Take a short walk..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset & Start Fresh
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start fresh?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will deactivate your current goal and take you through the setup again. 
                    Your progress history will be preserved, but you'll define a new goal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Yes, start fresh
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            It's okay to adjust your path as you grow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Goals;

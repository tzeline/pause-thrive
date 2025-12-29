import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, Wind, Target, Sparkles, Heart, ArrowRight, X, Check, Minus } from "lucide-react";

const STEPS = ["pause", "goal", "reappraisal", "alternative", "reflect"] as const;
type Step = typeof STEPS[number];

const Emergency = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("pause");
  const [goal, setGoal] = useState<{ id: string; title: string; why_it_matters: string | null } | null>(null);
  const [pattern, setPattern] = useState<{ desired_alternative: string } | null>(null);
  const [reappraisal, setReappraisal] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchGoalAndPattern();
  }, [user]);

  const fetchGoalAndPattern = async () => {
    if (!user) return;
    const { data: goals } = await supabase.from("goals").select("id, title, why_it_matters").eq("user_id", user.id).eq("is_active", true).limit(1);
    if (goals?.[0]) {
      setGoal(goals[0]);
      const { data: patterns } = await supabase.from("temptation_patterns").select("desired_alternative").eq("goal_id", goals[0].id).limit(1);
      if (patterns?.[0]) setPattern(patterns[0]);
    }
  };

  const generateReappraisal = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-reappraisal", {
        body: { goal: goal?.title, why: goal?.why_it_matters },
      });
      if (!error && data?.message) setReappraisal(data.message);
      else setReappraisal("This urge is temporary. Your future self will thank you for pausing right now.");
    } catch {
      setReappraisal("This urge is temporary. Your future self will thank you for pausing right now.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const nextStep = async () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      const next = STEPS[currentIndex + 1];
      setStep(next);
      if (next === "reappraisal") generateReappraisal();
    }
  };

  const handleOutcome = async (outcome: "resisted" | "gave_in" | "partially_resisted") => {
    if (!user || !goal) return;
    await supabase.from("emergency_sessions").insert({ user_id: user.id, goal_id: goal.id, outcome, ai_reappraisal: reappraisal || null });
    navigate("/dashboard");
  };

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center gradient-calm"><div className="animate-breathe"><Leaf className="h-12 w-12 text-primary" /></div></div>;
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        <button onClick={() => navigate("/dashboard")} className="self-end text-muted-foreground hover:text-foreground"><X className="h-6 w-6" /></button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {step === "pause" && (
            <div className="text-center space-y-8 animate-float-up">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-breathe"><Wind className="h-12 w-12 text-primary" /></div>
              <div><h1 className="font-display text-3xl text-foreground mb-3">Pause</h1><p className="text-muted-foreground text-lg">Take one slow, deep breath.</p></div>
              <Button size="lg" className="w-full" onClick={nextStep}>I'm ready<ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          )}

          {step === "goal" && goal && (
            <div className="text-center space-y-8 animate-float-up">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Target className="h-10 w-10 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground mb-2">Remember your goal:</p><h2 className="font-display text-2xl text-foreground">{goal.title}</h2>{goal.why_it_matters && <p className="text-muted-foreground mt-4 italic">"{goal.why_it_matters}"</p>}</div>
              <Button size="lg" className="w-full" onClick={nextStep}>Continue<ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          )}

          {step === "reappraisal" && (
            <div className="text-center space-y-8 animate-float-up">
              <div className="w-20 h-20 rounded-full bg-highlight/10 flex items-center justify-center mx-auto"><Sparkles className="h-10 w-10 text-highlight" /></div>
              {isLoadingAI ? <div className="animate-pulse"><p className="text-muted-foreground">Preparing a thought for you...</p></div> : <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft"><p className="text-lg text-foreground leading-relaxed">{reappraisal}</p></div>}
              <Button size="lg" className="w-full" onClick={nextStep} disabled={isLoadingAI}>Continue<ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          )}

          {step === "alternative" && pattern && (
            <div className="text-center space-y-8 animate-float-up">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto"><Heart className="h-10 w-10 text-success" /></div>
              <div><p className="text-sm text-muted-foreground mb-2">Try this for 1-2 minutes:</p><div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft"><p className="text-lg text-foreground">{pattern.desired_alternative}</p></div></div>
              <Button size="lg" className="w-full" onClick={nextStep}>Done<ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          )}

          {step === "reflect" && (
            <div className="text-center space-y-8 animate-float-up">
              <h2 className="font-display text-2xl text-foreground">How did it go?</h2>
              <div className="space-y-3 w-full">
                <Button variant="success" size="lg" className="w-full" onClick={() => handleOutcome("resisted")}><Check className="h-5 w-5 mr-2" />I resisted</Button>
                <Button variant="calm" size="lg" className="w-full" onClick={() => handleOutcome("partially_resisted")}><Minus className="h-5 w-5 mr-2" />Partially</Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => handleOutcome("gave_in")}>I gave in</Button>
              </div>
              <p className="text-sm text-muted-foreground">No judgment—every attempt counts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emergency;

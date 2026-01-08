import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wind, Target, Sparkles, Heart, ArrowRight, X, Check, Minus, Users } from "lucide-react";
import { MicroLearningCard } from "@/components/MicroLearningCard";
import { getRandomMicroLearning, MicroLearning } from "@/lib/microLearning";
import { usePauseLimit } from "@/hooks/usePauseLimit";
import { PauseLimitReached } from "@/components/PauseLimitReached";
import { FullPageLoading } from "@/components/LoadingSpinner";
import { SafetyFooter } from "@/components/SafetyFooter";

const STEPS = ["pause", "goal", "reappraisal", "friend_message", "alternative", "reflect"] as const;
type Step = typeof STEPS[number];

interface FriendMessage {
  id: string;
  friend_name: string;
  message: string;
}

const Emergency = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("pause");
  const [goal, setGoal] = useState<{ id: string; title: string; why_it_matters: string | null } | null>(null);
  const [pattern, setPattern] = useState<{ desired_alternative: string } | null>(null);
  const [reappraisal, setReappraisal] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [friendMessage, setFriendMessage] = useState<FriendMessage | null>(null);
  const [shownFriendMessageId, setShownFriendMessageId] = useState<string | null>(null);
  const [microLearning, setMicroLearning] = useState<MicroLearning | null>(null);
  const [pauseConsumed, setPauseConsumed] = useState(false);
  
  const { 
    hasReachedLimit, 
    loading: pauseLoading, 
    incrementPause, 
    resetDate 
  } = usePauseLimit(user?.id);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchGoalAndPattern();
      fetchRandomFriendMessage();
    }
  }, [user]);

  const fetchGoalAndPattern = async () => {
    if (!user) return;
    try {
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("id, title, why_it_matters")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);
      
      if (goalsError) {
        console.error("Failed to fetch goals:", goalsError);
        return;
      }
      
      if (goals?.[0]) {
        setGoal(goals[0]);
        try {
          const { data: patterns } = await supabase
            .from("temptation_patterns")
            .select("desired_alternative")
            .eq("goal_id", goals[0].id)
            .limit(1);
          if (patterns?.[0]) setPattern(patterns[0]);
        } catch (patternErr) {
          console.error("Failed to fetch patterns:", patternErr);
        }
      }
    } catch (err) {
      console.error("Error fetching goal data:", err);
    }
  };

  const fetchRandomFriendMessage = async () => {
    if (!user) return;
    try {
      const { data: messages, error } = await supabase
        .from("friend_messages")
        .select("id, friend_name, message")
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Failed to fetch friend messages:", error);
        return;
      }
      
      if (messages && messages.length > 0) {
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setFriendMessage(randomMsg);
      }
    } catch (err) {
      console.error("Error fetching friend messages:", err);
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
      let next = STEPS[currentIndex + 1];
      
      // Skip friend_message step if no messages available
      if (next === "friend_message" && !friendMessage) {
        next = STEPS[currentIndex + 2];
      }
      
      // Consume a pause when moving from the first step
      // Even if this fails, we still proceed - user experience takes priority
      if (step === "pause" && !pauseConsumed) {
        try {
          const success = await incrementPause();
          if (success) {
            setPauseConsumed(true);
          }
        } catch (err) {
          console.error("Failed to increment pause, proceeding anyway:", err);
          // Mark as consumed so we don't retry - intervention is more important than tracking
          setPauseConsumed(true);
        }
      }
      
      // Always proceed to next step
      setStep(next);
      if (next === "reappraisal") generateReappraisal();
      if (next === "friend_message" && friendMessage) {
        setShownFriendMessageId(friendMessage.id);
      }
    }
  };

  const handleOutcome = async (outcome: "resisted" | "gave_in" | "partially_resisted") => {
    if (!user) {
      navigate("/dashboard");
      return;
    }
    
    // Save session - but don't block navigation if it fails
    try {
      const { error } = await supabase.from("emergency_sessions").insert({ 
        user_id: user.id, 
        goal_id: goal?.id || null, 
        outcome, 
        ai_reappraisal: reappraisal || null,
        friend_message_shown: shownFriendMessageId,
      });
      if (error) {
        console.error("Failed to save session:", error);
      }
    } catch (err) {
      console.error("Error saving session:", err);
    }
    
    // Show micro-learning after completing flow (50% chance)
    if (Math.random() > 0.5) {
      try {
        const { data: viewedLearnings } = await supabase
          .from("micro_learning_views")
          .select("learning_id")
          .eq("user_id", user.id);
        
        const viewedIds = viewedLearnings?.map(v => v.learning_id) || [];
        const learning = getRandomMicroLearning(viewedIds);
        if (learning) {
          setMicroLearning(learning);
          return; // Don't navigate yet
        }
      } catch (err) {
        console.error("Error fetching micro-learning:", err);
      }
    }
    
    navigate("/dashboard");
  };

  const dismissMicroLearning = () => {
    setMicroLearning(null);
    navigate("/dashboard");
  };

  if (loading || pauseLoading || !user) {
    return <FullPageLoading />;
  }

  // Show limit reached screen if user has hit their limit and hasn't consumed a pause yet
  if (hasReachedLimit && !pauseConsumed) {
    return <PauseLimitReached resetDate={resetDate} onClose={() => navigate("/dashboard")} />;
  }

  // Show micro-learning after completing the flow
  if (microLearning) {
    return (
      <div className="min-h-screen gradient-calm">
        <div className="flex flex-col min-h-screen px-6 py-8">
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <div className="w-full mb-6">
              <MicroLearningCard
                learning={microLearning}
                userId={user.id}
                onDismiss={dismissMicroLearning}
              />
            </div>
            <Button onClick={dismissMicroLearning}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
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

          {step === "friend_message" && friendMessage && (
            <div className="text-center space-y-8 animate-float-up">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto"><Users className="h-10 w-10 text-accent" /></div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">A message from someone who cares:</p>
                <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft">
                  <p className="text-lg text-foreground leading-relaxed italic">"{friendMessage.message}"</p>
                  <p className="text-sm text-muted-foreground mt-4">— {friendMessage.friend_name}</p>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={nextStep}>Continue<ArrowRight className="h-4 w-4 ml-2" /></Button>
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

          {/* Crisis support link - always visible during emergency flow */}
          <SafetyFooter 
            className="mt-8" 
            showDisclaimer={false} 
            showCrisisLink={true} 
          />
        </div>
      </div>
    </div>
  );
};

export default Emergency;

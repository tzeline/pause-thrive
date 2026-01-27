import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wind, Users, ArrowRight, X, Check, Minus } from "lucide-react";
import { MicroLearningCard } from "@/components/MicroLearningCard";
import { getRandomMicroLearning, MicroLearning } from "@/lib/microLearning";
import { usePauseLimit } from "@/hooks/usePauseLimit";
import { PauseLimitReached } from "@/components/PauseLimitReached";
import { FullPageLoading } from "@/components/LoadingSpinner";
import { SafetyFooter } from "@/components/SafetyFooter";
import { PauseCoaching, PauseCoachingData } from "@/components/PauseCoaching";

const STEPS = ["pause", "coaching", "friend_message", "reflect"] as const;
type Step = typeof STEPS[number];

interface FriendMessage {
  id: string;
  friend_name: string;
  message: string;
}

interface TemptationPattern {
  trigger_description: string;
  temptation_behavior: string;
  desired_alternative: string;
}

interface Goal {
  id: string;
  title: string;
  why_it_matters: string | null;
}

const Emergency = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("pause");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [pattern, setPattern] = useState<TemptationPattern | null>(null);
  const [coaching, setCoaching] = useState<PauseCoachingData | null>(null);
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
            .select("trigger_description, temptation_behavior, desired_alternative")
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

  const generatePauseCoaching = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pause-coaching", {
        body: {
          goal: goal?.title,
          whyItMatters: goal?.why_it_matters,
          triggerDescription: pattern?.trigger_description,
          temptationBehavior: pattern?.temptation_behavior,
          desiredAlternative: pattern?.desired_alternative,
        },
      });
      
      if (!error && data && !data.error) {
        setCoaching(data as PauseCoachingData);
      } else {
        console.error("Coaching generation error:", error || data?.error);
        // Use fallback
        setCoaching(getFallbackCoaching());
      }
    } catch (err) {
      console.error("Failed to generate coaching:", err);
      setCoaching(getFallbackCoaching());
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getFallbackCoaching = (): PauseCoachingData => ({
    goalReminder: goal?.title 
      ? `You're working toward something meaningful: ${goal.title.toLowerCase()}.`
      : "You have a goal that matters to you — hold onto that right now.",
    motivation: "This urge is temporary, but your commitment to growth is lasting. The discomfort of waiting will pass; the pride of choosing wisely stays.",
    alternatives: [
      pattern?.desired_alternative || "Take a short walk or stretch",
      "Take 3 slow, deep breaths",
      "Wait just 5 minutes before deciding",
      "Drink a glass of water mindfully",
    ],
    closingLine: "You're allowed to choose differently right now.",
  });

  const nextStep = async () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      let next = STEPS[currentIndex + 1];
      
      // Skip friend_message step if no messages available
      if (next === "friend_message" && !friendMessage) {
        next = STEPS[currentIndex + 2];
      }
      
      // Consume a pause when moving from the first step
      if (step === "pause" && !pauseConsumed) {
        try {
          const success = await incrementPause();
          if (success) {
            setPauseConsumed(true);
          }
        } catch (err) {
          console.error("Failed to increment pause, proceeding anyway:", err);
          setPauseConsumed(true);
        }
      }
      
      // Generate coaching when entering the coaching step
      if (next === "coaching") {
        generatePauseCoaching();
      }
      
      if (next === "friend_message" && friendMessage) {
        setShownFriendMessageId(friendMessage.id);
      }
      
      setStep(next);
    }
  };

  const handleOutcome = async (outcome: "resisted" | "gave_in" | "partially_resisted") => {
    if (!user) {
      navigate("/dashboard");
      return;
    }
    
    try {
      const { error } = await supabase.from("emergency_sessions").insert({ 
        user_id: user.id, 
        goal_id: goal?.id || null, 
        outcome, 
        ai_reappraisal: coaching ? JSON.stringify(coaching) : null,
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
          return;
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

  if (hasReachedLimit && !pauseConsumed) {
    return <PauseLimitReached resetDate={resetDate} onClose={() => navigate("/dashboard")} />;
  }

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
        <button 
          onClick={() => navigate("/dashboard")} 
          className="self-end text-muted-foreground hover:text-foreground"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {step === "pause" && (
            <div className="text-center space-y-8 animate-float-up">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-breathe">
                <Wind className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl text-foreground mb-3">Pause</h1>
                <p className="text-muted-foreground text-lg">Take one slow, deep breath.</p>
              </div>
              <Button size="lg" className="w-full" onClick={nextStep}>
                I'm ready
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === "coaching" && (
            <PauseCoaching
              coaching={coaching || getFallbackCoaching()}
              isLoading={isLoadingAI}
              onContinue={nextStep}
            />
          )}

          {step === "friend_message" && friendMessage && (
            <div className="text-center space-y-8 animate-float-up">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Users className="h-10 w-10 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">A message from someone who cares:</p>
                <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft">
                  <p className="text-lg text-foreground leading-relaxed italic">
                    "{friendMessage.message}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">— {friendMessage.friend_name}</p>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={nextStep}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === "reflect" && (
            <div className="text-center space-y-8 animate-float-up">
              <h2 className="font-display text-2xl text-foreground">How did it go?</h2>
              <div className="space-y-3 w-full">
                <Button variant="success" size="lg" className="w-full" onClick={() => handleOutcome("resisted")}>
                  <Check className="h-5 w-5 mr-2" />
                  I resisted
                </Button>
                <Button variant="calm" size="lg" className="w-full" onClick={() => handleOutcome("partially_resisted")}>
                  <Minus className="h-5 w-5 mr-2" />
                  Partially
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => handleOutcome("gave_in")}>
                  I gave in
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">No judgment—every attempt counts.</p>
            </div>
          )}

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

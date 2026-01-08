import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingUp, LogOut, AlertCircle, Users, Sparkles, Beaker, Calendar } from "lucide-react";
import { PilotBanner } from "@/components/PilotBanner";
import { MicroLearningCard } from "@/components/MicroLearningCard";
import { getRandomMicroLearning, MicroLearning } from "@/lib/microLearning";
import { usePauseLimit } from "@/hooks/usePauseLimit";
import { PauseUsageIndicator } from "@/components/PauseUsageIndicator";
import { SafetyFooter } from "@/components/SafetyFooter";
import { FullPageLoading } from "@/components/LoadingSpinner";

interface Goal {
  id: string;
  title: string;
  why_it_matters: string | null;
}

interface Stats {
  totalSessions: number;
  resistedCount: number;
  currentStreak: number;
}

interface ActiveExperiment {
  id: string;
  title: string;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [stats, setStats] = useState<Stats>({ totalSessions: 0, resistedCount: 0, currentStreak: 0 });
  const [displayName, setDisplayName] = useState<string>("");
  const [showPilotBanner, setShowPilotBanner] = useState(true);
  const [microLearning, setMicroLearning] = useState<MicroLearning | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<ActiveExperiment | null>(null);

  const { pausesUsed, pausesRemaining, isSubscribed } = usePauseLimit(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "Friend");
      if (!profile.onboarding_completed) {
        navigate("/onboarding");
        return;
      }
    }

    // Fetch active goal
    const { data: goals } = await supabase
      .from("goals")
      .select("id, title, why_it_matters")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1);

    if (goals && goals.length > 0) {
      setGoal(goals[0]);
    }

    // Fetch stats
    const { data: sessions } = await supabase
      .from("emergency_sessions")
      .select("outcome, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (sessions) {
      const resistedCount = sessions.filter(
        (s) => s.outcome === "resisted" || s.outcome === "partially_resisted",
      ).length;

      // Calculate streak (days with at least one session)
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sessionDates = new Set(
        sessions.map((s) => {
          const date = new Date(s.created_at);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        }),
      );

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        if (sessionDates.has(checkDate.getTime())) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      setStats({
        totalSessions: sessions.length,
        resistedCount,
        currentStreak: streak,
      });
    }

    // Fetch active experiment
    const { data: experiments } = await supabase
      .from("experiments")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);

    if (experiments?.[0]) {
      setActiveExperiment(experiments[0]);
    }

    // Fetch viewed micro-learnings to show a new one occasionally
    const { data: viewedLearnings } = await supabase
      .from("micro_learning_views")
      .select("learning_id")
      .eq("user_id", user.id);

    const viewedIds = viewedLearnings?.map((v) => v.learning_id) || [];
    // Show micro-learning occasionally (50% chance if not all viewed)
    if (Math.random() > 0.5) {
      const learning = getRandomMicroLearning(viewedIds);
      setMicroLearning(learning);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) {
    return <FullPageLoading />;
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="font-medium text-foreground">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/weekly-insight")} title="Weekly Insight">
              <Calendar className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/experiments")} title="Experiments">
              <Beaker className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/friends")} title="Friend Support">
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/progress")}>
              <TrendingUp className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Pilot Banner */}
        {showPilotBanner && (
          <div className="mb-6 max-w-md mx-auto w-full">
            <PilotBanner userId={user.id} onDismiss={() => setShowPilotBanner(false)} />
          </div>
        )}

        {/* Active Experiment Reminder */}
        {activeExperiment && (
          <div
            className="mb-6 max-w-md mx-auto w-full p-4 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors animate-float-up"
            onClick={() => navigate("/experiments")}
          >
            <div className="flex items-center gap-3">
              <Beaker className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">Active experiment</p>
                <p className="text-xs text-muted-foreground">{activeExperiment.title}</p>
              </div>
              <Sparkles className="h-4 w-4 text-highlight" />
            </div>
          </div>
        )}

        {/* Micro-Learning Card */}
        {microLearning && (
          <div className="mb-6 max-w-md mx-auto w-full">
            <MicroLearningCard learning={microLearning} userId={user.id} onDismiss={() => setMicroLearning(null)} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Goal Reminder or Add Goal prompt */}
          {goal ? (
            <div
              className="w-full max-w-sm mb-8 animate-float-up cursor-pointer group"
              onClick={() => navigate("/goals")}
            >
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft group-hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Your goal:</p>
                  <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    Tap to edit
                  </p>
                </div>
                <p className="font-display text-xl text-foreground">{goal.title}</p>
                {goal.why_it_matters && (
                  <p className="text-sm text-muted-foreground mt-2 italic">"{goal.why_it_matters}"</p>
                )}
              </div>
            </div>
          ) : (
            <div
              className="w-full max-w-sm mb-8 animate-float-up cursor-pointer group"
              onClick={() => navigate("/goals")}
            >
              <div className="p-5 rounded-2xl bg-card border border-dashed border-primary/30 shadow-soft group-hover:border-primary/50 transition-colors text-center">
                <p className="text-sm text-muted-foreground mb-1">No goal set yet</p>
                <p className="font-display text-lg text-primary group-hover:text-primary/80 transition-colors">
                  + Add your first goal
                </p>
              </div>
            </div>
          )}

          {/* Pause Usage Indicator */}
          <div className="w-full max-w-sm mb-4">
            <PauseUsageIndicator
              pausesUsed={pausesUsed}
              pausesRemaining={pausesRemaining}
              isSubscribed={isSubscribed}
            />
          </div>

          {/* Emergency Button */}
          <div className="relative animate-float-up delay-100">
            {/* Ripple effect background */}
            <div
              className="absolute inset-0 rounded-full gradient-emergency opacity-30 animate-breathe"
              style={{ transform: "scale(1.2)" }}
            />

            <Button
              variant="emergency"
              size="emergency"
              className="relative z-10"
              onClick={() => navigate("/emergency")}
            >
              <div className="flex flex-col items-center gap-1">
                <AlertCircle className="h-8 w-8" />
                <span>Pause</span>
              </div>
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-center animate-float-up delay-200">
            Feeling tempted? Tap to pause.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-12 animate-float-up delay-300">
            <StatCard label="Sessions" value={stats.totalSessions} />
            <StatCard label="Resisted" value={stats.resistedCount} />
            <StatCard label="Streak" value={`${stats.currentStreak}d`} />
          </div>
        </div>

        {/* Weekly Insight Prompt */}
        <div
          className="text-center py-4 animate-float-up delay-400 cursor-pointer"
          onClick={() => navigate("/weekly-insight")}
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="h-4 w-4 text-highlight" />
            <span>View your weekly insight</span>
          </div>
        </div>

        {/* Encouraging Message */}
        <div className="text-center pb-2 animate-float-up delay-400">
          <p className="text-sm text-muted-foreground italic">"Every pause is a step forward."</p>
        </div>

        {/* Safety Footer */}
        <SafetyFooter className="pb-4 pt-2" />
      </div>
    </div>
  );
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
      <p className="text-2xl font-display text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default Dashboard;

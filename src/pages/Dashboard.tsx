import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingUp, LogOut, AlertCircle, Users } from "lucide-react";

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

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [stats, setStats] = useState<Stats>({ totalSessions: 0, resistedCount: 0, currentStreak: 0 });
  const [displayName, setDisplayName] = useState<string>("");

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
      const resistedCount = sessions.filter(s => s.outcome === "resisted" || s.outcome === "partially_resisted").length;
      
      // Calculate streak (days with at least one session)
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sessionDates = new Set(sessions.map(s => {
        const date = new Date(s.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }));

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
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-calm">
        <div className="animate-breathe">
          <Leaf className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="font-medium text-foreground">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/friends")}
              title="Friend Support"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/progress")}
            >
              <TrendingUp className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Goal Reminder */}
          {goal && (
            <div className="w-full max-w-sm mb-8 animate-float-up">
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft">
                <p className="text-sm text-muted-foreground mb-2">Your goal:</p>
                <p className="font-display text-xl text-foreground">{goal.title}</p>
                {goal.why_it_matters && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{goal.why_it_matters}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Emergency Button */}
          <div className="relative animate-float-up delay-100">
            {/* Ripple effect background */}
            <div className="absolute inset-0 rounded-full gradient-emergency opacity-30 animate-breathe" style={{ transform: "scale(1.2)" }} />
            
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

        {/* Encouraging Message */}
        <div className="text-center py-6 animate-float-up delay-400">
          <p className="text-sm text-muted-foreground italic">
            "Every pause is a step forward."
          </p>
        </div>
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

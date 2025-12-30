import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowLeft, Calendar, TrendingUp, Sparkles, Target, Lightbulb } from "lucide-react";

interface Insight {
  id: string;
  week_start: string;
  week_end: string;
  patterns: string | null;
  strengths: string | null;
  awareness_signs: string | null;
  suggestion: string | null;
  sessions_count: number;
  resisted_count: number;
  viewed_at: string | null;
}

const WeeklyInsight = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchOrGenerateInsight();
  }, [user]);

  const fetchOrGenerateInsight = async () => {
    if (!user) return;
    setLoadingInsight(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-weekly-insight");
      
      if (fnError) throw fnError;
      if (data) {
        setInsight(data);
        // Mark as viewed
        if (!data.viewed_at) {
          await supabase
            .from("weekly_insights")
            .update({ viewed_at: new Date().toISOString() })
            .eq("id", data.id);
        }
      }
    } catch (e) {
      console.error("Error fetching insight:", e);
      setError("Unable to generate your weekly insight right now.");
    } finally {
      setLoadingInsight(false);
    }
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl text-foreground">Weekly Insight</h1>
            <p className="text-sm text-muted-foreground">Your growth in focus</p>
          </div>
        </div>

        {loadingInsight ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="animate-breathe mb-4">
              <Sparkles className="h-12 w-12 text-highlight" />
            </div>
            <p className="text-muted-foreground animate-pulse">Preparing your insight...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={fetchOrGenerateInsight}>
              Try again
            </Button>
          </div>
        ) : insight ? (
          <div className="space-y-6 animate-float-up">
            {/* Week header */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {formatDate(insight.week_start)} – {formatDate(insight.week_end)}
              </span>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                <p className="text-2xl font-display text-foreground">{insight.sessions_count}</p>
                <p className="text-xs text-muted-foreground">Pauses</p>
              </div>
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                <p className="text-2xl font-display text-success">{insight.resisted_count}</p>
                <p className="text-xs text-muted-foreground">Resisted</p>
              </div>
            </div>

            {/* Patterns */}
            {insight.patterns && (
              <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">What we noticed</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">{insight.patterns}</p>
              </div>
            )}

            {/* Strengths */}
            {insight.strengths && (
              <div className="p-5 rounded-2xl bg-success/5 border border-success/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-success" />
                  <p className="text-sm font-medium text-foreground">Your strengths</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">{insight.strengths}</p>
              </div>
            )}

            {/* Awareness */}
            {insight.awareness_signs && (
              <div className="p-5 rounded-2xl bg-highlight/5 border border-highlight/20">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-highlight" />
                  <p className="text-sm font-medium text-foreground">Signs of growth</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">{insight.awareness_signs}</p>
              </div>
            )}

            {/* Suggestion */}
            {insight.suggestion && (
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Focus for this week</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">{insight.suggestion}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground italic">
                "Growth is learning from every moment."
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">No insights available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Use the app for a week to see your first insight.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyInsight;

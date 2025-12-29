import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowLeft, TrendingUp, Check, X, Minus } from "lucide-react";

interface Session { id: string; outcome: string | null; created_at: string; }

const Progress = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({ total: 0, resisted: 0, partial: 0, gaveIn: 0 });

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  useEffect(() => { if (user) fetchSessions(); }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    const { data } = await supabase.from("emergency_sessions").select("id, outcome, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (data) {
      setSessions(data);
      setStats({
        total: data.length,
        resisted: data.filter(s => s.outcome === "resisted").length,
        partial: data.filter(s => s.outcome === "partially_resisted").length,
        gaveIn: data.filter(s => s.outcome === "gave_in").length,
      });
    }
  };

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center gradient-calm"><div className="animate-breathe"><Leaf className="h-12 w-12 text-primary" /></div></div>;
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"><ArrowLeft className="h-4 w-4" /><span>Back</span></button>

        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8 animate-float-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"><TrendingUp className="h-8 w-8 text-primary" /></div>
            <h1 className="font-display text-3xl text-foreground">Your Progress</h1>
            <p className="text-muted-foreground mt-2">Every pause is growth</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 animate-float-up delay-100">
            <div className="p-5 rounded-xl bg-card border border-border/50 text-center"><p className="text-3xl font-display text-foreground">{stats.total}</p><p className="text-sm text-muted-foreground">Total Sessions</p></div>
            <div className="p-5 rounded-xl bg-success/10 border border-success/20 text-center"><p className="text-3xl font-display text-success">{stats.resisted}</p><p className="text-sm text-muted-foreground">Resisted</p></div>
          </div>

          <div className="space-y-3 animate-float-up delay-200">
            <h3 className="font-medium text-foreground">Recent Sessions</h3>
            {sessions.length === 0 ? <p className="text-muted-foreground text-center py-8">No sessions yet. Use the Pause button when tempted.</p> : sessions.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
                <span className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  {s.outcome === "resisted" && <><Check className="h-4 w-4 text-success" /><span className="text-sm text-success">Resisted</span></>}
                  {s.outcome === "partially_resisted" && <><Minus className="h-4 w-4 text-highlight" /><span className="text-sm text-highlight">Partial</span></>}
                  {s.outcome === "gave_in" && <><X className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Gave in</span></>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;

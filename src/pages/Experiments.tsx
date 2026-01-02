import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Beaker, Plus, Sparkles } from "lucide-react";
import { ExperimentCard } from "@/components/ExperimentCard";
import { experimentSuggestions } from "@/lib/microLearning";
import { toast } from "sonner";
import { FullPageLoading } from "@/components/LoadingSpinner";

interface Experiment {
  id: string;
  title: string;
  description: string | null;
  status: string;
  started_at: string;
}

const Experiments = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingExperiments, setLoadingExperiments] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchExperiments();
  }, [user]);

  const fetchExperiments = async () => {
    if (!user) return;
    setLoadingExperiments(true);
    const { data } = await supabase
      .from("experiments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setExperiments(data);
    setLoadingExperiments(false);
  };

  const startExperiment = async (title: string, description: string) => {
    if (!user) return;
    const { error } = await supabase.from("experiments").insert({
      user_id: user.id,
      title,
      description,
    });
    if (!error) {
      toast.success("Experiment started! Just try it — no pressure.");
      fetchExperiments();
      setShowSuggestions(false);
    }
  };

  if (loading || !user) {
    return <FullPageLoading />;
  }

  const activeExperiments = experiments.filter(e => e.status === "active");
  const pastExperiments = experiments.filter(e => e.status !== "active");

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl text-foreground">Experiments</h1>
              <p className="text-sm text-muted-foreground">Small steps, no pressure</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Try one
          </Button>
        </div>

        {/* Intro */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6 animate-float-up">
          <div className="flex items-start gap-3">
            <Beaker className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Try small experiments</p>
              <p className="text-xs text-muted-foreground mt-1">
                These are optional, low-pressure ways to practice awareness. No failure states — just noticing counts.
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="space-y-3 mb-6 animate-float-up">
            <p className="text-sm text-muted-foreground">Want to try a small experiment?</p>
            {experimentSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => startExperiment(suggestion.title, suggestion.description)}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-highlight shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground font-medium">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    <span className="text-xs text-primary mt-2 inline-block">{suggestion.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Experiments */}
        {activeExperiments.length > 0 && (
          <div className="space-y-3 mb-6 animate-float-up delay-100">
            <h3 className="text-sm font-medium text-foreground">Active</h3>
            {activeExperiments.map(exp => (
              <ExperimentCard key={exp.id} experiment={exp} onUpdate={fetchExperiments} />
            ))}
          </div>
        )}

        {/* Past Experiments */}
        {pastExperiments.length > 0 && (
          <div className="space-y-3 animate-float-up delay-200">
            <h3 className="text-sm font-medium text-muted-foreground">Past experiments</h3>
            {pastExperiments.map(exp => (
              <ExperimentCard key={exp.id} experiment={exp} onUpdate={fetchExperiments} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {experiments.length === 0 && !showSuggestions && !loadingExperiments && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Beaker className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No experiments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Try one to build momentum between emergencies.</p>
            <Button className="mt-4" onClick={() => setShowSuggestions(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Start an experiment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Experiments;

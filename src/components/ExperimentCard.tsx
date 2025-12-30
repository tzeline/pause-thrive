import { useState } from "react";
import { Beaker, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Experiment {
  id: string;
  title: string;
  description: string | null;
  status: string;
  started_at: string;
}

interface ExperimentCardProps {
  experiment: Experiment;
  onUpdate: () => void;
}

export function ExperimentCard({ experiment, onUpdate }: ExperimentCardProps) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus: "tried" | "completed") => {
    setUpdating(true);
    const { error } = await supabase
      .from("experiments")
      .update({ 
        status: newStatus,
        completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", experiment.id);

    setUpdating(false);
    if (!error) {
      toast.success(newStatus === "tried" ? "Nice! You gave it a try." : "Experiment completed!");
      onUpdate();
    }
  };

  const statusColors = {
    active: "border-primary/30 bg-primary/5",
    tried: "border-highlight/30 bg-highlight/5",
    completed: "border-success/30 bg-success/5",
  };

  return (
    <div className={`rounded-xl p-4 border ${statusColors[experiment.status as keyof typeof statusColors] || statusColors.active}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shrink-0">
          <Beaker className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-medium">{experiment.title}</p>
          {experiment.description && (
            <p className="text-xs text-muted-foreground mt-1">{experiment.description}</p>
          )}
          
          {experiment.status === "active" && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => updateStatus("tried")}
                disabled={updating}
              >
                <Play className="h-3 w-3 mr-1" />
                I tried it
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => updateStatus("completed")}
                disabled={updating}
              >
                <Check className="h-3 w-3 mr-1" />
                Completed
              </Button>
            </div>
          )}
          
          {experiment.status === "tried" && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-highlight">You gave it a try!</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => updateStatus("completed")}
                disabled={updating}
              >
                Mark complete
              </Button>
            </div>
          )}
          
          {experiment.status === "completed" && (
            <span className="text-xs text-success flex items-center gap-1 mt-2">
              <Check className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MicroLearning } from "@/lib/microLearning";
import { supabase } from "@/integrations/supabase/client";

interface MicroLearningCardProps {
  learning: MicroLearning;
  userId: string;
  onDismiss: () => void;
}

export function MicroLearningCard({ learning, userId, onDismiss }: MicroLearningCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = async () => {
    // Record that user viewed this learning
    await supabase.from("micro_learning_views").insert({
      user_id: userId,
      learning_id: learning.id,
    });
    setDismissed(true);
    onDismiss();
  };

  return (
    <div className="bg-highlight/5 border border-highlight/20 rounded-xl p-4 animate-float-up">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-highlight/20 flex items-center justify-center shrink-0">
          <Lightbulb className="h-4 w-4 text-highlight" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground font-medium">{learning.title}</p>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {learning.content}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 h-7 px-2 text-xs text-muted-foreground"
            onClick={handleDismiss}
          >
            Got it
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

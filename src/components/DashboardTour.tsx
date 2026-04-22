import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Beaker,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

interface TourStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: "Welcome to your dashboard",
    description:
      "This is your home base. Here you'll find your goal, your pause button, and quick access to everything that helps you stay aligned.",
  },
  {
    icon: <Target className="h-6 w-6 text-primary" />,
    title: "Your goal",
    description:
      "At the top you'll see the habit you want to restrict. Tap the card to edit it or change your focus anytime.",
  },
  {
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
    title: "The Pause button",
    description:
      "When temptation hits, tap the big Pause button. We'll guide you through a short reflection to help you stay on track.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: "Track your progress",
    description:
      "The icons in the top-right open Progress, Friend Support, Experiments, and your Weekly Insight — your tools for growth.",
  },
  {
    icon: <Calendar className="h-6 w-6 text-highlight" />,
    title: "Weekly Insight",
    description:
      "Every week we summarise your patterns, strengths, and a gentle suggestion. Tap the calendar icon (top-right) to see it.",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Friend Support",
    description:
      "Save encouraging messages from friends. They appear during pauses to remind you that you're not alone.",
  },
  {
    icon: <Beaker className="h-6 w-6 text-primary" />,
    title: "Experiments",
    description:
      "Try small, time-boxed challenges to test what works for you. Tap the beaker icon to start one.",
  },
];

const STORAGE_KEY = "dashboard_tour_completed";

export const hasSeenDashboardTour = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "true";
};

interface DashboardTourProps {
  open: boolean;
  onClose: () => void;
}

export const DashboardTour = ({ open, onClose }: DashboardTourProps) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  if (!open) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-float-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-soft p-6">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Skip tour"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4">
          {step.icon}
        </div>

        <h2 id="tour-title" className="font-display text-2xl text-foreground text-center mb-2">
          {step.title}
        </h2>
        <p className="text-muted-foreground text-center leading-relaxed mb-6">{step.description}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!isFirst && (
            <Button variant="calm" size="lg" className="flex-1" onClick={() => setStepIndex((i) => i - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button size="lg" className="flex-1" onClick={handleNext}>
            {isLast ? "Got it" : "Next"}
            {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>

        {!isLast && (
          <button
            type="button"
            onClick={handleClose}
            className="block w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
          >
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
};
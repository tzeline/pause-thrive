import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  message = "Something didn't load right now. You're still okay to continue.",
  onRetry,
  className = ""
}: ErrorMessageProps) {
  return (
    <div className={`p-5 rounded-2xl bg-muted/50 border border-border/50 text-center ${className}`}>
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="mt-3"
        >
          Try again
        </Button>
      )}
    </div>
  );
}

import { Leaf } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message, className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="animate-breathe">
        <Leaf className="h-12 w-12 text-primary" />
      </div>
      {message && (
        <p className="text-muted-foreground mt-4 animate-pulse text-sm">
          {message}
        </p>
      )}
    </div>
  );
}

export function FullPageLoading({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-calm">
      <LoadingSpinner message={message} />
    </div>
  );
}

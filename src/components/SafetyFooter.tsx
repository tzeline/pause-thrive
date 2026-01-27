import { ExternalLink } from "lucide-react";
interface SafetyFooterProps {
  className?: string;
  showDisclaimer?: boolean;
  showCrisisLink?: boolean;
}
export function SafetyFooter({
  className = "",
  showDisclaimer = true,
  showCrisisLink = true
}: SafetyFooterProps) {
  return <div className={`text-center space-y-3 ${className}`}>
      {showDisclaimer && <p className="text-xs text-muted-foreground/70">
          This app is a self-support tool. It is not a substitute for professional therapy or crisis support.
        </p>}
      {showCrisisLink}
    </div>;
}
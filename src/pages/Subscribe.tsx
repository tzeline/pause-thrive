import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, Heart, Infinity, Shield, ArrowLeft, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Subscribe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);

  // During pilot, activate subscription for free
  const handleActivateSubscription = async () => {
    if (!user) return;
    
    setIsActivating(true);
    
    try {
      // Create or update subscription to active
      const { error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          status: "active",
          plan_type: "unlimited",
          started_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      toast.success("Unlimited pauses activated!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <button 
          onClick={() => navigate(-1)} 
          className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-8">
          <div className="text-center space-y-8 animate-float-up w-full">
            {/* Hero */}
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Infinity className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl text-foreground">
                Unlimited Support
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Be there for yourself, whenever you need it.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 text-left">
              <BenefitItem 
                icon={<Heart className="h-4 w-4" />}
                text="Unlimited pauses in moments of temptation"
              />
              <BenefitItem 
                icon={<Shield className="h-4 w-4" />}
                text="Uninterrupted support when it matters most"
              />
              <BenefitItem 
                icon={<Sparkles className="h-4 w-4" />}
                text="Help us continue developing tools that truly help"
              />
            </div>

            {/* Pilot Banner */}
            <div className="p-4 rounded-xl bg-highlight/10 border border-highlight/20">
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-highlight flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Pilot Phase — Free Access
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All premium features are currently available at no cost while we gather feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-4">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleActivateSubscription}
                disabled={isActivating}
              >
                {isActivating ? "Activating..." : "Activate Unlimited Pauses"}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Free during pilot. No payment required.
              </p>
            </div>

            {/* Philosophy */}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground italic">
                "We're limiting access to moments of support, not locking features."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <p className="text-sm text-foreground">{text}</p>
    </div>
  );
}

export default Subscribe;

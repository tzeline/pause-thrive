import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Leaf, Heart, Shield, Sparkles } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-calm">
        <div className="animate-breathe">
          <Leaf className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-calm">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo */}
          <div className="animate-float-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Leaf className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4 animate-float-up delay-100">
            <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              Stillness
            </h1>
            <p className="text-lg text-muted-foreground font-body leading-relaxed">
              A gentle companion for your journey toward self-control
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4 pt-8 animate-float-up delay-200">
            <FeatureItem 
              icon={<Shield className="h-5 w-5" />}
              text="Pause in tempting moments"
            />
            <FeatureItem 
              icon={<Heart className="h-5 w-5" />}
              text="Compassionate support, not judgment"
            />
            <FeatureItem 
              icon={<Sparkles className="h-5 w-5" />}
              text="AI-powered guidance when you need it"
            />
          </div>

          {/* CTA */}
          <div className="pt-8 space-y-4 animate-float-up delay-300">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate("/auth")}
            >
              Begin Your Journey
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/auth?mode=login")}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30 shadow-soft">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-foreground font-medium text-left">{text}</p>
    </div>
  );
}

export default Index;

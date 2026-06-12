import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Contact = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    // Opens default mail client with prefilled content
    const subject = encodeURIComponent("Pause App – Support Request");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:hello@pauseapp.co?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen gradient-calm">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="space-y-8 animate-float-up">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Contact Us</h1>
              <p className="text-sm text-muted-foreground mt-1">We're here to help</p>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-card/50 border border-border/30 rounded-xl p-5 shadow-soft flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Email</p>
                <a
                  href="mailto:hello@pauseapp.co"
                  className="text-primary hover:underline text-sm"
                >
                  hello@pauseapp.co
                </a>
              </div>
            </div>
            <div className="bg-card/50 border border-border/30 rounded-xl p-5 shadow-soft flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Response time</p>
                <p className="text-muted-foreground text-sm">Within 2 business days</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          {!submitted ? (
            <div className="bg-card/50 border border-border/30 rounded-xl p-6 shadow-soft space-y-5">
              <h2 className="font-display text-lg text-foreground">Send us a message</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  rows={5}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                Send Message
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your message will open in your email app, ready to send.
              </p>
            </div>
          ) : (
            <div className="bg-card/50 border border-border/30 rounded-xl p-8 shadow-soft text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-xl text-foreground">Thank you!</h2>
              <p className="text-muted-foreground text-sm">
                Your email app should have opened. If not, write us directly at{" "}
                <a href="mailto:hello@pauseapp.co" className="text-primary hover:underline">
                  hello@pauseapp.co
                </a>
              </p>
              <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
                Back to app
              </Button>
            </div>
          )}

          {/* Crisis note */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
            <p className="text-sm text-foreground font-medium mb-1">⚠️ In a crisis?</p>
            <p className="text-sm text-muted-foreground">
              If you are in immediate distress, please don't wait for our reply. Contact a crisis line directly:{" "}
              <a href="tel:143" className="text-primary hover:underline font-medium">
                143
              </a>{" "}
              (Die Dargebotene Hand, Switzerland) or your local emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground mt-1">Last updated: June 2026</p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Your privacy matters deeply to us. This policy explains what data Pause collects, how we use it, and how we protect it.
          </p>

          {/* Sections */}
          <Section title="1. Who We Are">
            <p>
              Pause ("we", "our", "us") is a self-support app designed to help individuals build self-control and healthier habits. We are not a medical or therapeutic service.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p>We collect only what is necessary to provide the app experience:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-muted-foreground">
              <li><strong className="text-foreground">Account data:</strong> Email address and display name when you register</li>
              <li><strong className="text-foreground">Usage data:</strong> Pause sessions, goals, experiments, and progress you log in the app</li>
              <li><strong className="text-foreground">Device data:</strong> Basic technical information (device type, OS version) for app performance</li>
              <li><strong className="text-foreground">Support data:</strong> Messages you send us via the contact form</li>
            </ul>
            <p className="mt-3">We do not collect location data, contacts, or camera access.</p>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide and improve the Pause app experience</li>
              <li>To personalise your coaching and progress insights</li>
              <li>To respond to support requests</li>
              <li>To send important service-related notifications (not marketing without consent)</li>
            </ul>
          </Section>

          <Section title="4. Data Storage & Security">
            <p>
              Your data is stored securely using Supabase, a trusted cloud infrastructure provider. Data is encrypted in transit (TLS) and at rest. We retain your data for as long as your account is active. You may request deletion at any time.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>
              We do not sell your personal data. We do not share it with third parties for advertising purposes. We may share limited data with service providers (such as our hosting infrastructure) strictly to operate the app.
            </p>
          </Section>

          <Section title="6. Sensitive Information">
            <p>
              Pause may process information related to personal habits and behaviours. This information is treated with the highest level of care. It is never shared with third parties and is used solely to power your in-app experience.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-muted-foreground">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@pauseapp.co" className="text-primary hover:underline">
                privacy@pauseapp.co
              </a>
            </p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              Pause is not intended for children under the age of 13 (or 16 in the EU). We do not knowingly collect data from minors. If you believe a minor has created an account, please contact us immediately.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this policy from time to time. We will notify you of significant changes via the app or email. Continued use of the app after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about this privacy policy? Reach us at{" "}
              <a href="mailto:privacy@pauseapp.co" className="text-primary hover:underline">
                privacy@pauseapp.co
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card/50 border border-border/30 rounded-xl p-6 space-y-3 shadow-soft">
      <h2 className="font-display text-lg text-foreground">{title}</h2>
      <div className="text-muted-foreground leading-relaxed text-sm space-y-2">{children}</div>
    </div>
  );
}

export default Privacy;

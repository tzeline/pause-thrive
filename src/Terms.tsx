import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

const Terms = () => {
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
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Terms & Conditions</h1>
              <p className="text-sm text-muted-foreground mt-1">Last updated: June 2026</p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Please read these terms carefully before using Pause. By using the app, you agree to these terms.
          </p>

          <Section title="1. About Pause">
            <p>
              Pause is a self-support tool designed to help individuals build self-control and healthier habits through guided pauses, reflection, and AI-powered coaching. Pause is <strong className="text-foreground">not a medical service, therapy, or crisis intervention tool</strong>.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years of age (or 16 in the EU) to use Pause. By creating an account, you confirm you meet this requirement. If you are under 18, please use the app with parental consent.
            </p>
          </Section>

          <Section title="3. Your Account">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You are responsible for keeping your account credentials secure</li>
              <li>You are responsible for all activity under your account</li>
              <li>You must provide accurate information when registering</li>
              <li>You may not share your account with others</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-muted-foreground">
              <li>Use Pause for any unlawful purpose</li>
              <li>Attempt to reverse engineer, hack, or disrupt the app</li>
              <li>Submit false or misleading information</li>
              <li>Use the app in a way that harms others</li>
            </ul>
          </Section>

          <Section title="5. Health Disclaimer">
            <p>
              Pause is a <strong className="text-foreground">self-support tool only</strong>. It is not a substitute for professional medical advice, diagnosis, therapy, or treatment. If you are experiencing a mental health crisis, please contact a qualified professional or crisis service immediately.
            </p>
            <p className="mt-2">
              In Switzerland, you can reach the crisis line at{" "}
              <a href="tel:143" className="text-primary hover:underline">143</a> (Die Dargebotene Hand).
            </p>
          </Section>

          <Section title="6. Subscriptions & Payments">
            <p>
              Pause may offer free and paid plans. During the pilot phase, access may be granted at no cost. Any future paid subscriptions will be clearly communicated before purchase. Subscription terms, pricing, and cancellation policies will be presented at the time of purchase.
            </p>
            <p className="mt-2">
              For purchases made through the Apple App Store, Apple's standard terms and refund policies apply.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content, features, and design within Pause are owned by us or licensed to us. You may not reproduce, distribute, or create derivative works without our written permission. Your personal data and content you create in the app remain yours.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Pause is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the app. Our total liability shall not exceed the amount you paid us in the 12 months prior to any claim.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              You may delete your account at any time via the app settings or by contacting us. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your data will be deleted in accordance with our Privacy Policy.
            </p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>
              We may update these terms from time to time. We will notify you of significant changes via the app or email. Continued use of the app after changes means you accept the updated terms.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These terms are governed by the laws of Switzerland. Any disputes shall be subject to the exclusive jurisdiction of the courts of Zurich, Switzerland.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Questions about these terms? Reach us at{" "}
              <a href="mailto:hello@pauseapp.co" className="text-primary hover:underline">
                hello@pauseapp.co
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

export default Terms;

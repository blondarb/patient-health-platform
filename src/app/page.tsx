import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Brain, Users } from "lucide-react";

const valueProps = [
  {
    icon: FileText,
    title: "See all your records",
    description: "Lab results, medications, conditions, and visits from every provider — in one place.",
  },
  {
    icon: Brain,
    title: "Understand your health",
    description: "AI-powered plain-language explanations of your test results and health trends.",
  },
  {
    icon: Users,
    title: "Share on your terms",
    description: "Control who sees your data. Share with caregivers or providers with one tap.",
  },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-10 w-10 text-brand-teal" aria-hidden="true" />
          <span className="text-2xl font-bold text-brand-navy">MyHealthRecord</span>
        </div>

        {/* Hero */}
        <h1 className="text-3xl font-bold text-brand-navy leading-tight mb-4">
          Your health data.{" "}
          <span className="text-brand-teal">Your control.</span>{" "}
          Your understanding.
        </h1>

        <p className="text-text-secondary mb-8">
          See records from every provider in Montana, understand your results in plain language,
          and share securely — all in one place.
        </p>

        {/* Value props */}
        <div className="space-y-4 mb-8 w-full text-left">
          {valueProps.map((prop) => {
            const Icon = prop.icon;
            return (
              <div key={prop.title} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brand-teal/10 shrink-0">
                  <Icon className="h-5 w-5 text-brand-teal" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">{prop.title}</h2>
                  <p className="text-sm text-text-secondary">{prop.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Link href="/onboarding" className="w-full">
          <Button className="w-full min-h-[48px] text-base bg-brand-teal hover:bg-brand-teal/90">
            Get Started
          </Button>
        </Link>

        {/* Sign in link */}
        <p className="text-sm text-text-secondary mt-4">
          Already have an account?{" "}
          <Link href="/dashboard" className="text-brand-teal hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted">
        <p>Data sourced from Big Sky Care Connect — Montana&apos;s Health Information Exchange</p>
      </footer>
    </div>
  );
}

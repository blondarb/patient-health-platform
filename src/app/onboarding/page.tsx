"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";

type Step = "identity" | "verifying" | "found";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identity");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [ssn4, setSsn4] = useState("");
  const [zip, setZip] = useState("");
  const [recordCounts, setRecordCounts] = useState({ labs: 0, meds: 0, visits: 0 });

  const canSubmit = name.length > 2 && dob && ssn4.length === 4 && zip.length === 5;

  const handleVerify = () => {
    setStep("verifying");

    // Simulate verification delay
    setTimeout(() => {
      setStep("found");
      // Animate counts
      const targets = { labs: 47, meds: 12, visits: 8 };
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        setRecordCounts({
          labs: Math.min(Math.round((frame / 20) * targets.labs), targets.labs),
          meds: Math.min(Math.round((frame / 20) * targets.meds), targets.meds),
          visits: Math.min(Math.round((frame / 20) * targets.visits), targets.visits),
        });
        if (frame >= 20) clearInterval(interval);
      }, 50);
    }, 2000);
  };

  const steps = [
    { key: "identity", label: "Verify Identity" },
    { key: "verifying", label: "Finding Records" },
    { key: "found", label: "See Your Records" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= currentIdx
                    ? "bg-brand-teal text-white"
                    : "bg-surface-bg text-text-muted border border-surface-border"
                }`}
              >
                {i < currentIdx ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 ${
                    i < currentIdx ? "bg-brand-teal" : "bg-surface-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Identity step */}
        {step === "identity" && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-brand-teal" aria-hidden="true" />
              <h1 className="text-xl font-bold text-brand-navy">Verify Your Identity</h1>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              We&apos;ll use this information to find your health records from providers across Montana.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                  Full Legal Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Margaret Thompson"
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-text-primary mb-1">
                  Date of Birth
                </label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="ssn4" className="block text-sm font-medium text-text-primary mb-1">
                  Last 4 of SSN
                </label>
                <Input
                  id="ssn4"
                  value={ssn4}
                  onChange={(e) => setSsn4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  className="min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-text-primary mb-1">
                  Montana ZIP Code
                </label>
                <Input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="59301"
                  maxLength={5}
                  className="min-h-[44px]"
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={!canSubmit}
                className="w-full min-h-[48px] bg-brand-teal hover:bg-brand-teal/90"
              >
                Find My Records
              </Button>
            </div>
          </Card>
        )}

        {/* Verifying step */}
        {step === "verifying" && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-brand-teal animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-navy mb-2">
              Searching Montana&apos;s health records...
            </h2>
            <p className="text-sm text-text-secondary">
              Connecting to Big Sky Care Connect
            </p>
          </div>
        )}

        {/* Found step */}
        {step === "found" && (
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-status-normal mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-navy mb-2">
              We found your records from 4 providers across Montana!
            </h2>

            <div className="flex justify-center gap-6 my-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-teal">{recordCounts.labs}</p>
                <p className="text-sm text-text-secondary">Lab results</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-teal">{recordCounts.meds}</p>
                <p className="text-sm text-text-secondary">Medications</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-teal">{recordCounts.visits}</p>
                <p className="text-sm text-text-secondary">Visits</p>
              </div>
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full min-h-[48px] bg-brand-teal hover:bg-brand-teal/90"
            >
              See My Health Records
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Shield, Heart, Users, Baby, ChevronRight } from "lucide-react";
import { DEMO_PATIENTS, useDemoPatient } from "@/lib/demo-context";

const scenarioIcons = [Heart, Users, Baby];
const scenarioColors = [
  "border-l-amber-500 bg-amber-50",
  "border-l-blue-500 bg-blue-50",
  "border-l-emerald-500 bg-emerald-50",
];
const iconColors = ["text-amber-600", "text-blue-600", "text-emerald-600"];

export default function WelcomePage() {
  const router = useRouter();
  const { setPatientById } = useDemoPatient();

  const handleSelect = (patientId: string) => {
    setPatientById(patientId);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 py-10 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-10 w-10 text-brand-teal" aria-hidden="true" />
          <span className="text-2xl font-bold text-brand-navy">MyHealthRecord</span>
        </div>

        {/* Hero */}
        <h1 className="text-3xl font-bold text-brand-navy leading-tight mb-3 text-center">
          Your health data.{" "}
          <span className="text-brand-teal">Your control.</span>
        </h1>

        <p className="text-text-secondary mb-2 text-center max-w-md">
          See records from every provider, understand your results in plain language,
          and share securely — all in one place.
        </p>

        <div className="bg-brand-teal/10 rounded-lg px-4 py-2 mb-8 text-center">
          <p className="text-sm text-brand-teal font-medium">
            Demo Mode — Choose a patient scenario to explore
          </p>
        </div>

        {/* Scenario cards */}
        <div className="w-full space-y-4">
          {DEMO_PATIENTS.map((patient, i) => {
            const Icon = scenarioIcons[i];
            return (
              <button
                key={patient.id}
                onClick={() => handleSelect(patient.id)}
                className={`w-full text-left rounded-xl border-l-4 ${scenarioColors[i]} p-5 transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    <Icon className={`h-7 w-7 ${iconColors[i]}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-lg font-semibold text-brand-navy">
                        {patient.name}
                      </h2>
                      <ChevronRight className="h-5 w-5 text-text-muted shrink-0" />
                    </div>
                    <p className="text-xs text-text-muted mb-2">Age {patient.age}</p>
                    <p className="text-sm text-text-secondary mb-3">
                      {patient.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {patient.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-xs px-2 py-1 rounded-full bg-white/80 text-text-secondary border border-black/5"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted">
        <p>Synthetic demo data — no real patient information</p>
        <p className="mt-1">Data model based on Big Sky Care Connect — Montana&apos;s Health Information Exchange</p>
      </footer>
    </div>
  );
}

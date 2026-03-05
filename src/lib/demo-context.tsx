"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface DemoPatient {
  id: string;
  name: string;
  shortName: string;
  age: number;
  dateOfBirth: string;
  zipCode: string;
  description: string;
  highlights: string[];
}

export const DEMO_PATIENTS: DemoPatient[] = [
  {
    id: "demo-margaret",
    name: "Margaret Thompson",
    shortName: "Margaret",
    age: 67,
    dateOfBirth: "September 14, 1958",
    zipCode: "59301",
    description:
      "Manages multiple chronic conditions including Type 2 diabetes, chronic kidney disease, and hypertension. Her records show abnormal lab trends that benefit from AI-powered explanations.",
    highlights: ["Abnormal HbA1c & kidney labs", "4 active medications", "AI alerts for lab trends"],
  },
  {
    id: "demo-robert",
    name: "Robert Chen",
    shortName: "Robert",
    age: 78,
    dateOfBirth: "November 28, 1947",
    zipCode: "59457",
    description:
      "Living with congestive heart failure, COPD, and atrial fibrillation. His son David has caregiver access, demonstrating the sharing and family access features.",
    highlights: ["Heart failure monitoring", "Caregiver sharing (son David)", "Complex medication list"],
  },
  {
    id: "demo-emily",
    name: "Emily Ramirez",
    shortName: "Emily",
    age: 35,
    dateOfBirth: "June 22, 1990",
    zipCode: "59401",
    description:
      "A younger patient managing migraines and her 7-year-old daughter Luna's asthma. Shows how the platform works for families and less complex health profiles.",
    highlights: ["Family records (daughter Luna)", "Migraine tracking", "Pediatric asthma management"],
  },
];

interface DemoContextValue {
  patient: DemoPatient;
  setPatientById: (id: string) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<DemoPatient>(DEMO_PATIENTS[0]);

  const setPatientById = (id: string) => {
    const found = DEMO_PATIENTS.find((p) => p.id === id);
    if (found) setPatient(found);
  };

  return (
    <DemoContext.Provider value={{ patient, setPatientById }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoPatient() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoPatient must be used within DemoProvider");
  return ctx;
}

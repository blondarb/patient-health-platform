import { RecordCategory } from "./types";

export const resourceTypeToCategory: Record<string, RecordCategory> = {
  Observation: "labs",
  MedicationRequest: "medications",
  Condition: "conditions",
  Encounter: "visits",
  AllergyIntolerance: "allergies",
  Immunization: "immunizations",
  Procedure: "procedures",
};

export const categoryLabels: Record<RecordCategory, string> = {
  labs: "Lab Results",
  medications: "Medications",
  conditions: "Conditions",
  visits: "Visits",
  allergies: "Allergies",
  immunizations: "Immunizations",
  procedures: "Procedures",
};

export const categoryColors: Record<RecordCategory, string> = {
  labs: "#3498DB",
  medications: "#27AE60",
  conditions: "#0D2137",
  visits: "#8E44AD",
  allergies: "#E74C3C",
  immunizations: "#0A7E8C",
  procedures: "#E67E22",
};

export const categoryIcons: Record<RecordCategory, string> = {
  labs: "flask-conical",
  medications: "pill",
  conditions: "heart-pulse",
  visits: "stethoscope",
  allergies: "shield-alert",
  immunizations: "syringe",
  procedures: "scissors",
};

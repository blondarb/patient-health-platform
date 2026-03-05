// FHIR R4 TypeScript interfaces (subset for this platform)

export interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

export interface FhirReference {
  reference?: string;
  display?: string;
}

export interface FhirQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FhirPeriod {
  start?: string;
  end?: string;
}

export interface FhirReferenceRange {
  low?: FhirQuantity;
  high?: FhirQuantity;
  text?: string;
}

export interface FhirDosageInstruction {
  text?: string;
  timing?: {
    repeat?: {
      frequency?: number;
      period?: number;
      periodUnit?: string;
    };
  };
  route?: FhirCodeableConcept;
  doseAndRate?: Array<{
    doseQuantity?: FhirQuantity;
  }>;
}

export interface FhirReaction {
  manifestation?: FhirCodeableConcept[];
  severity?: string;
}

// Resource types

export interface FhirPatient {
  resourceType: "Patient";
  id: string;
  name?: Array<{ given?: string[]; family?: string; text?: string }>;
  birthDate?: string;
  gender?: string;
  address?: Array<{ postalCode?: string; city?: string; state?: string }>;
}

export interface FhirObservation {
  resourceType: "Observation";
  id: string;
  status: string;
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject?: FhirReference;
  effectiveDateTime?: string;
  valueQuantity?: FhirQuantity;
  referenceRange?: FhirReferenceRange[];
  interpretation?: FhirCodeableConcept[];
  performer?: FhirReference[];
  component?: Array<{
    code: FhirCodeableConcept;
    valueQuantity?: FhirQuantity;
    referenceRange?: FhirReferenceRange[];
    interpretation?: FhirCodeableConcept[];
  }>;
}

export interface FhirMedicationRequest {
  resourceType: "MedicationRequest";
  id: string;
  status: string;
  intent: string;
  medicationCodeableConcept?: FhirCodeableConcept;
  subject?: FhirReference;
  authoredOn?: string;
  requester?: FhirReference;
  dosageInstruction?: FhirDosageInstruction[];
}

export interface FhirCondition {
  resourceType: "Condition";
  id: string;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject?: FhirReference;
  onsetDateTime?: string;
  recorder?: FhirReference;
}

export interface FhirAllergyIntolerance {
  resourceType: "AllergyIntolerance";
  id: string;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  type?: string;
  category?: string[];
  criticality?: string;
  code: FhirCodeableConcept;
  patient?: FhirReference;
  reaction?: FhirReaction[];
}

export interface FhirEncounter {
  resourceType: "Encounter";
  id: string;
  status: string;
  class?: FhirCoding;
  type?: FhirCodeableConcept[];
  subject?: FhirReference;
  period?: FhirPeriod;
  serviceProvider?: FhirReference;
  participant?: Array<{
    individual?: FhirReference;
  }>;
  reasonCode?: FhirCodeableConcept[];
}

export interface FhirImmunization {
  resourceType: "Immunization";
  id: string;
  status: string;
  vaccineCode: FhirCodeableConcept;
  patient?: FhirReference;
  occurrenceDateTime?: string;
  performer?: Array<{ actor?: FhirReference }>;
}

export interface FhirProcedure {
  resourceType: "Procedure";
  id: string;
  status: string;
  code: FhirCodeableConcept;
  subject?: FhirReference;
  performedDateTime?: string;
  performedPeriod?: FhirPeriod;
  performer?: Array<{ actor?: FhirReference }>;
}

export type FhirResource =
  | FhirPatient
  | FhirObservation
  | FhirMedicationRequest
  | FhirCondition
  | FhirAllergyIntolerance
  | FhirEncounter
  | FhirImmunization
  | FhirProcedure;

export interface FhirBundle {
  resourceType: "Bundle";
  type: string;
  entry?: Array<{
    resource: FhirResource;
  }>;
}

// Display models (transformed from FHIR)

export type RecordCategory =
  | "labs"
  | "medications"
  | "conditions"
  | "visits"
  | "allergies"
  | "immunizations"
  | "procedures";

export type RecordStatus = "normal" | "abnormal" | "critical" | "active" | "resolved";

export interface DisplayRecord {
  id: string;
  resourceType: string;
  fhirId: string;
  category: RecordCategory;
  title: string;
  summary?: string;
  effectiveDate: string;
  source: string;
  facility?: string;
  provider?: string;
  status: RecordStatus;
  numericValue?: number;
  unit?: string;
  refRangeLow?: number;
  refRangeHigh?: number;
  data: string; // Full FHIR JSON
}

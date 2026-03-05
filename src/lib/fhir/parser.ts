import {
  FhirBundle,
  FhirResource,
  FhirObservation,
  FhirMedicationRequest,
  FhirCondition,
  FhirAllergyIntolerance,
  FhirEncounter,
  FhirImmunization,
  FhirProcedure,
  DisplayRecord,
  RecordStatus,
  RecordCategory,
} from "./types";
import { resourceTypeToCategory } from "./categories";

const HIE_SOURCE = "Big Sky Care Connect";

function getStatus(interpretation?: Array<{ coding?: Array<{ code?: string }> }>): RecordStatus {
  if (!interpretation?.length) return "normal";
  const code = interpretation[0]?.coding?.[0]?.code;
  switch (code) {
    case "H":
    case "HH":
    case "L":
    case "LL":
      return code === "HH" || code === "LL" ? "critical" : "abnormal";
    case "A":
    case "AA":
      return code === "AA" ? "critical" : "abnormal";
    default:
      return "normal";
  }
}

function parseObservation(obs: FhirObservation): DisplayRecord {
  const title = obs.code?.text || obs.code?.coding?.[0]?.display || "Lab Result";
  const value = obs.valueQuantity?.value;
  const unit = obs.valueQuantity?.unit;
  const refLow = obs.referenceRange?.[0]?.low?.value;
  const refHigh = obs.referenceRange?.[0]?.high?.value;
  const status = getStatus(obs.interpretation);

  return {
    id: "",
    resourceType: "Observation",
    fhirId: obs.id,
    category: "labs",
    title,
    effectiveDate: obs.effectiveDateTime || "",
    source: HIE_SOURCE,
    facility: obs.performer?.[0]?.display,
    status,
    numericValue: value,
    unit: unit,
    refRangeLow: refLow,
    refRangeHigh: refHigh,
    data: JSON.stringify(obs),
  };
}

function parseMedicationRequest(med: FhirMedicationRequest): DisplayRecord {
  const title =
    med.medicationCodeableConcept?.text ||
    med.medicationCodeableConcept?.coding?.[0]?.display ||
    "Medication";
  const dosage = med.dosageInstruction?.[0]?.text || "";

  return {
    id: "",
    resourceType: "MedicationRequest",
    fhirId: med.id,
    category: "medications",
    title,
    summary: dosage,
    effectiveDate: med.authoredOn || "",
    source: HIE_SOURCE,
    facility: med.requester?.display,
    status: med.status === "active" ? "active" : "resolved",
    data: JSON.stringify(med),
  };
}

function parseCondition(cond: FhirCondition): DisplayRecord {
  const title = cond.code?.text || cond.code?.coding?.[0]?.display || "Condition";
  const clinicalStatus = cond.clinicalStatus?.coding?.[0]?.code;

  return {
    id: "",
    resourceType: "Condition",
    fhirId: cond.id,
    category: "conditions",
    title,
    effectiveDate: cond.onsetDateTime || "",
    source: HIE_SOURCE,
    facility: cond.recorder?.display,
    status: clinicalStatus === "active" ? "active" : "resolved",
    data: JSON.stringify(cond),
  };
}

function parseAllergyIntolerance(allergy: FhirAllergyIntolerance): DisplayRecord {
  const title = allergy.code?.text || allergy.code?.coding?.[0]?.display || "Allergy";
  const severity = allergy.criticality === "high" ? "critical" : "abnormal";

  return {
    id: "",
    resourceType: "AllergyIntolerance",
    fhirId: allergy.id,
    category: "allergies",
    title,
    summary: allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display,
    effectiveDate: "",
    source: HIE_SOURCE,
    status: severity,
    data: JSON.stringify(allergy),
  };
}

function parseEncounter(enc: FhirEncounter): DisplayRecord {
  const title = enc.type?.[0]?.text || enc.type?.[0]?.coding?.[0]?.display || "Visit";
  const reason = enc.reasonCode?.[0]?.text || enc.reasonCode?.[0]?.coding?.[0]?.display;

  return {
    id: "",
    resourceType: "Encounter",
    fhirId: enc.id,
    category: "visits",
    title,
    summary: reason,
    effectiveDate: enc.period?.start || "",
    source: HIE_SOURCE,
    facility: enc.serviceProvider?.display,
    provider: enc.participant?.[0]?.individual?.display,
    status: enc.status === "finished" ? "normal" : "active",
    data: JSON.stringify(enc),
  };
}

function parseImmunization(imm: FhirImmunization): DisplayRecord {
  const title = imm.vaccineCode?.text || imm.vaccineCode?.coding?.[0]?.display || "Immunization";

  return {
    id: "",
    resourceType: "Immunization",
    fhirId: imm.id,
    category: "immunizations",
    title,
    effectiveDate: imm.occurrenceDateTime || "",
    source: HIE_SOURCE,
    facility: imm.performer?.[0]?.actor?.display,
    status: "normal",
    data: JSON.stringify(imm),
  };
}

function parseProcedure(proc: FhirProcedure): DisplayRecord {
  const title = proc.code?.text || proc.code?.coding?.[0]?.display || "Procedure";

  return {
    id: "",
    resourceType: "Procedure",
    fhirId: proc.id,
    category: "procedures",
    title,
    effectiveDate: proc.performedDateTime || proc.performedPeriod?.start || "",
    source: HIE_SOURCE,
    facility: proc.performer?.[0]?.actor?.display,
    status: proc.status === "completed" ? "normal" : "active",
    data: JSON.stringify(proc),
  };
}

export function parseFhirResource(resource: FhirResource): DisplayRecord | null {
  switch (resource.resourceType) {
    case "Observation":
      return parseObservation(resource);
    case "MedicationRequest":
      return parseMedicationRequest(resource);
    case "Condition":
      return parseCondition(resource);
    case "AllergyIntolerance":
      return parseAllergyIntolerance(resource);
    case "Encounter":
      return parseEncounter(resource);
    case "Immunization":
      return parseImmunization(resource);
    case "Procedure":
      return parseProcedure(resource);
    case "Patient":
      return null; // Patient resource doesn't map to a record
    default:
      return null;
  }
}

export function parseFhirBundle(bundle: FhirBundle): DisplayRecord[] {
  if (!bundle.entry) return [];

  return bundle.entry
    .map((entry) => parseFhirResource(entry.resource))
    .filter((record): record is DisplayRecord => record !== null)
    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
}

export function getCategoryFromResourceType(resourceType: string): RecordCategory {
  return resourceTypeToCategory[resourceType] || "labs";
}

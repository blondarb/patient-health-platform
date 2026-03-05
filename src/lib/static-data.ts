/**
 * Static data store — pre-parsed FHIR bundles for all demo patients.
 * Replaces the database for Vercel deployment (read-only demo data).
 */
import { parseFhirBundle } from "@/lib/fhir/parser";
import { DisplayRecord, FhirBundle } from "@/lib/fhir/types";

import margaretBundle from "@/data/patients/margaret-thompson.json";
import robertBundle from "@/data/patients/robert-chen.json";
import emilyBundle from "@/data/patients/emily-ramirez.json";

function loadPatient(bundle: unknown, userId: string): DisplayRecord[] {
  const records = parseFhirBundle(bundle as FhirBundle);
  return records.map((r, i) => ({
    ...r,
    id: `${userId}-${i}`,
  }));
}

const allRecords: Record<string, DisplayRecord[]> = {
  "demo-margaret": loadPatient(margaretBundle, "demo-margaret"),
  "demo-robert": loadPatient(robertBundle, "demo-robert"),
  "demo-emily": loadPatient(emilyBundle, "demo-emily"),
};

/** Get all records for a patient, optionally filtered */
export function getRecords(
  userId: string,
  options?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
): { records: DisplayRecord[]; total: number } {
  let records = allRecords[userId] || [];

  if (options?.category) {
    records = records.filter((r) => r.category === options.category);
  }
  if (options?.status) {
    records = records.filter((r) => r.status === options.status);
  }

  const total = records.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return {
    records: records.slice(offset, offset + limit),
    total,
  };
}

/** Get a single record by ID */
export function getRecordById(id: string): {
  record: DisplayRecord | null;
  relatedRecords: DisplayRecord[];
} {
  for (const userId of Object.keys(allRecords)) {
    const record = allRecords[userId].find((r) => r.id === id);
    if (record) {
      const relatedRecords = allRecords[userId]
        .filter(
          (r) =>
            r.title === record.title &&
            r.category === record.category &&
            r.id !== record.id
        )
        .sort(
          (a, b) =>
            new Date(a.effectiveDate).getTime() -
            new Date(b.effectiveDate).getTime()
        );
      return { record, relatedRecords };
    }
  }
  return { record: null, relatedRecords: [] };
}

/** Get all records for a patient as DisplayRecord[] (for AI context) */
export function getAllRecordsForUser(userId: string): DisplayRecord[] {
  return allRecords[userId] || [];
}

/** Default caregiver grants per patient (demo data) */
export const defaultGrants: Record<
  string,
  Array<{
    id: string;
    caregiverName: string;
    caregiverEmail: string;
    accessLevel: string;
    permissions: Record<string, boolean>;
  }>
> = {
  "demo-robert": [
    {
      id: "grant-david-chen",
      caregiverName: "David Chen",
      caregiverEmail: "david.chen@example.com",
      accessLevel: "view_ai",
      permissions: {
        labs: true,
        medications: true,
        conditions: true,
        visits: true,
        allergies: true,
        immunizations: true,
        procedures: true,
      },
    },
  ],
};

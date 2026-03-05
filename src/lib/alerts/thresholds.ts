import { DisplayRecord } from "@/lib/fhir/types";

export type AlertSeverity = "critical" | "attention" | "info";

export interface HealthAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  actionText: string;
  recordId: string;
  testName: string;
  value: number;
  unit: string;
}

interface ThresholdRule {
  testNames: string[];
  loincCodes: string[];
  abnormalLow?: number;
  abnormalHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  abnormalMessage: string;
  criticalMessage: string;
}

const thresholdRules: ThresholdRule[] = [
  {
    testNames: ["HbA1c", "Hemoglobin A1c"],
    loincCodes: ["4548-4"],
    abnormalHigh: 6.5,
    criticalHigh: 9.0,
    abnormalMessage: "Your HbA1c shows diabetes range. Your care team is monitoring this.",
    criticalMessage: "Your blood sugar marker is significantly elevated. Discuss with your provider.",
  },
  {
    testNames: ["Creatinine"],
    loincCodes: ["2160-0"],
    abnormalHigh: 1.3,
    criticalHigh: 4.0,
    abnormalMessage: "Your kidney function marker is elevated.",
    criticalMessage: "Your kidney function marker is critically elevated. Contact your provider promptly.",
  },
  {
    testNames: ["eGFR", "Glomerular filtration rate"],
    loincCodes: ["98979-8"],
    abnormalLow: 30,
    criticalLow: 30,
    abnormalMessage: "Your kidney filtration rate needs attention.",
    criticalMessage: "Your kidney filtration rate is critically low. Contact your provider promptly.",
  },
  {
    testNames: ["Potassium"],
    loincCodes: ["2823-3"],
    abnormalLow: 3.5,
    abnormalHigh: 5.0,
    criticalLow: 3.0,
    criticalHigh: 5.5,
    abnormalMessage: "Your potassium level is outside the normal range.",
    criticalMessage:
      "Your potassium level is outside the safe range. Contact your provider promptly.",
  },
  {
    testNames: ["BNP", "Natriuretic peptide B"],
    loincCodes: ["42637-9"],
    abnormalHigh: 100,
    criticalHigh: 400,
    abnormalMessage: "Your heart failure marker is elevated.",
    criticalMessage: "Your heart failure marker is significantly elevated. Contact your provider.",
  },
  {
    testNames: ["Glucose", "Fasting glucose"],
    loincCodes: ["1558-6"],
    abnormalHigh: 125,
    criticalHigh: 250,
    abnormalMessage: "Your blood sugar needs attention.",
    criticalMessage: "Your blood sugar is critically elevated. Contact your provider promptly.",
  },
];

function matchesRule(record: DisplayRecord, rule: ThresholdRule): boolean {
  const titleLower = record.title.toLowerCase();
  const nameMatch = rule.testNames.some((name) => titleLower.includes(name.toLowerCase()));
  if (nameMatch) return true;

  try {
    const data = JSON.parse(record.data);
    const codes = data.code?.coding?.map((c: { code: string }) => c.code) || [];
    return rule.loincCodes.some((loinc) => codes.includes(loinc));
  } catch {
    return false;
  }
}

export function evaluateAlerts(records: DisplayRecord[]): HealthAlert[] {
  const alerts: HealthAlert[] = [];

  // Only evaluate lab records with numeric values
  const labRecords = records.filter(
    (r) => r.category === "labs" && r.numericValue !== undefined && r.numericValue !== null
  );

  // Group by test name, take most recent
  const latestByTest = new Map<string, DisplayRecord>();
  for (const record of labRecords) {
    const existing = latestByTest.get(record.title);
    if (
      !existing ||
      new Date(record.effectiveDate) > new Date(existing.effectiveDate)
    ) {
      latestByTest.set(record.title, record);
    }
  }

  for (const record of latestByTest.values()) {
    const value = record.numericValue!;

    for (const rule of thresholdRules) {
      if (!matchesRule(record, rule)) continue;

      // Check critical first
      const isCriticalLow = rule.criticalLow !== undefined && value < rule.criticalLow;
      const isCriticalHigh = rule.criticalHigh !== undefined && value > rule.criticalHigh;
      if (isCriticalLow || isCriticalHigh) {
        alerts.push({
          id: `alert-critical-${record.fhirId}`,
          severity: "critical",
          title: record.title,
          message: rule.criticalMessage,
          actionText: "Contact your provider promptly",
          recordId: record.id,
          testName: record.title,
          value,
          unit: record.unit || "",
        });
        break;
      }

      // Check abnormal
      const isAbnormalLow = rule.abnormalLow !== undefined && value < rule.abnormalLow;
      const isAbnormalHigh = rule.abnormalHigh !== undefined && value > rule.abnormalHigh;
      if (isAbnormalLow || isAbnormalHigh) {
        alerts.push({
          id: `alert-abnormal-${record.fhirId}`,
          severity: "attention",
          title: record.title,
          message: rule.abnormalMessage,
          actionText: "Discuss at your next visit",
          recordId: record.id,
          testName: record.title,
          value,
          unit: record.unit || "",
        });
        break;
      }
    }
  }

  // Sort: critical first, then attention, then info
  const severityOrder: Record<AlertSeverity, number> = { critical: 0, attention: 1, info: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

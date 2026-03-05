import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { parseFhirBundle } from "../fhir/parser";
import { FhirBundle } from "../fhir/types";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

interface PatientConfig {
  filename: string;
  userId: string;
  email: string;
  name: string;
  dateOfBirth: string;
  zipCode: string;
}

const patients: PatientConfig[] = [
  {
    filename: "margaret-thompson.json",
    userId: "demo-margaret",
    email: "margaret.thompson@example.com",
    name: "Margaret Thompson",
    dateOfBirth: "1958-09-14",
    zipCode: "59301",
  },
  {
    filename: "robert-chen.json",
    userId: "demo-robert",
    email: "robert.chen@example.com",
    name: "Robert Chen",
    dateOfBirth: "1947-11-28",
    zipCode: "59457",
  },
  {
    filename: "emily-ramirez.json",
    userId: "demo-emily",
    email: "emily.ramirez@example.com",
    name: "Emily Ramirez",
    dateOfBirth: "1990-06-22",
    zipCode: "59401",
  },
];

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.aIQueryLog.deleteMany();
  await prisma.aIQuery.deleteMany();
  await prisma.providerLink.deleteMany();
  await prisma.shareGrant.deleteMany();
  await prisma.cachedRecord.deleteMany();
  await prisma.patientFhirCache.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleared existing data.");

  for (const config of patients) {
    const dataPath = path.join(
      process.cwd(),
      "src",
      "data",
      "patients",
      config.filename
    );

    if (!fs.existsSync(dataPath)) {
      console.warn(`Skipping ${config.name}: ${dataPath} not found`);
      continue;
    }

    console.log(`Processing ${config.name}...`);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: config.userId,
        email: config.email,
        name: config.name,
        dateOfBirth: new Date(config.dateOfBirth),
        zipCode: config.zipCode,
        verified: true,
      },
    });

    // Read and parse FHIR bundle
    const rawJson = fs.readFileSync(dataPath, "utf-8");
    const bundle: FhirBundle = JSON.parse(rawJson);
    const displayRecords = parseFhirBundle(bundle);

    console.log(
      `  Parsed ${displayRecords.length} records from ${bundle.entry?.length || 0} FHIR resources`
    );

    // Insert records
    for (const record of displayRecords) {
      await prisma.cachedRecord.create({
        data: {
          userId: user.id,
          resourceType: record.resourceType,
          fhirId: record.fhirId,
          category: record.category,
          title: record.title,
          summary: record.summary,
          data: record.data,
          effectiveDate: record.effectiveDate
            ? new Date(record.effectiveDate)
            : new Date(),
          source: record.source,
          facility: record.facility,
          provider: record.provider,
          status: record.status,
          numericValue: record.numericValue,
          unit: record.unit,
          refRangeLow: record.refRangeLow,
          refRangeHigh: record.refRangeHigh,
        },
      });
    }

    // Cache the FHIR bundle
    await prisma.patientFhirCache.create({
      data: {
        userId: user.id,
        fhirPatientId: config.userId,
        fhirBundle: rawJson,
        resourceCount: bundle.entry?.length || 0,
        lastModifiedAt: new Date(),
        status: "fresh",
      },
    });

    // Add demo sharing data for Robert Chen (David caregiver)
    if (config.userId === "demo-robert") {
      await prisma.shareGrant.create({
        data: {
          userId: user.id,
          caregiverEmail: "david.chen@example.com",
          caregiverName: "David Chen",
          permissions: JSON.stringify({
            labs: true,
            medications: true,
            conditions: true,
            visits: true,
            allergies: true,
            immunizations: true,
            procedures: true,
          }),
          accessLevel: "view_ai",
        },
      });
    }

    console.log(`  Created user ${config.name} with ${displayRecords.length} records`);
  }

  console.log("Seed complete!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

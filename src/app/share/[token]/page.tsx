import { prisma } from "@/lib/prisma";
import { Shield, AlertTriangle, Clock } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { RecordStatus } from "@/lib/fhir/types";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  // Validate token
  const link = await prisma.providerLink.findUnique({ where: { token } });

  if (!link) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-status-critical mx-auto mb-4" />
          <h1 className="text-xl font-bold text-brand-navy mb-2">Invalid Link</h1>
          <p className="text-text-secondary">This provider link is not valid or has been removed.</p>
        </div>
      </div>
    );
  }

  if (link.revokedAt) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-status-abnormal mx-auto mb-4" />
          <h1 className="text-xl font-bold text-brand-navy mb-2">Link Revoked</h1>
          <p className="text-text-secondary">
            The patient has revoked this link. Please request a new link from the patient.
          </p>
        </div>
      </div>
    );
  }

  if (isPast(link.expiresAt)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Clock className="h-12 w-12 text-status-abnormal mx-auto mb-4" />
          <h1 className="text-xl font-bold text-brand-navy mb-2">Link Expired</h1>
          <p className="text-text-secondary">
            This link has expired. Please request a new link from the patient.
          </p>
        </div>
      </div>
    );
  }

  // Update access log
  await prisma.providerLink.update({
    where: { id: link.id },
    data: {
      accessedAt: new Date(),
      accessCount: { increment: 1 },
    },
  });

  // Fetch patient data
  const user = await prisma.user.findUnique({ where: { id: link.userId } });
  const scope = JSON.parse(link.scope) as Record<string, boolean>;
  const allowedCategories = Object.entries(scope)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const records = await prisma.cachedRecord.findMany({
    where: {
      userId: link.userId,
      category: { in: allowedCategories },
    },
    orderBy: { effectiveDate: "desc" },
  });

  // Group records by category
  const grouped = records.reduce<Record<string, typeof records>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    labs: "Lab Results",
    medications: "Medications",
    conditions: "Conditions",
    visits: "Visits",
    allergies: "Allergies",
    immunizations: "Immunizations",
    procedures: "Procedures",
  };

  const statusStyles: Record<string, string> = {
    normal: "bg-green-50 text-green-700 border-green-200",
    abnormal: "bg-yellow-50 text-yellow-700 border-yellow-200",
    critical: "bg-red-50 text-red-700 border-red-200",
    active: "bg-teal-50 text-teal-700 border-teal-200",
    resolved: "bg-gray-50 text-gray-500 border-gray-200",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#0A7E8C]" />
            <span className="text-lg font-bold text-[#0D2137]">MyHealthRecord</span>
          </div>
          <div className="text-sm text-gray-500">
            Shared link • Expires{" "}
            {format(link.expiresAt, "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Patient info */}
        {user && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h1 className="text-xl font-bold text-[#0D2137]">{user.name}</h1>
            <p className="text-sm text-gray-500">
              DOB: {format(user.dateOfBirth, "MMMM d, yyyy")} • {records.length} records shared
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Data sourced from Big Sky Care Connect
            </p>
          </div>
        )}

        {/* Records by category */}
        {Object.entries(grouped).map(([category, catRecords]) => (
          <section key={category} className="mb-6">
            <h2 className="text-lg font-bold text-[#0D2137] mb-3">
              {categoryLabels[category] || category} ({catRecords.length})
            </h2>
            <div className="space-y-2">
              {catRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-[#0D2137]">{record.title}</h3>
                      {record.numericValue !== null && (
                        <p className="text-lg font-bold text-[#0D2137] mt-1">
                          {record.numericValue} {record.unit}
                          {record.refRangeLow !== null && record.refRangeHigh !== null && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                              (ref: {record.refRangeLow}–{record.refRangeHigh})
                            </span>
                          )}
                        </p>
                      )}
                      {record.summary && (
                        <p className="text-sm text-gray-600 mt-1">{record.summary}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {format(record.effectiveDate, "MMM d, yyyy")}
                        {record.facility ? ` • ${record.facility}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        statusStyles[record.status as RecordStatus] || statusStyles.normal
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Footer disclaimer */}
        <div className="text-center text-xs text-gray-400 mt-8 pb-8">
          <p>This is a read-only view of patient health records shared via MyHealthRecord.</p>
          <p>Data sourced from Big Sky Care Connect — Montana&apos;s Health Information Exchange.</p>
        </div>
      </main>
    </div>
  );
}

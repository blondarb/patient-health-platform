import { Shield, AlertTriangle } from "lucide-react";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  // In demo mode, provider links are generated client-side and not persisted.
  // A real deployment would validate the token against a database.
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#0A7E8C]" />
          <span className="text-lg font-bold text-[#0D2137]">MyHealthRecord</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-status-abnormal mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0D2137] mb-2">Demo Mode</h1>
          <p className="text-gray-500 mb-2">
            Provider share links are not persisted in demo mode.
          </p>
          <p className="text-sm text-gray-400">
            In a production deployment with a database, this link ({token.slice(0, 8)}…)
            would display the patient&apos;s shared health records.
          </p>
        </div>
      </main>
    </div>
  );
}

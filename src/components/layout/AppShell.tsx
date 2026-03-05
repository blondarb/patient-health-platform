"use client";

import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-60 pb-16 md:pb-0">
        <div className="max-w-[720px] mx-auto px-4 py-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}

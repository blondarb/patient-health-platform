"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Brain, Users, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home, section: "Main" },
  { href: "/records", label: "Records", icon: ClipboardList, section: "Main" },
  { href: "/ai", label: "Ask AI", icon: Brain, section: "Main" },
  { href: "/sharing", label: "Sharing", icon: Users, section: "Manage" },
  { href: "/settings", label: "Settings", icon: Settings, section: "Manage" },
];

export function Sidebar() {
  const pathname = usePathname();

  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  return (
    <aside
      className="hidden lg:flex flex-col w-60 bg-white border-r border-surface-border h-screen fixed left-0 top-0"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-brand-teal" aria-hidden="true" />
          <span className="text-lg font-bold text-brand-navy">MyHealthRecord</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3">
        {sections.map((section) => (
          <div key={section} className="mb-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">
              {section}
            </p>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                      isActive
                        ? "bg-brand-teal/10 text-brand-teal"
                        : "text-text-secondary hover:bg-surface-bg hover:text-text-primary"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-border">
        <p className="text-xs text-text-muted">Data from Big Sky Care Connect</p>
      </div>
    </aside>
  );
}

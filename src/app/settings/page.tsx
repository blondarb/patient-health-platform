"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Bell, Eye, MessageSquare, Shield } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    newResults: true,
    sharingActivity: true,
    weeklyDigest: false,
  });
  const [aiHistory, setAiHistory] = useState(true);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Settings</h1>

      {/* Profile */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-bold text-brand-navy">Profile</h2>
        </div>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Name</span>
              <span className="text-sm font-medium">Margaret Thompson</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Date of Birth</span>
              <span className="text-sm font-medium">September 14, 1958</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">ZIP Code</span>
              <span className="text-sm font-medium">59301</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Data Source</span>
              <span className="text-sm font-medium">Big Sky Care Connect</span>
            </div>
          </div>
        </Card>
      </section>

      <Separator className="mb-6" />

      {/* Notifications */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-bold text-brand-navy">Notifications</h2>
        </div>
        <Card className="p-4 space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between min-h-[44px] cursor-pointer">
              <span className="text-sm text-text-primary">
                {key === "criticalAlerts"
                  ? "Critical lab alerts"
                  : key === "newResults"
                  ? "New results available"
                  : key === "sharingActivity"
                  ? "Sharing activity"
                  : "Weekly health digest"}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof prev],
                  }))
                }
                className="h-5 w-5 rounded text-brand-teal focus:ring-brand-teal"
              />
            </label>
          ))}
        </Card>
      </section>

      <Separator className="mb-6" />

      {/* Accessibility */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-bold text-brand-navy">Accessibility</h2>
        </div>
        <Card className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Text Size
            </label>
            <div className="flex gap-2">
              {(["normal", "large", "xlarge"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm min-h-[44px] transition-colors ${
                    fontSize === size
                      ? "bg-brand-teal/10 border-brand-teal text-brand-teal"
                      : "border-surface-border text-text-secondary"
                  }`}
                >
                  {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <Separator className="mb-6" />

      {/* Privacy */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-bold text-brand-navy">Privacy</h2>
        </div>
        <Card className="p-4 space-y-3">
          <label className="flex items-center justify-between min-h-[44px] cursor-pointer">
            <div>
              <span className="text-sm text-text-primary block">AI conversation history</span>
              <span className="text-xs text-text-muted">Save your AI questions and answers</span>
            </div>
            <input
              type="checkbox"
              checked={aiHistory}
              onChange={() => setAiHistory(!aiHistory)}
              className="h-5 w-5 rounded text-brand-teal focus:ring-brand-teal"
            />
          </label>
        </Card>
      </section>

      <Separator className="mb-6" />

      {/* Provider Messaging Stub */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-bold text-brand-navy">Provider Messaging</h2>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full min-h-[44px]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message your provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Coming Soon</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary">
              Provider messaging is coming soon. For now, contact your provider&apos;s office directly.
            </p>
          </DialogContent>
        </Dialog>
      </section>
    </AppShell>
  );
}

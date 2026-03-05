"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SharingPermissionGrid } from "@/components/health/SharingPermissionGrid";
import { ProviderLinkCard } from "@/components/health/ProviderLinkCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Link2, Plus, UserPlus, Clock } from "lucide-react";

const DEMO_USER_ID = "demo-margaret";

interface CaregiverGrant {
  id: string;
  caregiverName: string;
  caregiverEmail: string;
  accessLevel: string;
  permissions: Record<string, boolean>;
  lastAccessed?: string;
}

interface ProviderLinkData {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  accessCount: number;
  revokedAt?: string | null;
}

export default function SharingPage() {
  const [caregivers, setCaregivers] = useState<CaregiverGrant[]>([]);
  const [links, setLinks] = useState<ProviderLinkData[]>([]);
  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [newCaregiver, setNewCaregiver] = useState({
    name: "",
    email: "",
    accessLevel: "view",
  });
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({
    labs: true,
    medications: true,
    conditions: true,
    visits: true,
    allergies: true,
    immunizations: true,
    procedures: true,
  });
  const [linkDuration, setLinkDuration] = useState(24);
  const [linkScope, setLinkScope] = useState<Record<string, boolean>>({
    labs: true,
    medications: true,
    conditions: true,
    allergies: true,
  });

  const addCaregiver = async () => {
    const res = await fetch("/api/sharing/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        caregiverName: newCaregiver.name,
        caregiverEmail: newCaregiver.email,
        permissions: newPermissions,
        accessLevel: newCaregiver.accessLevel,
      }),
    });
    if (res.ok) {
      const grant = await res.json();
      setCaregivers((prev) => [
        ...prev,
        {
          ...grant,
          permissions: newPermissions,
        },
      ]);
      setShowAddCaregiver(false);
      setNewCaregiver({ name: "", email: "", accessLevel: "view" });
    }
  };

  const generateLink = async () => {
    const res = await fetch("/api/sharing/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        scope: linkScope,
        durationHours: linkDuration,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setLinks((prev) => [
        {
          id: data.id,
          token: data.token,
          expiresAt: data.expiresAt,
          createdAt: new Date().toISOString(),
          accessCount: 0,
        },
        ...prev,
      ]);
    }
  };

  const revokeLink = async (linkId: string) => {
    await fetch(`/api/sharing/link?id=${linkId}`, { method: "DELETE" });
    setLinks((prev) =>
      prev.map((l) =>
        l.id === linkId ? { ...l, revokedAt: new Date().toISOString() } : l
      )
    );
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Sharing</h1>

      {/* Caregiver Access */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-teal" />
            <h2 className="text-lg font-bold text-brand-navy">Caregiver Access</h2>
          </div>
          <Dialog open={showAddCaregiver} onOpenChange={setShowAddCaregiver}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="min-h-[44px]">
                <UserPlus className="h-4 w-4 mr-1" />
                Add Caregiver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Caregiver</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
                  <Input
                    value={newCaregiver.name}
                    onChange={(e) =>
                      setNewCaregiver({ ...newCaregiver, name: e.target.value })
                    }
                    placeholder="David Chen"
                    className="min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                  <Input
                    value={newCaregiver.email}
                    onChange={(e) =>
                      setNewCaregiver({ ...newCaregiver, email: e.target.value })
                    }
                    placeholder="david@example.com"
                    className="min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Access Level
                  </label>
                  <select
                    value={newCaregiver.accessLevel}
                    onChange={(e) =>
                      setNewCaregiver({ ...newCaregiver, accessLevel: e.target.value })
                    }
                    className="w-full rounded-md border border-surface-border px-3 py-2 min-h-[44px] text-sm"
                  >
                    <option value="view">View Only</option>
                    <option value="view_ai">View + AI Queries</option>
                    <option value="full">Full Access</option>
                  </select>
                </div>
                <SharingPermissionGrid
                  permissions={newPermissions}
                  onChange={setNewPermissions}
                />
                <Button
                  onClick={addCaregiver}
                  disabled={!newCaregiver.name || !newCaregiver.email}
                  className="w-full min-h-[44px] bg-brand-teal hover:bg-brand-teal/90"
                >
                  Grant Access
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {caregivers.length === 0 ? (
          <Card className="p-6 text-center">
            <Users className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              No caregivers added yet. Add a caregiver to let them view your health records.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {caregivers.map((cg) => (
              <Card key={cg.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">{cg.caregiverName}</p>
                    <p className="text-sm text-text-muted">{cg.caregiverEmail}</p>
                    <p className="text-xs text-text-muted mt-1 capitalize">
                      {cg.accessLevel.replace("_", " + ")} access
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-status-critical min-h-[44px]">
                    Revoke
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator className="mb-8" />

      {/* Provider Links */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-bold text-brand-navy">Provider Links</h2>
        </div>

        <Card className="p-4 mb-4 bg-brand-teal/5 border-brand-teal/20">
          <p className="text-sm text-text-secondary mb-3">
            Generate a secure link that any provider can open in their browser to view your records.
            No login or app needed on their end.
          </p>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-text-muted" />
              <select
                value={linkDuration}
                onChange={(e) => setLinkDuration(Number(e.target.value))}
                className="rounded-md border border-surface-border px-2 py-1.5 text-sm min-h-[44px]"
              >
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
              </select>
            </div>
          </div>

          <SharingPermissionGrid permissions={linkScope} onChange={setLinkScope} />

          <Button
            onClick={generateLink}
            className="w-full mt-4 min-h-[44px] bg-brand-teal hover:bg-brand-teal/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Generate Provider Link
          </Button>
        </Card>

        {links.length > 0 && (
          <div className="space-y-2">
            {links.map((link) => (
              <ProviderLinkCard
                key={link.id}
                {...link}
                onRevoke={revokeLink}
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

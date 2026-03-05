"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Copy, Clock, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";
import { useState } from "react";

interface ProviderLinkCardProps {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  accessCount: number;
  revokedAt?: string | null;
  onRevoke: (id: string) => void;
  className?: string;
}

export function ProviderLinkCard({
  id,
  token,
  expiresAt,
  createdAt,
  accessCount,
  revokedAt,
  onRevoke,
  className,
}: ProviderLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const expired = isPast(parseISO(expiresAt));
  const revoked = !!revokedAt;
  const isActive = !expired && !revoked;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${token}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn("p-4", !isActive && "opacity-60", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-teal/10 shrink-0">
            <Link2 className="h-5 w-5 text-brand-teal" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm text-text-primary">Provider Link</p>
              {isActive ? (
                <Badge className="bg-status-normal/10 text-status-normal text-xs">Active</Badge>
              ) : expired ? (
                <Badge variant="outline" className="text-text-muted text-xs">Expired</Badge>
              ) : (
                <Badge variant="outline" className="text-status-critical text-xs">Revoked</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isActive
                  ? `Expires ${formatDistanceToNow(parseISO(expiresAt), { addSuffix: true })}`
                  : expired
                  ? "Expired"
                  : "Revoked"}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {accessCount} {accessCount === 1 ? "view" : "views"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="flex-1 min-h-[44px]"
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(id)}
            className="text-status-critical hover:text-status-critical min-h-[44px]"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Revoke
          </Button>
        </div>
      )}
    </Card>
  );
}

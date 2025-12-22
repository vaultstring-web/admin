"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  merchant: {
    id: string;
    businessName: string;
    legalType?: string;
    registrationNumber?: string;
    taxId?: string;
    address?: string;
    contact?: string;
    verificationStatus?: string;
    accountStatus?: string;
  };
};

function audit(action: string, merchantId: string, reason?: string) {
  const entry = {
    merchantId,
    action,
    reason: reason || null,
    admin: "admin@example.com",
    timestamp: new Date().toISOString(),
  };
  try {
    const raw = localStorage.getItem("merchantAudit");
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    localStorage.setItem("merchantAudit", JSON.stringify(arr));
    console.log("Audit logged", entry);
  } catch (e) {
    console.warn("Failed to write audit log", e);
  }
}

export default function MerchantDetail({ merchant }: Props) {
  const handleApprove = () => {
    if (
      !confirm(
        `Approve ${merchant.businessName}? This grants transactional privileges.`
      )
    )
      return;
    audit("approve", merchant.id);
    alert("Merchant approved (mock)");
  };

  const handleReject = () => {
    const reason = prompt("Enter rejection reason (required)");
    if (!reason) {
      alert("Rejection reason is required");
      return;
    }
    audit("reject", merchant.id, reason);
    alert("Merchant rejected (mock)");
  };

  const handleSuspendToggle = () => {
    const action =
      merchant.accountStatus === "suspended" ? "unsuspend" : "suspend";
    if (
      !confirm(
        `${action === "suspend" ? "Suspend" : "Unsuspend"} account for ${
          merchant.businessName
        }?`
      )
    )
      return;
    audit(action, merchant.id);
    alert(`Account ${action}ed (mock)`);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{merchant.businessName}</h2>
          <p className="text-sm text-muted-foreground">ID: {merchant.id}</p>
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
            <div>
              <strong>Legal type:</strong> {merchant.legalType || "—"}
            </div>
            <div>
              <strong>Registration #:</strong>{" "}
              {merchant.registrationNumber || "—"}
            </div>
            <div>
              <strong>Tax ID:</strong> {merchant.taxId || "—"}
            </div>
            <div>
              <strong>Address:</strong> {merchant.address || "—"}
            </div>
            <div>
              <strong>Contact:</strong> {merchant.contact || "—"}
            </div>
          </div>
        </div>

        <aside className="w-full md:w-72">
          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Verification</div>
              <div className="mt-1">
                <span
                  role="status"
                  aria-label={`Verification status: ${
                    merchant.verificationStatus || "pending"
                  }`}
                  className="px-2 py-0.5 rounded text-sm"
                  style={{
                    backgroundColor:
                      merchant.verificationStatus === "approved"
                        ? "var(--color-success-bg)"
                        : merchant.verificationStatus === "rejected"
                        ? "var(--color-error-bg)"
                        : "var(--color-warning-bg)",
                    color:
                      merchant.verificationStatus === "approved"
                        ? "var(--color-success-foreground)"
                        : merchant.verificationStatus === "rejected"
                        ? "var(--color-error-foreground)"
                        : "var(--color-warning-foreground)",
                  }}
                >
                  {merchant.verificationStatus || "pending"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Account status
              </div>
              <div className="mt-1">
                <span
                  role="status"
                  aria-label={`Account status: ${
                    merchant.accountStatus || "active"
                  }`}
                  className="px-2 py-0.5 rounded text-sm"
                  style={{
                    backgroundColor:
                      merchant.accountStatus === "active"
                        ? "var(--color-success-bg-weak)"
                        : "var(--color-error-bg)",
                    color:
                      merchant.accountStatus === "active"
                        ? "var(--color-success-foreground)"
                        : "var(--color-error-foreground)",
                  }}
                >
                  {merchant.accountStatus || "active"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t flex flex-col gap-2">
              <Button variant="default" onClick={handleApprove}>
                Approve
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
              <Button variant="outline" onClick={handleSuspendToggle}>
                {merchant.accountStatus === "suspended"
                  ? "Unsuspend"
                  : "Suspend"}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </Card>
  );
}

// components/merchants/MerchantDetail.tsx (updated)
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, FileText, Users, Banknote, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface MerchantDetailProps {
  merchant: {
    id: string;
    businessName: string;
    legalType: string;
    registrationNumber: string;
    taxId: string;
    address: string;
    contact: string;
    phone: string;
    email: string;
    category: string;
    registrationDate: string;
    verificationStatus: "pending" | "approved" | "rejected";
    accountStatus: "active" | "suspended";
    riskScore: number;
    transactionVolume: number;
    settlementBalance: number;
    documents: Array<{
      type: string;
      status: "verified" | "unverified";
      submittedAt: string;
    }>;
    owners: Array<{
      name: string;
      email: string;
      phone: string;
      ownershipPercentage: number;
    }>;
  bankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    currency: string;
    isPrimary: boolean;
  }>;
  primaryCurrency?: string;
};
  onUpdateStatus: (id: string, action: string, reason?: string) => void;
  onBack: () => void;
}

export default function MerchantDetail({ merchant, onUpdateStatus, onBack }: MerchantDetailProps) {
  const handleApprove = () => {
    if (
      !confirm(
        `Approve ${merchant.businessName}? This grants transactional privileges.`
      )
    )
      return;
    onUpdateStatus(merchant.id, "approve");
  };

  const handleReject = () => {
    const reason = prompt("Enter rejection reason (required)");
    if (!reason) {
      alert("Rejection reason is required");
      return;
    }
    onUpdateStatus(merchant.id, "reject", reason);
  };

  const handleSuspendToggle = () => {
    const action = merchant.accountStatus === "suspended" ? "unsuspend" : "suspend";
    if (
      !confirm(
        `${action === "suspend" ? "Suspend" : "Unsuspend"} account for ${
          merchant.businessName
        }?`
      )
    )
      return;
    onUpdateStatus(merchant.id, action);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 20) return "text-green-600";
    if (score <= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        <div className="flex gap-2">
          <Badge className={getStatusColor(merchant.verificationStatus)}>
            {merchant.verificationStatus}
          </Badge>
          <Badge className={getStatusColor(merchant.accountStatus)}>
            {merchant.accountStatus}
          </Badge>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Information */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{merchant.businessName}</h2>
                  <p className="text-sm text-muted-foreground font-mono">ID: {merchant.id}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Business Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Legal Type: </span>
                      <span className="text-sm">{merchant.legalType}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Registration #: </span>
                      <span className="text-sm">{merchant.registrationNumber}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Tax ID: </span>
                      <span className="text-sm">{merchant.taxId}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Category: </span>
                      <Badge variant="outline">{merchant.category}</Badge>
                    </div>
                    {merchant.primaryCurrency && (
                      <div>
                        <span className="text-sm font-medium">Primary Currency: </span>
                        <Badge variant="outline">{merchant.primaryCurrency}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Contact Person: </span>
                      <span className="text-sm">{merchant.contact}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email: </span>
                      <span className="text-sm">{merchant.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Phone: </span>
                      <span className="text-sm">{merchant.phone}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Address: </span>
                      <span className="text-sm block mt-1">{merchant.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Risk & Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Score</span>
                      <span className={`text-lg font-bold ${getRiskColor(merchant.riskScore)}`}>
                        {merchant.riskScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transaction Volume</span>
                      <span className="text-lg font-bold">
                        ${(merchant.transactionVolume / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Settlement Balance</span>
                      <span className="text-lg font-bold">
                        ${merchant.settlementBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Registration Date</span>
                      <span className="text-sm">
                        {new Date(merchant.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents</h3>
                  <div className="space-y-2">
                    {merchant.documents.length > 0 ? (
                      merchant.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{doc.type}</span>
                          </div>
                          <Badge className={doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                            {doc.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents submitted</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <aside className="w-full md:w-72 space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Owners</h3>
                <div className="space-y-3">
                  {merchant.owners.map((owner, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-muted rounded-lg">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{owner.name}</p>
                        <p className="text-muted-foreground">{owner.ownershipPercentage}% ownership</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Bank Accounts</h3>
                <div className="space-y-3">
                  {merchant.bankAccounts.map((account, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-muted rounded-lg">
                        <Banknote className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{account.bankName}</p>
                        <p className="text-muted-foreground">{account.accountNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <Button className="w-full" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSuspendToggle}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                {merchant.accountStatus === "suspended" ? "Unsuspend" : "Suspend"}
              </Button>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}

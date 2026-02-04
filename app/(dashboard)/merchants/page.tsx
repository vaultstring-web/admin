// app/dashboard/merchants/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import MerchantsList from "@/components/merchants/MerchantList";
import MerchantDetail from "@/components/merchants/MerchantDetail";
import { MerchantCard } from "@/components/merchants/MerchantCard";
import { MOCK_MERCHANTS } from "@/components/merchants/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/constants";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function MerchantsPage() {
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [simpleMerchants, setSimpleMerchants] = useState<Array<{
    id: string;
    businessName: string;
    registrationDate: string;
    verificationStatus: "pending" | "approved" | "rejected";
    accountStatus: "active" | "suspended";
    category: string;
    contact: string;
    email: string;
    phone: string;
    riskScore: number;
    primaryCurrency: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{
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
    documents: { type: string; status: "verified" | "unverified"; submittedAt: string }[];
    owners: { name: string; email: string; phone: string; ownershipPercentage: number }[];
    bankAccounts: { bankName: string; accountNumber: string; accountHolder: string; currency: string; isPrimary: boolean }[];
  } | null>(null);

  useEffect(() => {
    const mapKYC = (s?: string) => {
      const v = (s || "").toLowerCase();
      if (v === "verified") return "approved";
      if (v === "rejected") return "rejected";
      return "pending";
    };
    const mapAccount = (isActive?: boolean) => (isActive ? "active" : "suspended");
    const mapRisk = (r: any) =>
      typeof r === "string"
        ? Math.min(100, Math.max(0, parseFloat(r)))
        : typeof r === "number"
        ? Math.min(100, Math.max(0, r))
        : 0;
    const fetchMerchants = async () => {
      setLoading(true);
      setError(null);
      try {
        const offset = (page - 1) * limit;
        const res = await fetch(`${API_BASE}/admin/users?limit=${limit}&offset=${offset}&type=merchant`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({} as any));
          throw new Error(data.error || `Fetch failed (${res.status})`);
        }
        const data = await res.json();
        const users = Array.isArray(data.users) ? data.users : [];
        setTotal(data.total || 0);
        // Backend now filters by type=merchant, so we use all returned users
        const mapped = users.map((u: any) => ({
          id: u.id,
          businessName: u.business_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Merchant",
          registrationDate: (u.created_at || "").toString().slice(0, 10),
          verificationStatus: mapKYC(u.kyc_status) as "pending" | "approved" | "rejected",
          accountStatus: mapAccount(u.is_active) as "active" | "suspended",
          category: "E-commerce",
          contact: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Contact",
          email: u.email || "",
          phone: u.phone || "",
          riskScore: mapRisk(u.risk_score),
          primaryCurrency: String(u.country_code || '').toUpperCase() === 'CN' ? 'CNY' : 'MWK',
        }));
        setSimpleMerchants(mapped);
      } catch (e: any) {
        console.error('Failed to fetch merchants:', e);
        setError(e.message || "Failed to load merchants");
        setSimpleMerchants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, [page, limit]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMerchants = total;
    const pendingVerification = simpleMerchants.filter(m => m.verificationStatus === "pending").length;
    const suspendedAccounts = simpleMerchants.filter(m => m.accountStatus === "suspended").length;
    const totalVolume = 0;
    return { totalMerchants, pendingVerification, totalVolume, suspendedAccounts };
  }, [simpleMerchants]);

  // Handle back from detail view
  const handleBackToList = () => {
    setSelectedMerchantId(null);
    setSelectedDetail(null);
  };

  // Handle merchant selection
  const handleSelectMerchant = (id: string) => {
    setSelectedMerchantId(id);
    const sel = simpleMerchants.find(m => m.id === id);
    setSelectedDetail({
      id,
      businessName: sel?.businessName || "Merchant",
      legalType: "Private Limited Company",
      registrationNumber: "",
      taxId: "",
      address: "",
      contact: sel?.contact || "",
      phone: sel?.phone || "",
      email: sel?.email || "",
      category: sel?.category || "E-commerce",
      registrationDate: sel?.registrationDate || "",
      verificationStatus: sel?.verificationStatus || "pending",
      accountStatus: sel?.accountStatus || "active",
      riskScore: sel?.riskScore || 0,
      transactionVolume: 0,
      settlementBalance: 0,
      documents: [],
      owners: [],
      bankAccounts: [],
      // propagate primary currency into detail view
      // @ts-expect-error optional field handled in component
      primaryCurrency: sel?.primaryCurrency
    });
    fetch(`${API_BASE}/admin/users/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        if (!u) return;
        setSelectedDetail(prev => ({
          id: u.id || prev?.id || id,
          businessName: u.business_name || prev?.businessName || "Merchant",
          legalType: "Private Limited Company",
          registrationNumber: u.business_registration || "",
          taxId: "",
          address: "",
          contact: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
          phone: u.phone || "",
          email: u.email || "",
          category: prev?.category || "E-commerce",
          registrationDate: (u.created_at || "").toString().slice(0, 10),
          verificationStatus: ((u.kyc_status || "").toLowerCase() === "verified" ? "approved" : (u.kyc_status || "").toLowerCase() === "rejected" ? "rejected" : "pending"),
          accountStatus: u.is_active ? "active" : "suspended",
          riskScore: prev?.riskScore ?? 0,
          transactionVolume: 0,
          settlementBalance: 0,
          documents: [],
          owners: [],
          bankAccounts: [],
        }));
      })
      .catch(() => {});
  };

  // Handle status updates (mock function)
  const handleUpdateStatus = (id: string, action: string, reason?: string) => {
    console.log(`Updated merchant ${id}: ${action}`, reason);
    // In a real app, this would update the merchant data
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Merchant Management</h1>
        <p className="text-muted-foreground">
          Manage merchant accounts, verifications, and settlements
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMerchants}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.pendingVerification / stats.totalMerchants) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalVolume / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Accounts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspendedAccounts}</div>
            <p className="text-xs text-muted-foreground">
              -1 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue={selectedMerchantId ? "detail" : "list"} value={selectedMerchantId ? "detail" : "list"}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="list" onClick={handleBackToList}>
            Merchant List
          </TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedMerchantId}>
            Merchant Detail
          </TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {selectedMerchantId ? (
            <Card>
              <CardHeader>
                <CardTitle>Viewing Merchant Detail</CardTitle>
                <CardDescription>
                  Currently viewing {selectedDetail?.businessName}. Use the tabs above to switch views.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleBackToList}>
                  Back to List
                </Button>
              </CardContent>
            </Card>
          ) : (
            <MerchantsList 
              onSelectMerchant={handleSelectMerchant}
              merchants={loading ? [] : simpleMerchants}
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          )}
        </TabsContent>
        
        <TabsContent value="detail" className="space-y-4">
          {selectedDetail ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Merchant Details</CardTitle>
                      <CardDescription>
                        {selectedDetail.businessName} - {selectedDetail.id}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleBackToList}>
                      Back to List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MerchantDetail 
                    merchant={selectedDetail}
                    onUpdateStatus={handleUpdateStatus}
                    onBack={handleBackToList}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No merchant selected</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedMerchantId(simpleMerchants[0]?.id || "")}
                  >
                    View Sample Merchant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Merchant Overview</CardTitle>
              <CardDescription>
                Quick overview of all merchants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(loading ? [] : simpleMerchants).map((merchant) => (
                  <MerchantCard
                    key={merchant.id}
                    merchant={{
                      id: merchant.id,
                      businessName: merchant.businessName,
                      verificationStatus: merchant.verificationStatus,
                      accountStatus: merchant.accountStatus,
                      category: merchant.category,
                      transactionVolume: 0,
                      riskScore: merchant.riskScore
                    }}
                    onClick={() => handleSelectMerchant(merchant.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

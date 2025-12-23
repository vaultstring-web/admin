// app/dashboard/merchants/page.tsx
"use client";

import React, { useState } from "react";
import MerchantsList from "@/components/merchants/MerchantList";
import MerchantDetail from "@/components/merchants/MerchantDetail";
import { MerchantCard } from "@/components/merchants/MerchantCard";
import { MOCK_MERCHANTS, SIMPLIFIED_MERCHANTS } from "@/components/merchants/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MerchantsPage() {
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  
  // Find the selected merchant
  const selectedMerchant = selectedMerchantId 
    ? MOCK_MERCHANTS.find(m => m.id === selectedMerchantId) 
    : null;

  // Calculate statistics
  const stats = {
    totalMerchants: MOCK_MERCHANTS.length,
    pendingVerification: MOCK_MERCHANTS.filter(m => m.verificationStatus === "pending").length,
    totalVolume: MOCK_MERCHANTS.reduce((sum, m) => sum + m.transactionVolume, 0),
    suspendedAccounts: MOCK_MERCHANTS.filter(m => m.accountStatus === "suspended").length,
  };

  // Handle back from detail view
  const handleBackToList = () => {
    setSelectedMerchantId(null);
  };

  // Handle merchant selection
  const handleSelectMerchant = (id: string) => {
    setSelectedMerchantId(id);
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
                  Currently viewing {selectedMerchant?.businessName}. Use the tabs above to switch views.
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
              merchants={SIMPLIFIED_MERCHANTS}
            />
          )}
        </TabsContent>
        
        <TabsContent value="detail" className="space-y-4">
          {selectedMerchant ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Merchant Details</CardTitle>
                      <CardDescription>
                        {selectedMerchant.businessName} - {selectedMerchant.id}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleBackToList}>
                      Back to List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MerchantDetail 
                    merchant={selectedMerchant}
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
                    onClick={() => setSelectedMerchantId(MOCK_MERCHANTS[0].id)}
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
                {MOCK_MERCHANTS.map((merchant) => (
                  <MerchantCard
                    key={merchant.id}
                    merchant={{
                      id: merchant.id,
                      businessName: merchant.businessName,
                      verificationStatus: merchant.verificationStatus,
                      accountStatus: merchant.accountStatus,
                      category: merchant.category,
                      transactionVolume: merchant.transactionVolume,
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
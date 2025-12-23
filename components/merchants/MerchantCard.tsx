// components/merchants/MerchantCard.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface MerchantCardProps {
  merchant: {
    id: string;
    businessName: string;
    verificationStatus: "pending" | "approved" | "rejected";
    accountStatus: "active" | "suspended";
    category: string;
    transactionVolume: number;
    riskScore: number;
  };
  onClick: () => void;
}

export function MerchantCard({ merchant, onClick }: MerchantCardProps) {
  const getVerificationIcon = () => {
    switch (merchant.verificationStatus) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
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
    if (score <= 20) return "text-green-600 dark:text-green-400";
    if (score <= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{merchant.businessName}</CardTitle>
            <CardDescription className="text-xs font-mono">{merchant.id}</CardDescription>
          </div>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Verification</span>
            <div className="flex items-center gap-1">
              {getVerificationIcon()}
              <Badge className={`text-xs ${getStatusColor(merchant.verificationStatus)}`}>
                {merchant.verificationStatus}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account</span>
            <Badge className={`text-xs ${getStatusColor(merchant.accountStatus)}`}>
              {merchant.accountStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className={`font-semibold ${getRiskColor(merchant.riskScore)}`}>
              {merchant.riskScore}/100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge variant="outline" className="text-xs">
              {merchant.category}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Volume</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                ${(merchant.transactionVolume / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={onClick}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
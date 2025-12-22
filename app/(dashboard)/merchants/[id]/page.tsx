import MerchantDetail from "@/components/dashboard/merchant-detail";

type Props = {
  params: { id: string };
};

export default function MerchantPage({ params }: Props) {
  const id = params.id;

  // Mocked server-side data — replace with real data fetching
  const merchant = {
    id,
    businessName: `Merchant ${id}`,
    legalType: "Limited Liability Company",
    registrationNumber: "REG-12345",
    taxId: "TAX-98765",
    address: "123 Business St, Suite 100",
    contact: "ops@example.com",
    verificationStatus: "pending",
    accountStatus: "active",
  };

  return (
    <div className="space-y-6">
      <MerchantDetail merchant={merchant} />
    </div>
  );
}

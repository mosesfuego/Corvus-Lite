import { RfqDetailPageContent } from "@/components/rfqs/rfq-detail-page";

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;

  return <RfqDetailPageContent rfqId={rfqId} />;
}

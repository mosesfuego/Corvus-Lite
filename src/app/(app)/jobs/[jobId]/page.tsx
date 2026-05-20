import { JobDetailPageContent } from "@/components/jobs/job-detail-page";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return <JobDetailPageContent jobId={jobId} />;
}

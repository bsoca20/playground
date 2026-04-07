import { FacilitatorShell } from "@/components/simulator/facilitator-shell";

export default async function FacilitatorPage({
  params
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  return <FacilitatorShell sessionCode={sessionCode} />;
}

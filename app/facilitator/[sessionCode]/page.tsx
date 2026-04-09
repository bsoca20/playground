import { FacilitatorShell } from "@/components/simulator/facilitator-shell";

type Props = {
  params: Promise<{ sessionCode: string }>;
};

export default async function FacilitatorPage({ params }: Props) {
  const { sessionCode } = await params;

  return <FacilitatorShell sessionCode={sessionCode} />;
}

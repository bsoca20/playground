import { StudentShell } from "@/components/simulator/student-shell";

export default async function StudentPage({
  params,
  searchParams
}: {
  params: Promise<{ sessionCode: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { sessionCode } = await params;
  const { phase } = await searchParams;
  return <StudentShell sessionCode={sessionCode} initialPhase={phase} />;
}

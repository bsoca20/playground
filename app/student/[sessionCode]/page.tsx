import { StudentShell } from "@/components/simulator/student-shell";

type Props = {
  params: Promise<{ sessionCode: string }>;
};

export default async function StudentPage({ params }: Props) {
  const { sessionCode } = await params;

  return <StudentShell sessionCode={sessionCode} />;
}

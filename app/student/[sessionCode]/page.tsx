type Props = {
  params: Promise<{ sessionCode: string }>;
};

export default async function StudentPage({ params }: Props) {
  const { sessionCode } = await params;

  return (
    <div style={{ padding: 40 }}>
      <h1>Simulador</h1>
      <p>Session: {sessionCode}</p>
    </div>
  );
}

export default function StudentPage({ params }: { params: { sessionCode: string } }) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Simulador</h1>
      <p>Session: {params.sessionCode}</p>
    </div>
  );
}

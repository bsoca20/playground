export function ShareBars({
  share2020,
  share2021
}: {
  share2020: number;
  share2021: number;
}) {
  return (
    <div className="grid gap-4">
      {[
        { label: "Share 2020", value: share2020 },
        { label: "Share 2021", value: share2021 }
      ].map((row) => (
        <div key={row.label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">{row.label}</span>
            <span className="font-bold text-zinc-950">{row.value}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#991b1b_0%,#dc2626_55%,#f87171_100%)]"
              style={{ width: `${row.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

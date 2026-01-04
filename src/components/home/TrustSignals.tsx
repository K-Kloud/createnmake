const signals = [
  { label: "PAYMENTS", value: "Escrow Protected" },
  { label: "TURNAROUND", value: "48hr Quotes" },
  { label: "ARTISANS", value: "Verified Only" },
  { label: "SUPPORT", value: "Direct Access" }
];

export const TrustSignals = () => {
  return (
    <section className="py-6 border-y border-border/50 bg-card/30">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4">
          {signals.map((signal) => (
            <div key={signal.label} className="flex items-center gap-3">
              <span className="text-label">{signal.label}</span>
              <span className="text-data text-foreground">{signal.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

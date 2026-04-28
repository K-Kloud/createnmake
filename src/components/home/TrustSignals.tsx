const signals = [
  "ESCROW PROTECTED",
  "48HR QUOTE TURNAROUND",
  "VERIFIED ARTISANS ONLY",
  "DIRECT MESSAGING",
  "PRODUCTION TRACKING",
  "GLOBAL SHIPPING",
];

export const TrustSignals = () => {
  return (
    <section
      aria-label="Platform guarantees"
      className="py-4 border-y border-border/50 bg-card/30 overflow-hidden"
    >
      <div
        className="flex gap-12 whitespace-nowrap animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]"
        style={{ willChange: "transform" }}
      >
        {[...signals, ...signals].map((signal, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className="w-1 h-1 bg-primary rounded-full" />
            <span className="text-label text-muted-foreground">{signal}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

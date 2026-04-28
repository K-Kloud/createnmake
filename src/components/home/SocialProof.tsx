const testimonials = [
  {
    name: "Adaeze Okafor",
    role: "Fashion Designer · Lagos",
    content:
      "Created over 50 unique designs in a month. The artisan network quality is exceptional — every order shipped on time.",
    metric: "50+ designs",
  },
  {
    name: "Chukwuemeka Nwosu",
    role: "Boutique Owner · Abuja",
    content:
      "Scaled production 4x without compromising quality. The platform transformed how I manage my business operations.",
    metric: "4× production",
  },
  {
    name: "Folake Adeyemi",
    role: "Creative Director",
    content:
      "Concept to production in days, not weeks. The workflow efficiency is genuinely unmatched in the industry.",
    metric: "3-day turnaround",
  },
];

export const SocialProof = () => {
  return (
    <section className="py-24 border-y border-border/50">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="mb-12 flex items-end justify-between gap-4 pb-6 border-b border-border/40">
          <div>
            <span className="text-label mb-2 block">TESTIMONIALS</span>
            <h2 className="text-h2">From the community</h2>
          </div>
          <span className="hidden md:block text-metadata text-muted-foreground">
            03 / 03
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border/40">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="group bg-background p-8 flex flex-col justify-between transition-colors hover:bg-card"
            >
              <blockquote className="text-foreground leading-relaxed mb-8">
                {t.content}
              </blockquote>

              <div className="space-y-4">
                <div className="inline-block px-2 py-1 border border-primary/30 text-primary font-mono text-[10px] uppercase tracking-wider">
                  {t.metric}
                </div>
                <figcaption className="pt-4 border-t border-border/50">
                  <div className="font-medium text-foreground">{t.name}</div>
                  <div className="text-metadata text-muted-foreground mt-0.5">
                    {t.role}
                  </div>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

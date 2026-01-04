const testimonials = [
  {
    name: "Adaeze Okafor",
    role: "Fashion Designer, Lagos",
    content: "Created over 50 unique designs. The artisan network quality is exceptional."
  },
  {
    name: "Chukwuemeka Nwosu",
    role: "Boutique Owner",
    content: "Scaled production without compromising quality. Transformed my business operations."
  },
  {
    name: "Folake Adeyemi",
    role: "Creative Director",
    content: "Concept to production in days. The workflow efficiency is unmatched."
  }
];

export const SocialProof = () => {
  return (
    <section className="py-24 border-y border-border/50">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-12">
          <span className="text-label mb-2 block">TESTIMONIALS</span>
          <h2 className="text-h2">From the Community</h2>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.name} className="relative">
              {/* Quote mark */}
              <div className="text-6xl font-serif text-border leading-none mb-4">"</div>
              
              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                {testimonial.content}
              </p>

              {/* Author */}
              <div className="pt-4 border-t border-border/50">
                <div className="font-medium text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

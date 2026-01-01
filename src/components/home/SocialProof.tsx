import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Adaeze Okafor",
    role: "Fashion Designer",
    image: null,
    content: "The AI generation quality is incredible. I've created over 50 unique designs and connected with amazing tailors in Lagos.",
    rating: 5
  },
  {
    name: "Chukwuemeka Nwosu",
    role: "Boutique Owner",
    content: "This platform transformed my business. The artisan network helped me scale production without compromising quality.",
    rating: 5
  },
  {
    name: "Folake Adeyemi",
    role: "Creative Director",
    content: "From concept to production in days, not weeks. The workflow is seamless and the results speak for themselves.",
    rating: 5
  }
];

export const SocialProof = () => {
  return (
    <section className="py-20 bg-card/20">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-technical text-primary mb-2 block">TESTIMONIALS</span>
          <h2 className="text-h2 mb-4">Loved by Creators</h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Join thousands of designers, boutiques, and fashion entrepreneurs already using our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative p-6 rounded-lg bg-card border border-border/50 hover:border-primary/20 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

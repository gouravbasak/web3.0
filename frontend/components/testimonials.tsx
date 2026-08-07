export default function Testimonials() {
  return (
    <section className="w-full px-4 bg-background">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-semibold uppercase tracking-wide mb-10 text-foreground">
          FIND OUT WHAT PEOPLE ARE SAYING ABOUT US
        </h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card */}
          {[
            {
              title: `"Eco-Friendly and Stylish"`,
              name: "James Mitchell",
            },
            {
              title: `"Ideal for Active Lifestyles"`,
              name: "Rebecca Thompson",
            },
            {
              title: `"My New Daily Essential"`,
              name: "Sophia Navarro",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm
                         flex flex-col transition"
            >
              <h3 className="text-xl font-bold text-primary mb-3">
                {t.title}
              </h3>

              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                Use this space to share a testimonial quote about the business,
                its products or its services. Include a quote from an actual
                customer to build trust and attract site visitors.
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <img
                  src="/testimonial.png"
                  className="h-14 w-14 rounded-full object-cover border border-border"
                  alt="User"
                />
                <span className="text-sm font-semibold text-foreground">
                  {t.name}
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

type Block =
  | { type: 'hero'; title: string; subtitle?: string; cta?: { label: string; href: string } }
  | { type: 'richText'; html: string }
  | { type: 'testimonials'; items: Array<{ quote: string; author: string; role?: string }> }
  | { type: 'faqs'; items: Array<{ q: string; a: string }> }
  | { type: 'featureGrid'; items: Array<{ title: string; body: string }> };

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-16">
      {blocks.map((b, idx) => {
        const key = `${b.type}-${idx}`;
        if (b.type === 'hero') {
          return (
            <section key={key} className="mx-auto max-w-6xl px-4 py-16">
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{b.title}</h1>
              {b.subtitle ? <p className="mt-4 max-w-2xl text-lg text-slate-300">{b.subtitle}</p> : null}
              {b.cta ? (
                <a
                  href={b.cta.href}
                  className="mt-8 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground"
                >
                  {b.cta.label}
                </a>
              ) : null}
            </section>
          );
        }
        if (b.type === 'richText') {
          return (
            <section key={key} className="mx-auto max-w-3xl px-4">
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: b.html }} />
            </section>
          );
        }
        if (b.type === 'testimonials') {
          return (
            <section key={key} className="mx-auto max-w-6xl px-4">
              <h2 className="text-xl font-semibold">Testimonials</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {b.items.map((t, i) => (
                  <figure key={i} className="rounded-xl border border-slate-800 p-5">
                    <blockquote className="text-slate-200">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-3 text-sm text-slate-400">
                      <span className="font-medium text-slate-200">{t.author}</span>
                      {t.role ? <span> · {t.role}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          );
        }
        if (b.type === 'faqs') {
          return (
            <section key={key} className="mx-auto max-w-3xl px-4">
              <h2 className="text-xl font-semibold">FAQs</h2>
              <div className="mt-6 space-y-4">
                {b.items.map((f, i) => (
                  <details key={i} className="rounded-xl border border-slate-800 p-4">
                    <summary className="cursor-pointer font-medium">{f.q}</summary>
                    <p className="mt-2 text-sm text-slate-300">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        }
        if (b.type === 'featureGrid') {
          return (
            <section key={key} className="mx-auto max-w-6xl px-4">
              <div className="grid gap-6 md:grid-cols-3">
                {b.items.map((f, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 p-5">
                    <div className="font-semibold">{f.title}</div>
                    <p className="mt-2 text-sm text-slate-300">{f.body}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        }
        return null;
      })}
    </div>
  );
}

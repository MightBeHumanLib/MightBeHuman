export default function Page() {
  return (
    <main style={{ padding: 32, maxWidth: 1080, margin: "0 auto" }}>
      <header style={{ marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 24, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 24, padding: 12, background: "var(--surface)" }}>
          <img src="/logo.png" alt="MightBeHuman logo" width={84} height={84} />
        </div>
        <div>
          <p style={{ color: "var(--muted)", letterSpacing: "0.24em", textTransform: "uppercase", fontSize: 12 }}>MightBeHuman Docs</p>
          <h1 style={{ fontSize: 48, fontWeight: 300, margin: "12px 0" }}>Local-first humanization platform</h1>
          <p style={{ maxWidth: 760, lineHeight: 1.7, color: "var(--muted)" }}>
            Architecture, CLI usage, API contracts, plugin design, deployment notes, and benchmarking methodology for the TypeScript monorepo.
          </p>
        </div>
      </header>

      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {[
          ["Architecture", "How the pipeline, apps, and packages fit together."],
          ["CLI", "Commands, flags, and JSON / markdown output modes."],
          ["API", "Fastify endpoints for analysis and humanization."],
          ["Plugins", "Typed extension points for mutation, detection, and scoring."],
          ["Deployment", "Docker, Compose, and local environment guidance."],
          ["Benchmarking", "Methodology and regression tracking for quality signals."],
        ].map(([title, description]) => (
          <article key={title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>{title}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

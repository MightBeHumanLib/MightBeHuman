"use client";

import { useMemo, useState, type ChangeEvent } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { humanizeText, analyzeText } from "@mightbehuman/core-engine";

const sampleText = `AI writing often sounds polished, but it tends to flatten rhythm, repeat syntactic shapes, and over-index on uniform sentence length. A human editor would vary pacing, tighten some clauses, and let structure breathe.`;

export default function Page() {
  const [input, setInput] = useState(sampleText);
  const [strength, setStrength] = useState(0.62);

  const analysis = useMemo(() => analyzeText(input, { strength }), [input, strength]);
  const humanized = useMemo(() => humanizeText(input, { strength }), [input, strength]);

  return (
    <main className="min-h-screen px-6 py-8 text-white md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/20">
              <img src="/logo.png" alt="MightBeHuman logo" width={72} height={72} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">MightBeHuman Research Console</p>
              <h1 className="text-4xl font-light tracking-[-0.04em] md:text-6xl">Humanization engine control room</h1>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
            Local-first algorithmic writing mutation, preservation, and detector analysis in one workspace.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-zinc-400">
              <span>Live editor</span>
              <span>Strength {(strength * 100).toFixed(0)}%</span>
            </div>
            <textarea
              value={input}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.currentTarget.value)}
              className="min-h-[300px] w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-zinc-100 outline-none transition focus:border-white/20"
            />
            <div className="mt-4">
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">Humanization strength</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={strength}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setStrength(Number(event.currentTarget.value))}
                className="w-full accent-white"
              />
            </div>
          </article>

          <article className="grid gap-4">
            <Panel title="Score" value={analysis.score.score.toFixed(3)} note={analysis.score.warnings[0] ?? "Stable"} />
            <Panel title="Rhythm" value={analysis.rhythm.cadenceScore.toFixed(3)} note={`Variance ${analysis.rhythm.sentenceLengthVariance.toFixed(1)}`} />
            <Panel title="Entropy" value={analysis.entropy.wordEntropy.toFixed(3)} note={`Burstiness ${analysis.entropy.burstiness.toFixed(2)}`} />
            <Panel title="Preservation" value={analysis.preservation.citationIntegrity.toFixed(3)} note={`Entities ${analysis.preservation.entityCount}`} />
          </article>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <OutputPanel title="Original" text={input} />
          <OutputPanel title="Humanized" text={humanized.outputText} />
        </section>
      </section>
    </main>
  );
}

function Panel({ title, value, note }: { readonly title: string; readonly value: string; readonly note: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[var(--panel)] p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">{title}</p>
      <div className="mt-4 text-4xl font-light tracking-[-0.05em]">{value}</div>
      <p className="mt-2 text-sm text-zinc-400">{note}</p>
    </div>
  );
}

function OutputPanel({ title, text }: { readonly title: string; readonly text: string }) {
  return (
    <motion.article
      layout
      className="rounded-3xl border border-white/10 bg-black/30 p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">{title}</p>
      <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{text}</pre>
    </motion.article>
  );
}

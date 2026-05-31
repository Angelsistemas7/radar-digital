"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sparkles, Send, Bot, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface ResultSummary {
  overall: number;
  levelName: string;
  dimensions: { name: string; score: number }[];
}

const SUGGESTIONS = [
  "¿Por dónde empiezo esta semana?",
  "Explícame mi punto más débil",
  "¿Qué herramientas gratuitas me recomiendas?",
];

/* ---- minimal markdown renderer (headings, lists, bold) ---- */
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul
          key={`l${blocks.length}`}
          className="my-2 list-disc space-y-1 pl-5 marker:text-faint"
        >
          {list.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{1,3}\s/.test(line)) {
      flush();
      blocks.push(
        <h4 key={`h${blocks.length}`} className="mt-3 mb-1 font-semibold text-foreground">
          {renderInline(line.replace(/^#{1,3}\s/, ""))}
        </h4>,
      );
    } else if (/^[-*]\s/.test(line)) {
      list.push(line.replace(/^[-*]\s/, ""));
    } else if (/^\d+\.\s/.test(line)) {
      list.push(line.replace(/^\d+\.\s/, ""));
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      blocks.push(
        <p key={`p${blocks.length}`} className="my-1.5">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flush();
  return <div className="text-sm leading-relaxed text-muted">{blocks}</div>;
}

export function AiAdvisor({
  company,
  sector,
  result,
}: {
  company?: string;
  sector?: string;
  result: ResultSummary;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming, loading]);

  const run = async (history: Msg[]) => {
    setLoading(true);
    setError(null);
    setStreaming("");
    try {
      const res = await fetch("/api/asesor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result: { company, sector, ...result },
          messages: history,
        }),
      });
      if (res.status === 503) {
        setNotConfigured(true);
        setStreaming(null);
        setLoading(false);
        return;
      }
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "No se pudo generar la respuesta.");
        setStreaming(null);
        setLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
        setLoading(false);
      }
      setMessages((m) => [...m, { role: "assistant", content: acc }]);
      setStreaming(null);
    } catch {
      setError("Error de conexión con el asesor.");
      setStreaming(null);
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || streaming !== null;

  const start = () => {
    setStarted(true);
    run([]);
  };

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    run(next);
  };

  return (
    <div className="glass relative overflow-hidden rounded-3xl border border-accent/20 p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-60" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h2 className="font-bold tracking-tight">Asesor con IA</h2>
            <p className="text-xs text-faint">Diagnóstico conversacional</p>
          </div>
        </div>

        {notConfigured ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-warning" />
            <div className="text-muted">
              <p className="font-semibold text-warning">Asesor con IA no activado</p>
              Agrega una API key (gratis con{" "}
              <code className="text-foreground">GEMINI_API_KEY</code> o{" "}
              <code className="text-foreground">GROQ_API_KEY</code>) en{" "}
              <code className="text-foreground">.env.local</code> para habilitarlo.
              Mientras tanto, arriba tienes el diagnóstico y el plan por reglas.
            </div>
          </div>
        ) : !started ? (
          <div className="mt-5">
            <p className="max-w-xl text-muted">
              Habla con un asesor que analiza tus resultados, te explica tus
              debilidades a fondo y diseña contigo el plan de acción, paso a paso.
            </p>
            <button
              type="button"
              onClick={start}
              className={buttonClasses("primary", "md", "mt-5")}
            >
              <Sparkles className="size-4" /> Generar diagnóstico con IA
            </button>
          </div>
        ) : (
          <div className="mt-5">
            <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
              {messages.map((m, i) =>
                m.role === "assistant" ? (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <Bot className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border/70 bg-surface/50 px-4 py-3">
                      <MarkdownLite text={m.content} />
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/15 px-4 py-2.5 text-sm text-foreground">
                      {m.content}
                    </div>
                  </div>
                ),
              )}

              {streaming !== null && (
                <div className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <Bot className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border/70 bg-surface/50 px-4 py-3">
                    {streaming === "" ? (
                      <span className="inline-flex items-center gap-2 text-sm text-faint">
                        <Loader2 className="size-4 animate-spin" /> Analizando tus
                        resultados…
                      </span>
                    ) : (
                      <MarkdownLite text={streaming} />
                    )}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {error && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-danger">
                <AlertCircle className="size-4" />
                {error}
              </p>
            )}

            {!busy && messages.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted transition hover:border-border-strong hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="mt-4 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
                placeholder="Pregúntale al asesor…"
                className="flex-1 rounded-xl border border-border bg-surface/70 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className={cn(buttonClasses("primary", "md"), "px-4")}
                aria-label="Enviar"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

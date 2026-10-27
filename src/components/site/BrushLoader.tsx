/** A brush stroke that paints itself while something loads. Calm and still for reduced motion. */
export function BrushLoader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <svg viewBox="0 0 220 80" className="w-48" aria-hidden>
        <path
          d="M12,52 C40,18 70,66 100,40 S160,14 208,34"
          fill="none" stroke="var(--color-pink)" strokeWidth="9" strokeLinecap="round"
          style={{ strokeDasharray: 600, strokeDashoffset: 600 }}
          className="animate-[draw_1.4s_ease-in-out_infinite_alternate] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
        />
        <circle cx="208" cy="34" r="5" fill="var(--color-foreground)" className="animate-pulse motion-reduce:animate-none" />
      </svg>
      <p className="font-script mt-4 text-5xl leading-none">{label}</p>
      {hint ? <p className="type mt-3 max-w-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Compact brush stroke for inline slots (e.g. Mail Club price while catalogue loads). */
export function PriceLoader() {
  return (
    <span role="status" aria-live="polite" aria-label="Checking price" className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 56 18" className="h-4 w-14 shrink-0" aria-hidden>
        <path
          d="M3,11 C14,3 22,15 32,9 S48,5 53,10"
          fill="none" stroke="var(--color-pink)" strokeWidth="2.4" strokeLinecap="round"
          style={{ strokeDasharray: 90, strokeDashoffset: 90 }}
          className="animate-[draw_1.2s_ease-in-out_infinite_alternate] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
        />
      </svg>
      <span className="eyebrow text-muted-foreground">Checking price…</span>
    </span>
  );
}

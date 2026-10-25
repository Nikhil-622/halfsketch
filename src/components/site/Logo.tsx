/**
 * Wordmark from public/assets/logo.webp (artwork centered, white knocked out).
 * The box clips to the letters. Footer includes the tagline line.
 */
export function Logo({ className = "h-12", withTagline = false }: { className?: string; withTagline?: boolean }) {
  return (
    <span
      className={`relative inline-block overflow-hidden bg-transparent ${className}`}
      style={{ aspectRatio: withTagline ? "750 / 545" : "750 / 470" }}
    >
      <img
        src="/assets/logo.webp"
        alt="Halfस्केच"
        width={1254}
        height={1254}
        decoding="async"
        fetchPriority="high"
        className="absolute max-w-none"
        style={
          withTagline
            ? { width: "167.2%", left: "-41.33%", top: "-63.3%" }
            : { width: "167.2%", left: "-41.33%", top: "-73.4%" }
        }
      />
    </span>
  );
}

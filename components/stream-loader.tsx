"use client"
export default function Loader({ label = "Thinking" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-1.5 px-1 py-1 text-xs text-zinc-500 dark:text-zinc-400">
      <style>{`
        @keyframes matrix-pulse {
          0%, 80%, 100% {
          opacity: 0.25; transform: scale(0.7);
          }
          40% {
          opacity: 1;
          transform: scale(1);
          }
        }
      `}</style>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="size-1 rounded-full bg-zinc-500 dark:bg-zinc-400"
            style={{ animation: "matrix-pulse 1s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span>{label}</span>
    </div>
  )
}
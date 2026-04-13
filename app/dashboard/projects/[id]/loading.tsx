export default function ProjectDetailLoading() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-10"
      role="status"
      aria-busy="true"
      aria-label="Loading project"
    >
      <span className="sr-only">Loading project…</span>
      <div className="space-y-4">
        <div className="h-4 w-40 max-w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-10 max-w-xs rounded-lg bg-muted animate-pulse" />
        <div className="h-4 max-w-lg rounded-lg bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="mb-4 h-3 w-16 rounded-md bg-muted animate-pulse" />
          <div className="aspect-4/3 w-full rounded-xl bg-muted animate-pulse" />
        </section>
        <section className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="mb-4 h-3 w-20 rounded-md bg-muted animate-pulse" />
          <div className="aspect-4/3 w-full rounded-xl bg-muted animate-pulse" />
        </section>
      </div>
    </div>
  );
}

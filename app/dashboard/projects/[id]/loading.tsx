export default function ProjectDetailLoading() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-8"
      role="status"
      aria-busy="true"
      aria-label="Loading project"
    >
      <span className="sr-only">Loading project…</span>
      <div className="space-y-2">
        <div className="h-4 w-36 max-w-full rounded-md bg-muted animate-pulse" />
        <div className="h-8 max-w-56 rounded-md bg-muted animate-pulse" />
        <div className="h-4 max-w-md rounded-md bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 h-3 w-16 rounded bg-muted animate-pulse" />
          <div className="aspect-4/3 w-full rounded-lg bg-muted animate-pulse" />
        </section>
        <section className="flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="aspect-4/3 w-full rounded-lg bg-muted animate-pulse" />
        </section>
      </div>
    </div>
  );
}

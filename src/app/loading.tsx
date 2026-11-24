export default function Loading() {
  return (
    <div className="loading-page" aria-label="Loading workspace" role="status">
      <div className="loading-brand">Vesttara</div>
      <div className="skeleton sk-heading" />
      <div className="skeleton-row">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton" />
        ))}
      </div>
      <div className="skeleton sk-chart" />
    </div>
  );
}

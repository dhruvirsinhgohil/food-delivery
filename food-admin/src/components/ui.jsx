export function StatusBadge({ status }) {
  const label = (status || "unknown").replaceAll("_", " ");
  return <span className={`status-badge status-${(status || "unknown").toLowerCase().replaceAll("_", "-")}`}><i />{label}</span>;
}

export function EmptyMessage({ title, detail }) {
  return <div className="empty-state"><span>✦</span><strong>{title}</strong><p>{detail}</p></div>;
}

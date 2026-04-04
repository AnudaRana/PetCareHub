export function formatCurrency(value) {
  return `Rs ${Number(value || 0).toFixed(0)}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatTime(value) {
  if (!value) return "Any time during opening hours";
  const normalized = value.length === 5 ? `${value}:00` : value;
  return new Intl.DateTimeFormat("en-LK", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(`1970-01-01T${normalized}`));
}

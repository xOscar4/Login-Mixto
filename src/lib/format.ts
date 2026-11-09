export function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

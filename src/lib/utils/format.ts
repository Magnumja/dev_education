const RELATIVE = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/** "há 2 dias", "há 5 minutos" — vazio quando a data é inválida. */
export function formatRelativeTime(date: string | null): string {
  if (!date) return "";

  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "";

  const elapsed = timestamp - Date.now();

  for (const [unit, size] of UNITS) {
    if (Math.abs(elapsed) >= size) {
      return RELATIVE.format(Math.round(elapsed / size), unit);
    }
  }

  return "agora";
}

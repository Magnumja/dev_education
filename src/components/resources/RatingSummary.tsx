import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Média em estrelas, para leitura.
 *
 * Meia estrela é representada por sobreposição com largura recortada, e não
 * arredondando a nota: 4,4 e 4,6 viram estrelas visivelmente diferentes, o que
 * importa quando a ordenação por avaliação usa justamente essa diferença.
 */
export function RatingSummary({
  average,
  count,
  size = "sm",
  className,
}: {
  average: number | null;
  count: number;
  size?: "sm" | "md";
  className?: string;
}) {
  if (average === null || count === 0) return null;

  const estrela = size === "md" ? "size-4" : "size-3.5";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`${average.toFixed(1)} de 5, com ${count} ${count === 1 ? "avaliação" : "avaliações"}`}
    >
      <span aria-hidden className="relative inline-flex">
        <span className="flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(estrela, "text-line")} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: `${(average / 5) * 100}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              className={cn(estrela, "shrink-0 fill-brand-400 text-brand-400")}
            />
          ))}
        </span>
      </span>

      <span className="text-xs text-ink-500">
        {average.toFixed(1).replace(".", ",")}
        <span className="text-ink-400"> ({count})</span>
      </span>
    </span>
  );
}

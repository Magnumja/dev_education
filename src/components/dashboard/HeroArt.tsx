import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { FunnelIllustration } from "@/components/dashboard/FunnelIllustration";
import { cn } from "@/lib/utils/cn";

const ART_PATH = "/images/funil-deveducation.png";

/**
 * Usa a ilustração oficial do funil quando ela existe em `public/images/`
 * e cai no SVG desenhado enquanto o arquivo não estiver no repositório.
 * Assim a Home nunca quebra por causa de um asset ausente.
 */
export function HeroArt({ className }: { className?: string }) {
  const hasArtwork = existsSync(join(process.cwd(), "public", ART_PATH));

  if (!hasArtwork) return <FunnelIllustration className={className} />;

  // A arte tem fundo branco e cores de marca (vermelho do YouTube, o G do
  // Google) que não podem ser invertidas. Por isso ela ganha um painel claro
  // próprio, que continua legível no tema escuro.
  return (
    <div className={cn("overflow-hidden rounded-lg bg-white p-2", className)}>
      <Image
        src={ART_PATH}
        alt="Conteúdos de YouTube, Google, PDFs, documentações, sites e repositórios passam por um funil e chegam organizados ao desenvolvedor."
        width={1456}
        height={1092}
        priority
        className="h-auto w-full"
      />
    </div>
  );
}

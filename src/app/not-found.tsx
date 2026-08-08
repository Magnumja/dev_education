import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="py-20">
      <EmptyState
        title="Não encontramos esta página."
        description="O endereço pode ter mudado ou o conteúdo saiu do catálogo. Tente buscar pelo assunto."
      >
        <div className="flex flex-wrap justify-center gap-2">
          <ButtonLink href="/search" size="sm">
            Buscar conteúdos
          </ButtonLink>
          <ButtonLink href="/topics" variant="secondary" size="sm">
            Ver tecnologias
          </ButtonLink>
        </div>
      </EmptyState>
    </div>
  );
}

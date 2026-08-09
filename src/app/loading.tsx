import { RouteLoading } from "@/components/layout/RouteLoading";

/**
 * Limite de Suspense da rota raiz: vale para toda navegação que não tenha um
 * `loading` mais específico. É o que faz o clique reagir na hora.
 */
export default function Loading() {
  return <RouteLoading />;
}

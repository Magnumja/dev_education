"use client";

import { cn } from "@/lib/utils/cn";

interface ExternalResourceLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  resourceId: string;
  url: string;
}

/**
 * Leva o usuário à fonte original mantendo o destino visível na barra de status.
 * O clique é registrado por beacon, sem atrasar a navegação.
 */
export function ExternalResourceLink({
  resourceId,
  url,
  className,
  children,
  ...props
}: ExternalResourceLinkProps) {
  function recordClick() {
    const payload = JSON.stringify({ resourceId });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/clicks",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/clicks", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={recordClick}
      onAuxClick={recordClick}
      className={cn("transition-quick", className)}
      {...props}
    >
      {children}
    </a>
  );
}

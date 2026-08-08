/**
 * O funil da marca: muitas fontes entram, o conteúdo certo sai organizado.
 * SVG inline para acompanhar o tema e não pesar como imagem.
 */
export function FunnelIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 260"
      className={className}
      role="img"
      aria-label="Diagrama: conteúdos de várias fontes passam por um funil e chegam organizados ao desenvolvedor."
    >
      <defs>
        <linearGradient id="funnel-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-500)" />
          <stop offset="55%" stopColor="var(--color-brand-400)" />
          <stop offset="100%" stopColor="var(--color-brand-300)" />
        </linearGradient>
        <marker
          id="funnel-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="var(--color-ink-400)" />
        </marker>
      </defs>

      {/* Fontes de entrada */}
      {[
        { y: 34, label: "YouTube" },
        { y: 84, label: "PDFs" },
        { y: 134, label: "Documentações" },
        { y: 184, label: "Repositórios" },
      ].map((source, index) => (
        <g key={source.label}>
          <rect
            x="10"
            y={source.y}
            width="74"
            height="30"
            rx="7"
            fill="var(--color-surface-muted)"
            stroke="var(--color-line)"
          />
          <text
            x="47"
            y={source.y + 19}
            textAnchor="middle"
            fontSize="10.5"
            fill="var(--color-ink-500)"
            fontFamily="var(--font-sans)"
          >
            {source.label}
          </text>
          <path
            d={`M92 ${source.y + 15} C 128 ${source.y + 15}, 132 ${
              104 + index * 4
            }, 158 ${106 + index * 3}`}
            fill="none"
            stroke="var(--color-ink-400)"
            strokeWidth="1.3"
            strokeDasharray="4 4"
            markerEnd="url(#funnel-arrow)"
            opacity="0.75"
          />
        </g>
      ))}

      {/* Funil */}
      <path
        d="M170 78 L286 78 L240 152 L240 206 L216 194 L216 152 Z"
        fill="url(#funnel-fill)"
        opacity="0.92"
      />
      <path
        d="M170 78 L286 78 L240 152 L240 206 L216 194 L216 152 Z"
        fill="none"
        stroke="var(--color-brand-600)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse
        cx="228"
        cy="78"
        rx="58"
        ry="11"
        fill="var(--color-brand-300)"
        opacity="0.55"
      />
      <text
        x="228"
        y="118"
        textAnchor="middle"
        fontSize="15"
        fontWeight="600"
        fill="#ffffff"
        fontFamily="var(--font-sans)"
      >
        {"</>"}
      </text>

      {/* Saída organizada */}
      <path
        d="M292 150 L318 150"
        stroke="var(--color-ink-400)"
        strokeWidth="1.3"
        strokeDasharray="4 4"
        markerEnd="url(#funnel-arrow)"
      />
      <rect
        x="322"
        y="88"
        width="88"
        height="94"
        rx="9"
        fill="var(--color-surface)"
        stroke="var(--color-line)"
        strokeWidth="1.5"
      />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect
            x="332"
            y={102 + row * 26}
            width="16"
            height="16"
            rx="4"
            fill="var(--color-brand-400)"
            opacity={1 - row * 0.22}
          />
          <rect
            x="356"
            y={105 + row * 26}
            width="44"
            height="4"
            rx="2"
            fill="var(--color-ink-400)"
            opacity="0.5"
          />
          <rect
            x="356"
            y={113 + row * 26}
            width="30"
            height="4"
            rx="2"
            fill="var(--color-ink-400)"
            opacity="0.3"
          />
        </g>
      ))}
      <rect
        x="336"
        y="188"
        width="60"
        height="5"
        rx="2.5"
        fill="var(--color-line)"
      />
    </svg>
  );
}

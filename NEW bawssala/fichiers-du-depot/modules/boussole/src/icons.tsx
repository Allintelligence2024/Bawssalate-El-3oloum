import React from "react";
export function Icon({
  name,
  size = 18,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    arrow: (
      <>
        <path d="M4 12h15m-6-6 6 6-6 6" />
      </>
    ),
    back: (
      <>
        <path d="M20 12H5m6 6-6-6 6-6" />
      </>
    ),
    caret: <path d="m9 5 7 7-7 7" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    layers: (
      <>
        <path d="m3 8 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5m-18 5 9 5 9-5" />
      </>
    ),
    chart: (
      <>
        <path d="M3 19h18M6 15v-4m6 4V5m6 10V8" />
      </>
    ),
    book: (
      <>
        <path d="M12 6v14M3 5c4-1 6 0 9 2 3-2 5-3 9-2v13c-4-1-6 0-9 2-3-2-5-3-9-2z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    flask: (
      <>
        <path d="M9 3h6m-5 0v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-9V3M7 15h10" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </>
    ),
    pin: (
      <>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
      </>
    ),
    sort: (
      <>
        <rect x="3" y="3" width="7" height="8" rx="1.5" />
        <rect x="14" y="3" width="7" height="13" rx="1.5" />
        <path d="M6.5 15v6m-3-3 3 3 3-3" />
      </>
    ),
    table: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M9 4v16m-6-5h18" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    hide: (
      <>
        <path d="m3 3 18 18M9 5.5c6-2 12 6.5 12 6.5s-1 2-3 4M15 18c-6 3-13-6-13-6s2-3 5-5" />
      </>
    ),
    pen: (
      <>
        <path d="m4 16 12-12a2 2 0 0 1 4 4L8 20l-5 1zM13 7l4 4M4 16l4 4" />
      </>
    ),
    measure: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 6v6m4-6v3m4-3v6" />
      </>
    ),
    compare: (
      <>
        <path d="M3 8h16m-4-4 4 4-4 4m6 4H5m4-4-4 4 4 4" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 17v-2c0-2-4-3-4-7a7 7 0 0 1 14 0c0 4-4 5-4 7v2zm0 3h6" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v.1" />
      </>
    ),
    close: <path d="m5 5 14 14M19 5 5 19" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
      </>
    ),
    leaf: (
      <>
        <path d="M4 16C4 5 14 6 21 3c0 11-3 17-12 16m-6 2L15 9" />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
    reset: (
      <>
        <path d="M3 11a9 9 0 1 1 2 7M3 4v7h7" />
      </>
    ),
    shield: (
      <>
        <path d="M12 2 3 6v6c0 5 4 7 9 10 5-3 9-5 9-10V6z" />
        <path d="m8 11 3 3 5-6" />
      </>
    ),
    tiles: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    route: (
      <>
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="6" r="2" />
        <path d="M7 18h6a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h6" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.book}
    </svg>
  );
}
export function Compass({ small = false }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width={small ? 25 : 40}
      height={small ? 25 : 40}
      viewBox="0 0 44 44"
      fill="none"
    >
      <rect x="1" y="1" width="42" height="42" rx="12" fill="#173f35" />
      <circle
        cx="22"
        cy="22"
        r="13"
        stroke="#a6be9b"
        strokeWidth=".85"
        strokeDasharray="2.4 3"
      />
      <path d="m30.8 10.2-5.1 15.2-13.5 8.4 6-16.4z" fill="#f4c76a" />
      <path d="m30.8 10.2-8.7 11.9-9.9 11.7 6-16.4z" fill="#f7efd1" />
      <circle cx="22" cy="22" r="2.1" fill="#173f35" />
    </svg>
  );
}

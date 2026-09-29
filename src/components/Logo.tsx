import React from "react";

/*
  Official Qeloma 3D logo mark featuring orbiting focus lens ring,
  pulsing terracotta core, sheen tile, and signature corner pixel.
*/
export default function QelomaMark({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Qeloma logo"
    >
      <defs>
        <linearGradient id="g-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B5268" />
          <stop offset="1" stopColor="#1B2733" />
        </linearGradient>
        <linearGradient id="g-core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0743F" />
          <stop offset="1" stopColor="#8E3A1E" />
        </linearGradient>
        <radialGradient id="g-sheen" cx="0.32" cy="0.28" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.45" />
        </linearGradient>
        <filter id="f-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <filter id="f-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="clip-tile">
          <rect x="6" y="6" width="88" height="88" rx="20" />
        </clipPath>
      </defs>

      {/* 3D tile: base, face gradient, top sheen, bottom shade */}
      <rect x="6" y="9" width="88" height="88" rx="20" fill="#0C141C" />
      <rect x="6" y="6" width="88" height="88" rx="20" fill="url(#g-tile)" />
      <g clipPath="url(#clip-tile)">
        <rect x="6" y="6" width="88" height="88" fill="url(#g-sheen)" />
        <rect x="6" y="70" width="88" height="28" fill="#000000" opacity="0.18" />
        {/* scan sweep */}
        <rect x="-30" y="6" width="26" height="88" fill="#E0743F" opacity="0.0">
          <animate
            attributeName="x"
            values="-30;100"
            dur="3.6s"
            begin="0.4s"
            repeatCount="indefinite"
            keyTimes="0;1"
            calcMode="spline"
            keySplines="0.4 0 0.2 1"
          />
          <animate
            attributeName="opacity"
            values="0;0.18;0"
            dur="3.6s"
            begin="0.4s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* orbiting focus ring group */}
      <g transform="translate(50 50)">
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="14s"
            repeatCount="indefinite"
          />
          <circle
            r="26"
            fill="none"
            stroke="url(#g-ring)"
            strokeWidth="2.4"
            strokeOpacity="0.30"
            strokeDasharray="120 40"
          />
          <circle r="2.6" cx="0" cy="-26" fill="#fff" opacity="0.9" />
        </g>
        {/* static inner lens ring */}
        <circle
          r="20"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeOpacity="0.92"
          filter="url(#f-soft)"
        />
        <circle r="20" fill="#16222E" fillOpacity="0.35" />
        {/* pulsing terracotta core */}
        <g filter="url(#f-glow)">
          <circle r="8.5" fill="url(#g-core)">
            <animate
              attributeName="r"
              values="7.6;9.4;7.6"
              dur="2.4s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.5;1"
              keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
            />
          </circle>
          <circle
            r="8.5"
            fill="none"
            stroke="#E0743F"
            strokeWidth="1.4"
            opacity="0"
          >
            <animate
              attributeName="r"
              values="8.5;15"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" cx="-2.2" cy="-2.2" fill="#fff" opacity="0.55" />
        </g>
        {/* lens handle */}
        <path
          d="M14.5 14.5 L30 30"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeOpacity="0.92"
        />
        <path
          d="M14.5 14.5 L30 30"
          stroke="#C0532E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </g>

      {/* signature corner pixel */}
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#C0532E">
        <animate
          attributeName="opacity"
          values="1;0.35;1"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}



import { SVGProps } from "react";

export const HangerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 4C10.9 4 10 4.9 10 6C10 6.7 10.4 7.4 11 7.7V8L4 15V17C4 18.1 4.9 19 6 19H18C19.1 19 20 18.1 20 17V15L13 8V7.7C13.6 7.4 14 6.7 14 6C14 4.9 13.1 4 12 4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="5.5" r="1.5" fill="currentColor" />
  </svg>
);

export const FabricIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 3H21V21H3V3Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M3 8H21M3 13H21M3 18H21" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <path d="M8 3V21M13 3V21M18 3V21" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <path
      d="M6 6L9 9M14 6L17 9M6 14L9 17M14 14L17 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

export const TechnicalBadge = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7V12L15 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ScanIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 7V5C3 3.9 3.9 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 3H19C20.1 3 21 3.9 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M21 17V19C21 20.1 20.1 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 21H5C3.9 21 3 20.1 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);

export const GridOverlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="7" cy="7" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="17" cy="7" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="7" cy="17" r="1" fill="currentColor" opacity="0.6" />
    <circle cx="17" cy="17" r="1" fill="currentColor" opacity="0.6" />
  </svg>
);

export const DataPointIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
    <path d="M12 4V8M12 16V20M4 12H8M16 12H20" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

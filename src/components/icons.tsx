import type { SVGProps } from "react";

export function XChefLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M168 40.7a16 16 0 0 1 20.4 25.4l-32 40a16 16 0 0 1-25.4-20.4l-40-32a16 16 0 0 1 20.4-25.4l40 32 16.6-20.8zM92.3 112a16 16 0 0 1-25.4 20.4l-40 32A16 16 0 0 1 7.7 144l32-40a16 16 0 0 1 20.4-25.4l-32-40a16 16 0 0 1 25.4-20.4l40 32z"
      />
      <path
        fill="currentColor"
        d="M213.3 106.3a16 16 0 0 0-21.8 4.9l-44.8 67.2a16 16 0 1 0 26.6 17.8l44.8-67.2a16 16 0 0 0-4.8-22.7z"
      />
      <path
        fill="currentColor"
        d="M136.2 119.8c-3.3-3-8-4.2-12.4-3.4l-21.3 3.9a16.1 16.1 0 0 0-12.2 12.3l-3.9 21.2a15.9 15.9 0 0 0 19.3 19.3l21.2-3.9a16.1 16.1 0 0 0 12.3-12.2l3.9-21.2a16.1 16.1 0 0 0-3.1-12.6zm-12.5 28.1a4 4 0 0 1-3.1 3.1l-21.2 3.9a4 4 0 0 1-4.8-4.8l3.9-21.2a4 4 0 0 1 3.1-3.1l21.2-3.9a4 4 0 0 1 4.8 4.8z"
      />
      <path
        fill="currentColor"
        d="M128 168a12 12 0 1 0-12-12 12 12 0 0 0 12 12z"
      />
    </svg>
  );
}

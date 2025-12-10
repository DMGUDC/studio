import type { SVGProps } from "react";
import Image from "next/image";

interface XChefLogoProps {
  className?: string;
}

export function XChefLogo({ className = "h-8 w-8" }: XChefLogoProps) {
  // Extrae el tamaño de la clase (h-8 = 32px, h-16 = 64px, etc.)
  const sizeMatch = className.match(/h-(\d+)/);
  const size = sizeMatch ? parseInt(sizeMatch[1]) * 4 : 32; // Tailwind h-8 = 32px
  
  return (
    <Image
      src="/logo.png"
      alt="XChef Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

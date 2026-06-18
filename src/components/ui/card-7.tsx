"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  title: string;
  price: string;
  badge?: string | null;
}

/**
 * Carte produit interactive 3D (effet tilt au survol).
 * Adaptée de https://21st.dev/r/ravikatiyar162/card-7
 */
export function InteractiveProductCard({
  className,
  imageUrl,
  title,
  price,
  badge,
  ...props
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -6;
    const rotateY = ((x - width / 2) / (width / 2)) * 6;
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        "group relative w-full aspect-[4/3] rounded-2xl bg-secondary shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ transform: "translateZ(-10px)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {badge && (
        <div
          className="absolute top-3 left-3"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="inline-block bg-background/95 backdrop-blur text-foreground text-[10px] tracking-luxe-sm uppercase px-3 py-1.5 font-sans rounded-full shadow-sm">
            {badge}
          </span>
        </div>
      )}

      <div
        className="absolute bottom-3 right-3"
        style={{ transform: "translateZ(30px)" }}
      >
        <span className="inline-block bg-black/40 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded-full">
          {price}
        </span>
      </div>
    </div>
  );
}

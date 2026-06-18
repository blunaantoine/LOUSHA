"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  title: string;
  badge?: string | null;
}

/**
 * Carte produit avec effet de survol subtil (zoom image + ombre).
 * Image en object-contain pour ne pas couper/déformer les photos.
 */
export function InteractiveProductCard({
  className,
  imageUrl,
  title,
  badge,
  ...props
}: InteractiveProductCardProps) {
  return (
    <div
      className={cn(
        "group relative w-full aspect-square rounded-2xl bg-secondary overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500",
        className
      )}
      {...props}
    >
      {/* Image — object-contain pour afficher toute la photo sans coupe */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <img
          src={imageUrl}
          alt={title}
          className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Badge (Nouveauté / Best-seller) — en haut à gauche */}
      {badge && (
        <span className="absolute top-3 left-3 z-10 bg-background/95 backdrop-blur text-foreground text-[10px] tracking-luxe-sm uppercase px-3 py-1.5 font-sans rounded-full shadow-sm">
          {badge}
        </span>
      )}
    </div>
  );
}

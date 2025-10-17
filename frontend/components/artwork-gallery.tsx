"use client";

import { ArtworkCard } from "@/components/artwork-card";
import type { Artwork } from "@/lib/mock-data";

interface ArtworkGalleryProps {
  artworks: Artwork[];
}

export function ArtworkGallery({ artworks }: ArtworkGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}

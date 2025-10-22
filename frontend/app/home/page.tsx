"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { ArtworkGallery } from "@/components/artwork-gallery";
import { fetchArtworks } from "@/lib/api";
import type { Artwork } from "@/lib/mock-data";
import Loading from "@/components/Loading";

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const data = await fetchArtworks();

        // Helper: convert bytes -> base64url
        const bytesToBase64Url = (bytes: number[]) => {
          // create binary string from bytes
          let bin = "";
          for (let i = 0; i < bytes.length; i++)
            bin += String.fromCharCode(bytes[i]);
          const b64 =
            typeof btoa === "function"
              ? btoa(bin)
              : Buffer.from(bin, "binary").toString("base64");
          return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        };

        // Helper: produce a stable, URL-safe id
        const normalizeId = (raw: any) => {
          if (!raw && raw !== 0) return "";

          // If it's an object with toHexString (Mongo ObjectId), use that
          if (typeof raw === "object" && raw !== null) {
            if (typeof (raw as any).toHexString === "function") {
              return (raw as any).toHexString();
            }
            // Buffer-like (Node) -> convert to base64url
            if (
              typeof (raw as any).toString === "function" &&
              (raw as any).buffer instanceof ArrayBuffer
            ) {
              const buf = Buffer.from((raw as any).buffer);
              return buf
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
            }
          }

          const s = String(raw);

          // Binary.createFromBase64('BASE64', ...)
          const matchBase64 = s.match(
            /Binary\.createFromBase64\('([A-Za-z0-9+/=]+)'\)/
          );
          if (matchBase64) {
            const base64 = matchBase64[1];
            return base64
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "");
          }

          // Escaped hex sequences like b'\x97\x1a...' or sequences with \xHH
          if (/\\x[0-9A-Fa-f]{2}/.test(s)) {
            const bytes: number[] = [];
            const re = /\\x([0-9A-Fa-f]{2})/g;
            let m;
            while ((m = re.exec(s)) !== null) {
              bytes.push(parseInt(m[1], 16));
            }
            if (bytes.length) return bytesToBase64Url(bytes);
          }

          // If string looks like raw base64 (ends with == or contains +/), convert to base64url
          if (
            /^[A-Za-z0-9+/=]+$/.test(s) &&
            (s.endsWith("=") || /[+/]/.test(s))
          ) {
            return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          }

          // Fallback: base64url of the UTF-8 encoded string
          try {
            // encodeURIComponent -> percent-escapes -> convert to bytes
            const encoded = encodeURIComponent(s);
            const bytes: number[] = [];
            for (let i = 0; i < encoded.length; ) {
              if (encoded[i] === "%") {
                const hex = encoded.slice(i + 1, i + 3);
                bytes.push(parseInt(hex, 16));
                i += 3;
              } else {
                bytes.push(encoded.charCodeAt(i));
                i++;
              }
            }
            return bytesToBase64Url(bytes);
          } catch {
            return encodeURIComponent(s);
          }
        };

        // Thorough normalization so detail page receives stable types
        const normalized = (data || []).map((a: any) => {
          const item = { ...a };

          // Prefer _id for canonical id, otherwise id
          const rawId = item._id ?? item.id;
          item._id = rawId;
          item.id = normalizeId(rawId);

          // Convert time fields to Date instances (guard invalid dates)
          const toDate = (val: any) => {
            if (!val) return undefined;
            if (val instanceof Date) return val;
            const d = new Date(val);
            return isNaN(d.getTime()) ? undefined : d;
          };
          item.end_time =
            toDate(item.end_time ?? item.endTime) ?? item.end_time;
          item.start_time =
            toDate(item.start_time ?? item.startTime) ?? item.start_time;

          // Parse numeric fields
          const toNum = (v: any) => {
            if (v === null || v === undefined) return v;
            const n = typeof v === "number" ? v : parseFloat(String(v));
            return Number.isFinite(n) ? n : v;
          };
          item.starting_bid = toNum(item.starting_bid);
          item.current_bid = toNum(item.current_bid);
          item.min_increment = toNum(item.min_increment);

          // Coerce booleans
          if (typeof item.is_active === "string") {
            item.is_active = item.is_active === "true";
          } else {
            item.is_active = Boolean(item.is_active);
          }

          // Ensure image_url exists as string (detail pages and <Image> expect a string)
          if (item.image_url && typeof item.image_url !== "string") {
            try {
              item.image_url = String(item.image_url);
            } catch {
              // leave as-is
            }
          }

          return item as Artwork;
        });

        setArtworks(normalized);
      } catch (error) {
        console.error("Failed to load artworks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadArtworks();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            Discover Exceptional
            <span className="block text-primary">Artworks</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-8">
            Bid on curated collections from renowned artists worldwide.
            Experience the thrill of live auctions from the comfort of your
            home.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container mx-auto">
          <ArtworkGallery artworks={artworks} />
        </div>
      </section>
    </div>
  );
}

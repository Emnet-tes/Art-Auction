"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { ArtworkGallery } from "@/components/artwork-gallery";
import { fetchArtworks, createArtwork as apiCreateArtwork } from "@/lib/api";
import type { Artwork } from "@/lib/mock-data";
import Loading from "@/components/Loading";
import axios from "axios";

export default function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: modal + form state ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    artist: "",
    description: "",
    category: "",
    starting_bid: "",
    min_increment: "", // <-- added
    image_url: "",
    end_time: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Add category choices for the create modal
  const CATEGORY_CHOICES = [
    { value: "Painting", label: "Painting" },
    { value: "Sculpture", label: "Sculpture" },
    { value: "Digital", label: "Digital" },
    { value: "Photography", label: "Photography" },
  ];

  // --- Hoist loadArtworks so we can reuse it after creation ---
  const loadArtworks = async () => {
    setLoading(true);
    try {
      const data = await fetchArtworks();

      // reuse normalization logic (kept concise here)
      const bytesToBase64Url = (bytes: number[]) => {
        let bin = "";
        for (let i = 0; i < bytes.length; i++)
          bin += String.fromCharCode(bytes[i]);
        const b64 =
          typeof btoa === "function"
            ? btoa(bin)
            : Buffer.from(bin, "binary").toString("base64");
        return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      };
      const normalizeId = (raw: any) => {
        if (!raw && raw !== 0) return "";
        if (typeof raw === "object" && raw !== null) {
          if (typeof (raw as any).toHexString === "function")
            return (raw as any).toHexString();
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
        const matchBase64 = s.match(
          /Binary\.createFromBase64\('([A-Za-z0-9+/=]+)'\)/
        );
        if (matchBase64)
          return matchBase64[1]
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
        if (/\\x[0-9A-Fa-f]{2}/.test(s)) {
          const bytes: number[] = [];
          const re = /\\x([0-9A-Fa-f]{2})/g;
          let m;
          while ((m = re.exec(s)) !== null) bytes.push(parseInt(m[1], 16));
          if (bytes.length) return bytesToBase64Url(bytes);
        }
        if (
          /^[A-Za-z0-9+/=]+$/.test(s) &&
          (s.endsWith("=") || /[+/]/.test(s))
        ) {
          return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }
        try {
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

      const normalized = (data || []).map((a: any) => {
        const item = { ...a };
        const rawId = item._id ?? item.id;
        item._id = rawId;
        item.id = normalizeId(rawId ?? "");
        const toDate = (val: any) => {
          if (!val) return undefined;
          if (val instanceof Date) return val;
          const d = new Date(val);
          return isNaN(d.getTime()) ? undefined : d;
        };
        item.end_time = toDate(item.end_time ?? item.endTime) ?? item.end_time;
        item.start_time =
          toDate(item.start_time ?? item.startTime) ?? item.start_time;
        const toNum = (v: any) => {
          if (v === null || v === undefined) return v;
          const n = typeof v === "number" ? v : parseFloat(String(v));
          return Number.isFinite(n) ? n : v;
        };
        item.starting_bid = toNum(item.starting_bid);
        item.current_bid = toNum(item.current_bid);
        item.min_increment = toNum(item.min_increment);
        if (typeof item.is_active === "string")
          item.is_active = item.is_active === "true";
        else item.is_active = Boolean(item.is_active);
        if (item.image_url && typeof item.image_url !== "string") {
          try {
            item.image_url = String(item.image_url);
          } catch {}
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

  useEffect(() => {
    loadArtworks();
  }, []);

  // inside createArtwork handler
  const createArtwork = async (e?: any) => {
    if (e) e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      const payload = {
        title: form.title,
        artist: form.artist,
        description: form.description,
        category: form.category,
        starting_bid: form.starting_bid
          ? parseFloat(form.starting_bid)
          : undefined,
        min_increment: form.min_increment
          ? parseFloat(form.min_increment)
          : undefined, // <-- include min_increment
        image_url: form.image_url,
        end_time: form.end_time
          ? new Date(form.end_time).toISOString() // <-- convert datetime-local to ISO
          : undefined,
      };
      const res = await axios.post(`${API_URL}/artworks/`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      // reload artworks and reset form
      await loadArtworks();
      setShowCreateModal(false);
      setForm({
        title: "",
        artist: "",
        description: "",
        category: "",
        starting_bid: "",
        min_increment: "", // <-- reset min_increment
        image_url: "",
        end_time: "",
      });
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.detail || "Network error");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* NEW: Create Artwork button (next to hero) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
          >
            Create Artwork
          </button>
        </div>
      </div>

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

      {/* Modal (simple) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Artwork</h2>
            <form onSubmit={createArtwork} className="space-y-3">
              <div>
                <label className="block text-sm">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Artist</label>
                <input
                  value={form.artist}
                  onChange={(e) => setForm({ ...form, artist: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
               <div>
                <label className="block text-sm">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              {/* Image preview */}
              {form.image_url && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden rounded">
                    <img
                      src={form.image_url}
                      alt="Artwork preview"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                      onError={(e: any) => {
                        e.currentTarget.src = "";
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Select category</option>
                    {CATEGORY_CHOICES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm">Starting Bid</label>
                  <input
                    type="number"
                    value={form.starting_bid}
                    onChange={(e) =>
                      setForm({ ...form, starting_bid: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>

              {/* NEW: min increment and end time row */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-sm">Min Increment</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.min_increment}
                    onChange={(e) =>
                      setForm({ ...form, min_increment: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm">
                    End time (date & time)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={(e) =>
                      setForm({ ...form, end_time: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>

              {formError && (
                <div className="text-sm text-red-600">{formError}</div>
              )}

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

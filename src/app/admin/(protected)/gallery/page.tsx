"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ImageIcon, Sparkles, FolderPlus } from "lucide-react";
import Image from "next/image";

type GalleryImage = {
  _id: string;
  imageUrl: string;
  altText: string;
  category: string;
};

const CATEGORIES = ["Bridal", "Reception", "Engagement", "Guest", "Mehendi", "Jewellery", "Hairstyle", "Before & After"];

const PRESET_WORK = [
  { label: "Before & After HD Makeover", path: "/images/portfolio/before-after-hd-makeover.jpg", cat: "Before & After", alt: "HD Bridal Makeover Transformation by Maha Shree" },
  { label: "Traditional South Indian Bride", path: "/images/portfolio/traditional-south-indian-bride.jpg", cat: "Bridal", alt: "Outdoor Traditional South Indian Bride Look" },
  { label: "Pink Silk Saree & Gold Set", path: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg", cat: "Bridal", alt: "Royal Pink Silk Bridal Makeup & Antique Gold" },
  { label: "Full Standing Pose Saree Pleating", path: "/images/portfolio/full-bridal-pose-silk-saree.jpg", cat: "Saree Draping", alt: "Pre-Pleated Silk Saree & Temple Belt Pose" },
  { label: "HD Bridal Close-Up Portrait", path: "/images/portfolio/bridal-close-up-portrait.jpg", cat: "Jewellery", alt: "Glowing HD Bridal Portrait by Maha Shree" },
];

const EMPTY = { imageUrl: "", altText: "", category: "Bridal" };

export default function GalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState("All");

  const fetch_ = async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/gallery?category=${filter}`);
    setImages(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, [filter]);

  const save = async () => {
    await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm(EMPTY);
    fetch_();
  };

  const del = async (id: string) => {
    if (!confirm("Remove this image from gallery?")) return;
    await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetch_();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Portfolio Gallery</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage real makeover pictures done by Maha Shree</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground gap-2">
          <Plus size={16} /> Add New Picture
        </Button>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(EMPTY); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Add Picture to Portfolio</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              {/* Quick Select Presets */}
              <div className="p-3 bg-secondary/30 rounded-lg border border-border space-y-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} /> Quick Select Maha Shree's Work:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_WORK.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setForm({ imageUrl: preset.path, altText: preset.alt, category: preset.cat })}
                      className="text-[11px] bg-background hover:bg-primary/10 border border-primary/20 px-2.5 py-1 rounded transition-colors text-foreground"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Image URL or Local Path</Label>
                <Input 
                  value={form.imageUrl} 
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
                  placeholder="e.g. /images/portfolio/my-picture.jpg or https://..." 
                />
                <p className="text-[11px] text-muted-foreground">
                  You can paste any web URL or save photos into <code className="text-primary font-mono bg-muted px-1 py-0.5 rounded">public/images/portfolio/</code> and type <code className="text-primary font-mono bg-muted px-1 py-0.5 rounded">/images/portfolio/your-file.jpg</code>.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Title / Description</Label>
                <Input 
                  value={form.altText} 
                  onChange={e => setForm({ ...form, altText: e.target.value })} 
                  placeholder="Bridal HD Makeup & Saree Pleating by Maha Shree" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Category</Label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {form.imageUrl && (
                <div className="aspect-video relative rounded-lg overflow-hidden border border-primary/20 bg-muted shadow-sm">
                  <img src={form.imageUrl} alt="preview" className="object-cover w-full h-full" />
                </div>
              )}

              <Button onClick={save} className="w-full bg-primary text-primary-foreground py-5 text-xs uppercase tracking-widest font-semibold" disabled={!form.imageUrl || !form.altText}>
                Add to Portfolio Gallery
              </Button>
            </div>

          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              filter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading gallery...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-md">
          <ImageIcon className="mx-auto mb-4 text-muted-foreground" size={40} />
          <p className="text-muted-foreground">No images in this category. Add your first image above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img._id} className="group relative aspect-square rounded-md overflow-hidden border border-border bg-muted">
              <img src={img.imageUrl} alt={img.altText} className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <span className="text-white text-xs text-center line-clamp-2">{img.altText}</span>
                <span className="text-white/70 text-xs">{img.category}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-2"
                  onClick={() => del(img._id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

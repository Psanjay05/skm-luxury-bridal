"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ImageIcon, Sparkles, Upload, AlertCircle, Loader2 } from "lucide-react";

type GalleryImage = {
  _id: string;
  imageUrl: string;
  altText: string;
  category: string;
};

const CATEGORIES = [
  "Bridal",
  "Reception",
  "Engagement",
  "Guest",
  "Mehendi",
  "Jewellery",
  "Hairstyle",
  "Before & After",
];

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
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const url = filter === "All" ? "/api/gallery" : `/api/gallery?category=${encodeURIComponent(filter)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setImages(json.data ?? []);
      } else {
        setActionError(json.error || "Failed to fetch gallery images.");
      }
    } catch (err) {
      console.error("[FETCH_GALLERY_ERROR]", err);
      setActionError("Unable to fetch gallery. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [filter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setActionError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setForm((prev) => ({ ...prev, imageUrl: json.data.url }));
      } else {
        setActionError(json.error || "Cloudinary upload failed. You can manually enter an image URL.");
      }
    } catch (err) {
      console.error("[CLOUDINARY_UPLOAD_ERROR]", err);
      setActionError("Failed to upload image file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setOpen(false);
        setForm(EMPTY);
        fetchImages();
      } else {
        setActionError(json.error || "Failed to add image to portfolio.");
      }
    } catch (err) {
      console.error("[SAVE_GALLERY_ERROR]", err);
      setActionError("Failed to save image.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image from portfolio gallery?")) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        fetchImages();
      } else {
        setActionError(json.error || "Failed to remove image.");
      }
    } catch (err) {
      console.error("[DELETE_GALLERY_ERROR]", err);
      setActionError("Failed to remove image.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Portfolio Gallery</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage real makeover pictures and transformations done by Maha Shree</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground gap-2 font-semibold">
          <Plus size={16} /> Add Portfolio Picture
        </Button>
      </div>

      {actionError && (
        <div className="p-3.5 text-sm rounded-md bg-destructive/10 text-destructive flex items-center gap-2 font-medium">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(EMPTY); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Add Picture to Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {/* Quick Select Presets */}
            <div className="p-3 bg-secondary/30 rounded-lg border border-border space-y-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} /> Quick Select Studio Portfolio Photos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_WORK.map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => setForm({ imageUrl: preset.path, altText: preset.alt, category: preset.cat })}
                    className="text-[11px] bg-background hover:bg-primary/10 border border-primary/20 px-2.5 py-1 rounded transition-colors text-foreground font-medium"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cloudinary Upload Button */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider">Upload Image to Cloudinary</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="bg-background text-sm"
                />
                {uploading && <Loader2 size={18} className="animate-spin text-primary shrink-0" />}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider">Image URL or Local Path *</Label>
              <Input
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="e.g. https://res.cloudinary.com/... or /images/portfolio/..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider">Title / Alt Description *</Label>
              <Input
                value={form.altText}
                onChange={e => setForm({ ...form, altText: e.target.value })}
                placeholder="Bridal HD Makeup & Saree Pleating by Maha Shree"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider">Category *</Label>
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

            <Button
              onClick={handleSave}
              disabled={saving || !form.imageUrl || !form.altText}
              className="w-full bg-primary text-primary-foreground py-5 text-xs uppercase tracking-widest font-semibold"
            >
              {saving ? "Saving Image..." : "Add to Portfolio Gallery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
              filter === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-foreground border-border hover:border-primary/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-primary" /> Loading portfolio images...
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <ImageIcon className="mx-auto mb-4 text-muted-foreground" size={40} />
          <p className="text-muted-foreground">No images in this category. Click &quot;Add Portfolio Picture&quot; above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img._id} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted shadow-sm">
              <img src={img.imageUrl} alt={img.altText} className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                <span className="text-white text-xs font-medium text-center line-clamp-2">{img.altText}</span>
                <span className="text-primary-foreground/80 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-primary/40">{img.category}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-2 text-xs"
                  onClick={() => handleDelete(img._id)}
                >
                  <Trash2 size={14} /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

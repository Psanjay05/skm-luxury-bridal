"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Clock, AlertCircle, Sparkles, Tag, Check } from "lucide-react";

type Service = {
  _id?: string;
  title: string;
  price: string;
  tagline?: string;
  description: string;
  imageUrl: string;
  category: string;
  ctaText: string;
};

const CATEGORIES = [
  { value: "all", label: "All Services" },
  { value: "bridal_package", label: "Bridal Packages" },
  { value: "makeup", label: "Makeup & Skin" },
  { value: "hairstyle", label: "Hair Artistry" },
  { value: "saree", label: "Saree Draping" },
  { value: "jewellery", label: "Jewellery Rental" },
  { value: "mehendi", label: "Mehendi" },
  { value: "other", label: "Other Services" },
];

const PRESET_PRICES = ["₹18,000", "₹25,000", "₹35,000", "From ₹9,999", "From ₹12,999", "From ₹7,999", "From ₹2,500", "From ₹1,200", "From ₹999", "Contact Us"];

const EMPTY: Service = {
  title: "",
  price: "From ₹9,999",
  tagline: "",
  description: "",
  imageUrl: "/images/portfolio/bridal-pink-saree-gold-jewellery.jpg",
  category: "makeup",
  ctaText: "Book Now",
};

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Service>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchServices = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/services", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store" },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setServices(json.data ?? []);
      } else {
        const errorMsg = json.details
          ? `${json.error || "Failed to fetch services"} — ${typeof json.details === "string" ? json.details : JSON.stringify(json.details)}`
          : (json.error || `Failed to fetch services (HTTP ${res.status}).`);
        setActionError(errorMsg);
      }
    } catch (err: unknown) {
      console.error("[FETCH_SERVICES_ERROR]", err);
      const msg = err instanceof Error ? err.message : "Unable to reach server.";
      setActionError(`Unable to fetch services: ${msg}. Please refresh.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async () => {
    // Trim price but preserve exact characters — "just ₹20" must stay "just ₹20"
    const trimmedPrice = form.price.trim();
    if (!form.title.trim() || !trimmedPrice || !form.description.trim()) {
      setActionError("Please provide title, price, and description.");
      return;
    }

    setSaving(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
      const method = editingId ? "PATCH" : "POST";

      // BUG 2 FIX: Explicitly cast price to String before sending to API.
      // This prevents any accidental numeric coercion if the browser serialises
      // a value like "20" (digits-only) as a JSON number rather than a string.
      const payload = {
        ...form,
        price: String(trimmedPrice),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      const json = await res.json();

      if (res.ok && json.success) {
        // Optimistic instant UI update
        if (editingId) {
          setServices((prev) =>
            prev.map((item) => (item._id === editingId ? { ...item, ...form } : item))
          );
          setActionSuccess(`Updated "${form.title}" price to ${form.price}. Live on website!`);
        } else {
          if (json.data) {
            setServices((prev) => [json.data, ...prev]);
          }
          setActionSuccess(`Added "${form.title}" with price ${form.price}. Live on website!`);
        }

        setOpen(false);
        setForm(EMPTY);
        setEditingId(null);
        fetchServices();
      } else {
        const errorMsg = json.details
          ? `${json.error || "Failed to save service price"} (${typeof json.details === "string" ? json.details : JSON.stringify(json.details)})`
          : (json.error || "Failed to save service price.");
        setActionError(errorMsg);
      }
    } catch (err) {
      console.error("[SAVE_SERVICE_ERROR]", err);
      setActionError("Failed to save service. Check server connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: Service) => {
    setForm({
      ...EMPTY,
      ...s,
      price: s.price || "From ₹9,999",
    });
    setEditingId(s._id ?? null);
    setActionError(null);
    setActionSuccess(null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this service from the website?")) return;
    try {
      setActionError(null);
      setActionSuccess(null);
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setServices((prev) => prev.filter((s) => s._id !== id));
        setActionSuccess("Service removed successfully.");
        fetchServices();
      } else {
        setActionError(json.error || "Failed to delete service.");
      }
    } catch (err) {
      console.error("[DELETE_SERVICE_ERROR]", err);
      setActionError("Failed to delete service.");
    }
  };

  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Services & Package Pricing</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update pricing, descriptions, and packages. Changes sync live on the website immediately.
          </p>
        </div>
        <Button
          onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); setActionError(null); setActionSuccess(null); }}
          className="bg-primary text-primary-foreground gap-2 font-semibold shadow-md"
        >
          <Plus size={16} /> Add New Service / Package
        </Button>
      </div>

      {/* Success Alert */}
      {actionSuccess && (
        <div className="p-3.5 text-sm rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-3 font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check size={16} className="shrink-0 text-emerald-500" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {actionError && (
        <div className="p-3.5 text-sm rounded-md bg-destructive/10 text-destructive flex items-center justify-between gap-3 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{actionError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchServices}
            className="text-xs h-7 border-destructive/30 hover:bg-destructive/10 text-destructive"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-foreground border-border hover:border-primary/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Modal Dialog for Add / Edit */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(EMPTY); setEditingId(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-bold flex items-center gap-2">
              <Tag size={20} className="text-primary" />
              {editingId ? "Edit Service Price & Details" : "Add New Service Package"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider">Service Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Royal HD Bridal Makeover"
              />
            </div>

            {/* Price with Quick Presets */}
            <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles size={14} /> Service Price on Website *
              </Label>
              <Input
                id="price"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. ₹25,000 or From ₹9,999"
                className="bg-background font-semibold text-base"
              />
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Quick Price Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PRICES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, price: p })}
                      className="text-[11px] bg-background hover:bg-primary/20 border border-border px-2 py-0.5 rounded text-foreground font-medium transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-1">
              <Label htmlFor="tagline" className="text-xs font-bold uppercase tracking-wider">Tagline / Short Subtitle (Optional)</Label>
              <Input
                id="tagline"
                value={form.tagline || ""}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Our most popular 2-event Muhurtham + Reception package"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider">Service Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Details of what's included in this service package..."
              />
            </div>

            {/* Image URL / Path */}
            <div className="space-y-1">
              <Label htmlFor="imageUrl" className="text-xs font-bold uppercase tracking-wider">Cover Image URL or Path *</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="/images/portfolio/bridal-pink-saree-gold-jewellery.jpg"
              />
            </div>

            {/* Category and CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider">Category *</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="bridal_package">Bridal Package (Tier)</option>
                  <option value="makeup">Makeup & Skin</option>
                  <option value="hairstyle">Hair Artistry</option>
                  <option value="saree">Saree Draping</option>
                  <option value="jewellery">Jewellery Rental</option>
                  <option value="mehendi">Mehendi</option>
                  <option value="other">Other Service</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ctaText" className="text-xs font-bold uppercase tracking-wider">Button CTA Text</Label>
                <Input
                  id="ctaText"
                  value={form.ctaText}
                  onChange={e => setForm({ ...form, ctaText: e.target.value })}
                  placeholder="Book Now"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground font-semibold py-5 text-xs uppercase tracking-widest mt-2"
            >
              {saving ? "Saving Changes..." : editingId ? "Update Service & Live Price" : "Publish Service to Website"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Services Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Service / Package</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Live Price on Web</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className="animate-spin text-primary" /> Loading live services and prices...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No services found in this category. Click &quot;Add New Service / Package&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((s) => (
                <TableRow key={s._id} className="hover:bg-muted/20">
                  <TableCell className="font-semibold text-foreground">
                    <div>{s.title}</div>
                    {s.tagline && <div className="text-xs text-muted-foreground font-normal">{s.tagline}</div>}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-[11px] font-bold px-2.5 py-0.5 bg-primary/10 text-primary rounded-full inline-block">
                      {s.category.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-foreground bg-secondary/80 px-2.5 py-1 rounded-md text-xs border border-border inline-flex items-center gap-1">
                      <Tag size={12} className="text-primary" /> {s.price || "From ₹9,999"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground text-xs">
                    {s.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(s)}
                        className="h-8 gap-1 text-xs"
                      >
                        <Pencil size={13} /> Edit Price
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(s._id!)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star, Clock, AlertCircle } from "lucide-react";

type Testimonial = {
  _id?: string;
  customerName: string;
  review: string;
  rating: number;
  isFeatured: boolean;
};

const EMPTY: Testimonial = { customerName: "", review: "", rating: 5, isFeatured: true };

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Testimonial>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/testimonials");
      const json = await res.json();
      if (res.ok && json.success) {
        setItems(json.data ?? []);
      } else {
        setActionError(json.error || "Failed to fetch testimonials.");
      }
    } catch (err) {
      console.error("[FETCH_TESTIMONIALS_ERROR]", err);
      setActionError("Unable to fetch testimonials. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);

    try {
      const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setOpen(false);
        setForm(EMPTY);
        setEditingId(null);
        fetchTestimonials();
      } else {
        setActionError(json.error || "Failed to save testimonial.");
      }
    } catch (err) {
      console.error("[SAVE_TESTIMONIAL_ERROR]", err);
      setActionError("Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      setActionError(null);
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchTestimonials();
      } else {
        setActionError(json.error || "Failed to update status.");
      }
    } catch (err) {
      console.error("[TOGGLE_FEATURED_ERROR]", err);
      setActionError("Failed to update status.");
    }
  };

  const handleEdit = (t: Testimonial) => {
    setForm(t);
    setEditingId(t._id ?? null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial review?")) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchTestimonials();
      } else {
        setActionError(json.error || "Failed to delete testimonial.");
      }
    } catch (err) {
      console.error("[DELETE_TESTIMONIAL_ERROR]", err);
      setActionError("Failed to delete testimonial.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Bride Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">Approve, feature, and manage bride reviews</p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); }} className="bg-primary text-primary-foreground gap-2 font-semibold">
          <Plus size={16} /> Add Testimonial
        </Button>
      </div>

      {actionError && (
        <div className="p-3.5 text-sm rounded-md bg-destructive/10 text-destructive flex items-center gap-2 font-medium">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(EMPTY); setEditingId(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Testimonial Review" : "Add New Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="customerName">Bride / Client Name *</Label>
              <Input
                id="customerName"
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                placeholder="e.g. Priya & Karthik"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="review">Review Content *</Label>
              <Textarea
                id="review"
                value={form.review}
                onChange={e => setForm({ ...form, review: e.target.value })}
                rows={4}
                placeholder="Write the client review..."
              />
            </div>
            <div className="space-y-1">
              <Label>Rating (1 to 5 Stars)</Label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className={`p-1 ${form.rating >= n ? "text-amber-500" : "text-muted-foreground"}`}
                  >
                    <Star size={22} fill={form.rating >= n ? "currentColor" : "none"} />
                  </button>
                ))}
                <span className="text-xs font-semibold text-muted-foreground ml-2">{form.rating} Stars</span>
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded border-border w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Approve & Feature on Public Website</span>
            </label>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground font-semibold py-5">
              {saving ? "Saving..." : editingId ? "Update Review" : "Save Testimonial"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Bride Name</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Public Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className="animate-spin text-primary" /> Loading testimonials...
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No testimonials found. Click &quot;Add Testimonial&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="font-medium text-foreground">{t.customerName}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{t.review}</TableCell>
                  <TableCell>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          className={t.rating >= n ? "text-amber-500" : "text-muted-foreground/40"}
                          fill={t.rating >= n ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleFeatured(t._id!, t.isFeatured)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider transition-colors ${
                        t.isFeatured
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {t.isFeatured ? "Approved / Featured" : "Pending Approval"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(t)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t._id!)}>
                        <Trash2 size={14} />
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

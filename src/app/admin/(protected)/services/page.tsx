"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Clock, AlertCircle } from "lucide-react";

type Service = {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  ctaText: string;
};

const EMPTY: Service = {
  title: "",
  description: "",
  imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80",
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
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      if (res.ok && json.success) {
        setServices(json.data ?? []);
      } else {
        setActionError(json.error || "Failed to fetch services.");
      }
    } catch (err) {
      console.error("[FETCH_SERVICES_ERROR]", err);
      setActionError("Unable to fetch services. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);

    try {
      const url = editingId ? `/api/services/${editingId}` : "/api/services";
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
        fetchServices();
      } else {
        setActionError(json.error || "Failed to save service.");
      }
    } catch (err) {
      console.error("[SAVE_SERVICE_ERROR]", err);
      setActionError("Failed to save service. Check internet connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: Service) => {
    setForm(s);
    setEditingId(s._id ?? null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchServices();
      } else {
        setActionError(json.error || "Failed to delete service.");
      }
    } catch (err) {
      console.error("[DELETE_SERVICE_ERROR]", err);
      setActionError("Failed to delete service.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Services & Packages</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage public bridal packages and makeup services</p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); }} className="bg-primary text-primary-foreground gap-2">
          <Plus size={16} /> Add New Service
        </Button>
      </div>

      {actionError && (
        <div className="p-3.5 text-sm rounded-md bg-destructive/10 text-destructive flex items-center gap-2 font-medium">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(EMPTY); setEditingId(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Service Package" : "Add New Service Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Royal HD Bridal Makeup"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Details of what's included..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="imageUrl">Cover Image URL *</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {["makeup", "saree", "hairstyle", "jewellery", "mehendi", "other"].map(c => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ctaText">Button CTA Text</Label>
                <Input
                  id="ctaText"
                  value={form.ctaText}
                  onChange={e => setForm({ ...form, ctaText: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground font-semibold">
              {saving ? "Saving..." : editingId ? "Update Service" : "Create Service"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className="animate-spin text-primary" /> Loading services...
                  </div>
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No services found. Click &quot;Add New Service&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium text-foreground">{s.title}</TableCell>
                  <TableCell className="capitalize text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full inline-block mt-2">
                    {s.category}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{s.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s._id!)}>
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

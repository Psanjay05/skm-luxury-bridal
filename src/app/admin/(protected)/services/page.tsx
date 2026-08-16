"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Service = {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  ctaText: string;
};

const EMPTY: Service = { title: "", description: "", imageUrl: "", category: "makeup", ctaText: "Book Now" };

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Service>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/services");
    setServices(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const save = async () => {
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing, ...form } : form;
    await fetch("/api/admin/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpen(false);
    setForm(EMPTY);
    setEditing(null);
    fetch_();
  };

  const edit = (s: Service) => {
    setForm(s);
    setEditing(s._id ?? null);
    setOpen(true);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await fetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetch_();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl">Services</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your service offerings</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground gap-2">
          <Plus size={16} /> Add Service
        </Button>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(EMPTY); setEditing(null); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Service" : "Add New Service"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-1">
                <Label>Image URL (Cloudinary)</Label>
                <Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    {["makeup","saree","hairstyle","jewellery","mehendi","other"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>CTA Button Text</Label>
                  <Input value={form.ctaText} onChange={e => setForm({ ...form, ctaText: e.target.value })} />
                </div>
              </div>
              <Button onClick={save} className="w-full bg-primary text-primary-foreground">
                {editing ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : services.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No services yet. Add your first service.</TableCell></TableRow>
            ) : services.map((s) => (
              <TableRow key={s._id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell className="capitalize">{s.category}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{s.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => edit(s)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del(s._id!)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

type Testimonial = {
  _id?: string;
  customerName: string;
  review: string;
  rating: number;
  isFeatured: boolean;
};

const EMPTY: Testimonial = { customerName: "", review: "", rating: 5, isFeatured: false };

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Testimonial>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/testimonials");
    setItems(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const save = async () => {
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing, ...form } : form;
    await fetch("/api/admin/testimonials", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpen(false);
    setForm(EMPTY);
    setEditing(null);
    fetch_();
  };

  const edit = (t: Testimonial) => { setForm(t); setEditing(t._id ?? null); setOpen(true); };

  const del = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch("/api/admin/testimonials", {
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
          <h1 className="font-heading text-3xl">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage client reviews and ratings</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground gap-2"><Plus size={16} /> Add Review</Button>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(EMPTY); setEditing(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Client Name</Label>
                <Input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Review</Label>
                <Textarea value={form.review} onChange={e => setForm({ ...form, review: e.target.value })} rows={4} />
              </div>
              <div className="space-y-1">
                <Label>Rating (1–5)</Label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm({ ...form, rating: n })}
                      className={`p-1 ${form.rating >= n ? "text-yellow-500" : "text-muted-foreground"}`}>
                      <Star size={20} fill={form.rating >= n ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured}
                  onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded border-border" />
                <span className="text-sm">Feature on homepage</span>
              </label>
              <Button onClick={save} className="w-full bg-primary text-primary-foreground">
                {editing ? "Update" : "Add Testimonial"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No testimonials yet.</TableCell></TableRow>
            ) : items.map((t) => (
              <TableRow key={t._id}>
                <TableCell className="font-medium">{t.customerName}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{t.review}</TableCell>
                <TableCell>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={14} className={t.rating >= n ? "text-yellow-500" : "text-muted-foreground"}
                        fill={t.rating >= n ? "currentColor" : "none"} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.isFeatured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {t.isFeatured ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => edit(t)}><Pencil size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => del(t._id!)}><Trash2 size={14} /></Button>
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

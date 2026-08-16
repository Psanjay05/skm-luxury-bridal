"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

type FAQ = {
  _id?: string;
  question: string;
  answer: string;
  order: number;
};

const EMPTY: FAQ = { question: "", answer: "", order: 0 };

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FAQ>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);

  const fetch_ = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/faq");
    setFaqs(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const save = async () => {
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing, ...form } : form;
    await fetch("/api/admin/faq", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setOpen(false);
    setForm(EMPTY);
    setEditing(null);
    fetch_();
  };

  const edit = (f: FAQ) => { setForm(f); setEditing(f._id ?? null); setOpen(true); };

  const del = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    await fetch("/api/admin/faq", {
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
          <h1 className="font-heading text-3xl">FAQ</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground gap-2"><Plus size={16} /> Add FAQ</Button>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(EMPTY); setEditing(null); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Question</Label>
                <Input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Answer</Label>
                <Textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={5} />
              </div>
              <div className="space-y-1">
                <Label>Display Order (lower = first)</Label>
                <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
              </div>
              <Button onClick={save} className="w-full bg-primary text-primary-foreground">
                {editing ? "Update FAQ" : "Create FAQ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Answer Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : faqs.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No FAQs yet. Add your first question.</TableCell></TableRow>
            ) : faqs.map((f) => (
              <TableRow key={f._id}>
                <TableCell className="text-center text-muted-foreground">{f.order}</TableCell>
                <TableCell className="font-medium max-w-xs">{f.question}</TableCell>
                <TableCell className="max-w-sm truncate text-muted-foreground text-sm">{f.answer}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => edit(f)}><Pencil size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => del(f._id!)}><Trash2 size={14} /></Button>
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

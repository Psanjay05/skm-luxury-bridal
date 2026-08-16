"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Clock, AlertCircle } from "lucide-react";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/faq");
      const json = await res.json();
      if (res.ok && json.success) {
        setFaqs(json.data ?? []);
      } else {
        setActionError(json.error || "Failed to fetch FAQs.");
      }
    } catch (err) {
      console.error("[FETCH_FAQS_ERROR]", err);
      setActionError("Unable to fetch FAQs. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setActionError(null);

    try {
      const url = editingId ? `/api/faq/${editingId}` : "/api/faq";
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
        fetchFaqs();
      } else {
        setActionError(json.error || "Failed to save FAQ.");
      }
    } catch (err) {
      console.error("[SAVE_FAQ_ERROR]", err);
      setActionError("Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f: FAQ) => {
    setForm(f);
    setEditingId(f._id ?? null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ item?")) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/faq/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchFaqs();
      } else {
        setActionError(json.error || "Failed to delete FAQ.");
      }
    } catch (err) {
      console.error("[DELETE_FAQ_ERROR]", err);
      setActionError("Failed to delete FAQ.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">FAQ Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage frequently asked questions displayed on the website</p>
        </div>
        <Button onClick={() => { setForm(EMPTY); setEditingId(null); setOpen(true); }} className="bg-primary text-primary-foreground gap-2 font-semibold">
          <Plus size={16} /> Add FAQ
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
            <DialogTitle>{editingId ? "Edit FAQ Item" : "Add New FAQ Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. How far in advance should I book my makeover?"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={form.answer}
                onChange={e => setForm({ ...form, answer: e.target.value })}
                rows={5}
                placeholder="Detailed answer..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="order">Sort Order (Lower numbers appear first)</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={e => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground font-semibold py-5">
              {saving ? "Saving..." : editingId ? "Update FAQ" : "Create FAQ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Answer Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className="animate-spin text-primary" /> Loading FAQs...
                  </div>
                </TableCell>
              </TableRow>
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No FAQs found. Click &quot;Add FAQ&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((f) => (
                <TableRow key={f._id}>
                  <TableCell className="text-center font-mono text-xs font-bold text-primary">{f.order}</TableCell>
                  <TableCell className="font-medium text-foreground max-w-xs">{f.question}</TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground text-sm">{f.answer}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(f)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(f._id!)}>
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

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Mail, Phone, Eye, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Message = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
};

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/messages", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store" },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessages(json.data ?? []);
      } else {
        setActionError(json.error || "Failed to load messages.");
      }
    } catch (err) {
      console.error("[FETCH_MESSAGES_ERROR]", err);
      setActionError("Unable to fetch messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markRead = async (id: string) => {
    try {
      setActionError(null);
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        fetchMessages();
      }
    } catch (err) {
      console.error("[MARK_READ_ERROR]", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry message?")) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSelected(null);
        fetchMessages();
      } else {
        setActionError(json.error || "Failed to delete message.");
      }
    } catch (err) {
      console.error("[DELETE_MESSAGE_ERROR]", err);
      setActionError("Failed to delete message.");
    }
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(`Hi ${name}, this is Maha Shree from SKM Luxury Bridal Studio regarding your contact inquiry.`);
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Contact Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Inquiries from your contact form — {messages.filter(m => m.status === "unread").length} unread
        </p>
      </div>

      {actionError && (
        <div className="p-3.5 text-sm rounded-md bg-destructive/10 text-destructive flex items-center gap-2 font-medium">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className="animate-spin text-primary" /> Loading contact messages...
                  </div>
                </TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No contact messages found.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => (
                <TableRow key={m._id} className={m.status === "unread" ? "bg-primary/5" : ""}>
                  <TableCell>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                      m.status === "unread" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{m.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone size={10} /> {m.phone}</span>
                      {m.email && <span className="flex items-center gap-1"><Mail size={10} /> {m.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground text-sm">{m.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelected(m); if (m.status === "unread") markRead(m._id); }}>
                        <Eye size={14} /> View
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(m._id)}>
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

      {/* Message Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry from {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-3 rounded-lg border border-border">
                <div>
                  <span className="text-muted-foreground text-xs block">Phone Number</span>
                  <span className="font-medium text-foreground">{selected.phone}</span>
                </div>
                {selected.email && (
                  <div>
                    <span className="text-muted-foreground text-xs block">Email Address</span>
                    <span className="font-medium text-foreground">{selected.email}</span>
                  </div>
                )}
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {selected.message}
              </div>
              <div className="flex gap-3 pt-2">
                <Button asChild variant="outline" className="flex-1">
                  <a href={`tel:${selected.phone}`}>Call Client</a>
                </Button>
                <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <a href={getWhatsAppLink(selected.phone, selected.name)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(selected._id)}>Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Mail, Phone, Eye } from "lucide-react";
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

  const fetch_ = async () => {
    setLoading(true);
    const r = await fetch("/api/admin/messages");
    setMessages(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const markRead = async (id: string) => {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "read" }),
    });
    fetch_();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetch_();
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Contact Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Inquiries from your contact form — {messages.filter(m => m.status === "unread").length} unread
        </p>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
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
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading messages...</TableCell></TableRow>
            ) : messages.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No messages yet.</TableCell></TableRow>
            ) : messages.map((m) => (
              <TableRow key={m._id} className={m.status === "unread" ? "bg-primary/5" : ""}>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.status === "unread" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {m.status}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone size={10} /> {m.phone}</span>
                    {m.email && <span className="flex items-center gap-1"><Mail size={10} /> {m.email}</span>}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{m.message}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelected(m); if (m.status === "unread") markRead(m._id); }}>
                      <Eye size={14} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del(m._id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div className="flex gap-6 text-sm">
                <div><span className="text-muted-foreground">Phone: </span><span className="font-medium">{selected.phone}</span></div>
                {selected.email && <div><span className="text-muted-foreground">Email: </span><span className="font-medium">{selected.email}</span></div>}
              </div>
              <div className="bg-muted rounded-md p-4 text-sm leading-relaxed">{selected.message}</div>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <a href={`tel:${selected.phone}`}>Call Now</a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href={`https://wa.me/91${selected.phone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </Button>
                <Button variant="destructive" onClick={() => del(selected._id)}>Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

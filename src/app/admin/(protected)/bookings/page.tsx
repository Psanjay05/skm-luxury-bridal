"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Trash2, CheckCircle2, Clock } from "lucide-react";

type Booking = {
  _id: string;
  bookingReference?: string;
  customerName: string;
  phone: string;
  email?: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  confirmed: "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  completed: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
  cancelled: "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/bookings?status=${statusFilter}`);
      if (!res.ok) throw new Error("Failed to load bookings");
      const json = await res.json();
      setBookings(json.data?.bookings ?? json.bookings ?? []);
    } catch (err) {
      console.error("[FETCH_BOOKINGS_ERROR]", err);
      setActionError("Unable to fetch bookings. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      setActionError(null);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchBookings();
    } catch (err) {
      console.error("[UPDATE_BOOKING_STATUS_ERROR]", err);
      setActionError("Failed to update booking status.");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete booking");
      fetchBookings();
    } catch (err) {
      console.error("[DELETE_BOOKING_ERROR]", err);
      setActionError("Failed to delete booking.");
    }
  };

  const getWhatsAppLink = (booking: Booking) => {
    const cleanPhone = booking.phone.replace(/[^0-9]/g, "");
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const ref = booking.bookingReference ?? "Your Booking";
    const text = encodeURIComponent(
      `Hello ${booking.customerName}, this is Maha Shree from SKM Luxury Bridal Studio regarding your booking request (${ref}) for ${booking.service} on ${new Date(booking.preferredDate).toLocaleDateString("en-IN")}.`
    );
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Bookings Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and process client bridal appointments
          </p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
          <SelectTrigger className="w-48 bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {actionError && (
        <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive font-medium">
          {actionError}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Client & Contact</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Venue Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className="animate-spin text-primary" /> Loading bookings...
                  </div>
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No bookings found for the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b._id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {b.bookingReference ?? `SKM-${b._id.slice(-6).toUpperCase()}`}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{b.customerName}</div>
                    <div className="text-xs text-muted-foreground">{b.phone}</div>
                    {b.email && <div className="text-[11px] text-muted-foreground/80">{b.email}</div>}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{b.service}</TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(b.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div className="text-xs text-muted-foreground">{b.preferredTime}</div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate" title={b.location}>
                    {b.location}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[b.status] ?? ""}`}>
                      {b.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <a
                        href={getWhatsAppLink(b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                        title="Contact client on WhatsApp"
                      >
                        <MessageSquare size={13} /> WhatsApp
                      </a>

                      {b.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs gap-1"
                          onClick={() => updateStatus(b._id, "confirmed")}
                        >
                          <CheckCircle2 size={13} /> Confirm
                        </Button>
                      )}
                      {b.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs"
                          onClick={() => updateStatus(b._id, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 p-2"
                        onClick={() => deleteBooking(b._id)}
                        aria-label="Delete booking"
                      >
                        <Trash2 size={15} />
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

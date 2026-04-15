import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { fetchAppointments } from "@/lib/queries";
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const TIME_SLOTS = [
  "09:00 صباحاً",
  "10:00 صباحاً",
  "11:00 صباحاً",
  "12:00 مساءً",
  "01:00 مساءً",
  "02:00 مساءً",
  "03:00 مساءً",
  "04:00 مساءً",
];

export default function AppointmentsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
    enabled: !!user,
  });

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!date || !selectedSlot) throw new Error("اختر التاريخ والوقت");
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({ date: `${y}-${m}-${d}`, timeSlot: selectedSlot }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "تم حجز الموعد",
        description: `تم تسجيل الموعد بانتظار التأكيد.`,
      });
      setIsDialogOpen(false);
    },
    onError: (e) => {
      toast({
        title: "تعذر الحجز",
        description: e instanceof Error ? e.message : "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const list = user.role === "patient" ? appointments.filter((a) => a.patientId === user.id) : appointments;

  const handleBook = () => {
    if (!date || !selectedSlot) return;
    bookMutation.mutate();
  };

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المواعيد</h1>
          <p className="text-muted-foreground text-sm">إدارة وحجز مواعيد الزيارة للجمعية</p>
        </div>
        {user.role === "patient" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2 rounded-xl shadow-lg">
                <Plus className="w-5 h-5" /> حجز موعد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>حجز موعد مراجعة</DialogTitle>
                <DialogDescription>يرجى اختيار التاريخ والوقت المناسبين لزيارتك للجمعية.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label>اختر التاريخ</Label>
                  <div className="border rounded-xl p-2 bg-muted/20">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="mx-auto"
                      disabled={(d) => d < new Date() || d.getDay() === 5 || d.getDay() === 6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>اختر الوقت</Label>
                  <Select value={selectedSlot || undefined} onValueChange={setSelectedSlot}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="اختر فترة زمنية" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                  إلغاء
                </Button>
                <Button
                  onClick={handleBook}
                  className="gradient-primary text-primary-foreground rounded-xl px-8"
                  disabled={bookMutation.isPending}
                >
                  {bookMutation.isPending ? "جاري الحجز…" : "تأكيد الحجز"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 py-20 text-center bg-card rounded-3xl border border-dashed">
            <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">لا توجد مواعيد مسجلة حالياً</p>
          </div>
        ) : (
          list.map((apt) => (
            <Card key={apt.id} className="rounded-2xl shadow-card border-none hover:shadow-elevated transition-all overflow-hidden group">
              <div
                className={`h-2 ${
                  apt.status === "registered" ? "bg-info" : apt.status === "completed" ? "bg-success" : "bg-destructive"
                }`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10 transition-colors">
                    <CalendarIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      apt.status === "registered"
                        ? "bg-info/10 text-info"
                        : apt.status === "completed"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {apt.status === "registered" ? "مؤكد" : apt.status === "completed" ? "مكتمل" : "ملغي"}
                  </span>
                </div>
                <div className="space-y-3">
                  {user.role !== "patient" && (
                    <p className="text-sm font-bold text-primary">{apt.patientName ?? "—"}</p>
                  )}
                  <div className="flex items-center gap-3 text-foreground font-bold">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{apt.timeSlot}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="font-medium text-foreground">{apt.date}</span>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t flex justify-end gap-2">
                  {apt.status === "registered" && user.role !== "patient" && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 rounded-lg" type="button">
                      <Trash2 className="w-4 h-4 mr-2" /> إلغاء
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

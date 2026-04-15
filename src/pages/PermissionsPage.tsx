import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { fetchPermissions } from "@/lib/queries";
import { Clock, Plus, History, CheckCircle2, XCircle, Timer, Calendar as CalendarIcon } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

export default function PermissionsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [permType, setPermType] = useState<"early_leave" | "late_attendance">("early_leave");
  const [permDate, setPermDate] = useState("");
  const [durationM, setDurationM] = useState("60");

  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
    enabled: !!user && (user.role === "employee" || user.role === "admin"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/permissions", {
        method: "POST",
        body: JSON.stringify({
          date: permDate,
          type: permType,
          durationMinutes: Number(durationM),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast({ title: "تم إرسال الطلب", description: "سيتم الرد من الإدارة قريباً." });
      setIsDialogOpen(false);
    },
    onError: (e) => {
      toast({
        title: "فشل الإرسال",
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  if (user.role === "patient" || user.role === "doctor") {
    return (
      <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
        <p className="text-muted-foreground">هذه الصفحة غير متاحة لدورك.</p>
      </DashboardLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permDate) return;
    createMutation.mutate();
  };

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">أذونات الحضور والانصراف</h1>
          <p className="text-muted-foreground text-sm">طلب متابعة أذونات التأخير أو الانصراف المبكر</p>
        </div>
        {user.role === "employee" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2 rounded-xl shadow-lg">
                <Plus className="w-5 h-5" /> طلب إذن جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>نموذج طلب إذن</DialogTitle>
                <DialogDescription>يرجى تحديد النوع والمدة المطلوبة للإذن.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>نوع الإذن</Label>
                  <Select value={permType} onValueChange={(v) => setPermType(v as "early_leave" | "late_attendance")}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="early_leave">انصراف مبكر</SelectItem>
                      <SelectItem value="late_attendance">حضور متأخر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <Input type="date" required className="rounded-xl h-11" value={permDate} onChange={(e) => setPermDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>المدة (بالدقائق)</Label>
                    <Select value={durationM} onValueChange={setDurationM}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {[30, 60, 90, 120, 150, 180].map((m) => (
                          <SelectItem key={m} value={m.toString()}>
                            {m} دقيقة
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                    إلغاء
                  </Button>
                  <Button type="submit" className="gradient-primary text-primary-foreground rounded-xl px-8" disabled={createMutation.isPending}>
                    إرسال الطلب
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-3xl border-none shadow-card bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg">قواعد الأذونات</h3>
              </div>
              <ul className="text-sm space-y-3 text-muted-foreground list-disc list-inside">
                <li>يجب تقديم الطلب قبل الموعد بـ 24 ساعة على الأقل.</li>
                <li>لا يتجاوز عدد الأذونات 3 شهرياً.</li>
                <li>الحد الأقصى للإذن الواحد 3 ساعات.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-3xl border-none shadow-card overflow-hidden">
            <CardHeader className="bg-muted/30 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" /> سجل الأذونات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {user.role === "admin" && <TableHead className="text-right">الموظف</TableHead>}
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">المدة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={user.role === "admin" ? 5 : 4} className="h-60 text-center text-muted-foreground">
                          لا توجد طلبات سابقة
                        </TableCell>
                      </TableRow>
                    ) : (
                      permissions.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/20">
                          {user.role === "admin" && (
                            <TableCell className="font-medium">{item.employeeName ?? "—"}</TableCell>
                          )}
                          <TableCell className="font-medium">{item.date}</TableCell>
                          <TableCell>
                            <span className="text-sm">{item.type === "early_leave" ? "انصراف مبكر" : "حضور متأخر"}</span>
                          </TableCell>
                          <TableCell>{item.durationMinutes} دقيقة</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {item.status === "pending" && <Clock className="w-4 h-4 text-warning" />}
                              {item.status === "approved" && <CheckCircle2 className="w-4 h-4 text-success" />}
                              {item.status === "rejected" && <XCircle className="w-4 h-4 text-destructive" />}
                              <span
                                className={`text-xs font-medium ${
                                  item.status === "pending"
                                    ? "text-warning"
                                    : item.status === "approved"
                                      ? "text-success"
                                      : "text-destructive"
                                }`}
                              >
                                {item.status === "pending" ? "قيد الانتظار" : item.status === "approved" ? "مقبول" : "مرفوض"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

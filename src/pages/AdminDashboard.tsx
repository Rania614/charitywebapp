import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchRequests, fetchStats, fetchUsers } from "@/lib/queries";
import type { User } from "@/types/domain";
import { Users, FileText, BarChart3, CreditCard, Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: users = [] } = useQuery({
    queryKey: ["users", "admin"],
    queryFn: fetchUsers,
    enabled: !!user && user.role === "admin",
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: !!user && user.role === "admin",
  });

  if (!user) return null;

  const staffPreview = users.filter((u) => u.role !== "patient").slice(0, 6);
  const recentRequests = requests.slice(0, 10);

  const roleLine = (u: User) => {
    if (u.role === "admin") return "مدير النظام";
    if (u.role === "doctor") return "طبيب مراجع";
    if (u.role === "employee") return "موظف";
    return "مريض";
  };

  return (
    <DashboardLayout role="admin" userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة تحكم المدير 🛡️</h1>
          <p className="text-muted-foreground text-sm">إدارة شاملة للنظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="إجمالي المستخدمين" value={users.length} icon={Users} variant="primary" />
        <StatsCard title="طلبات معلقة" value={stats?.pendingRequests ?? 0} icon={FileText} variant="muted" />
        <StatsCard
          title="تم صرفه (تقريبي)"
          value={`${(stats?.monthlyExpenses ?? 0).toLocaleString()} ر.س`}
          icon={CreditCard}
          variant="secondary"
        />
        <StatsCard
          title="إيرادات مسجلة"
          value={`${(stats?.monthlyIncome ?? 0).toLocaleString()} ر.س`}
          icon={BarChart3}
          variant="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card border-none rounded-3xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">ملخص مالي من السجلات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              إجمالي الإيرادات المسجلة:{" "}
              <span className="font-bold text-foreground">{(stats?.monthlyIncome ?? 0).toLocaleString()} ر.س</span>
            </p>
            <p>
              إجمالي المصروفات المسجلة:{" "}
              <span className="font-bold text-foreground">{(stats?.monthlyExpenses ?? 0).toLocaleString()} ر.س</span>
            </p>
            <p>
              صافي التقريبي:{" "}
              <span className="font-bold text-foreground">{(stats?.revenue ?? 0).toLocaleString()} ر.س</span>
            </p>
            <p className="text-xs pt-2 border-t">لتفاصيل أكثر افتح صفحة الإحصائيات المالية.</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">فريق العمل</CardTitle>
            <Button size="sm" className="gradient-primary text-primary-foreground gap-1 rounded-xl shadow-lg" type="button" onClick={() => navigate("/users")}>
              <Plus className="w-4 h-4" /> إدارة
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">لا يوجد مستخدمون بعد</p>
              ) : (
                staffPreview.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-transparent hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md group-hover:rotate-6 transition-transform">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{roleLine(u)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10" type="button">
                        <Edit className="w-4 h-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-destructive/10" type="button">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none rounded-3xl lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">آخر الطلبات المستلمة</CardTitle>
            <Button variant="outline" className="rounded-xl h-9" type="button" onClick={() => navigate("/requests")}>
              عرض الكل
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-4 px-2 text-muted-foreground font-medium">الرقم المرجعي</th>
                    <th className="text-right py-4 px-2 text-muted-foreground font-medium">اسم المريض</th>
                    <th className="text-right py-4 px-2 text-muted-foreground font-medium">نوع الطلب</th>
                    <th className="text-right py-4 px-2 text-muted-foreground font-medium">التاريخ</th>
                    <th className="text-right py-4 px-2 text-muted-foreground font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        لا توجد طلبات
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((r) => (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-2 text-muted-foreground font-mono">#{r.id}</td>
                        <td className="py-4 px-2 font-bold text-foreground">{r.patientName ?? "—"}</td>
                        <td className="py-4 px-2 text-foreground">{r.title}</td>
                        <td className="py-4 px-2 text-muted-foreground">{r.createdAt.split("T")[0]}</td>
                        <td className="py-4 px-2">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

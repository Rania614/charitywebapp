import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { fetchAppointments, fetchRequests, fetchStats } from "@/lib/queries";
import { FileText, Calendar, CreditCard, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: !!user,
  });

  if (!user) return null;

  const recentRequests = requests.slice(0, 6);
  const upcoming = appointments.filter((a) => a.status === "registered").slice(0, 6);

  return (
    <DashboardLayout role="employee" userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">مرحباً، {user.name}</h1>
        <p className="text-muted-foreground text-sm">لوحة تحكم الموظف</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="الطلبات" value={stats?.totalRequests ?? 0} icon={FileText} variant="primary" />
        <StatsCard title="المواعيد" value={stats?.totalAppointments ?? 0} icon={Calendar} variant="muted" />
        <StatsCard
          title="صافي التدفق"
          value={`${(stats?.revenue ?? 0).toLocaleString()} ر.س`}
          icon={CreditCard}
          variant="secondary"
        />
        <StatsCard title="مرفوضة" value={stats?.rejectedRequests ?? 0} icon={Archive} variant="muted" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد طلبات</p>
            ) : (
              recentRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {r.patientName ?? "—"} - {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">المواعيد القادمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">لا توجد مواعيد مجدولة</p>
            ) : (
              upcoming.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{apt.patientName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.date} - {apt.timeSlot}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === "registered"
                        ? "bg-info/10 text-info"
                        : apt.status === "completed"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {apt.status === "registered" ? "مجدول" : apt.status === "completed" ? "مكتمل" : "ملغي"}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

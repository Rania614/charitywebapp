import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { StepProgress } from "@/components/StepProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchNotifications, fetchRequests, fetchStats } from "@/lib/queries";
import { FileText, Clock, CheckCircle, Plus, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: myRequests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: !!user,
  });

  if (!user) return null;

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <DashboardLayout role="patient" userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مرحباً، {user.name} 👋</h1>
          <p className="text-muted-foreground text-sm">هذه لوحة التحكم الخاصة بك</p>
        </div>
        <Button className="gradient-primary text-primary-foreground gap-2" onClick={() => navigate("/requests")}>
          <Plus className="w-4 h-4" />
          طلب جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="إجمالي الطلبات" value={stats?.totalRequests ?? myRequests.length} icon={FileText} variant="primary" />
        <StatsCard title="قيد الانتظار" value={stats?.pendingRequests ?? myRequests.filter((r) => r.status === "pending").length} icon={Clock} variant="muted" />
        <StatsCard title="تمت الموافقة" value={stats?.approvedRequests ?? myRequests.filter((r) => r.status === "approved").length} icon={CheckCircle} variant="muted" />
        <StatsCard title="الإشعارات الجديدة" value={unreadNotifications.length} icon={Bell} variant="secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-card border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">آخر الطلبات</CardTitle>
              <Link to="/requests" className="text-sm text-primary hover:underline">عرض الكل</Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {myRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد طلبات بعد</p>
              ) : (
                myRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-foreground">{request.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{request.createdAt}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {myRequests[0] && (
            <Card className="shadow-card border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">تتبع الطلب: {myRequests[0].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <StepProgress currentStatus={myRequests[0].status} />
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد إشعارات</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg text-sm ${notif.read ? "bg-muted/30" : "bg-primary/5 border border-primary/10"}`}
                >
                  <p className="font-medium text-foreground">{notif.title}</p>
                  <p className="text-muted-foreground text-xs mt-1">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notif.createdAt}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

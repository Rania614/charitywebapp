import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { fetchRequests, fetchStats } from "@/lib/queries";
import type { PhysicianOpinion } from "@/types/domain";
import { ClipboardList, UserCheck, Clock, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [opinion, setOpinion] = useState<PhysicianOpinion>("deserves");

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: !!user,
  });

  useEffect(() => {
    if (selectedRequest) {
      setOpinion("deserves");
      setReviewNote("");
    }
  }, [selectedRequest]);

  const patchMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      await apiFetch(`/api/requests/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setSelectedRequest(null);
    },
  });

  if (!user) return null;

  const incomingRequests = requests.filter((r) => r.status === "pending" || r.status === "under_review");

  const submitReview = (requestId: string) => {
    const base = { physicianOpinion: opinion, physicianJustification: reviewNote };
    if (opinion === "deserves") {
      patchMutation.mutate({ id: requestId, body: { ...base, status: "approved" } });
    } else if (opinion === "does_not_deserve") {
      patchMutation.mutate({
        id: requestId,
        body: {
          physicianOpinion: opinion,
          rejectionReason: reviewNote || "—",
          status: "rejected",
        },
      });
    } else {
      patchMutation.mutate({ id: requestId, body: { ...base, status: "under_review" } });
    }
  };

  return (
    <DashboardLayout role="doctor" userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">مرحباً، {user.name} 🩺</h1>
        <p className="text-muted-foreground text-sm">لوحة تحكم الطبيب</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="طلبات واردة" value={incomingRequests.length} icon={ClipboardList} variant="primary" />
        <StatsCard
          title="قيد المراجعة"
          value={requests.filter((r) => r.status === "under_review").length}
          icon={Clock}
          variant="muted"
        />
        <StatsCard title="تمت الموافقة" value={stats?.approvedRequests ?? 0} icon={CheckCircle} variant="muted" />
        <StatsCard title="إجمالي المرضى" value={stats?.totalPatients ?? 0} icon={UserCheck} variant="secondary" />
      </div>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg">الطلبات الواردة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {incomingRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">لا توجد طلبات بانتظار المراجعة</p>
          ) : (
            incomingRequests.map((request) => (
              <div key={request.id} className="p-4 rounded-xl border bg-card hover:shadow-card transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{request.patientName ?? "—"}</h3>
                    <p className="text-sm text-muted-foreground">{request.title}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-sm text-muted-foreground mb-3">{request.description}</p>

                {request.documents.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {request.documents.map((doc, i) => (
                      <span key={i} className="text-xs bg-muted px-3 py-1 rounded-full flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {doc}
                      </span>
                    ))}
                  </div>
                )}

                {selectedRequest === request.id ? (
                  <div className="space-y-4 mt-4 p-6 rounded-[2rem] bg-muted/30 border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                      <Label className="font-bold">الرأي الطبي</Label>
                      <Select value={opinion} onValueChange={(v) => setOpinion(v as PhysicianOpinion)}>
                        <SelectTrigger className="rounded-xl h-11 bg-background">
                          <SelectValue placeholder="اختر الرأي الطبي" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="deserves">المريض يستحق الدعم المطلوب</SelectItem>
                          <SelectItem value="does_not_deserve">المريض لا يستحق (توجد بدائل أخرى)</SelectItem>
                          <SelectItem value="more_docs_needed">مطلوب مستندات طبية إضافية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">التبرير الطبي / ملاحظات إضافية</Label>
                      <Textarea
                        placeholder="اشرح مبررات رأيك الطبي بالتفصيل..."
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="min-h-[120px] rounded-xl bg-background"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="lg"
                        className="gradient-primary text-primary-foreground gap-2 rounded-xl flex-1 shadow-lg"
                        disabled={patchMutation.isPending}
                        onClick={() => submitReview(request.id)}
                      >
                        <CheckCircle className="w-5 h-5" /> اعتماد القرار الطبي
                      </Button>
                      <Button size="lg" variant="ghost" onClick={() => setSelectedRequest(null)} className="rounded-xl">
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request.id)} className="rounded-xl px-6">
                    بدء مراجعة الطلب
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

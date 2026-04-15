import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { StepProgress } from "@/components/StepProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { fetchRequests } from "@/lib/queries";
import type { MedicalRequest } from "@/types/domain";
import { Plus, Upload, FileText, Eye, Printer, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RejectionReport } from "@/components/RejectionReport";

export default function RequestsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewRequest, setViewRequest] = useState<MedicalRequest | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/requests", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim(),
          itemDescription: newItemDesc.trim() || newTitle.trim(),
          amountRequested: Number(newAmount) || 0,
          description: newDescription.trim() || newTitle.trim(),
          documents: [] as string[],
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setShowNewForm(false);
      setNewTitle("");
      setNewItemDesc("");
      setNewAmount("");
      setNewDescription("");
    },
  });

  if (!user) return null;

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user.role === "patient" ? "طلباتي" : "إدارة الطلبات"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLoading ? "جاري التحميل…" : `${requests.length} طلب مسجّل`}
          </p>
        </div>
        {user.role === "patient" && (
          <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2 rounded-xl shadow-lg">
                <Plus className="w-5 h-5" /> تقديم طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle>تقديم طلب دعم جديد</DialogTitle>
                <DialogDescription>املأ البيانات التالية لتقديم طلب دعم مالي أو طبي للجمعية.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTitle.trim() || !newAmount || Number(newAmount) <= 0) return;
                  createMutation.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label>نوع التدخل الطبي المطلوب</Label>
                  <Input
                    placeholder="مثال: جراحة مياه بيضاء، أدوية سكري..."
                    className="rounded-xl"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المبلغ التقريبي (ر.س)</Label>
                    <Input
                      type="number"
                      min={1}
                      step="0.01"
                      placeholder="0.00"
                      className="rounded-xl text-left"
                      dir="ltr"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>البند بالتفصيل (اختياري)</Label>
                    <Input
                      placeholder="وصف قصير للبند"
                      className="rounded-xl"
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>وصف الحالة والحاجة للدعم</Label>
                  <Textarea
                    placeholder="اشرح طلبك بالتفصيل وظروفك الاجتماعية..."
                    className="min-h-[100px] rounded-xl"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المستندات المؤيدة</Label>
                  <div className="border-4 border-dashed rounded-[2rem] p-10 text-center hover:border-primary/50 transition-all cursor-pointer bg-muted/20 group opacity-60">
                    <div className="w-16 h-16 bg-background rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground">رفع الملفات قريباً</p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">يمكنك إضافة أسماء ملفات لاحقاً من لوحة الإدارة</p>
                  </div>
                </div>
                {createMutation.isError && (
                  <p className="text-sm text-destructive text-center">
                    {createMutation.error instanceof Error ? createMutation.error.message : "فشل الإرسال"}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-bold mt-4"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "جاري الإرسال…" : "إرسال الطلب للمراجعة"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="shadow-card border-none hover:shadow-elevated transition-all rounded-3xl overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{request.title}</h3>
                    <StatusBadge status={request.status} />
                  </div>
                  {user.role !== "patient" && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-primary">{request.patientName ?? "—"}</p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{request.description}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span>المبلغ: {request.amountRequested.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span>تاريخ التقديم: {request.createdAt.split("T")[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {request.status === "rejected" && (
                    <Button
                      variant="outline"
                      className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 gap-2"
                      onClick={() => {
                        setViewRequest(request);
                        setShowReport(true);
                      }}
                    >
                      <Printer className="w-4 h-4" /> تقرير الرفض
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="rounded-xl gap-2 px-6"
                    onClick={() => {
                      setViewRequest(request);
                      setShowReport(false);
                    }}
                  >
                    <Eye className="w-4 h-4" /> التفاصيل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!viewRequest} onOpenChange={() => { setViewRequest(null); setShowReport(false); }}>
        <DialogContent className={`rounded-[2rem] max-w-2xl ${showReport ? "p-0 overflow-hidden" : "p-6"}`}>
          {viewRequest &&
            (showReport ? (
              <div className="max-h-[85vh] overflow-y-auto">
                <RejectionReport request={viewRequest} />
                <div className="p-6 bg-muted/10 border-t flex justify-center gap-4">
                  <Button className="gradient-primary text-primary-foreground gap-2 rounded-xl h-12 px-8 shadow-xl" onClick={() => window.print()}>
                    <Printer className="w-5 h-5" /> طباعة التقرير
                  </Button>
                  <Button variant="outline" className="rounded-xl h-12 px-8" onClick={() => setShowReport(false)}>
                    إغلاق
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold">{viewRequest.title}</DialogTitle>
                  <DialogDescription className="italic">الرقم المرجعي: {viewRequest.id}</DialogDescription>
                </DialogHeader>
                <div className="space-y-8">
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                    <StepProgress currentStatus={viewRequest.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="p-4 bg-muted/20 rounded-2xl space-y-1">
                      <span className="text-muted-foreground text-xs">المريض:</span>
                      <p className="text-foreground font-bold text-lg">{viewRequest.patientName ?? "—"}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-2xl space-y-1">
                      <span className="text-muted-foreground text-xs">المبلغ المطلوب:</span>
                      <p className="text-foreground font-bold text-lg">{viewRequest.amountRequested.toLocaleString()} ر.س</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-bold text-foreground">وصف الطلب:</p>
                    <p className="text-muted-foreground leading-relaxed">{viewRequest.description}</p>
                  </div>

                  {viewRequest.notes && (
                    <div className="p-4 rounded-2xl bg-warning/5 border border-warning/10 text-sm">
                      <p className="font-bold text-warning mb-1 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> ملاحظات اللجنة:
                      </p>
                      <p className="text-muted-foreground">{viewRequest.notes}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-sm font-bold text-foreground">المستندات المرفوعة:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {viewRequest.documents.map((doc, i) => (
                        <div
                          key={i}
                          className="p-3 bg-muted rounded-xl flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer border"
                        >
                          <span className="text-xs font-bold text-foreground truncate">{doc}</span>
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ))}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

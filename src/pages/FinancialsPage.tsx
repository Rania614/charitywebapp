import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { fetchFinancialLogs } from "@/lib/queries";
import type { FinancialLog } from "@/types/domain";
import { Search, Plus, Download, ArrowUpCircle, ArrowDownCircle, User } from "lucide-react";
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

function categoryLabel(c: FinancialLog["category"]) {
  const m: Record<FinancialLog["category"], string> = {
    subscription: "اشتراك",
    donation: "تبرع",
    zakat: "زكاة",
    patient_support: "دعم مريض",
    administrative: "إداري",
  };
  return m[c];
}

export default function FinancialsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [fType, setFType] = useState<"income" | "expense">("income");
  const [fCategory, setFCategory] = useState<FinancialLog["category"]>("donation");
  const [fAmount, setFAmount] = useState("");
  const [fName, setFName] = useState("");
  const [fReceipt, setFReceipt] = useState("");
  const [fDate, setFDate] = useState("");

  const { data: logs = [] } = useQuery({
    queryKey: ["financials"],
    queryFn: fetchFinancialLogs,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/financials", {
        method: "POST",
        body: JSON.stringify({
          type: fType,
          category: fCategory,
          amount: Number(fAmount),
          receiptNumber: fReceipt.trim(),
          date: fDate,
          name: fName.trim(),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financials"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setFAmount("");
      setFName("");
      setFReceipt("");
    },
  });

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "all" || log.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [logs, searchTerm, activeTab]);

  const totals = useMemo(() => {
    return {
      income: logs.filter((l) => l.type === "income").reduce((acc, curr) => acc + curr.amount, 0),
      expense: logs.filter((l) => l.type === "expense").reduce((acc, curr) => acc + curr.amount, 0),
    };
  }, [logs]);

  if (!user) return null;

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإدارة المالية</h1>
          <p className="text-muted-foreground text-sm">تتبع الواردات والمصروفات المالية للجمعية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2" type="button">
            <Download className="w-4 h-4" /> تصدير Excel
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2 rounded-xl shadow-lg">
                <Plus className="w-5 h-5" /> إضافة قيد مالي
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>إضافة عملية مالية جديدة</DialogTitle>
                <DialogDescription>أدخل تفاصيل الإيراد أو المصروف ليتم تسجيله في حسابات الجمعية.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!fAmount || !fName || !fReceipt || !fDate) return;
                  createMutation.mutate();
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع العملية</Label>
                    <Select value={fType} onValueChange={(v) => setFType(v as "income" | "expense")}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">إيراد</SelectItem>
                        <SelectItem value="expense">مصروف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الفئة</Label>
                    <Select value={fCategory} onValueChange={(v) => setFCategory(v as FinancialLog["category"])}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="donation">تبرع</SelectItem>
                        <SelectItem value="zakat">زكاة</SelectItem>
                        <SelectItem value="patient_support">دعم مريض</SelectItem>
                        <SelectItem value="administrative">مصاريف إدارية</SelectItem>
                        <SelectItem value="subscription">اشتراك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>المبلغ (ر.س)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="rounded-xl text-left"
                    dir="ltr"
                    value={fAmount}
                    onChange={(e) => setFAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>الاسم (المتبرع / المستلم)</Label>
                  <Input placeholder="أدخل الاسم" className="rounded-xl" value={fName} onChange={(e) => setFName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم الإيصال</Label>
                    <Input placeholder="REC-000" className="rounded-xl" value={fReceipt} onChange={(e) => setFReceipt(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <Input type="date" className="rounded-xl" value={fDate} onChange={(e) => setFDate(e.target.value)} required />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" className="gradient-primary text-primary-foreground rounded-xl px-8" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "جاري الحفظ…" : "حفظ العملية"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="rounded-3xl border-none shadow-card bg-emerald-50/50">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <ArrowUpCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">إجمالي الواردات</p>
              <p className="text-3xl font-bold text-emerald-950 font-mono tracking-tight">
                {totals.income.toLocaleString()} <span className="text-sm font-sans">ر.س</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-card bg-rose-50/50">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center">
              <ArrowDownCircle className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-600 mb-1">إجمالي المصروفات</p>
              <p className="text-3xl font-bold text-rose-950 font-mono tracking-tight">
                {totals.expense.toLocaleString()} <span className="text-sm font-sans">ر.س</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-none shadow-card overflow-hidden">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="px-6 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="all" className="rounded-lg px-6">
                الكل
              </TabsTrigger>
              <TabsTrigger value="income" className="rounded-lg px-6">
                الواردات
              </TabsTrigger>
              <TabsTrigger value="expense" className="rounded-lg px-6">
                المصروفات
              </TabsTrigger>
            </TabsList>
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو رقم الإيصال..."
                className="rounded-xl pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <CardContent className="p-0 mt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">النوع/الفئة</TableHead>
                    <TableHead className="text-right">رقم الإيصال</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="whitespace-nowrap">{log.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{log.name}</p>
                            {log.phone && <p className="text-xs text-muted-foreground">{log.phone}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${log.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                            {log.type === "income" ? "إيراد" : "مصروف"}
                          </span>
                          <span className="text-xs text-muted-foreground italic">{categoryLabel(log.category)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.receiptNumber}</TableCell>
                      <TableCell className={`text-left font-bold font-mono ${log.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                        {log.type === "income" ? "+" : "-"}
                        {log.amount.toLocaleString()} ر.س
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </DashboardLayout>
  );
}

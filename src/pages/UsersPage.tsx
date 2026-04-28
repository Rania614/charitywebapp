import { useMemo, useState, type ComponentType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { fetchUsers } from "@/lib/queries";
import type { User, UserRole } from "@/types/domain";
import { Search, UserPlus, Shield, UserCheck, UserCog, MoreVertical, ShieldCheck, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function UsersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"doctor" | "employee" | "admin">("doctor");
  const [newPhone, setNewPhone] = useState("");
  const [newNationalId, setNewNationalId] = useState("");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"doctor" | "employee" | "admin">("doctor");
  const [editPhone, setEditPhone] = useState("");
  const [editNationalId, setEditNationalId] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const { data: users = [] } = useQuery({
    queryKey: ["users", "management"],
    queryFn: fetchUsers,
    enabled: !!user && user.role === "admin",
  });

  const createUserMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ user: unknown }>("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          username: newUsername.trim(),
          password: newPassword,
          role: newRole,
          phone: newPhone.trim(),
          nationalId: newNationalId.trim(),
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", "management"] });
      setNewName("");
      setNewEmail("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("doctor");
      setNewPhone("");
      setNewNationalId("");
      setOpenCreate(false);
      toast({ title: "تمت الإضافة", description: "تم إنشاء المستخدم الجديد بنجاح." });
    },
    onError: (error) => {
      toast({
        title: "تعذر إنشاء المستخدم",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: () => {
      if (!editingUserId) throw new Error("لم يتم تحديد المستخدم");
      return apiFetch<{ user: unknown }>(`/api/users/${editingUserId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim() || null,
          username: editUsername.trim() || null,
          role: editRole,
          phone: editPhone.trim() || null,
          nationalId: editNationalId.trim() || null,
          address: editAddress.trim() || null,
          ...(editPassword.trim() ? { password: editPassword } : {}),
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", "management"] });
      setOpenEdit(false);
      setEditingUserId(null);
      setEditPassword("");
      toast({ title: "تم التحديث", description: "تم تعديل بيانات المستخدم بنجاح." });
    },
    onError: (error) => {
      toast({
        title: "تعذر تحديث المستخدم",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users", "management"] });
      toast({ title: "تم التحديث", description: "تم تحديث حالة الحساب بنجاح." });
    },
    onError: (error) => {
      toast({
        title: "تعذر تحديث الحالة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (u: User) => {
    if (u.role === "patient") return;
    setEditingUserId(u.id);
    setEditName(u.name ?? "");
    setEditEmail(u.email ?? "");
    setEditUsername(u.username ?? "");
    setEditPassword("");
    setEditRole((u.role === "admin" || u.role === "doctor" || u.role === "employee") ? u.role : "doctor");
    setEditPhone(u.phone ?? "");
    setEditNationalId(u.nationalId ?? "");
    setEditAddress(u.address ?? "");
    setOpenEdit(true);
  };

  const handleToggleUserActive = (u: User) => {
    if (u.id === user?.id) {
      toast({
        title: "غير مسموح",
        description: "لا يمكنك تعطيل حسابك الحالي.",
        variant: "destructive",
      });
      return;
    }

    setConfirmUser(u);
  };

  const managementUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.role !== "patient" &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const roleLabels: Record<UserRole, string> = {
    admin: "مدير نظام",
    doctor: "طبيب مراجع",
    employee: "موظف جمعية",
    patient: "مريض",
  };

  const roleColors: Record<UserRole, string> = {
    admin: "bg-purple-100 text-purple-700",
    doctor: "bg-blue-100 text-blue-700",
    employee: "bg-emerald-100 text-emerald-700",
    patient: "bg-gray-100 text-gray-700",
  };

  const roleIcons: Record<string, ComponentType<{ className?: string }>> = {
    admin: ShieldCheck,
    doctor: UserCheck,
    employee: UserCog,
  };

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
        <p className="text-muted-foreground">هذه الصفحة للمدير فقط.</p>
      </DashboardLayout>
    );
  }

  const counts = {
    admin: users.filter((u) => u.role === "admin").length,
    doctor: users.filter((u) => u.role === "doctor").length,
    employee: users.filter((u) => u.role === "employee").length,
  };

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة فريق العمل</h1>
          <p className="text-muted-foreground text-sm">إدارة الأطباء، الموظفين، وصلاحيات النظام</p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground gap-2 rounded-xl shadow-lg h-11" type="button">
              <UserPlus className="w-5 h-5" /> إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>يمكنك إضافة طبيب أو موظف أو مدير جديد.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim() || !newPassword.trim()) return;
                createUserMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="new-name">الاسم</Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-username">اسم المستخدم</Label>
                  <Input
                    id="new-username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="username"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">البريد الإلكتروني</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-password">كلمة المرور</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    dir="ltr"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدور الوظيفي</Label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as "doctor" | "employee" | "admin")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">طبيب</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-phone">رقم الهاتف (اختياري)</Label>
                  <Input
                    id="new-phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="01000000000"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-national-id">الرقم القومي (اختياري)</Label>
                  <Input
                    id="new-national-id"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    placeholder="xxxxxxxxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="gradient-primary text-primary-foreground" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "جاري الإضافة..." : "إضافة المستخدم"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
              <DialogDescription>يمكنك تعديل جميع بيانات المستخدم ثم حفظ التغييرات.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!editName.trim() || !editingUserId) return;
                updateUserMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="edit-name">الاسم</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">اسم المستخدم</Label>
                  <Input
                    id="edit-username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="username"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-password">كلمة مرور جديدة (اختياري)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="اتركها فارغة بدون تغيير"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدور الوظيفي</Label>
                  <Select value={editRole} onValueChange={(v) => setEditRole(v as "doctor" | "employee" | "admin")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">طبيب</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">رقم الهاتف (اختياري)</Label>
                  <Input
                    id="edit-phone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="01000000000"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-national-id">الرقم القومي (اختياري)</Label>
                  <Input
                    id="edit-national-id"
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value)}
                    placeholder="xxxxxxxxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">العنوان (اختياري)</Label>
                <Input
                  id="edit-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="العنوان"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="gradient-primary text-primary-foreground" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={!!confirmUser} onOpenChange={(open) => { if (!open) setConfirmUser(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmUser?.isActive === false ? "إعادة تفعيل الحساب" : "تعطيل الحساب"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmUser
                  ? confirmUser.isActive === false
                    ? `هل تريدين إلغاء تعطيل حساب "${confirmUser.name}"؟`
                    : `هل تريدين تعطيل حساب "${confirmUser.name}"؟`
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!confirmUser) return;
                  const willDisable = confirmUser.isActive !== false;
                  toggleActiveMutation.mutate({ id: confirmUser.id, isActive: !willDisable });
                  setConfirmUser(null);
                }}
              >
                تأكيد
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "المدراء", count: counts.admin, icon: Shield, color: "text-purple-600" },
          { label: "الأطباء", count: counts.doctor, icon: UserCheck, color: "text-blue-600" },
          { label: "الموظفون", count: counts.employee, icon: UserCog, color: "text-emerald-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-card rounded-2xl bg-card/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-background shadow-sm ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2rem] border-none shadow-card overflow-hidden">
        <CardHeader className="border-b bg-muted/20 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">فريق العمل</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو اسم المستخدم..."
                className="rounded-xl pr-10 border-none bg-background shadow-sm h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الدور الوظيفي</TableHead>
                  <TableHead className="text-right">اسم المستخدم</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managementUsers.map((u) => {
                  const Icon = roleIcons[u.role] || UserCog;
                  return (
                    <TableRow key={u.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                              u.role === "admin" ? "bg-purple-600" : u.role === "doctor" ? "bg-blue-600" : "bg-emerald-600"
                            }`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <p className="font-bold text-sm text-foreground">{u.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`border-none font-bold text-[10px] px-3 py-1 rounded-full ${roleColors[u.role]}`}
                        >
                          <Icon className="w-3 h-3 ml-1" />
                          {roleLabels[u.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{u.username ?? u.email ?? "—"}</TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="rounded-xl shadow-elevated border-none p-1">
                            <DropdownMenuItem
                              className="gap-2 rounded-lg cursor-pointer"
                              onClick={() => openEditDialog(u)}
                            >
                              <Pencil className="w-4 h-4" /> تعديل البيانات
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 rounded-lg text-destructive focus:bg-destructive/10 cursor-pointer"
                              onClick={() => handleToggleUserActive(u)}
                              disabled={toggleActiveMutation.isPending}
                            >
                              {u.isActive === false ? "إعادة تفعيل الحساب" : "تعطيل الحساب"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { fetchUsers } from "@/lib/queries";
import { Search, UserPlus, Phone, MapPin, Mail, ExternalLink, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function PatientsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["users", "patients"],
    queryFn: fetchUsers,
    enabled: !!user,
  });

  const patients = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === "patient" &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.nationalId?.includes(searchTerm))
    );
  }, [users, searchTerm]);

  if (!user) return null;

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-cairo">سجل المرضى</h1>
          <p className="text-muted-foreground text-sm">عرض وإدارة جميع المرضى المسجلين في الجمعية</p>
        </div>
        <Button className="gradient-primary text-primary-foreground gap-2 rounded-xl shadow-lg h-11">
          <UserPlus className="w-5 h-5" /> إضافة مريض جديد
        </Button>
      </div>

      <Card className="rounded-[2rem] border-none shadow-card overflow-hidden">
        <CardHeader className="border-b bg-muted/20 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg">قائمة المرضى</CardTitle>
                <div className="relative w-full md:w-80">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="بحث بالاسم أو الرقم القومي..." 
                        className="rounded-xl pr-10 border-none bg-background shadow-sm h-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-right w-1/3">المريض</TableHead>
                  <TableHead className="text-right">رقم الهاتف</TableHead>
                  <TableHead className="text-right">الرقم القومي</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map(p => (
                  <TableRow key={p.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span dir="ltr">{p.phone ?? "—"}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.nationalId ?? "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {p.address ?? "—"}
                        </div>
                    </TableCell>
                    <TableCell className="text-left">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-white shadow-sm border border-transparent hover:border-border transition-all">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="rounded-xl shadow-elevated border-none p-1">
                                <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer">
                                    <ExternalLink className="w-4 h-4" /> عرض الملف الطبي
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer">
                                    <Mail className="w-4 h-4" /> مراسلة المريض
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 rounded-lg text-destructive focus:bg-destructive/10 cursor-pointer">
                                    أرشفة الحساب
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

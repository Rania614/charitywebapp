import { Bell, User, LogOut, Settings } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Notification, UserRole } from "@/types/domain";
import { fetchNotifications } from "@/lib/queries";
import { apiFetch } from "@/lib/api";

interface NavbarProps {
  userName: string;
  role: UserRole;
  onLogout: () => void;
}

export function Navbar({ userName, role, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const inferNotificationRoute = (n: Notification): string => {
    const text = `${n.title} ${n.message}`.toLowerCase();
    if (text.includes("طلب إذن") || text.includes("إذن")) return "/permissions";
    if (text.includes("موعد")) return "/appointments";
    if (text.includes("طلب")) return "/requests";
    if (role === "admin" || role === "employee") return "/notifications";
    return "/dashboard";
  };

  const onNotificationClick = (n: Notification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
    navigate(inferNotificationRoute(n));
  };

  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-end">
      <div className="flex items-center gap-2 lg:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10 group">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -left-1 w-5 h-5 p-0 flex items-center justify-center gradient-primary border-2 border-background text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 rounded-2xl p-2 shadow-elevated border-none mt-2">
            <DropdownMenuLabel className="px-4 py-3 font-bold text-base">الإشعارات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto py-2">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">لا توجد إشعارات</p>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-muted/50 rounded-xl transition-colors mb-1 last:mb-0"
                    onClick={() => onNotificationClick(n)}
                  >
                    <p className="font-bold text-sm text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1">{n.createdAt.split("T")[0]}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-primary font-bold text-xs p-3 cursor-pointer rounded-xl"
              onClick={() => navigate("/notifications")}
            >
              عرض كافة التنبيهات
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-[1px] bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-muted/50 rounded-xl transition-colors group">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md">
                {userName.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-foreground leading-none">{userName}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{role}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-elevated border-none mt-2">
            <DropdownMenuItem className="gap-2 p-3 rounded-xl cursor-pointer" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4" /> الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 p-3 rounded-xl cursor-pointer" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4" /> الإعدادات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-3 rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { UserRole } from "@/types/domain";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard, FileText, Calendar, Users, Settings, Bell,
  LogOut, ChevronLeft, ChevronRight, Stethoscope, ClipboardList,
  Archive, CreditCard, Menu, X, Home, Clock
} from "lucide-react";


interface SidebarProps {
  role: UserRole;
  userName: string;
  onLogout: () => void;
}

const menuItems: Record<UserRole, { label: string; icon: typeof LayoutDashboard; path: string }[]> = {
  patient: [
    { label: "لوحة التحكم", icon: LayoutDashboard, path: "/dashboard" },
    { label: "طلباتي", icon: FileText, path: "/requests" },
    { label: "المواعيد", icon: Calendar, path: "/appointments" },
    { label: "الإشعارات", icon: Bell, path: "/notifications" },
    { label: "الملف الشخصي", icon: Settings, path: "/profile" },
  ],
  doctor: [
    { label: "لوحة التحكم", icon: LayoutDashboard, path: "/dashboard" },
    { label: "الطلبات الواردة", icon: ClipboardList, path: "/requests" },
    { label: "المرضى", icon: Users, path: "/patients" },
    { label: "المواعيد", icon: Calendar, path: "/appointments" },
  ],
  employee: [
    { label: "لوحة التحكم", icon: LayoutDashboard, path: "/dashboard" },
    { label: "الطلبات", icon: FileText, path: "/requests" },
    { label: "المواعيد", icon: Calendar, path: "/appointments" },
    { label: "المدفوعات", icon: CreditCard, path: "/financials" },
    { label: "أذونات الحضور", icon: Clock, path: "/permissions" },
    { label: "الأرشيف", icon: Archive, path: "/archive" },
  ],
  admin: [
    { label: "لوحة التحكم", icon: LayoutDashboard, path: "/dashboard" },
    { label: "المستخدمون", icon: Users, path: "/users" },
    { label: "الطلبات", icon: FileText, path: "/requests" },
    { label: "المواعيد", icon: Calendar, path: "/appointments" },
    { label: "أذونات الموظفين", icon: Clock, path: "/permissions" },
    { label: "الإعدادات", icon: Settings, path: "/settings" },
  ],
};


const roleLabels: Record<UserRole, string> = {
  patient: "مريض",
  doctor: "طبيب",
  employee: "موظف",
  admin: "مدير",
};

export function AppSidebar({ role, userName, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const items = menuItems[role];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <img src={logo} alt="الرعاية الشاملة" className="w-10 h-10 object-contain" />
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-sm text-foreground">الرعاية الشاملة</h1>
            <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-muted"
                }
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {userName.charAt(0)}
            </div>
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-card shadow-card"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="w-72 h-full bg-sidebar shadow-elevated" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 left-4 p-1">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar border-l border-sidebar-border h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-3 top-20 p-1 rounded-full bg-card border shadow-card"
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border shadow-elevated">
        <div className="flex justify-around py-2">
          {items.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors
                  ${isActive ? "text-primary" : "text-muted-foreground"}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

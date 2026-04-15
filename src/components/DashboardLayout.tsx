import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import type { UserRole } from "@/types/domain";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
  userName: string;
  onLogout: () => void;
}

export function DashboardLayout({ children, role, userName, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar role={role} userName={userName} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar userName={userName} role={role} onLogout={onLogout} />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


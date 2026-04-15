import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Construction, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-muted/20 rounded-[3rem] border border-dashed border-primary/20">
        <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mb-8 shadow-xl animate-float">
          <Construction className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          {description}
        </p>
        <Button onClick={() => navigate("/dashboard")} className="rounded-xl h-12 px-8 gap-2">
           العودة للرئيسية <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </DashboardLayout>
  );
}

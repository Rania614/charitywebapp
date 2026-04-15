import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "secondary" | "accent" | "muted";
  trend?: string;
}

const variantStyles = {
  primary: "gradient-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  muted: "bg-card text-card-foreground border",
};

const iconBgStyles = {
  primary: "bg-primary-foreground/20",
  secondary: "bg-secondary-foreground/20",
  accent: "bg-accent-foreground/20",
  muted: "bg-muted",
};

export function StatsCard({ title, value, icon: Icon, variant = "muted", trend }: StatsCardProps) {
  return (
    <Card className={`${variantStyles[variant]} shadow-card border-0 transition-all hover:shadow-elevated animate-fade-in`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && <p className="text-xs opacity-70 mt-1">{trend}</p>}
          </div>
          <div className={`${iconBgStyles[variant]} p-3 rounded-xl`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

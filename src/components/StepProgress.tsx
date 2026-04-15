import type { RequestStatus } from "@/types/domain";
import { statusLabels } from "@/types/domain";
import { Check, Clock, Search, X, Calendar as CalendarIcon, CreditCard } from "lucide-react";


interface StepProgressProps {
  currentStatus: RequestStatus;
}

const steps: { status: RequestStatus; icon: typeof Clock }[] = [
  { status: "pending", icon: Clock },
  { status: "under_review", icon: Search },
  { status: "approved", icon: Check },
  { status: "awaiting_appointment", icon: CalendarIcon },
  { status: "disbursed", icon: CreditCard },
];


export function StepProgress({ currentStatus }: StepProgressProps) {
  const isRejected = currentStatus === "rejected";
  const currentIndex = isRejected ? 1 : steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, index) => {
        const isCompleted = !isRejected && index <= currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isRejected && index === 1
                  ? "bg-destructive text-destructive-foreground"
                  : isCompleted
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }
              `}>
                {isRejected && index === 1 ? <X className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className="text-xs text-muted-foreground">
                {isRejected && index === 1 ? statusLabels.rejected : statusLabels[step.status]}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all ${
                !isRejected && index < currentIndex ? "gradient-primary" : "bg-muted"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

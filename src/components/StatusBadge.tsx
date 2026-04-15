import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels, type RequestStatus } from "@/types/domain";

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`${statusColors[status]} border-none font-bold text-xs px-3 py-1 rounded-lg`}>

      {statusLabels[status]}
    </Badge>
  );
}

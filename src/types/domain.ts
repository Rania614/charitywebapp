export type UserRole = "patient" | "doctor" | "employee" | "admin";

export type RequestStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "awaiting_appointment"
  | "disbursed";

export type PhysicianOpinion = "deserves" | "does_not_deserve" | "more_docs_needed";

export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role: UserRole;
  isActive?: boolean;
  avatar?: string;
  phone?: string;
  nationalId?: string;
  address?: string;
}

/** يطابق شكل الـ API بعد الـ serializer */
export interface MedicalRequest {
  id: string;
  patientId: string;
  patientName?: string;
  patientNationalId?: string;
  title: string;
  description: string;
  itemDescription: string;
  amountRequested: number;
  amountApproved?: number;
  amountDisbursed?: number;
  status: RequestStatus;
  physicianOpinion?: PhysicianOpinion;
  physicianJustification?: string;
  adminDecisionNotes?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  documents: string[];
  assignedDoctor?: string;
  archivedAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  requestId?: string;
  date: string;
  timeSlot: string;
  status: "registered" | "completed" | "cancelled";
}

export interface FinancialLog {
  id: string;
  type: "income" | "expense";
  category: "subscription" | "donation" | "zakat" | "patient_support" | "administrative";
  amount: number;
  receiptNumber: string;
  date: string;
  name: string;
  nationalId?: string;
  phone?: string;
  details?: string;
  recordedBy: string;
}

export interface StaffPermission {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  type: "early_leave" | "late_attendance";
  durationMinutes: number;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type StatsResponse = {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  revenue?: number;
};

export const statusLabels: Record<RequestStatus, string> = {
  pending: "قيد الانتظار",
  under_review: "قيد المراجعة",
  approved: "تمت الموافقة",
  rejected: "مرفوض",
  awaiting_appointment: "في انتظار موعد",
  disbursed: "تم الصرف",
};

export const physicianOpinionLabels: Record<PhysicianOpinion, string> = {
  deserves: "المريض يستحق الدعم",
  does_not_deserve: "المريض لا يستحق (توجد بدائل)",
  more_docs_needed: "مطلوب مستندات إضافية",
};

export const statusColors: Record<RequestStatus, string> = {
  pending: "bg-warning/10 text-warning",
  under_review: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  awaiting_appointment: "bg-primary/10 text-primary",
  disbursed: "bg-emerald-600/10 text-emerald-600",
};

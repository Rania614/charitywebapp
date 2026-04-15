import { apiFetch } from "@/lib/api";
import type {
  Appointment,
  FinancialLog,
  MedicalRequest,
  Notification,
  StaffPermission,
  StatsResponse,
  User,
} from "@/types/domain";

export async function fetchRequests(): Promise<MedicalRequest[]> {
  const d = await apiFetch<{ requests: MedicalRequest[] }>("/api/requests");
  return d.requests;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const d = await apiFetch<{ appointments: Appointment[] }>("/api/appointments");
  return d.appointments;
}

export async function fetchFinancialLogs(): Promise<FinancialLog[]> {
  const d = await apiFetch<{ logs: FinancialLog[] }>("/api/financials");
  return d.logs;
}

export async function fetchPermissions(): Promise<StaffPermission[]> {
  const d = await apiFetch<{ permissions: StaffPermission[] }>("/api/permissions");
  return d.permissions;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const d = await apiFetch<{ notifications: Notification[] }>("/api/notifications");
  return d.notifications;
}

export async function fetchUsers(): Promise<User[]> {
  const d = await apiFetch<{ users: User[] }>("/api/users");
  return d.users;
}

export async function fetchStats(): Promise<StatsResponse> {
  const d = await apiFetch<{ stats: StatsResponse }>("/api/stats");
  return d.stats;
}

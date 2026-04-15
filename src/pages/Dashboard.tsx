import { useAuth } from "@/hooks/useAuth";
import PatientDashboard from "@/pages/PatientDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { isAuthenticated, user, ready } = useAuth();

  if (!ready) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "patient": return <PatientDashboard />;
    case "doctor": return <DoctorDashboard />;
    case "employee": return <EmployeeDashboard />;
    case "admin": return <AdminDashboard />;
    default: return <Navigate to="/login" />;
  }
}

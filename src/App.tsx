import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Dashboard from "./pages/Dashboard";
import RequestsPage from "./pages/RequestsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import FinancialsPage from "./pages/FinancialsPage";
import PermissionsPage from "./pages/PermissionsPage";
import PatientsPage from "./pages/PatientsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/financials" element={<FinancialsPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          
          {/* Real Managed Pages */}
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Remaining Placeholders */}
          <Route path="/notifications" element={<PlaceholderPage title="مركز الإشعارات" description="عرض جميع الإشعارات السابقة والتنبيهات الهامة." />} />
          <Route path="/profile" element={<PlaceholderPage title="الملف الشخصي" description="تحديث بياناتك الشخصية وكلمة المرور." />} />
          <Route path="/archive" element={<PlaceholderPage title="الأرشيف" description="عرض الطلبات والعمليات التاريخية المؤرشفة." />} />

          
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;



import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/domain";
import logo from "@/assets/logo.png";
import authIllustration from "@/assets/auth-illustration.jpg";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "البريد أو اسم المستخدم أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: UserRole) => {
    setError("");
    setLoading(true);
    try {
      await loginAsRole(role);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "دخول التجربة غير متاح (تحقق من ALLOW_DEMO_LOGIN على الخادم)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Illustration side */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-lg text-center animate-fade-in">
          <img src={authIllustration} alt="الرعاية الصحية" className="w-full max-w-sm mx-auto mb-8 rounded-2xl shadow-elevated" />
          <h2 className="text-2xl font-bold text-foreground mb-3">مرحباً بك في الرعاية الشاملة</h2>
          <p className="text-muted-foreground">منصة متكاملة لإدارة الرعاية الصحية بكل سهولة وأمان</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <img src={logo} alt="الرعاية الشاملة" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
            <p className="text-muted-foreground text-sm mt-1">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني أو اسم المستخدم</Label>
                  <Input
                    id="email"
                    type="text"
                    autoComplete="username"
                    placeholder="example@email.com أو dr.ibrahim"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="text-left pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">تذكرني</Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold h-11">
                  {loading ? "جاري الدخول…" : "تسجيل الدخول"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                ليس لديك حساب؟{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  إنشاء حساب جديد
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick role access - demo only */}
          <div className="mt-6">
            <p className="text-xs text-muted-foreground text-center mb-3">دخول سريع (للتجربة)</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { role: "patient" as UserRole, label: "مريض" },
                { role: "doctor" as UserRole, label: "طبيب" },
                { role: "employee" as UserRole, label: "موظف" },
                { role: "admin" as UserRole, label: "مدير" },
              ]).map(({ role, label }) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => void quickLogin(role)}
                  className="text-xs"
                >
                  دخول كـ {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

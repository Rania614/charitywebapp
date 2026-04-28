import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import logo from "@/assets/logo.png";

type ForgotResponse = {
  resetToken: string;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<ForgotResponse>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setToken(data.resetToken);
      setSuccess("تم التحقق من الهوية. أدخل كلمة المرور الجديدة.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل التحقق من البريد الإلكتروني");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("يرجى التحقق من الهوية أولاً");
      return;
    }
    if (newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      setSuccess("تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إعادة تعيين كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logo} alt="الرعاية الشاملة" className="w-16 h-16 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">نسيت كلمة المرور</h1>
          <p className="text-sm text-muted-foreground mt-1">أدخل بريدك الإلكتروني ثم عيّن كلمة مرور جديدة</p>
        </div>

        <Card className="shadow-card border-0">
          <CardContent className="p-6 space-y-5">
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
            {success && <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">{success}</div>}

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "جاري التحقق…" : "تحقق من البريد الإلكتروني"}
              </Button>
            </form>

            <form onSubmit={handleReset} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <Button type="submit" disabled={loading || !token} className="w-full">
                {loading ? "جاري الحفظ…" : "تحديث كلمة المرور"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              تذكرت كلمة المرور؟{" "}
              <Link to="/login" className="text-primary hover:underline">
                العودة لتسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import authIllustration from "@/assets/auth-illustration.jpg";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", nationalId: "", address: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.password || !form.nationalId || !form.phone) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (form.phone.length < 5) {
      setError("رقم الهاتف قصير جداً");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        name: form.name,
        nationalId: form.nationalId,
        password: form.password,
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
        address: form.address.trim() || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-lg text-center animate-fade-in">
          <img src={authIllustration} alt="" className="w-full max-w-sm mx-auto mb-8 rounded-[2.5rem] shadow-2xl border-4 border-white" loading="lazy" width={800} height={800} />
          <h2 className="text-3xl font-bold text-foreground mb-4 italic">انضم إلينا اليوم</h2>
          <p className="text-muted-foreground leading-relaxed">خطوات بسيطة للحصول على أفضل رعاية صحية ودعم إنساني متميز.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <img src={logo} alt="الرعاية الشاملة" className="w-20 h-20 mx-auto mb-6 drop-shadow-sm" />
            <h1 className="text-3xl font-bold text-foreground">إنشاء حساب جديد</h1>
            <p className="text-muted-foreground text-sm mt-2">ابدأ رحلتك العلاجية كعضو في الجمعية</p>
          </div>

          <Card className="shadow-card border-none rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">{error}</div>
                )}
                <div className="space-y-2">
                  <Label className="font-bold text-xs">الاسم الكامل (رباعي) *</Label>
                  <Input value={form.name} onChange={e => update("name", e.target.value)} placeholder="مثال: أحمد محمد علي حسن" className="rounded-xl h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs">الرقم القومي (14 رقم) *</Label>
                        <Input value={form.nationalId} onChange={e => update("nationalId", e.target.value)} placeholder="00000000000000" dir="ltr" className="text-left rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs">رقم الهاتف *</Label>
                        <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="01XXXXXXXX" dir="ltr" className="text-left rounded-xl h-11" />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs">البريد الإلكتروني (اختياري)</Label>
                  <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="example@email.com" dir="ltr" className="text-left rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs">عنوان السكن بالتفصيل</Label>
                  <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="المحافظة، الحي، الشارع..." className="rounded-xl h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label className="font-bold text-xs">كلمة المرور *</Label>
                        <Input type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="••••••••" dir="ltr" className="text-left rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-xs">تأكيد كلمة المرور *</Label>
                        <Input type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="••••••••" dir="ltr" className="text-left rounded-xl h-11" />
                    </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground font-bold rounded-xl mt-6 shadow-xl hover:scale-[1.02] transition-transform">
                  {loading ? "جاري إنشاء الحساب…" : "إنشاء الحساب والموافقة"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                لديك حساب بالفعل؟{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

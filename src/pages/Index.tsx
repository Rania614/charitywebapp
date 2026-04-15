import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/hero-illustration.jpg";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Clock, Users, MapPin, Phone, Mail, Facebook, ExternalLink, Calculator, Landmark, Wallet } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Index() {
  const { isAuthenticated, user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated && user) navigate("/dashboard", { replace: true });
  }, [ready, isAuthenticated, user, navigate]);

  if (!ready) {
    return <div className="min-h-screen bg-background" aria-hidden />;
  }

  if (isAuthenticated && user) {
    return null;
  }

  const features = [
    { icon: Heart, title: "رعاية متميزة", description: "نظام متكامل لإدارة الرعاية الصحية بأعلى المعايير" },
    { icon: Shield, title: "أمان وخصوصية", description: "حماية كاملة لبياناتك الطبية والشخصية" },
    { icon: Clock, title: "سرعة وكفاءة", description: "تتبع طلباتك ومواعيدك بسهولة وفي أي وقت" },
    { icon: Users, title: "فريق متخصص", description: "أطباء وموظفون مؤهلون لخدمتك" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="الرعاية الشاملة" className="w-10 h-10" />
            <span className="font-bold text-xl text-foreground">الرعاية الشاملة</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>تسجيل الدخول</Button>
            <Button className="gradient-primary text-primary-foreground shadow-lg" onClick={() => navigate("/register")}>إنشاء حساب</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 gradient-hero">
        <div className="container flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-right animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              بوابتك إلى<br />
              <span className="text-primary italic">رعاية صحية شاملة</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              منصة متكاملة لإدارة طلباتك الطبية، حجز المواعيد، ومتابعة حالتك الصحية بكل سهولة وأمان وفخر.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-10 h-14 rounded-xl shadow-xl hover:scale-105 transition-transform" onClick={() => navigate("/register")}>
                ابدأ رحلتك الآن
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl" onClick={() => navigate("/login")}>
                تسجيل الدخول
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center animate-slide-in">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
              <img src={heroImage} alt="رعاية صحية شاملة" className="relative w-full max-w-md rounded-[2.5rem] shadow-2xl border-8 border-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">خدماتنا المتميزة</h2>
            <p className="text-muted-foreground">نحرص على تقديم أفضل تجربة للمرضى والمانحين</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="border-none shadow-card hover:shadow-elevated transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">طرق التبرع</h2>
            <p className="text-muted-foreground">ساهم معنا في تغيير حياة المرضى</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="rounded-2xl shadow-card border-none">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Landmark className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">الحساب البنكي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-background rounded-xl border border-dashed text-center">
                  <p className="text-sm text-muted-foreground mb-1">بنك مصر</p>
                  <p className="text-xl font-mono font-bold tracking-wider">123-456-7890</p>
                </div>
                <div className="p-4 bg-background rounded-xl border border-dashed text-center">
                  <p className="text-sm text-muted-foreground mb-1">فرع فرعي</p>
                  <p className="text-lg font-medium">جمعية الرعاية الخيرية</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-card border-none">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Wallet className="w-8 h-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">فودافون كاش</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-background rounded-xl border border-dashed text-center">
                  <p className="text-sm text-muted-foreground mb-1">رقم المحفظة</p>
                  <p className="text-xl font-mono font-bold tracking-wider">010 1234 5678</p>
                </div>
                <p className="text-xs text-muted-foreground text-center">يتم التبرع عن طريق محفظة فودافون كاش مباشرة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Conditions & Documents */}
      <section className="py-24">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">شروط المساعدة والمستندات</h2>
            <p className="text-muted-foreground">المعلومات اللازمة لتقديم طلب الحصول على دعم</p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border rounded-2xl px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">شروط الاستحقاق</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-6">
                <ul className="list-disc list-inside space-y-2">
                  <li>أن يكون المتقدم مصري الجنسية.</li>
                  <li>عدم وجود تأمين صحي شامل أو خاص يغطي كامل التكاليف.</li>
                  <li>تقديم ما يثبت الحالة الصحية (تقارير طبية من مستشفى حكومي).</li>
                  <li>بحث اجتماعي حديث يثبت عدم القدرة على سداد التكاليف.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border rounded-2xl px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">المستندات المطلوبة (إجبارية)</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-6">
                <ul className="list-disc list-inside space-y-2">
                  <li>صورة بطاقة الرقم القومي (سارية).</li>
                  <li>تقرير طبي مفصل بالحالة مختوم بختم النسر.</li>
                  <li>مفردات مرتب أو شهادة فقر (بحث اجتماعي).</li>
                  <li>عروض أسعار للإجراءات أو العمليات المطلوبة.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-24 bg-foreground text-foreground-inverse">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white mb-6">تواصل معنا</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">رقم الهاتف</p>
                    <p className="text-xl font-bold text-white">02 2345 6789</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">ساعات العمل</p>
                    <p className="text-xl font-bold text-white">يومياً من الساعة 9 صباحاً حتى 5 مساءً</p>
                    <p className="text-sm text-white/60">ماعدا يوم الجمعة والسبت</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">العنوان</p>
                    <p className="text-xl font-bold text-white">شارع عباس العقاد، مدينة نصر، القاهرة</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="secondary" size="lg" className="rounded-xl gap-2">
                  <Facebook className="w-5 h-5" /> صفحتنا على فيسبوك
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-white/5 flex items-center justify-center border-4 border-white/10 group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="text-center p-8">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-white font-bold text-xl">موقع الجمعية على الخريطة</p>
                  <p className="text-white/60 mt-2">انقر لعرض خرائط جوجل</p>
                </div>
                {/* Mock Map Background */}
                <div className="absolute inset-0 -z-10 opacity-30 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Cairo,Egypt&zoom=13&size=600x400&key=YOUR_API_KEY')] bg-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <img src={logo} alt="الرعاية الشاملة" className="w-8 h-8 opacity-50" />
             <span className="font-bold text-muted-foreground">الرعاية الشاملة</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">© 2024 جميع الحقوق محفوظة لجمعية الرعاية الخيرية.</p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Mail className="w-5 h-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}


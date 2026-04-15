import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Globe, Shield, Bell, Save, Palette, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <DashboardLayout role={user.role} userName={user.name} onLogout={() => { logout(); navigate("/login"); }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground text-sm">تخصيص إعدادات النظام والتفضيلات الشخصية</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto flex flex-wrap gap-1">
          <TabsTrigger value="general" className="rounded-lg h-10 px-6 gap-2">
            <Globe className="w-4 h-4" /> عام
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg h-10 px-6 gap-2">
            <Palette className="w-4 h-4" /> المظهر
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg h-10 px-6 gap-2">
            <Bell className="w-4 h-4" /> الإشعارات
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg h-10 px-6 gap-2">
            <Lock className="w-4 h-4" /> الأمان
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 animate-fade-in">
          <Card className="rounded-[2rem] border-none shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">معلومات الجمعية</CardTitle>
              <CardDescription>هذه التفاصيل تظهر في التقارير والصفحة الرئيسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الجمعية</Label>
                  <Input defaultValue="جمعية الرعاية الشاملة الخيرية" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>رقم الإشهار</Label>
                  <Input defaultValue="1234 / 2024" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                  <Label>رقم الهاتف الرسمي</Label>
                  <Input defaultValue="0123456789" className="rounded-xl" dir="ltr" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">حالة النظام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">وضع الصيانة</p>
                  <p className="text-xs text-muted-foreground">عند تفعيل هذا الوضع، لن يتمكن المرضى من الدخول للنظام</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">تسجيل طلبات جديدة</p>
                  <p className="text-xs text-muted-foreground">السماح للمرضى بتقديم طلبات دعم جديدة</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
            <Card className="rounded-[2rem] border-none shadow-card">
                <CardHeader>
                    <CardTitle className="text-lg">إعدادات الواجهة</CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center text-muted-foreground">
                    <Palette className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>إعدادات المظهر والوضع الليلي ستكون متاحة قريباً</p>
                </CardContent>
            </Card>
        </TabsContent>

        <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" className="rounded-xl px-8 h-11">إلغاء</Button>
            <Button className="gradient-primary text-primary-foreground rounded-xl px-10 h-11 shadow-lg gap-2">
                <Save className="w-4 h-4" /> حفظ الإعدادات
            </Button>
        </div>
      </Tabs>
    </DashboardLayout>
  );
}

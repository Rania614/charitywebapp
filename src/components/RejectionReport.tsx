import type { MedicalRequest } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { MapPin, Phone, Globe, Calendar, User, FileText, AlertCircle } from "lucide-react";

interface RejectionReportProps {
  request: MedicalRequest;
}

export function RejectionReport({ request }: RejectionReportProps) {
  // Mask national ID: 299***54
  const maskID = (id: string) => {
    if (id.length < 8) return id;
    return id.substring(0, 3) + "***" + id.substring(id.length - 2);
  };

  return (
    <div className="bg-white p-8 rounded-none border shadow-none print:p-0 print:border-0 font-cairo text-right" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start border-bottom-2 pb-6 border-double border-b-4 border-primary/20 mb-8">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-16 h-16" />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">جمعية الرعاية الخيرية</h1>
            <p className="text-sm text-muted-foreground italic">خدمة المريض شرف لنا</p>
          </div>
        </div>
        <div className="text-left text-xs text-muted-foreground space-y-1" dir="ltr">
            <div className="flex items-center justify-end gap-2"><span>Cairo, Egypt</span> <MapPin className="w-3 h-3" /></div>
            <div className="flex items-center justify-end gap-2"><span>+20 2 2345 6789</span> <Phone className="w-3 h-3" /></div>
            <div className="flex items-center justify-end gap-2"><span>www.careconnect.org</span> <Globe className="w-3 h-3" /></div>
        </div>
      </div>

      {/* Title */}
      <div className="bg-muted/30 p-4 rounded-xl text-center mb-8 border border-dashed">
        <h2 className="text-xl font-bold text-foreground">تقرير فني بنتيجة دراسة طلب المساعدة</h2>
        <p className="text-sm text-muted-foreground mt-1">الرقم المرجعي: {request.id}</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">اسم المريض:</p>
                <p className="font-bold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {request.patientName}</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">الرقم القومي:</p>
                <p className="font-mono font-bold">{maskID(request.patientNationalId || "")}</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">تاريخ التقديم:</p>
                <p className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {request.createdAt.split('T')[0]}</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">البند المطلوب:</p>
                <p className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> {request.itemDescription}</p>
            </div>
        </section>

        <section className="space-y-4">
            <h3 className="font-bold border-r-4 border-primary pr-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" /> نتيجة مراجعة اللجنة
            </h3>
            <div className="p-6 bg-destructive/5 rounded-2xl border border-destructive/10">
                <p className="text-destructive font-bold mb-2">الحالة: مرفوض</p>
                <div className="text-sm leading-relaxed text-foreground-muted">
                    <p className="font-bold text-foreground mb-1">سبب الرفض:</p>
                    <p>{request.rejectionReason || "عدم استيفاء شروط الاستحقاق بناءً على البحث الاجتماعي المرفق."}</p>
                </div>
            </div>
        </section>

        <section className="space-y-4">
            <h3 className="font-bold border-r-4 border-primary pr-3">المسار الزمني للطلب (Carepath)</h3>
            <div className="relative border-r-2 border-primary/10 pr-6 space-y-8 mr-2">
                <div className="relative">
                    <div className="absolute top-2 -right-[1.85rem] w-4 h-4 rounded-full bg-primary ring-4 ring-white" />
                    <div>
                        <p className="text-sm font-bold">تقديم الطلب الأصلي</p>
                        <p className="text-xs text-muted-foreground">{request.createdAt.split('T')[0]}</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute top-2 -right-[1.85rem] w-4 h-4 rounded-full bg-primary ring-4 ring-white" />
                    <div>
                        <p className="text-sm font-bold">إحالة الطلب للمراجعة الطبية</p>
                        <p className="text-xs text-muted-foreground">بواسطة اللجنة المختصة</p>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute top-2 -right-[1.85rem] w-4 h-4 rounded-full bg-destructive ring-4 ring-white" />
                    <div>
                        <p className="text-sm font-bold text-destructive">صدور القرار النهائي بالرفض</p>
                        <p className="text-xs text-muted-foreground">{request.updatedAt.split('T')[0]}</p>
                    </div>
                </div>
            </div>
        </section>
      </div>

      {/* Footer Signatures */}
      <div className="mt-20 grid grid-cols-2 gap-20 text-center">
        <div className="space-y-12">
            <p className="font-bold">توقيع الموظف المختص</p>
            <div className="border-b border-black/20 w-40 mx-auto" />
        </div>
        <div className="space-y-12">
            <p className="font-bold">اعتماد الإدارة</p>
            <div className="border-b border-black/20 w-40 mx-auto" />
        </div>
      </div>

      <div className="mt-12 text-[10px] text-muted-foreground text-center border-t pt-4">
          يعد هذا التقرير وثيقة رسمية صادرة من النظام الإلكتروني لجمعية الرعاية الخيرية.
      </div>
    </div>
  );
}

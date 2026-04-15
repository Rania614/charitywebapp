# توثيق مشروع «الرعاية الشاملة» (Charity Web App)

## 1. نظرة عامة

تطبيق ويب أمامي (Frontend فقط) لجمعية خيرية / رعاية صحية، مبني بـ:

| التقنية | الاستخدام |
|---------|-----------|
| **React 18** + **TypeScript** | واجهة المستخدم |
| **Vite** | البناء والتطوير المحلي |
| **React Router v6** | التوجيه بين الصفحات |
| **TanStack React Query** | جاهز لطلبات API (حالياً لا يُستخدم مع خادم حقيقي) |
| **Tailwind CSS** + **shadcn/ui** (مكوّنات مبنية على Radix) | التصميم والمكوّنات |
| **react-hook-form** + **zod** | متوفر في المشروع؛ نماذج كثيرة غير مربوطة به بالكامل |
| **date-fns** | تواريخ (مثلاً في المواعيد) |

**لا يوجد Backend أو قاعدة بيانات في هذا المشروع.** البيانات كلها وهمية من `src/data/mockData.ts`، والمصادقة محلية عبر `localStorage` فقط.

---

## 2. هيكل المجلدات (المهم للفهم)

```
src/
  App.tsx              # نقطة التوجيه الرئيسية + مزودي السياق العامين
  main.tsx             # إدخال React على #root
  index.css            # أنماط عامة
  assets/              # شعارات وصور
  data/mockData.ts     # أنواع البيانات + مستخدمون وطلبات وهمية
  hooks/useAuth.ts     # منطق «تسجيل الدخول / الخروج» المحلي
  components/          # تخطيط لوحة التحكم، شريط جانبي، شريط علوي، بطاقات، إلخ
  pages/               # صفحات الشاشات (Landing، Login، Dashboards، إلخ)
  lib/utils.ts         # دالة `cn` لدمج أصناف Tailwind
  components/ui/       # مكوّنات واجهة جاهزة (زر، حوار، جدول، …)
```

---

## 3. المصادقة (Auth) من أول الدخول لآخر الخروج

### 3.1 أين تُخزَّن الجلسة؟

- **المفتاح:** `healthcare_user` في `localStorage`.
- **القيمة:** JSON لكائن مستخدم من نوع `User` (من `mockData`).

### 3.2 الخطاف `useAuth` — الملف: `src/hooks/useAuth.ts`

> **ملاحظة معمارية:** هذا ليس `React Context` مشتركاً بين كل الشجرة. كل مكوّن يستدعي `useAuth()` يملك **نسخة حالة مستقلة** تُهيأ من `localStorage` عند أول تصيير. في هذا المشروع التدفق يعمل لأن كل صفحة تُعاد تركيبها عند التنقل، والتهيئة تقرأ من `localStorage` بعد تسجيل الدخول.

| العنصر | الوصف |
|--------|--------|
| **الحالة `auth`** | `{ isAuthenticated, user }` |
| **تهيئة الحالة** | إن وُجد `healthcare_user` في `localStorage` → `isAuthenticated: true` و `user` من `JSON.parse` |
| **`login(email, password, role?)`** | لا يتحقق من كلمة المرور فعلياً (`password` مُتجاهَل). يبحث في `mockUsers` عن أول تطابق `email`؛ إن لم يجد، يأخذ أول مستخدم بـ `role` الممرَّر أو `"patient"`. عند النجاح: يحفظ في `localStorage` ويحدّث الحالة ويعيد `true`؛ وإلا `false`. |
| **`loginAsRole(role)`** | يختار أول مستخدم من `mockUsers` لهذا `role`، يحفظه ويحدّث الحالة (للأزرار «دخول سريع» في صفحة الدخول). |
| **`logout()`** | يحذف `healthcare_user` من `localStorage` ويصفّر الحالة. |

### 3.3 الصفحة الرئيسية `Index` (`/`)

| الدالة / السلوك | الوظيفة |
|-----------------|----------|
| `useAuth()` | قراءة حالة الدخول |
| شرط `if (isAuthenticated && user)` | إعادة توجيه فورية إلى `/dashboard` عبر `navigate` |
| أزرار الهيدر والـ Hero | `navigate("/login")` أو `navigate("/register")` |
| بقية الصفحة | محتوى تسويقي (ميزات، تبرع، شروط، تواصل) — بدون منطق خادم |

### 3.4 صفحة تسجيل الدخول `LoginPage` (`/login`)

| الدالة / المعالج | الوظيفة |
|------------------|----------|
| `handleSubmit` | يمنع الإرسال الافتراضي؛ يتحقق أن البريد وكلمة المرور غير فارغين؛ يستدعي `login(email, password)`؛ عند النجاح `navigate("/dashboard")`، وعند الفشل رسالة خطأ عربية |
| `quickLogin(role)` | `loginAsRole(role)` ثم `navigate("/dashboard")` |
| حالة `remember` | **واجهة فقط** — لا تربط منطقياً بمدة الجلسة أو تخزين إضافي |
| رابط «نسيت كلمة المرور؟» | يوجّه إلى `/forgot-password` — **لا يوجد Route له في `App.tsx`** (سيصل المستخدم لصفحة غير موجودة إن لم تُضف لاحقاً) |

### 3.5 صفحة التسجيل `RegisterPage` (`/register`)

| الدالة | الوظيفة |
|--------|----------|
| `handleSubmit` | تحقق من الحقول المطلوبة وتطابق كلمتي المرور؛ عند النجاح **فقط** `navigate("/login")` — **لا يُنشأ مستخدم ولا يُرسل لأي API** |
| `update(field, value)` | تحديث حقل في كائن `form` |

### 3.6 حماية لوحة التحكم `Dashboard` (`/dashboard`)

| السلوك | الوظيفة |
|--------|----------|
| `if (!isAuthenticated \|\| !user)` | `<Navigate to="/login" />` |
| `switch (user.role)` | يعرض أحد: `PatientDashboard`، `DoctorDashboard`، `EmployeeDashboard`، `AdminDashboard` |
| `default` | إعادة توجيه لـ `/login` |

> **مهم:** مسارات مثل `/requests` و`/patients` **لا تمر** عبر `Dashboard`؛ الصفحات نفسها تفحص `if (!user) return null` فقط — أي أن مستخدماً غير مسجّل قد يرى شاشة فارغة بدل إعادة توجيه صريحة لصفحة الدخول. تحسين مستقبلي: `ProtectedRoute` موحّد.

### 3.7 تسجيل الخروج (Logout)

يحدث بنفس النمط في كل لوحات التحكم والصفحات المحمية تقريباً:

```ts
onLogout={() => { logout(); navigate("/login"); }}
```

| مصدر الاستدعاء | الوظيفة |
|----------------|----------|
| **`AppSidebar`** | زر «تسجيل الخروج» يستدعي `onLogout` الممرَّر من الأب |
| **`Navbar`** | من القائمة المنسدلة للمستخدم — `onClick={onLogout}` على عنصر «تسجيل الخروج» |
| **`DashboardLayout`** | يمرّر `onLogout` إلى `AppSidebar` و`Navbar` فقط (لا يستدعي `useAuth` بنفسه) |

**ترتيب التنفيذ:** `logout()` يمسح التخزين المحلي؛ `navigate("/login")` يغيّر المسار.

---

## 4. المسارات (Routes) في `App.tsx`

| المسار | الصفحة |
|--------|--------|
| `/` | `Index` — الصفحة العامة |
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/dashboard` | `Dashboard` — يفرع حسب الدور |
| `/requests` | `RequestsPage` |
| `/appointments` | `AppointmentsPage` |
| `/financials` | `FinancialsPage` |
| `/permissions` | `PermissionsPage` |
| `/patients` | `PatientsPage` |
| `/users` | `UsersPage` |
| `/settings` | `SettingsPage` |
| `/notifications`, `/profile`, `/archive` | `PlaceholderPage` (واجهة «قيد التطوير») |
| `*` | `NotFound` |

---

## 5. القائمة الجانبية حسب الدور — `AppSidebar`

الكائن `menuItems` يحدد الروابط لكل `UserRole`:

- **patient:** لوحة، طلبات، مواعيد، إشعارات، ملف شخصي
- **doctor:** لوحة، طلبات واردة، مرضى، مواعيد
- **employee:** لوحة، طلبات، مواعيد، مدفوعات، أذونات، أرشيف
- **admin:** لوحة، مستخدمون، طلبات، إحصائيات مالية، مواعيد، أذونات، إعدادات

| الدالة / العنصر | الوظيفة |
|-----------------|----------|
| `SidebarContent` | محتوى الشريط (شعار، روابط، مستخدم، خروج) |
| `setCollapsed` / زر الطي | طي/توسيع الشريط على الشاشات الكبيرة |
| `setMobileOpen` | فتح/إغلاق قائمة الجوال + زر القائمة |
| `location.pathname` | تمييز الرابط النشط |
| الشريط السفلي للجوال | أول 5 عناصر من `items` فقط |

---

## 6. شريط التنقل العلوي — `Navbar`

| الوظيفة | التفاصيل |
|---------|----------|
| حقل البحث | واجهة فقط — لا فلترة فعلية |
| جرس الإشعارات | يعرض `mockNotifications`؛ العدد = غير المقروء |
| قائمة المستخدم | ملف شخصي/إعدادات معطّلة بصرياً (`cursor-not-allowed`)؛ **تسجيل الخروج** يعمل عبر `onLogout` |

---

## 7. بيانات العرض الوهمية — `mockData.ts`

### 7.1 الأنواع (Types)

- `User`, `UserRole`, `MedicalRequest`, `RequestStatus`, `PhysicianOpinion`
- `Appointment`, `FinancialLog`, `StaffPermission`, `Notification`

### 7.2 خرائط العرض

- `statusLabels`, `statusColors`, `physicianOpinionLabels` — للترجمة والألوان في الواجهة

### 7.3 المصفوفات

- `mockUsers` — مستخدمون تجريبيون (مريضان، طبيب، موظف، مدير)
- `mockRequests`, `mockAppointments`, `mockFinancialLogs`, `mockStaffPermissions`, `mockNotifications`, `mockStats`

---

## 8. صفحات لوحة التحكم والإجراءات

### 8.1 `PatientDashboard`

| الإجراء | الوظيفة |
|---------|----------|
| فلترة `myRequests` | طلبات المريض الحالي فقط (`patientId === user.id`) |
| زر «طلب جديد» | `navigate("/requests")` |
| بطاقات إحصاء | عدد الطلبات حسب الحالة + إشعارات |
| `StepProgress` | يتبع أول طلب في القائمة |
| تسجيل الخروج | `logout()` + `navigate("/login")` |

### 8.2 `DoctorDashboard`

| الإجراء | الوظيفة |
|---------|----------|
| `incomingRequests` | طلبات `pending` أو `under_review` |
| «بدء مراجعة الطلب» | يفتح نموذج رأي طبي + ملاحظات |
| «اعتماد القرار الطبي» | **واجهة فقط** — لا يحدّث `mockRequests` |
| `setSelectedRequest` / `setReviewNote` | حالة محلية للواجهة |

### 8.3 `EmployeeDashboard`

| الإجراء | الوظيفة |
|---------|----------|
| عرض آخر الطلبات والمواعيد | من `mockRequests` و `mockAppointments` |
| الإحصاءات | من `mockStats` |

### 8.4 `AdminDashboard`

| الإجراء | الوظيفة |
|---------|----------|
| مخطط أعمدة بسيط | بيانات ثابتة داخل المكوّن |
| أزرار تعديل/حذف مستخدم | **واجهة فقط** |
| جدول الطلبات | من `mockRequests` |

### 8.5 `RequestsPage`

| الإجراء | الوظيفة |
|---------|----------|
| قائمة الطلبات | مريض: طلباته فقط؛ غير ذلك: كل الطلبات |
| حوار طلب جديد (مريض) | إغلاق عند الضغط على إرسال — **لا إضافة لقائمة البيانات** |
| «التفاصيل» | حوار مع `StepProgress` وتفاصيل الطلب |
| «تقرير الرفض» | يعرض `RejectionReport` + طباعة `window.print()` |

> **ملاحظة تقنية:** في نسخة الكود الحالية يوجد مرجع لـ `request.notes` في تفاصيل الطلب، بينما نوع `MedicalRequest` في `mockData` لا يعرّف حقل `notes`. قد يظهر تحذير TypeScript أو سلوك غير متوقع حتى يُوحَّد النموذج.

### 8.6 `AppointmentsPage`

| الدالة | الوظيفة |
|--------|----------|
| `handleBook` | يتحقق من التاريخ والوقت؛ يعرض `toast`؛ يغلق الحوار — **لا يضيف موعداً للبيانات** |
| تقويم الحجز | تعطيل الجمعة والسبت والماضي |

### 8.7 `FinancialsPage`

| الإجراء | الوظيفة |
|---------|----------|
| `filteredLogs` | بحث بالاسم/رقم الإيصال + تبويب الكل/إيراد/مصروف |
| `totals` | جمع مبالغ الإيرادات والمصروفات من `mockFinancialLogs` |
| أزرار التصدير / إضافة قيد | واجهة نماذج — **بدون حفظ فعلي** |

### 8.8 `PermissionsPage`

| الدالة | الوظيفة |
|--------|----------|
| `handleSubmit` | `toast` ثم إغلاق الحوار — **لا تحديث لـ `mockStaffPermissions`** |
| `myPermissions` | أذونات الموظف الحالي من البيانات الوهمية |

### 8.9 `PatientsPage` (للطبيب أساساً في التنقل)

| الإجراء | الوظيفة |
|---------|----------|
| فلترة `patients` | من `mockUsers` حيث `role === "patient"` + بحث بالاسم أو الرقم القومي |

### 8.10 `UsersPage` (للمدير)

| الإجراء | الوظيفة |
|---------|----------|
| `managementUsers` | كل من ليس مريضاً + بحث بالاسم أو `username` |
| بطاقات أعداد | عدّ الأدوار من `mockUsers` |

### 8.11 `SettingsPage`

| الإجراء | الوظيفة |
|---------|----------|
| تبويبات عام / مظهر / إشعارات / أمان | حقول وسويتشات — **بدون ربط تخزين أو API** |

### 8.12 `PlaceholderPage`

| الإجراء | الوظيفة |
|---------|----------|
| زر العودة | `navigate("/dashboard")` |

### 8.13 `NotFound`

صفحة 404 للمسارات غير المعرفة.

---

## 9. مكوّنات مساعدة

| المكوّن | الملف | الوظيفة |
|---------|------|---------|
| `DashboardLayout` | `DashboardLayout.tsx` | تخطيط: `AppSidebar` + `Navbar` + `main` للأطفال |
| `StatsCard` | `StatsCard.tsx` | بطاقة رقمية مع أيقونة ومتغيرات لون |
| `StatusBadge` | `StatusBadge.tsx` | شارة حالة طلب من `statusLabels` / `statusColors` |
| `StepProgress` | `StepProgress.tsx` | خطوات مسار الطلب؛ حالة `rejected` تعرض رفضاً عند خطوة المراجعة |
| `RejectionReport` | `RejectionReport.tsx` | تقرير طباعة للرفض؛ **`maskID`** يخفي جزءاً من الرقم القومي |
| `NavLink` | `NavLink.tsx` | رابط مع تمييز نشط (إن وُجد استخدامه في المشروع) |
| `cn` | `lib/utils.ts` | `twMerge(clsx(...))` لدمج classes |

---

## 10. `App.tsx` — التجميع العام

| العنصر | الوظيفة |
|--------|----------|
| `QueryClientProvider` | يجهّز React Query لأي استخدامات مستقبلية |
| `TooltipProvider` | سياق التلميحات لـ Radix |
| `Toaster` + `Sonner` | إشعارات من مكوّنات UI (`use-toast` و sonner) |
| `BrowserRouter` | التوجيه مع خيارات مستقبلية v7 |

---

## 11. سيناريو المستخدم من البداية للنهاية (ملخص)

1. يفتح `/` → إن كان مسجلاً يُوجَّه إلى `/dashboard`.
2. يدخل `/login` → يدخل بريداً من `mockUsers` (مثلاً `ahmed@example.com`) وأي كلمة مرور → نجاح تسجيل الدخول.
3. أو يضغط «دخول سريع» كدور → يُحمَّل أول مستخدم بهذا الدور.
4. `/dashboard` يعرض لوحة حسب الدور.
5. التنقل عبر الشريط الجانبي/السفلي حسب الصلاحيات المعروضة.
6. معظم أزرار «حفظ / إرسال / إضافة» تحدّث الواجهة أو تُظهر Toast فقط ولا تغيّر `mockData`.
7. «تسجيل الخروج» من الشريط أو القائمة العلوية → مسح `localStorage` والانتقال إلى `/login`.

---

## 12. اتجاهات تطوير مقترحة (اختياري)

- ربط `useAuth` بـ **Context** واحد أو **Zustand** لتفادي تعدد نسخ الحالة.
- **ProtectedRoute** لكل مسارات لوحة التحكم.
- إضافة Route لـ `/forgot-password` أو إزالة الرابط.
- توحيد نوع `MedicalRequest` مع الحقول المستخدمة في `RequestsPage` (مثل `notes` إن لزم).
- API حقيقي + توكن + تحقق من كلمة المرور.

---

*آخر تحديث للتوثيق يتوافق مع هيكل المستودع الحالي.*

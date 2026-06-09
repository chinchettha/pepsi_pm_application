# แผน Phase UI ก่อน UAT (U4) — Checklist แยกฉบับ

> **ใช้ไฟล์นี้ติ๊กงาน UI ก่อนอย่างอื่น** — แยกจาก [`../PRE-UAT-MASTER-PHASES.md`](../PRE-UAT-MASTER-PHASES.md) (SAP · Telegram · Deploy · UAT handoff)  
> **ยังไม่ใช่ชีต UAT ลูกค้า** — ทำครบ U4 ก่อนค่อยกลับไป Master §Gate

**อัปเดต:** 2026-06-09 (audit codebase · **U4f Portal** · **U4g Sidebar Premium** ออกแบบใหม่)  
**พื้นฐานที่ปิดแล้ว:** U0–U3 + Dark D0–D4 — ดู [`UI-POLISH-PHASES.md`](UI-POLISH-PHASES.md)  
**Token / สี:** [`UI-DESIGN-TOKENS.md`](UI-DESIGN-TOKENS.md) · [`skill-theme.md`](../../skill-theme.md) · `PM-Pepsi-App/frontend/src/lib/brand-palette.ts`

---

## สรุป — อะไรต้องปรับให้สวย/ทันสมัย (จาก codebase)

> U0–U3 ปิดแล้ว = shell · dark · responsive · component พื้นฐาน **มี**  
> **U4 = ช่องว่างที่เห็นได้** — popup ไม่ unified · สี Tailwind กระจาย · motion ไม่ครบ · confirm แบบ browser

| หมวด | สถานะปัจจุบัน | ต้องทำ (สรุป) |
|------|----------------|----------------|
| **Modern popup** | `Dialog` glass + zoom มี · **ไม่มี** `AlertDialog` / `Sheet` | size preset · backdrop blur · migrate `window.confirm` → AlertDialog |
| **Animation** | Login/Error/Material panel มี framer · **WO modal / planning ยังแข็ง** | tab indicator · row highlight · ack pulse · skeleton ต่อแท็บ |
| **Brand สีเดียว** | `brand-palette.ts` + Admin sync · **~40 ไฟล์ยัง `emerald-*` / `amber-*`** | semantic token `--status-*` · ไล่ไฟล์หน้าหลักก่อน |
| **Toast** | sonner `richColors` generic | theme ตาม Pepsi · ใช้ `app-toast.ts` ทุกจุด |
| **Mobile drawer** | ~~`FilterDateDrawer` custom~~ → Radix Sheet bottom | Sheet มาตรฐาน · slide + focus trap |
| **ไล่หน้า** | U2 layout ครบ · visual ยังไม่จบหน้า hot path | planning → WO modal → confirm → calendar → telegram → settings |
| **Portal** | login → หน้างานโดยตรง · **ยังไม่มี** `/portal` | การ์ด module ตาม RBAC · login จุดเดียว · ทำคู่ U4 |
| **Sidebar** | U1 `macos-sidebar` มี · active bar + collapse · **ยังไม่ premium** | glass depth · active pill slide · rail/tooltip · footer user · mobile Sheet |

**ลำดับแนะนำ:** U4a → U4b · **U4f Portal (คู่ขนาน)** · **U4g Sidebar (คู่ขนานหลัง U4a token)** · U4d-1 planning → U4d-2 WO modal → ที่เหลือ

---

## Checklist ด่วน — งาน UI ที่ค้าง (ติ๊กเมื่อเสร็จ)

### A. Component / Popup (modern)

- [x] สร้าง `components/ui/alert-dialog.tsx` (Radix) — destructive + cancel
- [x] สร้าง `components/ui/sheet.tsx` (Radix) — side/bottom · แทน drawer ad-hoc
- [x] `dialog.tsx` — prop `size`: `sm` | `md` | `lg` | `full` (WO modal ใช้ `lg`/`full`)
- [x] Overlay — `backdrop-blur-sm` (dialog + alert-dialog/sheet สอดคล้อง)
- [x] Sonner — `AppToaster` + `app-toast.ts` สี/icon brand (lucide · CSS tokens · `richColors` off)
- [x] `/dev/ui` — Sonner · AlertDialog · Sheet · dialog sizes (`UiPlaygroundPage` §Overlays)

### B. ย้าย `window.confirm` → AlertDialog (15 จุด)

| ไฟล์ | การกระทำ | สถานะ |
|------|-----------|--------|
| `AdminSettingsPage.tsx` | reset section | `[x]` |
| `BoardKioskCard.tsx` | ลบ kiosk token | `[x]` |
| `AdminBrandingPage.tsx` | reset branding | `[x]` |
| `AdminAuditPage.tsx` | cleanup audit | `[x]` |
| `AdminBackupPage.tsx` | restore overwrite · delete backup | `[x]` |
| `AdminMenuPage.tsx` | ลบเมนู | `[x]` |
| `PersonnelAdminPage.tsx` | ลบ user · reset password · impersonate · ลบรูป (หลายจุด) | `[x]` |

### C. Dialog audit (22 ไฟล์ใช้ `Dialog`)

- [x] `WorkOrderDetailDialog` — mobile full-height · sticky tabs · ไม่ overflow
- [x] `PlanningAssignDialog` — step loading · success state · token ไม่ custom
- [x] `ManhourSummaryDialog` — เอา emerald header ออก
- [x] `ConfirmPhraseDialog` — โทน destructive ชัด
- [x] `MovePlanDialog` · `TelegramInviteDialog` · `LoginFeedbackDialog` — สอดคล้อง U4b
- [x] `FilterDateDrawer` — migrate เป็น Sheet (หรือ wrap Sheet + เก็บ UX เดิม)
- [x] `image-lightbox` — keyboard Esc/←/→ · focus trap (มี motion แล้ว)

### D. Animation & feedback

- [x] WO modal — skeleton ต่อแท็บ (ไม่ flash ทั้ง modal)
- [x] WO modal — tab underline / fade สลับแท็บ (≤200ms)
- [x] Planning — แถว highlight หลัง assign แล้ว fade
- [x] Planning — ack badge pending → pulse ครั้งเดียว
- [x] List/KPI — stagger เบา (Home · Confirm รูปมีแล้ว)
- [x] ทุก motion ใหม่ — `useReducedMotion()` / `motion-reduce:`
- [x] **ห้าม** — animate แถวตาราง 500+ แถว

### E. Brand token sweep (`emerald` / `amber` / `violet`)

> เป้า: ใช้ `--status-success|warning|danger` · `--app-tone-*` · `kpi-tone.ts` / `wo-pm-phase.ts`  
> **ความรุนแรงสูง:** `[x]` ครบ 12 ไฟล์ · **รอง/admin/รายงาน:** `[x]` ครบ 4 กลุ่ม

**ความรุนแรงสูง (หน้าช่างใช้บ่อย):**

| ไฟล์ | emerald | amber | violet | สถานะ |
|------|:-------:|:-----:|:------:|--------|
| `WorkOrderConfirmCommentsSection.tsx` | — | — | 32→0 | `[x]` |
| `WorkOrderMaterialPanel.tsx` | — | — | 20→0 | `[x]` |
| `WorkOrderDetailDialog.tsx` | 11→0 | 6→0 | — | `[x]` |
| `WorkOrderConfirmPanel.tsx` | 12→0 | 2→0 | — | `[x]` |
| `WorkOrderTaskListPanel.tsx` | 7→0 | 7→0 | — | `[x]` |
| `ConfirmationImagesPanel.tsx` | 9→0 | 5→0 | — | `[x]` |
| `ConfirmQcPanel.tsx` | — | 10→0 | — | `[x]` |
| `WorkOrderMachinePanel.tsx` | — | 11→0 | — | `[x]` |
| `PlanningQuickAssign.tsx` | 4→0 | — | — | `[x]` |
| `FilterDetailSummary.tsx` | — | 3→0 | — | `[x]` |
| `Iw37nImportReviewPanel.tsx` | 4→0 | 6→0 | — | `[x]` |
| `ManhourSummaryDialog.tsx` | 0 | 0 | — | `[x]` |

**รอง / admin / รายงาน:**

| ไฟล์ | สถานะ |
|------|--------|
| `EngUtilizationPersonCard.tsx` · `SummaryWeeklyPage.tsx` | `[x]` |
| `PersonnelClosePanel.tsx` · `PersonnelConfirmPage.tsx` · `PersonnelAdminPage.tsx` | `[x]` |
| `AdminTelegramPage.tsx` · `TelegramLinkPanel.tsx` · `ImpersonationBanner.tsx` | `[x]` |
| `MasterDataPage.tsx` · `PmVibrationPage.tsx` · `ManhoursPage.tsx` | `[x]` |

### F. Micro-UX ข้ามหน้า

- [x] Empty state — ทุกหน้า hot path มี CTA ชัด (planning · telegram admin · portal)

### H. Sidebar Premium — ดู **§U4g** รายละเอียด

- [ ] U4g.0 — audit baseline + token map (`--sb-*` / `--app-sidebar-*`)
- [ ] U4g.1 — พื้นผิว sidebar (depth · inner highlight · dark elevation)
- [ ] U4g.2 — โซน brand (logo · title · Pepsi stripe · module chip)
- [ ] U4g.3 — รายการเมนู (active pill เลื่อน · icon rhythm · group heading)
- [ ] U4g.4 — collapsed rail (active ring · tooltip · scroll fade)
- [ ] U4g.5 — expand / pin (≤200ms · ไม่กระตุก label)
- [ ] U4g.6 — footer (avatar · role · logout · portal shortcut)
- [ ] U4g.7 — mobile drawer (backdrop-blur · focus trap · สอดคล้อง Sheet U4a)
- [ ] U4g.8 — Admin shell parity + `MenuNavLayoutCard` preview
- [ ] U4g.9 — ปรับแต่งผู้ใช้ (density · pin · optional width pref)
- [ ] U4g.10 — QA regression sidebar / keyboard / reduced motion

### G. Portal (login จุดเดียว · การ์ด module) — ดู **§U4f** รายละเอียด

- [x] หน้า `/portal` + การ์ด PM · สโตร์อะไหล่ · แจ้งซ่อม (ตามสิทธิ์)
- [x] หลัง login → portal (หรือ auto-skip ถ้ามีสิทธิ์ module เดียว)
- [x] Topbar “กลับ Portal” เมื่อ user มี >1 module
- [~] RBAC `module.*` — migration 102 ติดตั้งแล้ว · Admin Roles UI ติ๊ก module ถัดไป
- [x] สเปก handoff สโตร์/แจ้งซ่อมเมื่อมี URL จริง — [`docs/superpowers/specs/2026-06-09-module-handoff-store-repair.md`](../superpowers/specs/2026-06-09-module-handoff-store-repair.md)

- [ ] Loading — ตารางหนักใช้ Skeleton แถว ไม่ใช่ spinner กลางจออย่างเดียว
- [ ] Error — toast + inline message (ไม่เงียบ)
- [ ] Focus ring — dialog เปิดแล้ว focus อยู่ใน modal
- [ ] Dark mode — FullCalendar · amber callout · QC panel contrast (spot-check หน้า 1–7)
- [ ] รูปปิดงาน — UI สื่อ **หลัง PM เท่านั้น** (legacy before = read-only)

---

## วัตถุประสงค์ U4

| เป้า | รายละเอียด |
|------|-------------|
| **Modern popup** | Dialog / Alert / Sheet สม่ำเสมอ · glass · animation ≤200ms |
| **Brand เดียว** | ลด emerald/amber/violet แบบ hard-code → semantic token |
| **ไล่ทีละหน้า** | หน้าที่ช่าง/Planner ใช้บ่อย polish ก่อน |
| **พร้อม UAT** | ลูกค้าเห็น UI สมบูรณ์ ไม่ใช่ “ฟีเจอร์มีแต่หน้าตาไม่จบ” |
| **Portal** | Login จุดเดียว → การ์ด module ตามสิทธิ์ → เข้า PM / สโตร์อะไหล่ / แจ้งซ่อม |
| **Sidebar premium** | Shell ซ้าย = จุดแรกทุกวัน → depth · active slide · rail · footer user · mobile Sheet (**§U4g**) |

**Phase UI ปัจจุบัน:** _______________  
**หน้าที่กำลัง polish:** _______________  
**อัปเดตโดย:** _______________ **วันที่:** _______________

---

## ภาพรวม U4 (ลำดับทำ)

```text
[U4a] Foundation     — token · component ใหม่ · sonner
[U4b] Popup/Modal    — AlertDialog · Sheet · audit dialog ทั้งแอป
[U4c] Motion         — modal · planning · list (respect reduced-motion)
[U4d] ไล่ทีละหน้า   — planning → WO modal → confirm → …
[U4f] Portal         — login จุดเดียว · การ์ด module · RBAC (คู่ขนาน U4a–d)
[U4e] QA UI          — build · audit:ui · portal · dark mode spot-check
```

| Sub-phase | ชื่อ | สถานะ |
|-----------|------|--------|
| **U4a** | Foundation | `[ ]` |
| **U4b** | Popup / Modal | `[ ]` |
| **U4c** | Motion | `[ ]` |
| **U4d** | รายหน้า | `[ ]` |
| **U4f** | Portal (module hub) | `[ ]` |
| **U4e** | QA UI | `[ ]` |

---

## เกณฑ์ผ่าน U4 (Gate UI)

ติ๊กครบก่อนปิดรอบ UI:

- [ ] **U4a** — `UI-DESIGN-TOKENS.md` ตรง palette · semantic status tokens ใช้ได้
- [ ] **U4b** — `AlertDialog` + `Sheet` ใน `@/components/ui` · dialog หลัก audit แล้ว
- [ ] **U4d** — หน้า **1–7** (ตารางด้านล่าง) ครบ 5 คอลัมน์ Layout/Data/Visual/i18n/RBAC
- [ ] **U4e** — `npm run build` · `npm run audit:ui` ผ่าน · ไม่มี `(mock)` ใน production
- [ ] รูปปิดงาน UI สื่อ **หลัง PM เท่านั้น** (ไม่โชว์ Before upload ใหม่)
- [ ] Dark mode หน้า 1–7 ไม่มีข้อความ/พื้นหลัง contrast พัง
- [ ] **U4f** — `/portal` polish ครบ 5 คอลัมน์ · การ์ด PM ใช้ได้ · สโตร์/แจ้งซ่อม placeholder หรือ handoff ตามสิทธิ์

---

## คำนิยามคอลัมน์ (ติ๊ก `[x]` เมื่อผ่าน)

| คอลัมน์ | เกณฑ์ผ่าน |
|--------|-----------|
| **Layout** | `AppPageShell` / modal header ชัด · padding token · scroll ไม่ชน sidebar |
| **Data** | loading (Skeleton) · empty ไทย · error แสดงข้อความ |
| **Visual** | token Pepsi/brand · ไม่ hex/tailwind สุ่ม · ตาราง `app-table-shell` |
| **i18n** | EN default + TH ครบ key หน้านั้น · ไม่ปน EN โดยไม่จำเป็น |
| **RBAC** | ปุ่มแก้ซ่อนด้วย `CanPermission` / `usePermission` |

---

# U4a — Foundation (token + component)

## U4a.1 Brand & token

- [x] `brand-palette.ts` + `apply-theme.ts` + Admin branding sync
- [ ] อัป [`UI-DESIGN-TOKENS.md`](UI-DESIGN-TOKENS.md) — hex 2026-06 ครบ
- [x] เพิ่ม semantic CSS ใน `index.css`:
  - [x] `--status-success` / `--status-warning` / `--status-danger` / `--status-info`
  - [x] `--phase-before` / `--phase-after`
  - [x] `.app-tone-success|warning|danger|info-*` utilities
  - [ ] `--callout-info` / `--callout-warn` (alias — ใช้ `.app-tone-*` แทนแล้ว)
- [x] ไล่ replace สีดิบ — ตาราง **§E** ครบทั้งความรุนแรงสูง + รอง/admin/รายงาน

| ไฟล์ | ปัญหา | สถานะ |
|------|--------|--------|
| `ConfirmationImagesPanel.tsx` | tone after-only | `[x]` |
| `WorkOrderConfirmCommentsSection.tsx` | violet 32 จุด | `[x]` |
| `WorkOrderMaterialPanel.tsx` | violet 20 จุด | `[x]` |
| `WorkOrderDetailDialog.tsx` | emerald/amber | `[x]` |
| `WorkOrderConfirmPanel.tsx` | emerald | `[x]` |
| `WorkOrderTaskListPanel.tsx` | emerald/amber | `[x]` |
| `ConfirmQcPanel.tsx` | amber panel | `[x]` |
| `WorkOrderMachinePanel.tsx` | amber | `[x]` |
| `Iw37nImportReviewPanel.tsx` | amber/emerald | `[x]` |
| `ManhourSummaryDialog.tsx` | emerald header | `[x]` |
| `EngUtilizationPersonCard.tsx` | emerald/amber | `[x]` |
| `SummaryWeeklyPage.tsx` | amber cells | `[x]` |
| `FilterDetailSummary.tsx` | amber badge | `[x]` |
| `PersonnelClosePanel.tsx` | amber warn | `[x]` |
| `PlanningQuickAssign.tsx` | emerald | `[x]` |

## U4a.2 Component ใหม่

- [x] **`alert-dialog.tsx`** (Radix) — destructive variant · ใช้แทน confirm แบบ ad-hoc (`/dev/ui`)
- [x] **`sheet.tsx`** (Radix) — slide จากล่าง/ขวา · mobile filter
- [x] **`dialog.tsx`** — presets: `DialogContent size="sm|md|lg|full"`
- [x] **Sonner** — `components/ui/sonner.tsx` + `app-toast.ts` (icon+สี brand)
- [x] อัป `/dev/ui` แสดง component ใหม่ (dev only) — §Overlays U4a/U4b

---

# U4b — Popup / Modal (modern)

## U4b.1 มาตรฐาน Dialog

- [ ] Overlay: `backdrop-blur-sm` + fade (ไม่หนักเกิน)
- [ ] Content: `macos-dialog-glass` + zoom-in ≤200ms (มีแล้ว — audit ทุก dialog)
- [ ] ปิด: X · Esc · click outside (ยกเว้น destructive)
- [ ] Mobile: WO modal → `full` หรือ `max-h-[100dvh]` scroll ภายใน

## U4b.2 Audit ราย component

| Component | Path | Checklist | สถานะ |
|-----------|------|-----------|--------|
| WO modal | `WorkOrderDetailDialog.tsx` | แท็บ · sticky header · mobile · after-only รูป | `[ ]` |
| Planning assign | `PlanningAssignDialog.tsx` | step UI · success · loading | `[x]` |
| Move plan | `MovePlanDialog.tsx` | token ไม่ custom | `[ ]` |
| Manhour summary | `ManhourSummaryDialog.tsx` | เอา emerald header ออก | `[x]` |
| Confirm phrase | `ConfirmPhraseDialog.tsx` | โทนอันตราย | `[x]` |
| Login feedback | `LoginFeedbackDialog.tsx` | motion มีแล้ว — สอดคล้อง brand | `[x]` |
| Telegram invite | `TelegramInviteDialog.tsx` | i18n · empty bot | `[x]` |
| Filter date | `FilterDateDrawer.tsx` | Esc · Apply · Sheet (optional) | `[x]` |
| Image lightbox | `image-lightbox.tsx` | keyboard · focus | `[x]` |

## U4b.3 AlertDialog — จุดที่ควรใช้

- [ ] ลบรูป confirm (`ConfirmationImagesPanel`)
- [ ] ลบ comment / close record (WO modal)
- [ ] **Migrate `window.confirm`** — ดูตาราง **§B** ด้านบน (Admin + Personnel)
- [ ] Admin backup restore (คู่กับ `ConfirmPhraseDialog` หรือแทนที่)
- [ ] Telegram group delete (`AdminTelegramPage`)
- [ ] Mass confirm ยกเลิก batch (ถ้ามี confirm ad-hoc)

---

# U4c — Motion & feedback

> ทุก animation ต้อง `useReducedMotion()` หรือ `motion-reduce:` — ห้าม loop รบกวน

| จุด | งาน | สถานะ |
|-----|-----|--------|
| WO modal แท็บ | underline / fade เปลี่ยนแท็บ | `[x]` |
| WO modal โหลด | Skeleton ต่อแท็บ ไม่ flash ทั้ง modal | `[x]` |
| Planning หลัง assign | แถว highlight แล้ว fade | `[x]` |
| Planning ack | badge pending → pulse ครั้งเดียว | `[x]` |
| List/KPI stagger | Home · Confirm (≤30 รายการ) | `[x]` |
| Reduced motion | ทุก motion ใหม่ → `useReducedMotion()` / `motion-reduce:` / `@media` | `[x]` |
| Toast | sonner slide + brand icon | `[ ]` |
| ปุ่ม primary | hover/active มีแล้ว — audit หน้าใหม่ | `[ ]` |
| **ห้าม** | animate แถวตาราง 500+ แถว | `[x]` audit: ไม่มี `motion.tr`/stagger บน `<TableRow>` · planning = highlight 1 แถว · stagger ≤30 ใน `list-kpi-stagger.ts` |

---

# U4d — ไล่ทีละหน้า (ทำตามลำดับ)

## สรุปความคืบหน้า

| ลำดับ | หน้า / โซน | Layout | Data | Visual | i18n | RBAC | รวม |
|------|-------------|:------:|:----:|:------:|:----:|:----:|:---:|
| **1** | `/planning` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **2** | WO modal | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **3** | `/confirmation` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **4** | `/calendar` | `[x]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **5** | `/work-orders` | `[x]` | `[ ]` | `[ ]` | `[ ]` | `[x]` | `[ ]` |
| **6** | `/admin/telegram` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| **7** | `/settings` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| 8 | `/pm-vibration` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| 9 | `/integration` | `[x]` | `[ ]` | `[ ]` | `[ ]` | `[x]` | `[ ]` |
| 10 | `/personnel` + confirm | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| 11 | `/summary-weekly` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| 12 | `/admin/*` (ทั่วไป) | `[x]` | `[ ]` | `[ ]` | `[ ]` | `[x]` | `[ ]` |
| 13 | `/master-data` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[x]` | `[ ]` |

---

## U4d-1 — `/planning` (เริ่มที่นี่)

**ไฟล์หลัก:** `PlanningPage.tsx` · `PlanningAssignDialog.tsx` · `PlanningMultiAssign.tsx`

### Layout
- [ ] `AppPageShell` + hint ไทย/EN
- [ ] ตาราง/การ์ด scroll ใน content ไม่ดัน shell

### Visual / UX
- [ ] คอลัมน ack status — badge สี semantic (pending / acked)
- [ ] ปุ่มจ่ายงาน — primary ชัด · disabled state เมื่อไม่มีสิทธิ์
- [x] `PlanningAssignDialog` — header · โหMode P/G · success หลัง assign
- [x] Empty: ยังไม่มีงาน — ข้อความ + CTA ชัด

### Data
- [ ] Skeleton โหลดรายการ
- [ ] Error แสดง toast + ข้อความ

### i18n
- [ ] `planning.json` EN/TH — ack · assign · empty

**เกณฑ์ผ่านหน้านี้:** 5 คอลัมน์ครบ · screenshot ก่อน/หลังเก็บใน PR

---

## U4d-2 — WO modal (`WorkOrderDetailDialog`)

**ไฟล์หลัก:** `WorkOrderDetailDialog.tsx` · แท็บ Confirm / Planning / Task

### Layout
- [x] แท็บ sticky · scroll เนื้อหาแยก
- [x] Mobile: ไม่ overflow แนวนอน · ปิดง่าย

### Visual
- [ ] แท็บ Confirm — รูป **หลัง PM** เท่านั้น (legacy before = read-only)
- [ ] QC panel · technician status · close guard message ตรงกฎใหม่
- [ ] PM readings / comment — spacing สม่ำกับ design system

### Motion
- [ ] Skeleton ต่อแท็บเมื่อสลับ
- [ ] (optional) tab indicator slide

### i18n
- [ ] `scheduling.json` / `confirmation.json` — ข้อความ close ready · รูปหลัง PM

---

## U4d-3 — `/confirmation`

**ไฟล์หลัก:** `ConfirmationPage` · `ConfirmQcPanel` · `ConfirmationImagesPanel`

- [ ] Mass confirm UI ≤44 — ชัด · ไม่ clutter
- [ ] QC queue badge · approve/reject
- [ ] รูป: โซน after + legacy read-only
- [ ] Export panel — ปุ่ม + ไอคอนไทย/EN

---

## U4d-4 — `/calendar`

- [x] เอา Priority filter ออกแล้ว
- [ ] `FilterDetailSummary` + KPI สี token
- [ ] Event สีทีม A/B ตาม [`CALENDAR-DISPLAY.md`](CALENDAR-DISPLAY.md)
- [ ] FullCalendar dark mode ไม่แตก
- [ ] Move dialog สอดคล้อง U4b

---

## U4d-5 — `/work-orders`

- [x] AppPageShell · bulk team
- [ ] Filter bar compact · `FilterDetailSummary` live
- [ ] เปิด modal `initialTab=task-list` — visual polish
- [ ] ZB type filter label เรียง ZB01→ZB02→ZB05

---

## U4d-6 — `/admin/telegram`

**ไฟล์:** `AdminTelegramPage.tsx`

- [ ] `AdminPageShell` + KPI grid สไตล์ admin อื่น
- [ ] ตารางกลุ่ม · dialog create/edit · test send feedback
- [ ] Help steps อ่านง่าย · code block webhook
- [x] Empty: ยังไม่มีกลุ่ม

---

## U4d-7 — `/settings`

**ไฟล์:** `SettingsPage.tsx` · `TelegramLinkPanel.tsx` · `LanguagePreferencePanel.tsx`

- [ ] แท็บ Profile / Language / Telegram ชัด
- [ ] Globe + segmented language (Settings)
- [ ] Telegram linked / not linked state
- [ ] Connection badge ใช้ semantic success

---

## U4d-8 — หน้ารอง (หลัง 1–7)

### `/pm-vibration`
- [ ] Print form layout ตรงกระดาษ ([`PM-MANUAL-ENTRY-WORK-ORDER-FORM.md`](PM-MANUAL-ENTRY-WORK-ORDER-FORM.md))
- [ ] กราฟ trend · ตาราง · ไม่ amber ลอย

### `/integration` · `/iw37n`
- [ ] Review panel token · tab ชัด
- [ ] Job status badge

### `/personnel` · `/personnel/confirm`
- [ ] Mass confirm UX · รูป/เวลา summary

### `/summary-weekly` · `/board`
- [ ] Eng Util grid · รูปช่าง · TV layout

### `/master-data`
- [ ] polish ทีหลัง — tab · dialog import

---

# U4f — Portal (login จุดเดียว · การ์ด module)

> **ทำคู่กับ U4a–U4d** — UI portal ใช้ design system เดียวกัน (glass · token · i18n)  
> สเปกสถาปัตยกรรม: [`../superpowers/specs/2026-06-09-unified-portal-multi-module-design.md`](../superpowers/specs/2026-06-09-unified-portal-multi-module-design.md)

## บริบท module (นิยามลูกค้า)

| module_code | ชื่อแสดง | ความหมาย | สถานะแอป |
|-------------|----------|----------|----------|
| **`pm`** | PM Maintenance | แผนงาน · WO · Confirm · ปฏิทิน (แอปนี้) | มีแล้ว |
| **`store`** | สโตร์อะไหล่ | **เบิกอะไหล่/วัสดุ** สำหรับช่างตอนซ่อมและทำ PM (ไม่ใช่ร้านค้าปลีก) | แอปใหม่ / URL แยก (TBD) |
| **`repair`** | แจ้งซ่อม | แจ้งซ่อม / workflow งานซ่อม (นอก scope PM ปัจจุบัน) | แอปใหม่ / URL แยก (TBD) |

**Flow เป้าหมาย:**

```text
/login  →  /portal  →  [การ์ดตามสิทธิ์]  →  คลิก → PM (ในแอป) หรือ redirect สโตร์/แจ้งซ่อม
```

**กรณีพิเศษ:**

- มีสิทธิ์ **module เดียว** → ข้าม portal ไป entry ของ module นั้น (feature flag / setting)
- **ไม่มีสิทธิ์ module ใด** → portal ว่าง + ข้อความติดต่อ Admin
- กลับจาก PM → ลิงก์ “Portal” ใน topbar (เฉพาะ user ที่มี >1 module)

---

## U4f สรุปความคืบหน้า (หน้า `/portal`)

| คอลัมน์ | เกณฑ์ | สถานะ |
|--------|--------|--------|
| **Layout** | `AppPageShell` ไม่มี sidebar เมนู PM หนัก · grid การ์ด responsive | `[ ]` |
| **Data** | `GET /api/v1/portal/modules` · Skeleton · empty · error | `[x]` |
| **Visual** | การ์ด glass · ไอคอน module · accent token · hover ≤200ms | `[ ]` |
| **i18n** | `portal.json` EN/TH · ชื่อ/คำอธิบาย module | `[ ]` |
| **RBAC** | แสดงเฉพาะ module ที่มี permission · ซ่อนการ์ดที่ไม่มีสิทธิ์ | `[x]` |

---

## U4f.1 — Backend & RBAC

- [x] Migration **102** — `tbl_app_module` + permissions (ติดตั้งแล้ว)
- [x] Permission codes: `module.pm` · `module.store` · `module.repair` · `portal.view` — ใน DB แล้ว · ติ๊กได้ที่ Admin → บทบาท & สิทธิ์ กลุ่ม **Portal** (+ ตัวอย่างการ์ดเมื่อจำลอง role)
- [x] Grant ค่าเริ่มต้น: A/U/W ตาม migration 102
- [x] `GET /api/v1/portal/modules` — กรองตาม `listPermissionsForUser`
- [x] Admin → Roles — กลุ่ม **Portal** ติ๊ก pm/store/repair · ชื่อกลุ่ม i18n · `RolePortalPreview`
- [ ] (Phase M1) `POST /api/v1/auth/module-handoff` + `module-exchange` — ตามสเปก [`module-handoff-store-repair`](../superpowers/specs/2026-06-09-module-handoff-store-repair.md)
- [ ] Feature flag `PORTAL_ENABLED` — ปิดได้ระหว่าง dev ไม่กระทบ flow เดิม

---

## U4f.2 — Login & routing

- [ ] หลัง login สำเร็จ → `resolvePostLoginPath` → `/portal` (แทน `/plan-calendar` โดยตรง)
- [ ] เก็บ deep link: login จาก `/work-orders` → หลัง portal เลือก PM → ไป path เดิม (optional)
- [ ] `autoRedirect` — ถ้ามีสิทธิ์ module เดียว → ข้าม portal
- [ ] Route `/portal` — ไม่ใช้ `AppNavShell` sidebar เต็ม (หรือ shell แบบ hub บาง)
- [ ] Logout ยัง `/logout` → `/login` เหมือนเดิม

---

## U4f.3 — UI การ์ด module

**ไฟล์หลัก (ร่าง):** `PortalPage.tsx` · `ModulePortalCard.tsx` · `portal-api.ts`

### Layout
- [ ] หัวข้อ “เลือกระบบ” / “Select application” + ชื่อผู้ใช้
- [ ] Grid: 1 คอลัมน์ mobile · 2–3 คอลัน tablet/desktop
- [ ] ไม่โหลด sidebar PM จนกว่าจะเข้า module PM

### การ์ดแต่ละ module
- [ ] ไอคอน (lucide): PM=`Wrench` · สโตร์=`Package` · แจ้งซ่อม=`Bell`/`Wrench`
- [ ] ชื่อ TH + EN · คำอธิบายสั้น (สโตร์ = เบิกอะไหล่ช่าง)
- [ ] Hover: `motion-safe` lift/border · `useReducedMotion`
- [ ] การ์ด disabled + badge “เร็วๆ นี้” ถ้า `base_url` ยังไม่พร้อมแต่มีสิทธิ์

### คลิกการ์ด
- [ ] **`pm`** → `navigate` ไป entry ตาม role (`/` · `/planning` · `/plan-calendar`) หรือ `/plan-calendar` default
- [x] **`store`** — M0: toast “เร็วๆ นี้” เมื่อ `base_url` ว่าง · M1: handoff ตามสเปก
- [x] **`repair`** — เหมือน store

### Empty / error
- [x] ไม่มี module → `EmptyState` + ติดต่อ Admin
- [ ] API error → retry + toast

### i18n (`portal.json`)
- [ ] `title` · `subtitle` · `modules.pm` · `modules.store` · `modules.repair`
- [ ] `store.description` = เบิกอะไหล่สำหรับงานซ่อมและ PM
- [ ] `comingSoon` · `noModules` · `backToPortal`

---

## U4f.4 — Shell ข้าม module

- [ ] Topbar (เมื่ออยู่ใน PM) — ลิงก์ “Portal” / grid icon ถ้า `modules.length > 1`
- [ ] ไม่แสดงลิงก์ Portal ถ้ามีสิทธิ์แค่ `module.pm`
- [ ] Command palette (Ctrl+K) — เพิ่ม action “ไป Portal”
- [ ] Dark mode — การ์ด portal contrast อ่านได้

---

## U4f.5 — `/dev/ui` & QA

- [ ] `/dev/ui` — ตัวอย่าง `ModulePortalCard` 3 แบบ
- [ ] Screenshot ก่อน/หลัง portal สำหรับ UAT
- [ ] E2E (optional): login → เห็นการ์ด PM → คลิก → เข้า `/plan-calendar`

---

## U4f.6 — ลำดับทำคู่ UI (แนะนำ)

| ลำดับ | งาน | พึ่ง |
|------|-----|-----|
| 1 | U4f.1 permission + API mock/จริง | — |
| 2 | U4f.3 การ์ด + `/portal` (PM การ์ดเดียวก่อน) | U4a token |
| 3 | U4f.2 เปลี่ยน post-login | U4f.3 |
| 4 | U4f.4 topbar กลับ portal | U4f.2 |
| 5 | การ์ด store/repair placeholder + copy ลูกค้า | i18n |
| 6 | U4f.1 handoff (เมื่อมี URL สโตร์จริง) | แอปสโตร์ |

**ไม่บล็อก:** U4d-1 planning polish ทำคู่ขนานได้หลังขั้น 2

---

# U4g — Sidebar Premium (ปรับแต่งให้สวยที่สุด)

> **เป้าหมาย:** แถบนำทางซ้าย = จุดแรกที่ผู้ใช้เห็นทุกวัน — ต้องรู้สึก **premium · ชัด · เร็ว** เทียบ macOS / Linear / Notion sidebar แต่ยังเป็น **Pepsi corporate**  
> **พื้นฐานที่มีแล้ว (U1–U3):** `macos-sidebar` · collapse `w-14`/`w-60` · hover expand · pin · mobile drawer · active `::before` bar · tooltip ตอนยุบ — ดู [`UI-POLISH-PHASES.md`](UI-POLISH-PHASES.md) §U1  
> **ไฟล์หลัก:** `AppNavShell.tsx` · `NavMenuList.tsx` · `index.css` (`.macos-sidebar`) · `use-sidebar-state.ts` · `sidebar-prefs.ts` · Admin `MenuNavLayoutCard.tsx`

## หลักการออกแบบ (บังคับ)

| หลัก | รายละเอียด |
|------|-------------|
| **Token เท่านั้น** | สีจาก `--app-sidebar-*` · `--sb-menu-*` · `--app-accent` — ห้าม `teal-*` / `slate-*` ใหม่ใน sidebar |
| **Motion ≤200ms** | ขยายความกว้าง · active indicator · hover — ยกเว้น width collapse สูงสุด **300ms** (มีอยู่แล้ว) |
| **Reduced motion** | ทุก animation ใหม่ → `useReducedMotion()` หรือ `motion-reduce:` + `@media (prefers-reduced-motion)` |
| **ไม่ animate เมนูยาว** | ห้าม stagger รายการเมนู 20+ แถว — animate เฉพาะ **chrome** (shell · indicator · brand) |
| **RBAC ไม่เปลี่ยน** | เมนูยังมาจาก `tbmenu` / `nav-config` / permission — polish แค่ visual |
| **Admin สอดคล้อง** | `.macos-admin .macos-sidebar` ใช้ชุด component เดียวกัน ต่างแค่ `--admin-*` token |

## ภาพรวม UX เป้าหมาย (wireframe คำอธิบาย)

```text
┌─────────────────────────────┐
│ ▓ Pepsi stripe (บาง)        │
│ ┌────┐  PM Maintenance      │  ← brand: logo ในกรอบ glass + ชื่อ fade ตอนยุบ
│ │logo│  [PM]                 │     chip module (ถ้ามี portal)
├─────────────────────────────┤
│ WORK                         │  ← group heading: uppercase เบา + hairline gradient
│ ●▎ Planning          ←active │  ← active: pill + accent bar เลื่อน (ไม่กระโดด)
│   Calendar                   │
│ CONFIRM                      │
│   Work orders                │
│         ⋮ scroll fade        │  ← fade mask บน/ล่างเมื่อ scroll ยาว
├─────────────────────────────┤
│ [📌 Pin]                     │  ← footer: pin · avatar initials · role · logout
│ (👤) สมชาย · Planner         │
│ [ Log out ]                  │
└─────────────────────────────┘

ยุบ (rail w-14): ไอคอนกลาง · active = ring + dot · tooltip ขวา · brand = logo อย่างเดียว
มือถือ: Sheet/drawer + backdrop-blur · ปิด Esc · focus trap · ไม่บัง announcement
```

## U4g สรุปความคืบหน้า

| คอลัมน์ | เกณฑ์ | สถานะ |
|--------|--------|--------|
| **Surface** | depth · border luminance · dark contrast | `[ ]` |
| **Nav** | active indicator slide · hover · focus ring | `[ ]` |
| **Collapse** | rail ชัด · tooltip · ไม่ clip ไอคอน | `[ ]` |
| **Mobile** | drawer blur · a11y · สอดคล้อง Sheet | `[ ]` |
| **Footer** | user block · logout · portal link | `[ ]` |
| **Admin** | preview ตรงกับ sidebar จริง | `[ ]` |
| **Prefs** | pin + density จำ localStorage | `[ ]` |

---

## U4g.0 — Audit baseline

- [ ] Screenshot light/dark — sidebar expanded · collapsed · mobile drawer · admin
- [ ] บันทึก gap เทียบ wireframe ด้านบน (ใน PR หรือ comment checklist)
- [ ] รวม CSS กระจาย: `.macos-sidebar` · `.app-sidebar` · `.sidebar-nav` → แผนรวมศูนย์ใน `index.css` §sidebar
- [ ] ตรวจ contrast WCAG — `--app-sidebar-fg-muted` บนพื้น sidebar (light + dark)
- [ ] `/dev/ui` — เพิ่ม section **Sidebar states** (mock nav 5–8 รายการ)

---

## U4g.1 — พื้นผิว & depth (shell)

> ทำให้ sidebar “ลอย” เหนือ content โดยไม่หนักเกิน (ไม่ใช่ dialog glass เต็มจอ)

- [ ] พื้นหลัง: gradient แนวตั้งเบา `color-mix(--app-sidebar, --app-surface)` + **inner highlight** 1px ขอบขวา (light)
- [ ] Dark: elevation shadow + border `rgba(255,255,255,0.06)` — อ่านเมนู muted ชัด
- [ ] Hover-expand (ไม่ pin): เพิ่ม `box-shadow` ชั่วคราวเมื่อ overlay บน content — มีบางส่วนแล้ว ต้องจูนไม่กระพริบ
- [ ] แยก token ใหม่ (ถ้าจำเป็น): `--app-sidebar-elevated` · `--app-sidebar-inner-highlight` ใน [`UI-DESIGN-TOKENS.md`](UI-DESIGN-TOKENS.md)
- [ ] ห้าม `backdrop-filter` หนักบน desktop (perf) — ใช้เฉพาะ mobile overlay ได้

**ไฟล์:** `index.css` · `apply-theme.ts` (ถ้าผูก branding)

---

## U4g.2 — โซน brand (header sidebar)

- [ ] `PepsiStripe` — ความสูง/opacity สม่ำเสมอ expanded vs collapsed
- [ ] Logo: กรอบ `app-topbar-brand__mark` แบบย่อสำหรับ sidebar — มุมโค้ง · shadow เบา
- [ ] ชื่อแอป: fade `max-width` มีแล้ว — จูน easing ให้สอดคล้อง `--sidebar-motion`
- [ ] **Module chip** (ถ้า `showPortalLink`): badge เล็ก `PM` ข้างชื่อ — token `--app-tone-info`
- [ ] Collapsed: logo อยู่กึ่งกลาง · ไม่มี title · tooltip ชื่อแอปเมื่อ hover (optional)

**ไฟล์:** `AppNavShell.tsx` (`SidebarPanel`) · `PepsiStripe.tsx` · `index.css` `.app-sidebar-brand*`

---

## U4g.3 — รายการเมนู & active state

> ยกระดับจาก active `::before` แบบคงที่ → **indicator เลื่อน** (แนวเดียวกับ WO modal `SchedulingWoTabsList`)

- [ ] สร้าง `SidebarNavIndicator` (หรือ CSS-only) — bar/pill accent เลื่อนตาม `[aria-current='page']` · ≤200ms
- [ ] รายการ: ความสูงสม่ำเสมอ `h-10` · icon `size-4` · gap · radius `rounded-lg`
- [ ] Hover: พื้น `8%` accent — มีแล้ว ตรวจไม่ชน active
- [ ] Focus-visible: `focus-app-ring` ชัด (keyboard จาก hamburger → เมนู)
- [ ] Group heading: `nav-menu-group-heading` — letter-spacing · hairline `::after` (มีแล้ว) · **sticky** ขณะ scroll ภายใน nav (optional ถ้าไม่ซับซ้อน)
- [ ] Navbar variant (`navShellMode === 'navbar'`): active underline สอดคล้อง sidebar (ไม่ทิ้งโหมด navbar)

**ไฟล์:** `NavMenuList.tsx` · `index.css` `.macos-sidebar .sidebar-nav a*` · component ใหม่ใน `components/layout/`

---

## U4g.4 — Collapsed rail (w-14)

- [ ] Active ตอนยุบ: **icon ring** + dot ใต้ไอคอน (แทน bar ซ้ายที่ `display:none` อยู่) — ต้องเห็นชัดบน zebra พื้น
- [ ] Tooltip: delay 200ms · ขอบ glass เบา · ไม่บัง pointer
- [ ] Scroll ใน nav: **fade mask** บน/ล่าง `mask-image: linear-gradient(...)` เมื่อ overflow
- [ ] ไอคอน lucide สี muted → active เป็น `--sb-menu-highlight`
- [ ] จำนวนเมนูมาก: scroll เฉพาะ `<nav>` ไม่ดึงทั้ง sidebar (มี `overflow-y-auto` แล้ว — verify)

---

## U4g.5 — Expand · hover · pin

- [ ] Width transition คง `300ms` cubic-bezier เดิม — ตรวจไม่ layout shift main content
- [ ] Pin: ปุ่ม ghost → **toggle ชัด** (pressed state · `aria-pressed` มีแล้ว) · ไอคอน Pin/PinOff
- [ ] Hover expand (ไม่ pin): delay เล็กน้อยก่อนขยาย (optional 50ms) กันอาการกระพริบ
- [ ] เก็บ pref `pm_sidebar_pinned` — มีแล้วใน `sidebar-prefs.ts` · เพิ่ม `pm_sidebar_density` ใน U4g.9
- [ ] `useReducedMotion`: ขยายทันทีไม่มี transition width

**ไฟล์:** `use-sidebar-state.ts` · `AppNavShell.tsx`

---

## U4g.6 — Footer sidebar (user · actions)

- [ ] แยก visual โซน footer: `border-t` + พื้นเข้มขึ้นเล็กน้อย
- [ ] User block: **avatar initials** วงกลม (จาก `fullnameTh` / `username`) แทนข้อความล้วน
- [ ] Role: badge เล็ก `resolveRoleDisplayLabel` — token muted
- [ ] Logout: โทน ghost/outline สม่ำเสมอ · icon + label fade ตอนยุบ (มี pattern แล้ว)
- [ ] Portal: ลิงก์ “กลับ Portal” ใน footer เมื่อ `showPortalLink` (ซ้ำ topbar ได้ — หรือ footer only บนมือถือ)
- [ ] Collapsed: เหลือ avatar + logout icon · tooltip

---

## U4g.7 — Mobile drawer

- [ ] Overlay: `bg-black/40` + **`backdrop-blur-sm`** (สอดคล้อง dialog U4a)
- [ ] พิจารณา migrate เป็น `Sheet` (`side="left"`) แทน `<aside>` custom — ถ้าได้ focus trap ฟรี
- [ ] ปิด: X · Esc · click outside · navigate (มีแล้ว) — verify focus กลับ hamburger
- [ ] ความกว้าง `min(100vw-2rem, 18rem)` — จูน safe-area iOS
- [ ] ไม่ให้ announcement/banner ทับ drawer z-index

**ไฟล์:** `AppNavShell.tsx` · `components/ui/sheet.tsx`

---

## U4g.8 — Admin parity & preview

- [ ] `.macos-admin .macos-sidebar` ใช้ component ชุดเดียวกับแอปหลัก — ต่างแค่ CSS variables
- [ ] `MenuNavLayoutCard` (Admin → เมนู) preview **ตรง pixel** กับ sidebar จริงหลัง U4g.3
- [ ] Admin tour / command palette ไม่บัง indicator ใหม่

---

## U4g.9 — ปรับแต่งผู้ใช้ (optional แต่แนะนำ)

| Pref | คีย์ | ค่า |
|------|------|-----|
| ปักหมุด | `pm_sidebar_pinned` | มีแล้ว |
| ความหนาแน่น | `pm_sidebar_density` | `comfortable` \| `compact` |
| ความกว้าง (ถ้าทำ) | `pm_sidebar_width` | `narrow` \| `wide` (`w-14`/`w-60` vs `w-64`) |

- [ ] UI ตั้งค่าใน **Settings → Profile** หรือปุ่มใน footer sidebar (ไม่บังคับ Admin)
- [ ] compact: ลด `py` รายการเมนู · ยังแตะได้ 44px ขั้นต่ำบน mobile
- [ ] sync กับ branding จาก Admin (logo height `--brand-logo-nav-height`)

---

## U4g.10 — QA & regression

- [ ] Sidebar active ถูก route ย่อย (`/work-orders/123` → highlight ถูก parent ถ้ามี)
- [ ] สลับ EN/TH — ความยาว label ไม่ทำ layout พัง (truncate + tooltip)
- [ ] Impersonation banner + sidebar ไม่ overlap
- [ ] `navShellMode`: `sidebar` · `hamburger` · `navbar` — ทั้งสามโหมดใช้ได้
- [ ] Viewport: 1280 · 1920 · iPad · iPhone — drawer + rail
- [ ] Dark mode spot-check คู่ U4e
- [ ] Screenshot ก่อน/หลังสำหรับ UAT (light + dark)

---

## U4g — ลำดับทำแนะนำ

| ลำดับ | งาน | พึ่ง |
|------|-----|-----|
| 1 | U4g.0 audit + `/dev/ui` sidebar block | — |
| 2 | U4g.1 surface + tokens | U4a semantic token |
| 3 | U4g.3 active indicator + U4g.4 rail | U4g.1 |
| 4 | U4g.2 brand + U4g.6 footer | U4g.1 |
| 5 | U4g.5 pin/hover polish + U4g.7 mobile | U4g.3 |
| 6 | U4g.8 admin preview sync | U4g.3 |
| 7 | U4g.9 prefs (ถ้ามีเวลา) | U4g.5 |
| 8 | U4g.10 QA | ทั้งหมด |

**ทำคู่ขนานได้:** U4g กับ U4f Portal · U4d หน้า hot path — แต่ควรจบ **U4g.3 indicator** ก่อน demo ลูกค้า sidebar

---

# U4e — QA UI (ก่อนปิด U4)

## Build & audit

```bash
cd PM-Pepsi-App/frontend && npm run build
cd PM-Pepsi-App/frontend && npm run audit:ui
```

- [ ] build ผ่าน ไม่มี TS error
- [ ] `audit:ui` ไม่มี `(mock)`
- [ ] ไม่มี console error หน้า 1–7 (manual)

## Viewport

- [ ] **1280×720** — sidebar drawer · ตาราง scroll
- [ ] **1920×1080** — layout ไม่โล่งผิด
- [ ] **Tablet** — ปฏิทิน touch · modal ใช้ได้

## Dark mode spot-check

- [ ] Login · **portal** · planning · WO modal · confirmation · admin telegram
- [ ] ข้อความ muted อ่านได้ (contrast)

## Shell (regression U1 + U4g)

- [ ] Sidebar active · indicator slide · collapsed rail · mobile drawer (ดู **§U4g.10**)
- [ ] Topbar user popover · command palette
- [ ] Language switch EN/TH ทุกหน้าหลัก

---

## ลำดับทำงานแนะนำ (UI ก่อน)

| วัน/สprint | งาน |
|------------|-----|
| 1 | U4a — semantic token + AlertDialog/Sheet |
| 1b | **U4f** — API module + `/portal` การ์ด PM (คู่ขนาน) |
| 1c | **U4g.0–1** sidebar audit + surface (คู่ขนานหลัง U4a) |
| 2 | U4b — audit dialog · post-login → portal |
| 2b | **U4g.2–4** brand · active indicator · collapsed rail |
| 3 | **U4d-1** `/planning` + U4f.4 topbar Portal |
| 4 | **U4d-2** WO modal |
| 5 | **U4d-3** `/confirmation` |
| 6 | U4d-4–5 calendar + work-orders |
| 6b | **U4g.5–7** pin/mobile drawer · U4g.8 admin preview |
| 7 | U4d-6–7 + การ์ด store/repair placeholder |
| 8 | U4e QA + U4g.10 sidebar regression + ปิด Gate U4 |

---

## แมปเอกสาร

| เอกสาร | ความสัมพันธ์ |
|--------|----------------|
| [`UI-POLISH-PHASES.md`](UI-POLISH-PHASES.md) | U0–U3 ประวัติ (sidebar U1) · U4 → **ไฟล์นี้** · sidebar premium → **§U4g** |
| [`../PRE-UAT-MASTER-PHASES.md`](../PRE-UAT-MASTER-PHASES.md) | Master รวม · อ้าง U4 แทน P4 ยาว |
| [`NEW-PAGE-GUIDE.md`](NEW-PAGE-GUIDE.md) | สร้างหน้าใหม่หลัง U4 |
| [`HARDCODE-MOCK-AUDIT.md`](HARDCODE-MOCK-AUDIT.md) | audit:ui |
| [`../superpowers/specs/2026-06-09-unified-portal-multi-module-design.md`](../superpowers/specs/2026-06-09-unified-portal-multi-module-design.md) | สเปก Portal / SSO ข้ามแอป |

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-06-09 | แยก U4 ออกจาก PRE-UAT-MASTER — ไล่ UI ก่อน UAT |
| 2026-06-09 | Audit codebase — เพิ่ม §สรุป · Checklist A–F · ตาราง emerald/amber/violet · window.confirm |
| 2026-06-09 | **U4f Portal** — checklist + implement · migration 102 ติดตั้งแล้ว |
| 2026-06-09 | **U4g Sidebar Premium** — ออกแบบ phase เต็ม (§H checklist · surface · nav · rail · mobile · prefs · QA) |

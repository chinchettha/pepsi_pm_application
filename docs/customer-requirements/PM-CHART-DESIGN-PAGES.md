# PM Chart Design — 3 หน้า Manual Entry (จาก PMChartDesign.xlsx)

อัปเดต: **2026-06-22** · แหล่งอ้างอิง: [`PMChartDesign.xlsx`](../../PMChartDesign.xlsx) (3 sheets)

เอกสารนี้สรุปโครงสร้างที่ลูกค้าต้องการให้ **ตรง Excel ทุกประการ** — ใช้ implement หน้า React สำหรับช่างลงข้อมูล manual + กราฟอัปเดตทันที

| Sheet Excel | Route แอป | ชื่อหน้า |
|-------------|-----------|----------|
| `Vibration` | `/pm-charts/vibration` | Vibration Main Oil Pump-Stax |
| `Current` | `/pm-charts/current` | Flour Mixer Motor Current |
| `Combustion` | `/pm-charts/combustion` | Combustion / Stack Analysis |

> หน้า `/pm-vibration` (WO form) ยังซ่อนอยู่ — ชุดนี้เป็น **PM Chart Design** แยกตามไฟล์ Excel ลูกค้า

---

## 1) Vibration — Main Oil Pump-Stax

### ตารางข้อมูล

| คอลัมน์ | รายละเอียด |
|---------|------------|
| **D/M/Y** | วันที่วัด (แถวละ 1 ครั้ง) |
| **Motor Front** | Dst (Micron) · dB |
| **Motor Back** | Dst · dB |
| **Pump Point#1** | Dst · dB |
| **Pump Point#2** | Dst · dB |
| **Average** | ค่าเฉลี่ย Dst และ dB ของ 4 จุด (คำนวณอัตโนมัติ) |

สีหัวตาราง (ตาม Excel): วันที่แดง · Motor ชมพู · Pump เขียว · Average เขียวเข้ม

### กราฟ (2 charts คู่กัน)

1. **Sound level (dB)** — แกน Y ปรับตามข้อมูลจริง · 4 เส้น + Average + Polynomial trend
2. **Displacement (Micron)** — โครงสร้างเดียวกัน · ใช้ค่า Dst

สีเส้น (ตามตัวอย่างลูกค้า): Motor Front ส้ม · Motor Back น้ำเงิน · Pump#1 เขียว · Pump#2 น้ำตาล

---

## 2) Current — Flour Mixer Motor Current

### ตารางข้อมูล

| ส่วน | รายละเอียด |
|------|------------|
| **Machine** | ชื่อเครื่อง (ตัวอย่าง: Flour Mixer) |
| **Year Average** | ค่าเฉลี่ยปีต่อเฟส R / S / T (3 แถว) |
| **เดือน Feb–Dec** | แต่ละเดือนมีช่อง **1** และ **2** (วัด 2 ครั้ง/เดือน) |
| **3 แถวต่อเครื่อง** | เฟส **R · S · T** (กระแส A) |

### กราฟ

- **Title:** `{machine} Motor Current`
- **Y:** Current (A) · ช่วงปรับตามข้อมูล
- **Actual:** R / S / T + เส้น reference จาก year average

---

## 3) Combustion — Stack / Load Point Analysis

### ตารางข้อมูล

| POINT | พารามิเตอร์ | เดือน |
|-------|-------------|-------|
| **Patail · 50 · 75 · Full** | T. Air, T. Gas, O2, CO, NO2, SO2, CO2, Eff., Losses | JAN, Mar, Aug, Oct, Dec |

### กราฟ (3 charts — ตาม POINT ที่เลือก)

1. **Temperature** — T. Air · T. Gas · %Efficiency
2. **Impurities** — CO / NO2 / SO2 (ppm)
3. **CO2 & O2 Proportion**

---

## UI / UX เป้าหมาย

- Layout: ตารางด้านบน · กราฟด้านล่าง
- ช่องกรอกตัวเลขชัด · ค่าเฉลี่ย/กราฟอัปเดต realtime
- i18n EN/TH (`pmCharts` namespace)
- RBAC: `confirmation.read` (ดู/export) · `confirmation.write` (แก้/import)
- **Auto-save** ลง DB ~1.5 วินาทีหลังแก้ค่า (ไม่มีปุ่ม Save)
- **Scope:** `default` เท่านั้น (ไม่แยกตาม Work Order)

---

## Phase 2 — บันทึก DB · Export · เมนู ✅

| รายการ | สถานะ |
|--------|--------|
| ตาราง `app.tbpm_chart_design` | ✅ migration `120_pm_chart_design.sql` |
| API `GET/PUT /api/v1/pm-charts/:sheetKey` | ✅ |
| API `GET /api/v1/pm-charts/export.xlsx` | ✅ |
| เมนู `tbmenu` → `/pm-charts` | ✅ |

---

## Phase 3 — Import · merge ข้อมูลซ้ำ ✅

| รายการ | สถานะ |
|--------|--------|
| API `POST /api/v1/pm-charts/import` | ✅ บันทึก DB ทันที |
| Merge ข้อมูลซ้ำ (วันที่ / slot / point+month) | ✅ `pm-chart-design-merge.ts` |
| ลิงก์จาก WO modal / Master Plan → `/pm-charts/*` | ✅ เปิดหน้า PM Charts (scope เดียวกัน) |

---

## Phase 4 — Period views · Report export ✅

| รายการ | สถานะ |
|--------|--------|
| Daily / Weekly / Monthly / Yearly + ช่วงวันที่ | ✅ |
| กราฟกรอง/รวมตาม period | ✅ auto-range ตามข้อมูล |
| Export PMChartDesign.xlsx | ✅ |
| Export report (ตาราง + กราฟ PNG) | ✅ `exceljs` |

---

## Phase 5 — Auto-save · ถอด WO scope · E2E (2026-06-22)

| รายการ | สถานะ |
|--------|--------|
| ถอดฟิลเตอร์ Work Order — scope `default` เท่านั้น | ✅ |
| Auto-save แทนปุ่ม Save | ✅ `usePmChartPersistence` |
| แก้ layout กระตุก (save loop / refetch) | ✅ |
| E2E smoke `e2e/pm-charts-smoke.spec.ts` | ✅ |
| รวมใน `e2e/helpers/all-app-routes.ts` | ✅ |

**รัน migration:**

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f database/migrations/120_pm_chart_design.sql
```

**E2E (ต้องมี backend + frontend dev + credentials):**

```powershell
cd PM-Pepsi-App/frontend
$env:E2E_USE_DEV_SEED = '1'
npx playwright test e2e/pm-charts-smoke.spec.ts
```

---

## ไฟล์ implement

| ไฟล์ | บทบาท |
|------|--------|
| `frontend/src/features/pm-charts/` | หน้า + components |
| `backend/src/routes/pm-chart-design.ts` | API |
| `backend/src/lib/pm-chart-design-{import,export,merge}.ts` | Excel + merge |
| `database/migrations/120_pm_chart_design.sql` | ตาราง + เมนู |
| `frontend/e2e/pm-charts-smoke.spec.ts` | E2E smoke |
| `docs/reports/PM-CHART-VERIFICATION-ISO29110-2026-06-22.docx` | รายงาน ISO 29110 |

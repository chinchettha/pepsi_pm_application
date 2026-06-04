# PM Manual Entry — ฟอร์ม Work Order ตามเอกสารกระดาษลูกค้า

อัปเดต: **2026-06-03** · อ้างอิง WO ตัวอย่าง **4001565681** (PEPSICO INTERNATIONAL · Inspection & Cond. Monitoring)

เอกสารนี้เป็น **สเปก UI/ฟิลด์** สำหรับลงข้อมูลแบบ manual บน `/pm-vibration` และ WO modal — **ก่อน implement** ต้องตรงกับภาพที่ลูกค้าส่งมา 4 ชุด:

| # | เนื้อหา | ใช้กำหนด |
|---|---------|----------|
| 1 | Work Order หน้า 1 — header + Operation Long Text + กระแส 3 เฟส 3 จุด | ฟอร์มหลัก manual |
| 2 | กราฟ/ตาราง **กระแส 3 เฟส** (R/S/T · A · ตามเวลา) | โหมด trend + แสดงผล |
| 3 | กราฟ/ตาราง **Vibration 3 แกน** (X/Y/Z · mm/s RMS) | โหมด trend + Warning/Alarm |
| 4 | Work Order หน้า 2 — Comments and Findings + Activity Report | ส่วนท้ายฟอร์ม |

ดูสรุปประเภทค่าวัด: [`PM-MEASUREMENTS-3PHASE-CURRENT.md`](PM-MEASUREMENTS-3PHASE-CURRENT.md)

---

## 1) หน้า 1 — Work Order (SAP print)

### 1.1 ส่วน Header — **อ่านอย่างเดียว** (ดึงจาก IW37N / WO ในระบบ)

| ฟิลด์บนกระดาษ | ตัวอย่าง WO 4001565681 | แหล่งในแอป |
|---------------|------------------------|------------|
| Work Order (barcode) | `4001565681` | `tbiw37n.wkorder` |
| Functional Location | `PI-TH-7151-FA-F1-P1` | `functionalloc` |
| Equipment | `10049361` | `mat` / equipment id |
| Equipment Description | `FACTORY 1 PC50MZ / Oil Heating Zone` | `equdescrip` |
| Work Centre | `PRO002` | `wkctr` |
| Start / End Date | `26.05.2026` | `bscstart` / `actfinish` (แสดงเป็นวันที่) |
| Activity Type | `001 Inspection & Cond. Monitoring` | MaintActivityType / short text |
| Tech Id | `P14` | จาก task / team plan |
| Header Short Text | `369039 & P14-NI-EE` | `operationshorttext` / mntplan |

**UI ที่ต้องการ:** แสดงเป็น **การ์ดสรุป WO** ด้านบนฟอร์ม manual (ไม่แก้ค่า) — ให้ช่างเห็นบริบทเดียวกับกระดาษ SAP

### 1.2 Operation — **อ่านอย่างเดียว**

| ฟิลด์ | ตัวอย่าง |
|-------|----------|
| Operation | `0010` |
| Operation Text | `2M - EE Oil Heating Zone (P14)` |

### 1.3 Operation Long Text — **ลงมือ (Manual) · กระแสไฟฟ้า 3 เฟส**

ข้อความบนกระดาษ: **«ตรวจเช็คกระแสไฟฟ้าทั้ง 3 เฟส»** — แต่ละบรรทัด = **1 จุดวัด (1 task / 1 เครื่องจักร + รายการ PM)**

| ลำดับ | รายการ (เครื่องจักร / PM list) | Phase R (A) | Phase S (A) | Phase T (A) |
|-------|----------------------------------|-------------|-------------|-------------|
| 1 | **Main Oil Pump** | 97.5 | 97.6 | 96.2 |
| 2 | **Combustion Fan** | 39.9 | 40.5 | 40.6 |
| 3 | **Thermal Oil Circulating Pump** | 143.2 | 151.1 | 150.2 |

**กฎฟิลด์**

| รายการ | ค่า |
|--------|-----|
| ประเภทการวัด | `current_3phase` |
| หน่วย | **Ampere (A)** |
| 3 ช่องต่อแถว | **เฟส R · เฟส S · เฟส T** (ไม่ใช่แกน X/Y/Z) |
| วันเวลาวัด (จุดเดียวตามกระดาษ) | จากบล็อก Completion — ตัวอย่าง **29/05/2026 19:10–19:25** → ใช้ **วันที่ + เวลาเริ่ม** เป็น `measured_at` (หรือเวลากลางช่วง — ตกลง UAT) |
| จำนวนแถว | เท่ากับ **จำนวน task ที่เป็นกระแส 3 เฟส** ใน WO (WO ตัวอย่าง = 3 แถว) |

**UI ที่ต้องการ (Mode A — ตรงกระดาษ):**

```
┌─ WO 4001565681 · Oil Heating Zone ─────────────────────────┐
│  [Header อ่านอย่างเดียว — ตาราง §1.1]                          │
├─ Operation Long Text — กระแสไฟฟ้า 3 เฟส ────────────────────┤
│  Main Oil Pump          [ R ___ ] [ S ___ ] [ T ___ ] A      │
│  Combustion Fan         [ R ___ ] [ S ___ ] [ T ___ ] A      │
│  Thermal Oil Circ. Pump [ R ___ ] [ S ___ ] [ T ___ ] A      │
│  วันเวลาวัด: [ date ] [ time ]                               │
│  [ บันทึกทั้ง 3 จุด ]                                         │
└──────────────────────────────────────────────────────────────┘
```

ไม่ใช่แถว generic ที่ต้องพิมพ์ `machine` / `pmlist` เอง — ระบบ **prefill จาก task list** แล้วให้กรอกตัวเลข 3 ช่อง

### 1.4 บล็อก Completion บนกระดาษ (หน้า 1 ล่าง)

| ฟิลด์ | ตัวอย่างที่ลูกค้าเขียน | หมายเหตุ |
|-------|------------------------|----------|
| Completion Date | `29/05/26` | อาจซ้ำกับวันเวลาวัด §1.3 |
| Duration (ช่วงเวลา) | `19.10 – 19.25` | แยก **เวลาเริ่ม–จบ** (ไม่ใช่ชั่วโมง confirm ทั้ง WO) |
| Completed (Y/N) | ติ๊กบนกระดาษ | สถานะปิด operation |
| Completed by | `PR0014` / stamp | รหัสช่าง (`wkctr`) |

**UI ที่ต้องการ:** บล็อก **«Completion»** ใต้ตารางกระแส — ยังไม่มีในแอป (เก็บใน PM execution / confirm แยกจาก Comments §4)

---

## 2) กราฟ — กระแสไฟฟ้า 3 เฟส (ภาพตัวอย่างลูกค้า)

### 2.1 ชื่อและแกน

| รายการ | ค่า |
|--------|-----|
| ชื่อกราฟ (ไทย) | **กระแสไฟฟ้า 3 เฟส** |
| คำอธิบาย | แนวโน้มค่ากระแสแต่ละเฟสตามเวลา |
| แกน X | **เวลา** (08:00, 09:00, … หรือ datetime เต็ม) |
| แกน Y | **กระแส (A)** |
| เส้นกราฟ | 3 สี — **Phase R · Phase S · Phase T** |

### 2.2 ตารางข้อมูล (Manual Mode B — Trend)

ลูกค้าใช้ใน Excel ก่อนทำกราฟ — **โครงคอลัมน์บังคับ:**

| Time | Phase R (A) | Phase S (A) | Phase T (A) |
|------|-------------|-------------|-------------|
| 08:00 | 120 | 118 | 121 |
| 09:00 | 125 | 123 | 126 |
| 10:00 | 130 | 127 | 129 |
| 11:00 | 128 | 126 | 131 |
| 12:00 | 135 | 132 | 134 |

**กฎ**

- หลายแถว **ต่อ 1 จุดวัด (machine + pmlist)** → ระบบ plot เป็น line chart
- `Time` = เวลาในวัน (`HH:mm`) หรือ datetime — ต้อง sort ตามเวลา
- บันทึกลง `app.tbwo_pm_reading` แถวละ 1 จุดเวลา (มีอยู่แล้ว)

**UI ที่ต้องการ (Mode B):**

- แท็บหรือสลับ **«จุดเดียว (ตามกระดาษ WO)»** / **«หลายจุดเวลา (ทำกราห)»**
- Mode B: ตาราง editable — ปุ่ม **+ เพิ่มแถวเวลา** · คอลัมน์ Time | R | S | T
- ด้านล่าง: **Line chart 3 เส้น** (มี component แล้ว — `PmMeasurementLineChart`)

---

## 3) กราฟ — Vibration 3 แกน (ภาพตัวอย่างลูกค้า)

### 3.1 ชื่อและแกน

| รายการ | ค่า |
|--------|-----|
| ชื่อกราฟ | **Vibration trend 3 แกน** |
| หน่วย | **mm/s RMS** |
| แกน X | เวลา |
| แกน Y | mm/s |
| เส้นกราฟ | **แกน X · แกน Y · แกน Z** (ไม่ใช่ R/S/T) |
| เส้นอ้างอิง | **Warning** · **Alarm** (optional บนกราฟ) |

### 3.2 ตารางข้อมูล (Manual)

| Time | Axis X | Axis Y | Axis Z |
|------|--------|--------|--------|
| 08:00 | 1.8 | 2.1 | 1.6 |
| 09:00 | 1.9 | 2.3 | 1.7 |
| 10:00 | 2.1 | 2.8 | 1.9 |
| 11:00 | 2.0 | 3.2 | 2.1 |
| 12:00 | 2.3 | 3.6 | 2.2 |

| คอลัมน์ Excel (sheet Vibration) | F | G | H | I | J |
|---------------------------------|---|---|---|---|---|
| ชื่อ | แกน X | แกน Y | แกน Z | Warning | Alarm |

ประเภทใน DB: `kind = vibration_3axis`

---

## 4) หน้า 2 — Comments and Findings

### 4.1 ฟิลด์บนกระดาษ

| ฟิลด์ | ชนิด input | ตัวอย่าง / หมายเหตุ |
|-------|------------|---------------------|
| **Comments:** | Textarea หลายบรรทัด | ว่างได้ · แยกจาก comment ปิดงาน confirmation |
| ข้อความกลางหน้า | Label (อ่านอย่างเดียว) | *Damage, Cause & Activity Codes Must Be Recorded In The Notification* |
| **Activity Report** | Text | รายงานกิจกรรม |
| **Subsequent Notification** | Text | การแจ้งเตือนถัดไป |
| **Completed by** | Text | ตัวอย่างกระดาษ: `PPU 013, PAC 014` |
| **Signature** | Text หรือ upload ลายเซ็น | บนกระดาษเป็นลายมือ / stamp |
| **Date** | Date picker | วันที่ลงนาม |
| **Equipment back in operation at required rate and quality?** | **Y / N** (radio) | คำถามปิดท้ายฟอร์ม |

### 4.2 แมปแอปปัจจุบัน

| ฟิลด์กระดาษ | แอปวันนี้ | สถานะ |
|-------------|-----------|--------|
| Comments | `tbwo_pm_note.note` · `WorkOrderPmCommentSection` | **มี** (textarea เดียว) |
| Activity Report | — | **ยังไม่มี** |
| Subsequent Notification | — | **ยังไม่มี** |
| Completed by | — (มีแค่ `wkctr` ตอนบันทึก reading) | **ยังไม่มี** |
| Signature | — | **ยังไม่มี** |
| Date (ลงนาม) | — | **ยังไม่มี** |
| Equipment Y/N | — | **ยังไม่มี** |

**UI ที่ต้องการ:** ส่วน **«Comments and Findings»** บน `/pm-vibration` ต่อ WO — layout 2 คอลัมน์ตามกระดาษหน้า 2 · เก็บ JSON หรือคอลัมน์ใหม่ใน `tbwo_pm_note` / ตารางขยาย (ออกแบบ migration ใน phase implement)

---

## 5) โครงข้อมูลที่ใช้ร่วม (DB ที่มีแล้ว)

### `app.tbwo_pm_reading` — ค่าวัด (Manual + Import)

| คอลัมน์ | Manual Mode A | Manual Mode B |
|---------|---------------|---------------|
| `machine` | จาก task | จาก task |
| `pmlist` | จาก task | จาก task |
| `kind` | `current_3phase` / `vibration_3axis` | เหมือนกัน |
| `measured_at` | วันเวลาจาก §1.3 / §1.4 | แต่ละแถว Time |
| `v1,v2,v3` | R,S,T หรือ X,Y,Z | เหมือนกัน |
| `warning_limit`, `alarm_limit` | ว่างได้ (กระแส) | ใช้กับ vibration |

### Import Excel (มีแล้ว)

10 คอลัมน์ — ดู [`PM-MEASUREMENTS-3PHASE-CURRENT.md`](PM-MEASUREMENTS-3PHASE-CURRENT.md) § Template Excel

Manual ต้องใช้ **ชุดฟิลด์เดียวกับ Excel** เพื่อไม่สับสน

---

## 6) หน้า `/pm-vibration` — โครง UI เป้าหมาย (หลัง implement)

ลำดับบนหน้า (บน → ล่าง):

1. **ค้นหา / เลือก WO** (มีแล้ว)
2. **การ์ด Header WO** — §1.1–1.2 อ่านอย่างเดียว
3. **Manual — กระแส 3 เฟส** — §1.3 Mode A (+ สลับ Mode B §2.2)
4. **Manual — Vibration 3 แกน** — §3.2 (ถ้า WO มี task vibration)
5. **กราฟ + ตารางย้อนหลัง** — §2 + §3 (มี chart บางส่วนใน WO modal)
6. **Comments and Findings** — §4 (ขยายฟิลด์)
7. **Import Excel** — คงไว้ท้ายหรือแท็บแยก (มีแล้ว)

Permission: `confirmation.write` (เดิม)

---

## 7) ช่องว่างเทียบแอปปัจจุบัน (ก่อน rework UI)

| ความต้องการจากกระดาษ | สถานะ `/pm-vibration` วันนี้ |
|----------------------|-------------------------------|
| Header WO แบบ SAP print | แสดงแค่เลข WO |
| ฟอร์ม 3 จุดกระแส prefilled จาก task | แถว generic + ปุ่ม fill จาก task |
| Mode B ตาราง Time \| R \| S \| T | ใช้ `measuredAtLocal` ต่อแถว — ใกล้เคียงแต่ UX ไม่ตรงกระดาษ |
| บล็อก Completion §1.4 | ไม่มี |
| หน้า 2 ครบ §4 | มีแค่ Comments |
| กราฟ 3 เฟส / vibration | มีใน WO modal · หน้า bulk ยังไม่แสดง chart รวม |

**Phase ถัดไป (implement):** ทำ UI ตาม §6 · migration ฟิลด์ §4 · UAT ด้วย WO `4001565681`

---

## 8) UAT checklist (Manual)

1. เลือก WO **4001565681** (หรือ WO ZB02 ที่มี 3 task กระแส)
2. Header ตรง §1.1
3. กรอก §1.3 ครบ 3 แถว → บันทึก → ตาราง/กราฟแสดง R/S/T ถูกหน่วย (A)
4. เพิ่มแถวเวลา §2.2 อย่างน้อย 3 จุด → กราฟ 3 เส้นตามเวลา
5. (ถ้ามี task vibration) กรอก §3.2 + Warning/Alarm → กราฟ mm/s
6. กรอก Comments + ฟิลด์ §4 → reload แล้วข้อมูลอยู่
7. เปรียบเทียบกับกระดาษ + Excel export

---

## 10) วิธีทดสอบด้วยแอป **วันนี้** (ก่อน UI ตรงกระดาษครบ)

> ปัญหาที่ลูกค้าเจอ: เปิด `/pm-vibration` แล้ว**ไม่เห็นช่องกรอก** — เพราะเดิมฟอร์มซ่อนจนกว่าจะเลือก WO · แก้แล้วให้เห็นตารางทันที + คำแนะนำ 4 ขั้น

### ขั้นตอน (Manual)

| ขั้น | ทำอะไร |
|------|--------|
| 1 | Login ด้วยบัญชีที่มีสิทธิ **`confirmation.write`** (ช่าง W / Planner U / Admin A) |
| 2 | ไป **`/pm-vibration`** (เมนู PM ค่าวัด) |
| 3 | ช่อง **ค้นหา WO** → พิมพ์เลข เช่น **`4001565681`** → กดค้นหา → **คลิกเลือก** จากรายการ |
| 4 | ตาราง **กรอกค่าวัดด้วยมือ** — ระบบเติมแถวจาก task list (3 เครื่อง = 3 แถว) |
| 5 | กรอก **เฟส R / S / T** ตามกระดาษ (เช่น 97.5 · 97.6 · 96.2) → **บันทึกทุกแถว** |
| 6 | เลื่อนลง **กรอกทีละรายการ + ดูกราฟ** — บันทึกทีละจุดแล้วดูเส้น trend |
| 7 | กล่อง **Comments and Findings** — บันทึกหมายเหตุ PM |

### ทางเลือก (ไม่ต้องเลือก WO ก่อน)

| ขั้น | ทำอะไร |
|------|--------|
| 1 | กด **Template** → ดาวน์โหลด Excel |
| 2 | กรอก sheet **กระแส 3 เฟส** (คอลัมน์ WO + R/S/T) |
| 3 | **อัปโหลด Excel** — ระบบผูก WO จากคอลัมน์ A |

### ถ้ายังกรอกไม่ได้

| อาการ | สาเหตุที่พบบ่อย |
|--------|------------------|
| ปุ่มบันทึกกดไม่ได้ | ยัง**ไม่เลือก WO** หลังค้นหา |
| ช่องเทา / กรอกไม่ได้ | บัญชีไม่มี **`confirmation.write`** |
| ค้นหา WO ไม่เจอ | WO ยังไม่ import ใน IW37N / ไม่อยู่ factory 7151 |
| ไม่มี task 3 แถว | task list WO ไม่มีข้อความ «กระแส 3 เฟส» — กรอก **เครื่อง / รายการ PM** เองในตาราง |

### ทางเลือกอื่น

- เปิด WO จาก **`/work-orders`** → คลิกใบงาน → แท็บ **Task** → กรอก R/S/T ต่อรายการ (มีกราฟ)

---

## 9) ไฟล์ที่เกี่ยวข้องใน repo

| ไฟล์ | บทบาท |
|------|--------|
| `PM-Pepsi-App/frontend/src/features/pm-vibration/PmVibrationPage.tsx` | หน้า manual + import |
| `WorkOrderPmMeasurementBlock.tsx` | manual ต่อ task ใน WO modal |
| `WorkOrderPmCommentSection.tsx` | Comments (ต้องขยาย §4) |
| `database/migrations/092_wo_pm_execution.sql` | `tbwo_pm_note`, `tbwo_pm_reading` |
| `PM-Pepsi-App/backend/src/services/pm-readings-import.ts` | Excel template / import |

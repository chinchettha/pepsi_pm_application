# ปฏิทิน Work Scheduling — การแสดงผล event

อัปเดต: **2026-06-02**  
หน้า: `/calendar`

---

## Title บน event

| ส่วน | รูปแบบ |
|------|--------|
| เลข WO | **เต็ม** ตาม SAP (เช่น `4001558092`) |
| ประเภท | `{wkorder} / {wktype}` เช่น `4001558092 / ZB02` |
| ย้ายแผน | ต่อท้าย `/N` เมื่อ `tbmoveplan.mpcount = N` เช่น `4000001 / PM01/2` = ย้ายครั้งที่ 2 |

---

## สี event

| สี | ความหมาย | เงื่อนไข |
|----|----------|----------|
| **ม่วง** `#9333ea` | กำลังดำเนินการ | CRTD/REL · ยังไม่เสร็จ · ย้ายแผน Reason **ไม่บังคับ** |
| **แดง** `#dc2626` | เลยกำหนด | CRTD/REL · วันแผนผ่านมาแล้ว · ย้ายแผน Reason **บังคับ** |
| **ส้ม** `#f97316` | โอนย้ายแผน | มี `cday` + `mpcount ≥ 1` ขณะ syst ยัง CRTD/REL · Reason **บังคับ** |
| **เขียว** `#16a34a` | เสร็จแล้ว | QC อนุมัติ / % ปิด 100 — **ลากย้ายไม่ได้** |
| **🔔** | เตือน TECO | `syst = TECO` แต่ยังไม่ปิดงาน/confirm ในโปรแกรม |

Legend แสดงใต้ตัวกรองบนหน้า `/calendar`

---

## การแสดง Z1 / Z2 / Z5

ปุ่ม **รวมทั้งหมด · Z1 · Z2 · Z5** — กรอง event ตาม `mat` (กิจกรรม) บนปฏิทิน  
แยกจาก multiselect **กิจกรรม** ในแถบตัวกรอง (ใช้ร่วมกันได้)

---

## ย้ายแผน (Drag & Drop)

ลาก event ไปวันใหม่ → เปิด **MovePlanDialog**:

- **Reason Code** จาก `app.tbreason` (01–04, 99)
- **Comment** → `tbmoveplan.resoncom`
- **บังคับ** เมื่องานสีแดง/ส้ม · **ไม่บังคับ** เมื่องานม่วง (CRTD/REL ปกติ)
- **สีเขียว / TECO ปิดแล้ว** — ห้ามลาก (`canMovePlan: false`)

---

## Description (tooltip)

ชี้เมาส์ที่ event — popup `CalendarEventHoverCard` เช่น:

- Work Order · Start/End Date  
- Functional Location · Equipment  
- Work Centre · Activity Type (Z1/Z2/Z5)  
- Operation (opac + short text) · Operation long text  
- จำนวนครั้งย้ายแผน · สถานะการทำงาน  

---

## โค้ด

| ส่วน | ไฟล์ |
|------|------|
| สร้าง title / สี / description | [`calendar-event-display.ts`](../../PM-Pepsi-App/backend/src/lib/calendar-event-display.ts) |
| API events | [`calendar.ts`](../../PM-Pepsi-App/backend/src/services/calendar.ts) |
| UI legend + Z1/Z2/Z5 | [`CalendarColorLegend.tsx`](../../PM-Pepsi-App/frontend/src/components/scheduling/CalendarColorLegend.tsx) · [`CalendarPage.tsx`](../../PM-Pepsi-App/frontend/src/features/calendar/CalendarPage.tsx) |

---

## เอกสารที่เกี่ยวข้อง

- [`ACTIVITY-TYPE-FILTER.md`](ACTIVITY-TYPE-FILTER.md) — ตัวกรอง mat Z1/Z2/Z5  
- [`USER-MANUAL-TH.md`](../USER-MANUAL-TH.md) §5.3

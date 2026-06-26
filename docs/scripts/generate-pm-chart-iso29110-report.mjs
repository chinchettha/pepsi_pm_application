/**
 * Generate PM Chart Design verification report (ISO/IEC 29110 Basic Profile).
 * Run: node docs/scripts/generate-pm-chart-iso29110-report.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageNumber,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../reports')
const OUT_FILE = path.join(OUT_DIR, 'PM-CHART-VERIFICATION-ISO29110-2026-06-22.docx')

const REPORT_DATE = '22 มิถุนายน 2569 (2026-06-22)'
const DOC_ID = 'PM-PEPSI-VR-PMCHART-001'
const VERSION = '1.0'

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ text, size: 22, ...opts.run })],
  })
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] })
}

function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] })
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  })
}

function tableRow(cells, header = false) {
  return new TableRow({
    children: cells.map(
      (c) =>
        new TableCell({
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: c, bold: header, size: 20 })] })],
        }),
    ),
  })
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Sarabun', size: 22 } },
    },
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: `${DOC_ID} v${VERSION}`, size: 18, color: '666666' }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'หน้า ', size: 18 }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                new TextRun({ text: ' / ', size: 18 }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: 'รายงานการตรวจสอบและทดสอบซอฟต์แวร์', bold: true, size: 32 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: 'Software Verification Report — PM Chart Design Module',
              size: 26,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [
            new TextRun({
              text: 'โครงการ PM Pepsi App · อ้างอิง ISO/IEC 29110-4-1 (Basic Profile)',
              size: 22,
            }),
          ],
        }),

        h1('1. การควบคุมเอกสาร (Document Control)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['รายการ', 'รายละเอียด'], true),
            tableRow(['รหัสเอกสาร', DOC_ID]),
            tableRow(['เวอร์ชัน', VERSION]),
            tableRow(['วันที่', REPORT_DATE]),
            tableRow(['โมดูลที่ตรวจ', 'PM Chart Design (/pm-charts)']),
            tableRow(['มาตรฐานอ้างอิง', 'ISO/IEC 29110-4-1, ISO/IEC 12207 (กิจกรรม Verification)']),
            tableRow(['สเปกอ้างอิง', 'docs/customer-requirements/PM-CHART-DESIGN-PAGES.md']),
            tableRow(['สถานะ', 'ร่างตรวจสอบก่อน UAT']),
          ],
        }),
        p(''),

        h1('2. วัตถุประสงค์และขอบเขต (Purpose and Scope)'),
        p(
          'เอกสารฉบับนี้บันทึกผลการตรวจสอบข้อบกพร่อง (bug/error) และการทดสอบยืนยันคุณภาพของโมดูล PM Chart Design ซึ่งประกอบด้วยหน้า Vibration, Motor Current และ Combustion ตามไฟล์ PMChartDesign.xlsx ของลูกค้า',
        ),
        p('ขอบเขตครอบคลุม: Frontend (React), Backend API, ฐานข้อมูล (migration 120), การ import/export และ auto-save'),
        p('นอกขอบเขต: โมดูล Personnel Admin, Master Plan (ยกเว้นส่วนที่เกี่ยวข้องลิงก์), และระบบ deploy  production'),

        h1('3. สรุปผู้บริหาร (Executive Summary)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['หัวข้อ', 'ผลลัพธ์'], true),
            tableRow(['ทดสอบเฉพาะ PM Chart (frontend)', 'ผ่าน 5/5']),
            tableRow(['ทดสอบเฉพาะ PM Chart (backend)', 'ผ่าน 5/5']),
            tableRow(['Build frontend ทั้งโปรเจกต์', 'ไม่ผ่าน — TypeScript 9 รายการ (ส่วนใหญ่นอก PM Chart)']),
            tableRow(['ทดสอบ backend ทั้งโปรเจกต์', 'ไม่ผ่าน — 2 test cases (นอก PM Chart)']),
            tableRow(['บั๊ก PM Chart ที่แก้แล้วในรอบนี้', 'layout กระตุก, save loop, ช่วงวันที่กราฟ, WO scope ถอดออก']),
            tableRow(['ความเสี่ยงก่อน UAT', 'ปานกลาง — ต้องแก้ build errors โปรเจกต์หลักก่อน release']),
          ],
        }),
        p(''),

        h1('4. สภาพแวดล้อมการทดสอบ (Test Environment)'),
        bullet('OS: Windows 10/11 · Shell: PowerShell'),
        bullet('Frontend: Node.js, Vite, React 19, TypeScript, Vitest'),
        bullet('Backend: Node.js, Express, Vitest, PostgreSQL (app.tbpm_chart_design)'),
        bullet('Database migration: database/migrations/120_pm_chart_design.sql'),
        bullet('คำสั่งที่ใช้: npm run build (frontend), npm test --run (backend/frontend)'),

        h1('5. กิจกรรมตรวจสอบ (Verification Activities) — ISO 29110'),
        p('ตาม ISO/IEC 29110 Basic Profile ดำเนินกิจกรรมดังนี้:'),
        bullet('5.1 การทดสอบ (Testing) — รัน unit test อัตโนมัติ pm-chart-period, import, export, merge'),
        bullet('5.2 การตรวจสอบโค้ด (Inspection) — ทบทวน persistence, auto-save, auto-range, RBAC'),
        bullet('5.3 การสาธิต (Demonstration) — ตรวจ flow: กรอก manual, import Excel, กราฟ, export report'),
        bullet('5.4 การวิเคราะห์ข้อบกพร่อง (Problem Analysis) — บันทึก defect ในตารางข้อ 6'),

        h1('6. รายการข้อบกพร่องและข้อผิดพลาด (Defect Log)'),
        h2('6.1 PM Chart Design — แก้ไขแล้ว (Closed)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['ID', 'รายละเอียด', 'ความรุนแรง', 'สถานะ'], true),
            tableRow([
              'PMC-001',
              'หน้าเว็บกระตุก/ขยับตลอด — auto-save วน reload ข้อมูล',
              'สูง',
              'แก้แล้ว',
            ]),
            tableRow([
              'PMC-002',
              'กราฟไม่แสดง — ช่วงวันที่ default ไม่ครอบข้อมูล import และ yMax ต่ำเกิน',
              'สูง',
              'แก้แล้ว',
            ]),
            tableRow([
              'PMC-003',
              'Import ไม่ merge ข้อมูลซ้ำ — ทับข้อมูลเดิมทั้ง sheet',
              'กลาง',
              'แก้แล้ว',
            ]),
            tableRow(['PMC-004', 'ต้องการ auto-save แทนปุ่ม Save', 'ต่ำ', 'แก้แล้ว']),
            tableRow(['PMC-005', 'ถอดฟิลเตอร์ Work Order — ใช้ scope default เท่านั้น', 'ต่ำ', 'แก้แล้ว']),
            tableRow(['PMC-006', 'unused import PM_CHART_SCOPE_KEY ใน toolbar', 'ต่ำ', 'แก้แล้ว']),
          ],
        }),
        p(''),

        h2('6.2 PM Chart Design — เปิดอยู่ / ข้อสังเกต (Open / Observation)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['ID', 'รายละเอียด', 'ความรุนแรง', 'สถานะ'], true),
            tableRow([
              'PMC-007',
              'เอกสาร PM-CHART-DESIGN-PAGES.md ยังอ้าง WO scope — ไม่ตรง implementation ปัจจุบัน',
              'ต่ำ',
              'เปิด',
            ]),
            tableRow([
              'PMC-008',
              'Backend vibration save ทำ dedupe ฝั่ง server — client signature อาจต่างหลัง save รอบแรก',
              'ต่ำ',
              'เฝ้าระวัง',
            ]),
            tableRow([
              'PMC-009',
              'ไม่มี E2E test เฉพาะ /pm-charts — พึ่ง unit test เท่านั้น',
              'กลาง',
              'เปิด',
            ]),
          ],
        }),
        p(''),

        h2('6.3 โปรเจกต์หลัก — นอกขอบเขต PM Chart (Open)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['ID', 'รายละเอียด', 'ไฟล์/คำสั่ง', 'สถานะ'], true),
            tableRow([
              'PRJ-001',
              'TypeScript build fail — unused imports (AppNotificationBell, WorkOrderDetailDialog, …)',
              'npm run build',
              'เปิด',
            ]),
            tableRow([
              'PRJ-002',
              'MasterPlanDisciplineView — type error primaryAction, workbookQ.data undefined',
              'MasterPlanDisciplineView.tsx',
              'เปิด',
            ]),
            tableRow([
              'PRJ-003',
              'personnel-admin.test — schema ไม่รับ userst H, userrole manager',
              'personnel-admin.test.ts',
              'เปิด',
            ]),
            tableRow([
              'PRJ-004',
              'work-orders.batch.test — mock ไม่ครอบ UPDATE tbplangingwork',
              'work-orders.batch.test.ts',
              'เปิด',
            ]),
          ],
        }),
        p(''),

        h1('7. ผลการทดสอบอัตโนมัติ (Test Results)'),
        h2('7.1 Frontend — src/features/pm-charts/'),
        bullet('filterVibrationForPeriod — ผ่าน'),
        bullet('minMaxIsoDates / expandRangeForPeriod / rangeIncludesAnyDate — ผ่าน'),
        bullet('รวม: 5/5 tests passed'),

        h2('7.2 Backend — src/lib/pm-chart-design-*.ts'),
        bullet('parsePmChartDesignWorkbook (PMChartDesign.xlsx) — ผ่าน'),
        bullet('buildPmChartDesignWorkbook export — ผ่าน'),
        bullet('mergeVibrationPayload / mergeCurrent / mergeCombustion — ผ่าน'),
        bullet('รวม: 5/5 tests passed'),

        h1('8. การยืนยันความสอดคล้องความต้องการ (Requirements Traceability)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['ความต้องการ', 'หลักฐาน', 'ผล'], true),
            tableRow(['3 หน้าตาม Excel', 'PmChartVibration/Current/CombustionPage', 'ผ่าน']),
            tableRow(['บันทึก DB', 'tbpm_chart_design + API PUT', 'ผ่าน']),
            tableRow(['Import + dedupe', 'POST import + pm-chart-design-merge', 'ผ่าน']),
            tableRow(['Export template/report', 'export.xlsx + exceljs report', 'ผ่าน']),
            tableRow(['Auto-save', 'usePmChartPersistence debounce', 'ผ่าน']),
            tableRow(['Period Daily–Yearly', 'PmChartsPeriodControls', 'ผ่าน']),
            tableRow(['RBAC confirmation.read/write', 'usePermission + backend middleware', 'ผ่าน']),
            tableRow(['WO scope ต่อใบงาน', 'ถอดตามคำสั่งลูกค้า — scope default', 'เปลี่ยนขอบเขต']),
          ],
        }),
        p(''),

        h1('9. สรุปและข้อเสนอแนะ (Conclusions and Recommendations)'),
        p(
          'โมดูล PM Chart Design ผ่านการทดสอบหน่วยที่เกี่ยวข้องครบถ้วน และบั๊กหลักที่รายงานใน UAT ภายใน (layout, กราฟ, import, auto-save) ได้รับการแก้ไขแล้ว',
        ),
        p('ข้อเสนอแนะก่อน UAT อย่างเป็นทางการ:'),
        bullet('1) แก้ TypeScript build errors ทั้งโปรเจกต์ (PRJ-001, PRJ-002) เพื่อให้ CI/release ผ่าน'),
        bullet('2) แก้หรืออัปเดต backend tests ที่ fail (PRJ-003, PRJ-004)'),
        bullet('3) อัปเดต PM-CHART-DESIGN-PAGES.md ให้ตรงกับการถอด WO scope'),
        bullet('4) เพิ่ม E2E smoke test สำหรับ /pm-charts (import → กราฟ → export)'),
        bullet('5) ลูกค้าทดสอบ UAT ด้วยไฟล์ PMChartDesign.xlsx จริงบน environment ที่รัน migration 120 แล้ว'),

        h1('10. การอนุมัติ (Approval)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['บทบาท', 'ชื่อ', 'ลายมือชื่อ', 'วันที่'], true),
            tableRow(['ผู้จัดทำรายงาน', 'AI Agent / ทีมพัฒนา', '', '']),
            tableRow(['ผู้ตรวจสอบ', '', '', '']),
            tableRow(['ผู้อนุมัติ', '', '', '']),
          ],
        }),
        p(''),
        p(
          '— จบรายงาน —',
          { alignment: AlignmentType.CENTER, run: { italics: true, size: 20, color: '888888' } },
        ),
      ],
    },
  ],
})

fs.mkdirSync(OUT_DIR, { recursive: true })
const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(OUT_FILE, buffer)
console.log(`Written: ${OUT_FILE}`)

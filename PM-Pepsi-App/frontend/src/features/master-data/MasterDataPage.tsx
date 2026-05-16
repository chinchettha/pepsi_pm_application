import { PageHeader } from '@/components/layout/PageHeader'
import { type MasterDataItem } from '@/api/schemas'
import { ActivityTypePanel } from '@/features/master-data/ActivityTypePanel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchMasterData } from '@/lib/api-public'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

const tabs = [
  { id: 'equipment', label: 'Equipment', legacy: 'M_equipment', backend: false },
  { id: 'functional', label: 'Functional loc.', legacy: 'M_functional', backend: false },
  { id: 'machine', label: 'Machine', legacy: 'M_machine', backend: false },
  { id: 'material', label: 'Material', legacy: 'M_material', backend: false },
  { id: 'zone', label: 'Zone', legacy: 'M_zone', backend: false },
  { id: 'workcentre', label: 'Work centre', legacy: 'tb_workcentre', backend: false },
  { id: 'department', label: 'Department', legacy: 'M_department', backend: false },
  { id: 'tasklist', label: 'Task list', legacy: 'M_tasklist', backend: false },
  { id: 'worktype', label: 'Work type', legacy: 'M_worktype', backend: false },
  { id: 'activitytype', label: 'Activity type', legacy: 'M_activitytype', backend: true },
  { id: 'reason', label: 'Reason', legacy: 'M_reason', backend: false },
  { id: 'group', label: 'Group', legacy: 'M_Group', backend: false },
  { id: 'lineproduct', label: 'Line product', legacy: 'M_lineproduct', backend: false },
] as const

function GenericMasterTable({
  rows,
}: {
  rows: Extract<MasterDataItem, { code: string }>[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัส</TableHead>
            <TableHead>ชื่อ (ไทย)</TableHead>
            <TableHead>Plant</TableHead>
            <TableHead>ใช้งาน</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-sm">{row.code}</TableCell>
              <TableCell>{row.nameTh}</TableCell>
              <TableCell>{row.plant}</TableCell>
              <TableCell>{row.active ? 'ใช่' : 'ไม่'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MasterTable({ entity, useBackend }: { entity: string; useBackend: boolean }) {
  const q = useQuery({
    queryKey: ['master-data', entity],
    queryFn: () => fetchMasterData(entity),
  })

  if (entity === 'activitytype') {
    return <ActivityTypePanel />
  }

  if (q.isLoading) return <Skeleton className="h-48 w-full rounded-lg" />
  if (q.isError) return <p className="text-sm text-red-600">{(q.error as Error).message}</p>

  const items = q.data ?? []
  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        {useBackend ? 'ไม่มีข้อมูล — รัน migration 002 และ seed ใน DBeaver' : 'ไม่มีข้อมูล (mock)'}
      </p>
    )
  }

  const generic = items.filter((r): r is Extract<MasterDataItem, { code: string }> => 'code' in r)
  return <GenericMasterTable rows={generic} />
}

export function MasterDataPage() {
  const [tab, setTab] = useState<string>('activitytype')
  const current = tabs.find((t) => t.id === tab) ?? tabs[0]

  return (
    <div>
      <PageHeader
        title="ข้อมูลหลัก (Master data)"
        description="Activity type: CRUD + นำเข้า CSV ต่อ PostgreSQL — แท็บอื่นยัง placeholder"
      >
        <Badge variant="secondary">{tabs.length} แท็บ</Badge>
        {current.backend ? (
          <Badge className="bg-emerald-700">API + DB</Badge>
        ) : (
          <Badge variant="outline">API</Badge>
        )}
      </PageHeader>

      <div className="px-4 py-6 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs sm:text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <p className="mb-3 text-xs text-zinc-500">Legacy: {t.legacy}</p>
              <MasterTable entity={t.id} useBackend={t.backend} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

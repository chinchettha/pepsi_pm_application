import type { ActivityTypeItem } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { fetchMasterData } from '@/lib/api-public'
import {
  createActivityType,
  deleteActivityType,
  importActivityTypes,
  parseActivityTypeCsv,
  updateActivityType,
} from '@/lib/master-data-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'

type FormState = { mat: string; matdescrip: string; matcheck: string }

const emptyForm: FormState = { mat: '', matdescrip: '', matcheck: 'Y' }

export function ActivityTypePanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'activitytype'],
    queryFn: () => fetchMasterData('activitytype'),
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<ActivityTypeItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [importText, setImportText] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'activitytype'] })

  const saveMut = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateActivityType(editing.mat, {
          matdescrip: form.matdescrip,
          matcheck: form.matcheck,
        })
      }
      return createActivityType(form)
    },
    onSuccess: () => {
      invalidate()
      setDialogOpen(false)
      setEditing(null)
      setForm(emptyForm)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (mat: string) => deleteActivityType(mat),
    onSuccess: invalidate,
  })

  const importMut = useMutation({
    mutationFn: async () => {
      const rows = parseActivityTypeCsv(importText)
      if (rows.length === 0) throw new Error('ไม่พบแถวข้อมูล — ใช้รูปแบบ mat,description,check')
      return importActivityTypes(rows)
    },
    onSuccess: () => {
      invalidate()
      setImportOpen(false)
      setImportText('')
    },
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (row: ActivityTypeItem) => {
    setEditing(row)
    setForm({
      mat: row.mat,
      matdescrip: row.matdescrip,
      matcheck: row.matcheck,
    })
    setDialogOpen(true)
  }

  if (q.isLoading) return <Skeleton className="h-48 w-full rounded-lg" />
  if (q.isError) return <p className="text-sm text-red-600">{(q.error as Error).message}</p>

  const rows = q.data?.filter(
    (r): r is ActivityTypeItem => 'mat' in r && typeof r.mat === 'string',
  ) ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          เพิ่ม
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="mr-1 size-4" />
          นำเข้า CSV
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-600">ไม่มีข้อมูล — รัน migration 002 หรือเพิ่มรายการใหม่</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mat</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Check</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.mat}>
                  <TableCell className="font-mono text-sm">{row.mat}</TableCell>
                  <TableCell>{row.matdescrip}</TableCell>
                  <TableCell>{row.matcheck}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(row)}
                        aria-label="แก้ไข"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`ลบ ${row.mat}?`)) deleteMut.mutate(row.mat)
                        }}
                        aria-label="ลบ"
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'แก้ไข Activity type' : 'เพิ่ม Activity type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="mat">Mat</Label>
              <Input
                id="mat"
                value={form.mat}
                disabled={Boolean(editing)}
                onChange={(e) => setForm((f) => ({ ...f, mat: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="matdescrip">Description</Label>
              <Input
                id="matdescrip"
                value={form.matdescrip}
                onChange={(e) => setForm((f) => ({ ...f, matdescrip: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="matcheck">Check</Label>
              <Input
                id="matcheck"
                value={form.matcheck}
                onChange={(e) => setForm((f) => ({ ...f, matcheck: e.target.value }))}
              />
            </div>
          </div>
          {saveMut.isError ? (
            <p className="text-sm text-red-600">{(saveMut.error as Error).message}</p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              disabled={!form.mat.trim() || saveMut.isPending}
              onClick={() => saveMut.mutate()}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>นำเข้า Activity type (CSV)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-500">
            วางข้อมูลแบบ Excel export: mat, description, check — ข้ามแถวหัวตารางได้ (เทียบ
            M_activitytype.php)
          </p>
          <Textarea
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'PM01,Preventive Maintenance,Y\nCM01,Corrective Maintenance,Y'}
          />
          {importMut.isSuccess ? (
            <p className="text-sm text-emerald-700">
              เพิ่ม {importMut.data.inserted} · อัปเดต {importMut.data.updated} · ข้าม{' '}
              {importMut.data.skipped}
            </p>
          ) : null}
          {importMut.isError ? (
            <p className="text-sm text-red-600">{(importMut.error as Error).message}</p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
              ปิด
            </Button>
            <Button
              type="button"
              disabled={importMut.isPending}
              onClick={() => importMut.mutate()}
            >
              นำเข้า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { CanPermission } from '@/components/auth/CanPermission'
import { AppCard } from '@/components/layout/AppCard'
import { AppPageShell } from '@/components/layout/AppPageShell'
import {
  type DepartmentItem,
  type EquipmentItem,
  type FunctionalItem,
  type GroupItem,
  type LevelItem,
  type LineSchdulItem,
  type LineProductItem,
  type MasterDataItem,
  type MachineItem,
  type MaterialItem,
  type PositionItem,
  type ReasonItem,
  type TasklistItem,
  type WorkStatusItem,
  type WorkTypeItem,
  type ZbItem,
  type ZoneItem,
} from '@/api/schemas'
import { ActivityTypePanel } from '@/features/master-data/ActivityTypePanel'
import {
  MasterDataPanelEmpty,
  MasterDataPanelError,
  MasterDataPanelSkeleton,
} from '@/features/master-data/master-data-panel-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useMasterDataPermissions } from '@/lib/master-data-permissions'
import {
  createDepartment,
  deleteDepartment,
  createEquipment,
  deleteEquipment,
  importEquipments,
  parseEquipmentCsv,
  parseEquipmentFile,
  createFunctional,
  deleteFunctional,
  importFunctionals,
  parseFunctionalCsv,
  parseFunctionalFile,
  createLineProduct,
  createLevel,
  deleteLineProduct,
  deleteLevel,
  importLineProducts,
  parseLineProductCsv,
  parseLineProductFile,
  createMachine,
  deleteMachine,
  importMachines,
  parseMachineCsv,
  parseMachineFile,
  createMaterial,
  deleteMaterial,
  formatIsoDateToDdMmYyyy,
  importMaterials,
  parseDdMmYyyyToIso,
  parseMaterialCsv,
  parseMaterialFile,
  createPosition,
  createGroup,
  createTasklist,
  createReason,
  deleteGroup,
  deleteTasklist,
  deletePosition,
  deleteReason,
  createWorkStatus,
  deleteWorkStatus,
  createWorkType,
  deleteWorkType,
  importZones,
  parseZoneCsv,
  parseZoneFile,
  createZb,
  deleteZb,
  createZone,
  deleteZone,
  updateDepartment,
  updateEquipment,
  updateFunctional,
  updateLineProduct,
  updateLevel,
  updateMachine,
  updateMaterial,
  updatePosition,
  updateReason,
  updateGroup,
  updateTasklist,
  updateWorkStatus,
  updateWorkType,
  updateZb,
  updateZone,
  importTasklists,
  parseTasklistCsv,
  parseTasklistFile,
  createLineSchdul,
  deleteLineSchdul,
  formatEpochSecondsToDdMmYyyy,
  importLineSchduls,
  parseLineSchdulCsv,
  parseLineSchdulFile,
  updateLineSchdul,
} from '@/lib/master-data-api'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

const tabs = [
  { id: 'equipment', label: 'อุปกรณ์', legacy: 'M_equipment', backend: true },
  { id: 'functional', label: 'Functional Loc.', legacy: 'M_functional', backend: true },
  { id: 'machine', label: 'เครื่องจักร', legacy: 'M_machine', backend: true },
  { id: 'material', label: 'วัสดุ', legacy: 'M_material', backend: true },
  { id: 'zone', label: 'โซน', legacy: 'M_zone', backend: true },
  { id: 'department', label: 'แผนก', legacy: 'M_department', backend: true },
  { id: 'tasklist', label: 'Task list', legacy: 'M_tasklist', backend: true },
  { id: 'worktype', label: 'ประเภทงาน', legacy: 'M_worktype', backend: true },
  { id: 'zb', label: 'ZB', legacy: 'M_zb', backend: true },
  { id: 'level', label: 'ระดับ', legacy: 'M_level', backend: true },
  { id: 'position', label: 'ตำแหน่ง', legacy: 'M_position', backend: true },
  { id: 'activitytype', label: 'Activity type', legacy: 'M_activitytype', backend: true },
  { id: 'workstatus', label: 'สถานะงาน', legacy: 'M_workstatus', backend: true },
  { id: 'reason', label: 'เหตุผล', legacy: 'M_reason', backend: true },
  { id: 'group', label: 'กลุ่ม', legacy: 'M_Group', backend: true },
  { id: 'lineproduct', label: 'สายผลิต', legacy: 'M_lineproduct', backend: true },
  { id: 'lineschdul', label: 'ตารางสาย', legacy: 'M_lineschdul', backend: true },
] as const

type DepartmentFormState = { iddepartment: string; department: string }
type DepartmentFormMode = 'create' | 'edit' | 'delete'

const emptyDepartmentForm: DepartmentFormState = { iddepartment: '', department: '' }

type EquipmentFormState = {
  equipment: string
  equdescrip: string
  equipmentsub: string
  functionalloc: string
  equl: string
  equ1: string
  equea: string
}

type EquipmentFormMode = 'create' | 'edit' | 'delete'

const emptyEquipmentForm: EquipmentFormState = {
  equipment: '',
  equdescrip: '',
  equipmentsub: '',
  functionalloc: '',
  equl: '',
  equ1: '',
  equea: '',
}

type FunctionalFormState = {
  functionalloc: string
  funldescrip: string
  functionallocsub: string
}

type FunctionalFormMode = 'create' | 'edit' | 'delete'

const emptyFunctionalForm: FunctionalFormState = {
  functionalloc: '',
  funldescrip: '',
  functionallocsub: '',
}

type ReasonFormState = { reasoncode: string; reasonname: string }
type ReasonFormMode = 'create' | 'edit' | 'delete'
const emptyReasonForm: ReasonFormState = { reasoncode: '', reasonname: '' }

type WorkTypeFormState = { idwkctrtype: string; wkctrtype: string }
type WorkTypeFormMode = 'create' | 'edit' | 'delete'
const emptyWorkTypeForm: WorkTypeFormState = { idwkctrtype: '', wkctrtype: '' }

type ZbFormState = { wkzb: string; zbdescrip: string }
type ZbFormMode = 'create' | 'edit' | 'delete'
const emptyZbForm: ZbFormState = { wkzb: '', zbdescrip: '' }

type LevelFormState = { idwklevel: string; wklevel: string }
type LevelFormMode = 'create' | 'edit' | 'delete'
const emptyLevelForm: LevelFormState = { idwklevel: '', wklevel: '' }

type PositionFormState = { idposition: string; position: string }
type PositionFormMode = 'create' | 'edit' | 'delete'
const emptyPositionForm: PositionFormState = { idposition: '', position: '' }

type GroupFormState = { wkctrgroup: string; wkctrdescription: string }
type GroupFormMode = 'create' | 'edit' | 'delete'
const emptyGroupForm: GroupFormState = { wkctrgroup: '', wkctrdescription: '' }

type TasklistFormState = {
  idwkctrtype: string
  idzone: string
  idmachine: string
  mntplan: string
  tasklist: string
  legacy: string
  machine: string
  pmlist: string
  pmday: string
  machinestatus: string
  pmmin: string
  pmman: string
  manhour: string
  mat: string
  runhr: string
  mpoint: string
  bcprunhr: string
  gls: string
  ment: string
  freqhour: string
  plan: string
}
type TasklistFormMode = 'create' | 'edit' | 'delete'
const emptyTasklistForm: TasklistFormState = {
  idwkctrtype: '',
  idzone: '',
  idmachine: '',
  mntplan: '',
  tasklist: '',
  legacy: '',
  machine: '',
  pmlist: '',
  pmday: '',
  machinestatus: '',
  pmmin: '',
  pmman: '',
  manhour: '',
  mat: '',
  runhr: '',
  mpoint: '',
  bcprunhr: '',
  gls: '',
  ment: '',
  freqhour: '',
  plan: '',
}

type WorkStatusFormState = { syst: string; wkstreason: string; wkstcolor: string }
type WorkStatusFormMode = 'create' | 'edit' | 'delete'
const emptyWorkStatusForm: WorkStatusFormState = { syst: '', wkstreason: '', wkstcolor: '' }

type LineProductFormState = { productline: string; prolinedescrip: string }
type LineProductFormMode = 'create' | 'edit' | 'delete'
const emptyLineProductForm: LineProductFormState = { productline: '', prolinedescrip: '' }

type LineSchdulFormState = {
  idproductline: string
  lineday: string
  uptime: string
  linereason: string
}
type LineSchdulFormMode = 'create' | 'edit' | 'delete'
const emptyLineSchdulForm: LineSchdulFormState = {
  idproductline: '',
  lineday: '',
  uptime: '',
  linereason: '',
}

type ZoneFormState = { idzone: string; zone: string; zonedescrip: string; idproductline: string }
type ZoneFormMode = 'create' | 'edit' | 'delete'
const emptyZoneForm: ZoneFormState = { idzone: '', zone: '', zonedescrip: '', idproductline: '' }

type MachineFormState = { machine: string; idzone: string; idwkctrtype: string }
type MachineFormMode = 'create' | 'edit' | 'delete'
const emptyMachineForm: MachineFormState = { machine: '', idzone: '', idwkctrtype: '' }

type MaterialFormState = {
  wkorder: string
  pstngdate: string
  materialdesc: string
  amountinlc: string
  mvt: string
  material: string
  matquantity: string
  crcy: string
}
type MaterialFormMode = 'create' | 'edit' | 'delete'
const emptyMaterialForm: MaterialFormState = {
  wkorder: '',
  pstngdate: '',
  materialdesc: '',
  amountinlc: '',
  mvt: '',
  material: '',
  matquantity: '',
  crcy: '',
}

function DepartmentPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'department'],
    queryFn: () => fetchMasterData('department'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<DepartmentFormMode>('create')
  const [editing, setEditing] = useState<DepartmentItem | null>(null)
  const [form, setForm] = useState<DepartmentFormState>(emptyDepartmentForm)
  const [errors, setErrors] = useState<Partial<Record<keyof DepartmentFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'department'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyDepartmentForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof DepartmentFormState, string>> = {}
    const iddepartment = form.iddepartment.trim()
    const department = form.department.trim()

    if (!iddepartment) next.iddepartment = 'Department Code is required.'
    else if (iddepartment.length > 64) next.iddepartment = 'Department Code must be 64 characters or less.'

    if (!department) next.department = 'Department is required.'
    else if (department.length > 2000) next.department = 'Department must be 2000 characters or less.'

    setErrors(next)
    const first = Object.values(next).find(Boolean) ?? null
    setErrorSummary(first)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateDepartment(editing.iddepartment, { department: form.department.trim() })
      }
      if (mode === 'delete' && editing) {
        await deleteDepartment(editing.iddepartment)
        return null
      }
      return createDepartment({
        iddepartment: form.iddepartment.trim(),
        department: form.department.trim(),
      })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyDepartmentForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: DepartmentItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ iddepartment: row.iddepartment, department: row.department })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: DepartmentItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ iddepartment: row.iddepartment, department: row.department })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is DepartmentItem => 'iddepartment' in r && typeof (r as { iddepartment: unknown }).iddepartment === 'string',
  ) ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          เพิ่ม
        </Button>
      </div>

      {rows.length === 0 ? (
        <MasterDataPanelEmpty description="รัน migration 011 หรือนำเข้าข้อมูลแผนก" />
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <Table embedded stickyHeader zebra>
            <TableHeader>
              <TableRow>
                <TableHead>Department Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.iddepartment}>
                  <TableCell className="font-mono text-body-sm">{row.iddepartment}</TableCell>
                  <TableCell>{row.department}</TableCell>
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
                        onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Department' : mode === 'edit' ? 'Edit Department' : 'Delete Department'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="iddepartment">Department Code</Label>
              <Input
                id="iddepartment"
                value={form.iddepartment}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, iddepartment: e.target.value }))}
              />
              {errors.iddepartment ? (
                <p className="mt-1 text-xs text-red-600">{errors.iddepartment}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={form.department}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              />
              {errors.department ? (
                <p className="mt-1 text-xs text-red-600">{errors.department}</p>
              ) : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">
              This action cannot be undone. Delete {form.iddepartment}?
            </p>
          ) : null}
          {errorSummary && mode !== 'delete' ? (
            <p className="text-body-sm text-red-600">{errorSummary}</p>
          ) : null}
          {mut.isError ? (
            <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.iddepartment.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EquipmentPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'equipment'],
    queryFn: () => fetchMasterData('equipment'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<EquipmentFormMode>('create')
  const [editing, setEditing] = useState<EquipmentItem | null>(null)
  const [form, setForm] = useState<EquipmentFormState>(emptyEquipmentForm)
  const [errors, setErrors] = useState<Partial<Record<keyof EquipmentFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'equipment'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyEquipmentForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof EquipmentFormState, string>> = {}
    const equipment = form.equipment.trim()
    const equdescrip = form.equdescrip.trim()

    if (!equipment) next.equipment = 'Equipment is required.'
    else if (equipment.length > 64) next.equipment = 'Equipment must be 64 characters or less.'

    if (!equdescrip) next.equdescrip = 'Description is required.'
    else if (equdescrip.length > 2000) next.equdescrip = 'Description must be 2000 characters or less.'

    setErrors(next)
    const first = Object.values(next).find(Boolean) ?? null
    setErrorSummary(first)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateEquipment(editing.equipment, {
          equdescrip: form.equdescrip.trim(),
          equipmentsub: form.equipmentsub.trim(),
          functionalloc: form.functionalloc.trim(),
          equl: form.equl.trim(),
          equ1: form.equ1.trim(),
          equea: form.equea.trim(),
        })
      }
      if (mode === 'delete' && editing) {
        await deleteEquipment(editing.equipment)
        return null
      }
      return createEquipment({
        equipment: form.equipment.trim(),
        equdescrip: form.equdescrip.trim(),
        equipmentsub: form.equipmentsub.trim(),
        functionalloc: form.functionalloc.trim(),
        equl: form.equl.trim(),
        equ1: form.equ1.trim(),
        equea: form.equea.trim(),
      })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }

      const rows = importFile ? await parseEquipmentFile(importFile) : parseEquipmentCsv(importText)
      if (rows.length === 0) {
        throw new Error('No rows found. Expected columns: equipment, description, equipmentsub, functionalloc, equl, equ1, equea')
      }
      return importEquipments(rows)
    },
    onSuccess: () => {
      invalidate()
      closeImport()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyEquipmentForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: EquipmentItem) => {
    setMode('edit')
    setEditing(row)
    setForm({
      equipment: row.equipment,
      equdescrip: row.equdescrip,
      equipmentsub: row.equipmentsub,
      functionalloc: row.functionalloc,
      equl: row.equl,
      equ1: row.equ1,
      equea: row.equea,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: EquipmentItem) => {
    setMode('delete')
    setEditing(row)
    setForm({
      equipment: row.equipment,
      equdescrip: row.equdescrip,
      equipmentsub: row.equipmentsub,
      functionalloc: row.functionalloc,
      equl: row.equl,
      equ1: row.equ1,
      equea: row.equea,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is EquipmentItem => 'equipment' in r && typeof (r as { equipment: unknown }).equipment === 'string',
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
          Import file
        </Button>
      </div>

      {rows.length === 0 ? (
        <MasterDataPanelEmpty description="รัน migration 012 หรือนำเข้าข้อมูลอุปกรณ์" />
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <Table embedded stickyHeader zebra>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Equipment Sub</TableHead>
                <TableHead>Functional loc.</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.equipment}>
                  <TableCell className="font-mono text-body-sm">{row.equipment}</TableCell>
                  <TableCell>{row.equdescrip}</TableCell>
                  <TableCell>{row.equipmentsub}</TableCell>
                  <TableCell>{row.functionalloc}</TableCell>
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
                        onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? 'Create Equipment'
                : mode === 'edit'
                  ? 'Edit Equipment'
                  : 'Delete Equipment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                value={form.equipment}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))}
              />
              {errors.equipment ? <p className="mt-1 text-xs text-red-600">{errors.equipment}</p> : null}
            </div>
            <div>
              <Label htmlFor="equdescrip">Description</Label>
              <Input
                id="equdescrip"
                value={form.equdescrip}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, equdescrip: e.target.value }))}
              />
              {errors.equdescrip ? <p className="mt-1 text-xs text-red-600">{errors.equdescrip}</p> : null}
            </div>
            <div>
              <Label htmlFor="equipmentsub">Equipment Sub</Label>
              <Input
                id="equipmentsub"
                value={form.equipmentsub}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, equipmentsub: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="functionalloc">Functional loc.</Label>
              <Input
                id="functionalloc"
                value={form.functionalloc}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, functionalloc: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="equl">L</Label>
                <Input
                  id="equl"
                  value={form.equl}
                  disabled={mode === 'delete'}
                  onChange={(e) => setForm((f) => ({ ...f, equl: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="equ1">1</Label>
                <Input
                  id="equ1"
                  value={form.equ1}
                  disabled={mode === 'delete'}
                  onChange={(e) => setForm((f) => ({ ...f, equ1: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="equea">EA/CT</Label>
                <Input
                  id="equea"
                  value={form.equea}
                  disabled={mode === 'delete'}
                  onChange={(e) => setForm((f) => ({ ...f, equea: e.target.value }))}
                />
              </div>
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">
              This action cannot be undone. Delete {form.equipment}?
            </p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.equipment.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={importOpen}
        onOpenChange={(next) => {
          if (!next) closeImport()
          else setImportOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Equipment (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            Upload file export: equipment, description, equipmentsub, functionalloc, equl, equ1, equea. For Excel files,
            the first 2 rows are skipped (PHP parity). Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="equipment-import-file">Select file</Label>
              <Input
                id="equipment-import-file"
                type="file"
                accept=".csv,.xls,.xlsx,.xlsm,.xlsb"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="text-xs text-app-muted">
              Or paste CSV: equipment,equdescrip,equipmentsub,functionalloc,equl,equ1,equea
            </div>
          </div>
          <Textarea
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'EQ0001,Sample Equipment,,,L,1,EA'}
          />
          {importMut.isSuccess ? (
            <p className="text-body-sm text-emerald-700">
              Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed} · Skipped {importMut.data.skipped}
            </p>
          ) : null}
          {importMut.isError ? <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>
              Close
            </Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FunctionalPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'functional'],
    queryFn: () => fetchMasterData('functional'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<FunctionalFormMode>('create')
  const [editing, setEditing] = useState<FunctionalItem | null>(null)
  const [form, setForm] = useState<FunctionalFormState>(emptyFunctionalForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FunctionalFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'functional'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyFunctionalForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof FunctionalFormState, string>> = {}
    const functionalloc = form.functionalloc.trim()
    const funldescrip = form.funldescrip.trim()

    if (!functionalloc) next.functionalloc = 'Functional loc. is required.'
    else if (functionalloc.length > 64) next.functionalloc = 'Functional loc. must be 64 characters or less.'

    if (!funldescrip) next.funldescrip = 'Description is required.'
    else if (funldescrip.length > 2000) next.funldescrip = 'Description must be 2000 characters or less.'

    if (form.functionallocsub.trim().length > 64) {
      next.functionallocsub = 'Functional loc. Sub must be 64 characters or less.'
    }

    setErrors(next)
    const first = Object.values(next).find(Boolean) ?? null
    setErrorSummary(first)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateFunctional(editing.functionalloc, {
          funldescrip: form.funldescrip.trim(),
          functionallocsub: form.functionallocsub.trim(),
        })
      }
      if (mode === 'delete' && editing) {
        await deleteFunctional(editing.functionalloc)
        return null
      }
      return createFunctional({
        functionalloc: form.functionalloc.trim(),
        funldescrip: form.funldescrip.trim(),
        functionallocsub: form.functionallocsub.trim(),
      })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }

      const rows = importFile
        ? await parseFunctionalFile(importFile)
        : parseFunctionalCsv(importText)
      if (rows.length === 0) {
        throw new Error('No rows found. Expected columns: functionalloc, funldescrip, functionallocsub')
      }
      return importFunctionals(rows)
    },
    onSuccess: () => {
      invalidate()
      closeImport()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyFunctionalForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: FunctionalItem) => {
    setMode('edit')
    setEditing(row)
    setForm({
      functionalloc: row.functionalloc,
      funldescrip: row.funldescrip,
      functionallocsub: row.functionallocsub,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: FunctionalItem) => {
    setMode('delete')
    setEditing(row)
    setForm({
      functionalloc: row.functionalloc,
      funldescrip: row.funldescrip,
      functionallocsub: row.functionallocsub,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is FunctionalItem =>
      'functionalloc' in r && typeof (r as { functionalloc: unknown }).functionalloc === 'string',
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
          Import file
        </Button>
      </div>

      {rows.length === 0 ? (
        <MasterDataPanelEmpty description="รัน migration 005 หรือนำเข้า Functional loc." />
      ) : (
        <div className="app-table-shell overflow-x-auto">
          <Table embedded stickyHeader zebra>
            <TableHeader>
              <TableRow>
                <TableHead>Functional loc.</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Functional loc. Sub</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.functionalloc}>
                  <TableCell className="font-mono text-body-sm">{row.functionalloc}</TableCell>
                  <TableCell>{row.funldescrip}</TableCell>
                  <TableCell>{row.functionallocsub}</TableCell>
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
                        onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? 'Create Functional location'
                : mode === 'edit'
                  ? 'Edit Functional location'
                  : 'Delete Functional location'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="functionalloc">Functional loc.</Label>
              <Input
                id="functionalloc"
                value={form.functionalloc}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, functionalloc: e.target.value }))}
              />
              {errors.functionalloc ? (
                <p className="mt-1 text-xs text-red-600">{errors.functionalloc}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="funldescrip">Description</Label>
              <Input
                id="funldescrip"
                value={form.funldescrip}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, funldescrip: e.target.value }))}
              />
              {errors.funldescrip ? (
                <p className="mt-1 text-xs text-red-600">{errors.funldescrip}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="functionallocsub">Functional loc. Sub</Label>
              <Input
                id="functionallocsub"
                value={form.functionallocsub}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, functionallocsub: e.target.value }))}
              />
              {errors.functionallocsub ? (
                <p className="mt-1 text-xs text-red-600">{errors.functionallocsub}</p>
              ) : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">
              This action cannot be undone. Delete {form.functionalloc}?
            </p>
          ) : null}
          {errorSummary && mode !== 'delete' ? (
            <p className="text-body-sm text-red-600">{errorSummary}</p>
          ) : null}
          {mut.isError ? (
            <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.functionalloc.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={importOpen}
        onOpenChange={(next) => {
          if (!next) closeImport()
          else setImportOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Functional location (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            Upload file export: functionalloc, funldescrip, functionallocsub. For Excel files, the first 2 rows are skipped (PHP parity).
            Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="functional-import-file">Select file</Label>
              <Input
                id="functional-import-file"
                type="file"
                accept=".csv,.xls,.xlsx,.xlsm,.xlsb"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="text-xs text-app-muted">
              Or paste CSV: functionalloc,funldescrip,functionallocsub
            </div>
          </div>
          <Textarea
            rows={8}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'7151-PL01,Product line 01,'}
          />
          {importMut.isSuccess ? (
            <p className="text-body-sm text-emerald-700">
              Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed} · Skipped {importMut.data.skipped}
            </p>
          ) : null}
          {importMut.isError ? (
            <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>
              Close
            </Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReasonPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'reason'],
    queryFn: () => fetchMasterData('reason'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ReasonFormMode>('create')
  const [editing, setEditing] = useState<ReasonItem | null>(null)
  const [form, setForm] = useState<ReasonFormState>(emptyReasonForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ReasonFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'reason'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyReasonForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof ReasonFormState, string>> = {}
    const reasoncode = form.reasoncode.trim()
    const reasonname = form.reasonname.trim()

    if (!reasoncode) next.reasoncode = 'Reason code is required.'
    else if (reasoncode.length > 64) next.reasoncode = 'Reason code must be 64 characters or less.'

    if (!reasonname) next.reasonname = 'Description is required.'
    else if (reasonname.length > 2000) next.reasonname = 'Description must be 2000 characters or less.'

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateReason(editing.reasoncode, { reasonname: form.reasonname.trim() })
      }
      if (mode === 'delete' && editing) {
        await deleteReason(editing.reasoncode)
        return null
      }
      return createReason({ reasoncode: form.reasoncode.trim(), reasonname: form.reasonname.trim() })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyReasonForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: ReasonItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ reasoncode: row.reasoncode, reasonname: row.reasonname })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: ReasonItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ reasoncode: row.reasoncode, reasonname: row.reasonname })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is ReasonItem => 'reasoncode' in r && typeof (r as { reasoncode: unknown }).reasoncode === 'string',
  ) ?? []

  return (
    <div className="space-y-4">
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="mr-1 size-4" />
        เพิ่ม
      </Button>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Reason Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.reasoncode}>
                <TableCell className="font-mono text-body-sm">{row.reasoncode}</TableCell>
                <TableCell>{row.reasonname}</TableCell>
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
                      onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Reason' : mode === 'edit' ? 'Edit Reason' : 'Delete Reason'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="reasoncode">Reason code</Label>
              <Input
                id="reasoncode"
                value={form.reasoncode}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, reasoncode: e.target.value }))}
              />
              {errors.reasoncode ? <p className="mt-1 text-xs text-red-600">{errors.reasoncode}</p> : null}
            </div>
            <div>
              <Label htmlFor="reasonname">Description</Label>
              <Input
                id="reasonname"
                value={form.reasonname}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, reasonname: e.target.value }))}
              />
              {errors.reasonname ? <p className="mt-1 text-xs text-red-600">{errors.reasonname}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">
              This action cannot be undone. Delete {form.reasoncode}?
            </p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.reasoncode.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkTypePanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'worktype'],
    queryFn: () => fetchMasterData('worktype'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<WorkTypeFormMode>('create')
  const [editing, setEditing] = useState<WorkTypeItem | null>(null)
  const [form, setForm] = useState<WorkTypeFormState>(emptyWorkTypeForm)
  const [errors, setErrors] = useState<Partial<Record<keyof WorkTypeFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'worktype'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyWorkTypeForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof WorkTypeFormState, string>> = {}
    const idwkctrtype = form.idwkctrtype.trim()
    const wkctrtype = form.wkctrtype.trim()

    if (!idwkctrtype) next.idwkctrtype = 'Code is required.'
    else if (idwkctrtype.length > 64) next.idwkctrtype = 'Code must be 64 characters or less.'

    if (!wkctrtype) next.wkctrtype = 'Description is required.'
    else if (wkctrtype.length > 2000) next.wkctrtype = 'Description must be 2000 characters or less.'

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateWorkType(editing.idwkctrtype, { wkctrtype: form.wkctrtype.trim() })
      }
      if (mode === 'delete' && editing) {
        await deleteWorkType(editing.idwkctrtype)
        return null
      }
      return createWorkType({ idwkctrtype: form.idwkctrtype.trim(), wkctrtype: form.wkctrtype.trim() })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyWorkTypeForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: WorkTypeItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ idwkctrtype: row.idwkctrtype, wkctrtype: row.wkctrtype })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: WorkTypeItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ idwkctrtype: row.idwkctrtype, wkctrtype: row.wkctrtype })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is WorkTypeItem => 'idwkctrtype' in r && typeof (r as { idwkctrtype: unknown }).idwkctrtype === 'string',
  ) ?? []

  return (
    <div className="space-y-4">
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="mr-1 size-4" />
        เพิ่ม
      </Button>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Type Status Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.idwkctrtype}>
                <TableCell className="font-mono text-body-sm">{row.idwkctrtype}</TableCell>
                <TableCell>{row.wkctrtype}</TableCell>
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
                      onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Work type' : mode === 'edit' ? 'Edit Work type' : 'Delete Work type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="idwkctrtype">Code</Label>
              <Input
                id="idwkctrtype"
                value={form.idwkctrtype}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, idwkctrtype: e.target.value }))}
              />
              {errors.idwkctrtype ? <p className="mt-1 text-xs text-red-600">{errors.idwkctrtype}</p> : null}
            </div>
            <div>
              <Label htmlFor="wkctrtype">Description</Label>
              <Input
                id="wkctrtype"
                value={form.wkctrtype}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, wkctrtype: e.target.value }))}
              />
              {errors.wkctrtype ? <p className="mt-1 text-xs text-red-600">{errors.wkctrtype}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">
              This action cannot be undone. Delete {form.idwkctrtype}?
            </p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.idwkctrtype.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ZbPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'zb'],
    queryFn: () => fetchMasterData('zb'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ZbFormMode>('create')
  const [editing, setEditing] = useState<ZbItem | null>(null)
  const [form, setForm] = useState<ZbFormState>(emptyZbForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ZbFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'zb'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyZbForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof ZbFormState, string>> = {}
    const wkzb = form.wkzb.trim()
    const zbdescrip = form.zbdescrip.trim()

    if (!wkzb) next.wkzb = 'ZB Code is required.'
    else if (wkzb.length > 32) next.wkzb = 'ZB Code must be 32 characters or less.'

    if (!zbdescrip) next.zbdescrip = 'Description is required.'
    else if (zbdescrip.length > 2000) next.zbdescrip = 'Description must be 2000 characters or less.'

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateZb(editing.wkzb, { zbdescrip: form.zbdescrip.trim() })
      }
      if (mode === 'delete' && editing) {
        await deleteZb(editing.wkzb)
        return null
      }
      return createZb({ wkzb: form.wkzb.trim(), zbdescrip: form.zbdescrip.trim() })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyZbForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: ZbItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ wkzb: row.wkzb, zbdescrip: row.zbdescrip })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: ZbItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ wkzb: row.wkzb, zbdescrip: row.zbdescrip })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows =
    q.data?.filter(
      (r): r is ZbItem => 'wkzb' in r && typeof (r as { wkzb: unknown }).wkzb === 'string',
    ) ?? []

  return (
    <div className="space-y-4">
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="mr-1 size-4" />
        เพิ่ม
      </Button>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>ZB Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.wkzb}>
                <TableCell className="font-mono text-body-sm">{row.wkzb}</TableCell>
                <TableCell>{row.zbdescrip}</TableCell>
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
                      onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create ZB' : mode === 'edit' ? 'Edit ZB' : 'Delete ZB'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="wkzb">ZB Code</Label>
              <Input
                id="wkzb"
                value={form.wkzb}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, wkzb: e.target.value }))}
              />
              {errors.wkzb ? <p className="mt-1 text-xs text-red-600">{errors.wkzb}</p> : null}
            </div>
            <div>
              <Label htmlFor="zbdescrip">Description</Label>
              <Input
                id="zbdescrip"
                value={form.zbdescrip}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, zbdescrip: e.target.value }))}
              />
              {errors.zbdescrip ? <p className="mt-1 text-xs text-red-600">{errors.zbdescrip}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">
              This action cannot be undone. Delete {form.wkzb}?
            </p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.wkzb.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LevelPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'level'],
    queryFn: () => fetchMasterData('level'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<LevelFormMode>('create')
  const [editing, setEditing] = useState<LevelItem | null>(null)
  const [form, setForm] = useState<LevelFormState>(emptyLevelForm)
  const [errors, setErrors] = useState<Partial<Record<keyof LevelFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'level'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyLevelForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof LevelFormState, string>> = {}
    const idwklevel = form.idwklevel.trim()
    const wklevel = form.wklevel.trim()

    if (!idwklevel) next.idwklevel = 'Level code is required.'
    else if (idwklevel.length > 64) next.idwklevel = 'Level code must be 64 characters or less.'

    if (!wklevel) next.wklevel = 'Description is required.'
    else if (wklevel.length > 2000) next.wklevel = 'Description must be 2000 characters or less.'

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateLevel(editing.idwklevel, { wklevel: form.wklevel.trim() })
      }
      if (mode === 'delete' && editing) {
        await deleteLevel(editing.idwklevel)
        return null
      }
      return createLevel({ idwklevel: form.idwklevel.trim(), wklevel: form.wklevel.trim() })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyLevelForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: LevelItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ idwklevel: row.idwklevel, wklevel: row.wklevel })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: LevelItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ idwklevel: row.idwklevel, wklevel: row.wklevel })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is LevelItem => 'idwklevel' in r && typeof (r as { idwklevel: unknown }).idwklevel === 'string',
  ) ?? []

  return (
    <div className="space-y-4">
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="mr-1 size-4" />
        เพิ่ม
      </Button>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Level Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.idwklevel}>
                <TableCell className="font-mono text-body-sm">{row.idwklevel}</TableCell>
                <TableCell>{row.wklevel}</TableCell>
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
                      onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Level' : mode === 'edit' ? 'Edit Level' : 'Delete Level'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="idwklevel">Level code</Label>
              <Input
                id="idwklevel"
                value={form.idwklevel}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, idwklevel: e.target.value }))}
              />
              {errors.idwklevel ? <p className="mt-1 text-xs text-red-600">{errors.idwklevel}</p> : null}
            </div>
            <div>
              <Label htmlFor="wklevel">Description</Label>
              <Input
                id="wklevel"
                value={form.wklevel}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, wklevel: e.target.value }))}
              />
              {errors.wklevel ? <p className="mt-1 text-xs text-red-600">{errors.wklevel}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">This action cannot be undone. Delete {form.idwklevel}?</p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.idwklevel.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PositionPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'position'],
    queryFn: () => fetchMasterData('position'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PositionFormMode>('create')
  const [editing, setEditing] = useState<PositionItem | null>(null)
  const [form, setForm] = useState<PositionFormState>(emptyPositionForm)
  const [errors, setErrors] = useState<Partial<Record<keyof PositionFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'position'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyPositionForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof PositionFormState, string>> = {}
    const idposition = form.idposition.trim()
    const position = form.position.trim()

    if (!idposition) next.idposition = 'Position code is required.'
    else if (idposition.length > 64) next.idposition = 'Position code must be 64 characters or less.'

    if (!position) next.position = 'Description is required.'
    else if (position.length > 2000) next.position = 'Description must be 2000 characters or less.'

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updatePosition(editing.idposition, { position: form.position.trim() })
      }
      if (mode === 'delete' && editing) {
        await deletePosition(editing.idposition)
        return null
      }
      return createPosition({ idposition: form.idposition.trim(), position: form.position.trim() })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyPositionForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: PositionItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ idposition: row.idposition, position: row.position })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: PositionItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ idposition: row.idposition, position: row.position })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is PositionItem => 'idposition' in r && typeof (r as { idposition: unknown }).idposition === 'string',
  ) ?? []

  return (
    <div className="space-y-4">
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="mr-1 size-4" />
        เพิ่ม
      </Button>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Position Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.idposition}>
                <TableCell className="font-mono text-body-sm">{row.idposition}</TableCell>
                <TableCell>{row.position}</TableCell>
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
                      onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? 'Create Position'
                : mode === 'edit'
                  ? 'Edit Position'
                  : 'Delete Position'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="idposition">Position code</Label>
              <Input
                id="idposition"
                value={form.idposition}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, idposition: e.target.value }))}
              />
              {errors.idposition ? <p className="mt-1 text-xs text-red-600">{errors.idposition}</p> : null}
            </div>
            <div>
              <Label htmlFor="position">Description</Label>
              <Input
                id="position"
                value={form.position}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              />
              {errors.position ? <p className="mt-1 text-xs text-red-600">{errors.position}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">This action cannot be undone. Delete {form.idposition}?</p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.idposition.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GroupPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'group'],
    queryFn: () => fetchMasterData('group'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<GroupFormMode>('create')
  const [editing, setEditing] = useState<GroupItem | null>(null)
  const [form, setForm] = useState<GroupFormState>(emptyGroupForm)
  const [errors, setErrors] = useState<Partial<Record<keyof GroupFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'group'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyGroupForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }
    const next: Partial<Record<keyof GroupFormState, string>> = {}
    const wkctrgroup = form.wkctrgroup.trim()
    const wkctrdescription = form.wkctrdescription.trim()
    if (!wkctrgroup) next.wkctrgroup = 'Group is required.'
    else if (wkctrgroup.length > 64) next.wkctrgroup = 'Group must be 64 characters or less.'
    if (wkctrdescription.length > 2000) next.wkctrdescription = 'Group description must be 2000 characters or less.'
    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateGroup(editing.idwkctrgroup, {
          wkctrgroup: form.wkctrgroup.trim(),
          wkctrdescription: form.wkctrdescription.trim(),
        })
      }
      if (mode === 'delete' && editing) {
        await deleteGroup(editing.idwkctrgroup)
        return null
      }
      return createGroup({
        wkctrgroup: form.wkctrgroup.trim(),
        wkctrdescription: form.wkctrdescription.trim(),
      })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyGroupForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: GroupItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ wkctrgroup: row.wkctrgroup, wkctrdescription: row.wkctrdescription })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: GroupItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ wkctrgroup: row.wkctrgroup, wkctrdescription: row.wkctrdescription })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is GroupItem => 'idwkctrgroup' in r && typeof (r as { idwkctrgroup: unknown }).idwkctrgroup === 'number',
  ) ?? []

  return (
    <div className="space-y-4">
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="mr-1 size-4" />
        เพิ่ม
      </Button>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.idwkctrgroup}>
                <TableCell className="font-mono text-body-sm">{row.wkctrgroup}</TableCell>
                <TableCell>{row.wkctrdescription}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="แก้ไข">
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openDelete(row)} aria-label="ลบ">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create Group' : mode === 'edit' ? 'Edit Group' : 'Delete Group'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="wkctrgroup">Group</Label>
              <Input id="wkctrgroup" value={form.wkctrgroup} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, wkctrgroup: e.target.value }))} />
              {errors.wkctrgroup ? <p className="mt-1 text-xs text-red-600">{errors.wkctrgroup}</p> : null}
            </div>
            <div>
              <Label htmlFor="wkctrdescription">Group description</Label>
              <Input id="wkctrdescription" value={form.wkctrdescription} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, wkctrdescription: e.target.value }))} />
              {errors.wkctrdescription ? <p className="mt-1 text-xs text-red-600">{errors.wkctrdescription}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? <p className="text-body-sm text-red-600">This action cannot be undone. Delete {form.wkctrgroup}?</p> : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="button" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={!form.wkctrgroup.trim() || mut.isPending} onClick={() => mut.mutate()}>
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TasklistPanel() {
  const qc = useQueryClient()
  const tableWrapRef = useRef<HTMLDivElement>(null)
  const scrollToIdRef = useRef<number | null>(null)

  const q = useQuery({
    queryKey: ['master-data', 'tasklist'],
    queryFn: () => fetchMasterData('tasklist'),
    placeholderData: keepPreviousData,
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<TasklistFormMode>('create')
  const [editing, setEditing] = useState<TasklistItem | null>(null)
  const [form, setForm] = useState<TasklistFormState>(emptyTasklistForm)
  const [errors, setErrors] = useState<Partial<Record<keyof TasklistFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyTasklistForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const numOrUndef = (v: string) => {
    const s = v.trim()
    if (!s) return undefined
    const n = Number(s)
    return Number.isFinite(n) ? n : undefined
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }
    const next: Partial<Record<keyof TasklistFormState, string>> = {}
    if (!form.idwkctrtype.trim()) next.idwkctrtype = 'Type code is required.'
    else if (form.idwkctrtype.trim().length > 64) next.idwkctrtype = 'Type code must be 64 characters or less.'
    if (!form.idzone.trim()) next.idzone = 'Zone code is required.'
    else if (form.idzone.trim().length > 64) next.idzone = 'Zone code must be 64 characters or less.'
    if (form.idmachine.trim() && form.idmachine.trim().length > 64) next.idmachine = 'Machine list must be 64 characters or less.'
    if (!form.mntplan.trim()) next.mntplan = 'Maintenance plan is required.'
    if (!form.tasklist.trim()) next.tasklist = 'Task list is required.'
    if (!form.legacy.trim()) next.legacy = 'Legacy is required.'
    if (!form.machine.trim()) next.machine = 'M/C is required.'
    if (!form.pmlist.trim()) next.pmlist = 'PM list is required.'

    const nums: Array<[keyof TasklistFormState, string]> = [
      ['pmday', 'Days must be a number.'],
      ['machinestatus', 'Machine status must be a number.'],
      ['pmmin', 'Min must be a number.'],
      ['pmman', 'Man must be a number.'],
      ['manhour', 'Man hour must be a number.'],
      ['runhr', '%run hr must be a number.'],
      ['bcprunhr', 'BCP Run Hr must be a number.'],
      ['freqhour', 'Freq Hour must be a number.'],
    ]
    for (const [k, msg] of nums) {
      const s = form[k].trim()
      if (s && !Number.isFinite(Number(s))) next[k] = msg
    }

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      const payload = {
        idwkctrtype: form.idwkctrtype.trim(),
        idzone: form.idzone.trim(),
        idmachine: form.idmachine.trim() || undefined,
        mntplan: form.mntplan.trim(),
        tasklist: form.tasklist.trim(),
        legacy: form.legacy.trim(),
        machine: form.machine.trim(),
        pmlist: form.pmlist.trim(),
        pmday: numOrUndef(form.pmday),
        machinestatus: numOrUndef(form.machinestatus),
        pmmin: numOrUndef(form.pmmin),
        pmman: numOrUndef(form.pmman),
        manhour: numOrUndef(form.manhour),
        mat: form.mat.trim() || undefined,
        runhr: numOrUndef(form.runhr),
        mpoint: form.mpoint.trim() || undefined,
        bcprunhr: numOrUndef(form.bcprunhr),
        gls: form.gls.trim() || undefined,
        ment: form.ment.trim() || undefined,
        freqhour: numOrUndef(form.freqhour),
        plan: form.plan.trim() || undefined,
      }
      if (mode === 'edit' && editing) {
        return updateTasklist(editing.idtasklist, payload)
      }
      if (mode === 'delete' && editing) {
        await deleteTasklist(editing.idtasklist)
        return null
      }
      return createTasklist(payload)
    },
    onSuccess: async (saved) => {
      await qc.refetchQueries({ queryKey: ['master-data', 'tasklist'] })
      if (mode === 'edit' && saved && typeof saved === 'object' && 'idtasklist' in saved) {
        const row = saved as TasklistItem
        scrollToIdRef.current = row.idtasklist
        openEdit(row)
        toast.success('บันทึก Task list แล้ว')
        return
      }
      if (mode === 'delete') {
        close()
        toast.success('ลบแล้ว')
        return
      }
      close()
      toast.success('เพิ่ม Task list แล้ว')
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }
      const rows = importFile ? await parseTasklistFile(importFile) : parseTasklistCsv(importText)
      if (rows.length === 0) {
        throw new Error('No rows found. Expected columns: wkctrtype, zone, machineList, mntplan, tasklist, legacy, machine, pmlist, ...')
      }
      return importTasklists(rows)
    },
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ['master-data', 'tasklist'] })
      closeImport()
      toast.success('นำเข้า Task list แล้ว')
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyTasklistForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: TasklistItem) => {
    setMode('edit')
    setEditing(row)
    setForm({
      idwkctrtype: row.idwkctrtype,
      idzone: row.idzone,
      idmachine: row.idmachine,
      mntplan: row.mntplan,
      tasklist: row.tasklist,
      legacy: row.legacy,
      machine: row.machine,
      pmlist: row.pmlist,
      pmday: String(row.pmday ?? ''),
      machinestatus: String(row.machinestatus ?? ''),
      pmmin: String(row.pmmin ?? ''),
      pmman: String(row.pmman ?? ''),
      manhour: String(row.manhour ?? ''),
      mat: row.mat ?? '',
      runhr: String(row.runhr ?? ''),
      mpoint: row.mpoint ?? '',
      bcprunhr: String(row.bcprunhr ?? ''),
      gls: row.gls ?? '',
      ment: row.ment ?? '',
      freqhour: String(row.freqhour ?? ''),
      plan: row.plan ?? '',
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: TasklistItem) => {
    setMode('delete')
    setEditing(row)
    setForm({
      idwkctrtype: row.idwkctrtype,
      idzone: row.idzone,
      idmachine: row.idmachine,
      mntplan: row.mntplan,
      tasklist: row.tasklist,
      legacy: row.legacy,
      machine: row.machine,
      pmlist: row.pmlist,
      pmday: String(row.pmday ?? ''),
      machinestatus: String(row.machinestatus ?? ''),
      pmmin: String(row.pmmin ?? ''),
      pmman: String(row.pmman ?? ''),
      manhour: String(row.manhour ?? ''),
      mat: row.mat ?? '',
      runhr: String(row.runhr ?? ''),
      mpoint: row.mpoint ?? '',
      bcprunhr: String(row.bcprunhr ?? ''),
      gls: row.gls ?? '',
      ment: row.ment ?? '',
      freqhour: String(row.freqhour ?? ''),
      plan: row.plan ?? '',
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is TasklistItem => 'idtasklist' in r && typeof (r as { idtasklist: unknown }).idtasklist === 'number',
  ) ?? []

  useEffect(() => {
    const id = scrollToIdRef.current
    if (id == null || !tableWrapRef.current) return
    const el = tableWrapRef.current.querySelector(`[data-tasklist-id="${id}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    scrollToIdRef.current = null
  }, [q.dataUpdatedAt, rows.length])

  const formFields: Array<[keyof TasklistFormState, string, boolean]> = [
    ['idwkctrtype', 'Type code', true],
    ['idzone', 'Zone code', true],
    ['idmachine', 'Machine list', false],
    ['mntplan', 'Maintenance plan', true],
    ['tasklist', 'Task list', true],
    ['legacy', 'Legacy', true],
    ['machine', 'M/C', true],
    ['pmlist', 'PM list', true],
    ['pmday', 'Days', false],
    ['machinestatus', 'Machine status', false],
    ['pmmin', 'Min', false],
    ['pmman', 'Man', false],
    ['manhour', 'Man hour', false],
    ['mat', 'Act Code', false],
    ['runhr', '%run hr', false],
    ['mpoint', 'Measurement point', false],
    ['bcprunhr', 'BCP Run Hr', false],
    ['gls', 'Grease/Lube/SP', false],
    ['ment', 'ment', false],
    ['freqhour', 'Freq Hour', false],
    ['plan', 'Plan', false],
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          เพิ่ม
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="mr-1 size-4" />
          Import file
        </Button>
      </div>

      <div ref={tableWrapRef} className="app-table-shell max-h-[min(70vh,720px)] overflow-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Task list</TableHead>
              <TableHead>Maintenance plan</TableHead>
              <TableHead>PM list</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.idtasklist}
                data-tasklist-id={row.idtasklist}
                className={
                  open && editing?.idtasklist === row.idtasklist
                    ? 'bg-amber-50/80 ring-1 ring-inset ring-amber-300'
                    : undefined
                }
              >
                <TableCell className="font-mono text-body-sm">{row.tasklist}</TableCell>
                <TableCell>{row.mntplan}</TableCell>
                <TableCell>{row.pmlist}</TableCell>
                <TableCell>{row.wkctrtype || row.idwkctrtype}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="แก้ไข">
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openDelete(row)} aria-label="ลบ">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create Task list' : mode === 'edit' ? 'Edit Task list' : 'Delete Task list'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {formFields.map(([k, label, lockOnEdit]) => (
              <div key={k}>
                <Label htmlFor={String(k)}>{label}</Label>
                <Input
                  id={String(k)}
                  value={form[k]}
                  disabled={mode === 'delete' || (mode !== 'create' && lockOnEdit)}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                />
                {errors[k] ? <p className="mt-1 text-xs text-red-600">{errors[k]}</p> : null}
              </div>
            ))}
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">This action cannot be undone. Delete {form.tasklist}?</p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.tasklist.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(next) => (next ? setImportOpen(true) : closeImport())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Task list (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            For Excel files, the first 2 rows are skipped (PHP parity). Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="tasklist-import-file">Select file</Label>
              <Input id="tasklist-import-file" type="file" accept=".csv,.xls,.xlsx,.xlsm,.xlsb" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="text-xs text-app-muted">Or paste CSV</div>
          </div>
          <Textarea rows={8} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'TYPE 01,ZONE 01,MACHINE-01,PLAN-01,TASK-01,LEGACY-01,M/C,PM-01,7,0,10,2,1,ACT,80,MP,0,GLS,MENT,0,PLAN'} />
          {importMut.isSuccess ? <p className="text-body-sm text-emerald-700">Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed}</p> : null}
          {importMut.isError ? <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>
              Close
            </Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkStatusPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'workstatus'],
    queryFn: () => fetchMasterData('workstatus'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<WorkStatusFormMode>('create')
  const [editing, setEditing] = useState<WorkStatusItem | null>(null)
  const [form, setForm] = useState<WorkStatusFormState>(emptyWorkStatusForm)
  const [errors, setErrors] = useState<Partial<Record<keyof WorkStatusFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'workstatus'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyWorkStatusForm)
    setErrors({})
    setErrorSummary(null)
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }

    const next: Partial<Record<keyof WorkStatusFormState, string>> = {}
    const syst = form.syst.trim()
    const wkstreason = form.wkstreason.trim()
    const wkstcolor = form.wkstcolor.trim()

    if (!syst) next.syst = 'System status is required.'
    else if (syst.length > 32) next.syst = 'System status must be 32 characters or less.'

    if (!wkstreason) next.wkstreason = 'Description is required.'
    else if (wkstreason.length > 2000) next.wkstreason = 'Description must be 2000 characters or less.'

    if (!wkstcolor) next.wkstcolor = 'Color code is required.'
    else if (wkstcolor.length > 32) next.wkstcolor = 'Color code must be 32 characters or less.'

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateWorkStatus(editing.syst, {
          wkstreason: form.wkstreason.trim(),
          wkstcolor: form.wkstcolor.trim(),
        })
      }
      if (mode === 'delete' && editing) {
        await deleteWorkStatus(editing.syst)
        return null
      }
      return createWorkStatus({
        syst: form.syst.trim(),
        wkstreason: form.wkstreason.trim(),
        wkstcolor: form.wkstcolor.trim(),
      })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyWorkStatusForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openEdit = (row: WorkStatusItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ syst: row.syst, wkstreason: row.wkstreason, wkstcolor: row.wkstcolor })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  const openDelete = (row: WorkStatusItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ syst: row.syst, wkstreason: row.wkstreason, wkstcolor: row.wkstcolor })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is WorkStatusItem => 'syst' in r && typeof (r as { syst: unknown }).syst === 'string',
  ) ?? []

  return (
    <div className="space-y-4">
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="mr-1 size-4" />
        เพิ่ม
      </Button>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>System Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Color Code</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.syst}>
                <TableCell className="font-mono text-body-sm">{row.syst}</TableCell>
                <TableCell>{row.wkstreason}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-10 rounded border border-app" style={{ backgroundColor: row.wkstcolor }} />
                    <span className="font-mono text-xs text-app-muted">{row.wkstcolor}</span>
                  </div>
                </TableCell>
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
                      onClick={() => openDelete(row)}
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

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
          else setOpen(true)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? 'Create Work status'
                : mode === 'edit'
                  ? 'Edit Work status'
                  : 'Delete Work status'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="syst">System status</Label>
              <Input
                id="syst"
                value={form.syst}
                disabled={mode !== 'create'}
                onChange={(e) => setForm((f) => ({ ...f, syst: e.target.value }))}
              />
              {errors.syst ? <p className="mt-1 text-xs text-red-600">{errors.syst}</p> : null}
            </div>
            <div>
              <Label htmlFor="wkstreason">Description</Label>
              <Input
                id="wkstreason"
                value={form.wkstreason}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, wkstreason: e.target.value }))}
              />
              {errors.wkstreason ? <p className="mt-1 text-xs text-red-600">{errors.wkstreason}</p> : null}
            </div>
            <div>
              <Label htmlFor="wkstcolor">Color code</Label>
              <Input
                id="wkstcolor"
                value={form.wkstcolor}
                disabled={mode === 'delete'}
                onChange={(e) => setForm((f) => ({ ...f, wkstcolor: e.target.value }))}
              />
              {errors.wkstcolor ? <p className="mt-1 text-xs text-red-600">{errors.wkstcolor}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? (
            <p className="text-body-sm text-red-600">
              This action cannot be undone. Delete {form.syst}?
            </p>
          ) : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'delete' ? 'destructive' : 'default'}
              disabled={!form.syst.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LineProductPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'lineproduct'],
    queryFn: () => fetchMasterData('lineproduct'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<LineProductFormMode>('create')
  const [editing, setEditing] = useState<LineProductItem | null>(null)
  const [form, setForm] = useState<LineProductFormState>(emptyLineProductForm)
  const [errors, setErrors] = useState<Partial<Record<keyof LineProductFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'lineproduct'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyLineProductForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }
    const next: Partial<Record<keyof LineProductFormState, string>> = {}
    const productline = form.productline.trim()
    const prolinedescrip = form.prolinedescrip.trim()
    if (!productline) next.productline = 'Product line is required.'
    else if (productline.length > 64) next.productline = 'Product line must be 64 characters or less.'
    if (!prolinedescrip) next.prolinedescrip = 'Description is required.'
    else if (prolinedescrip.length > 2000) next.prolinedescrip = 'Description must be 2000 characters or less.'
    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateLineProduct(editing.productline, { prolinedescrip: form.prolinedescrip.trim() })
      }
      if (mode === 'delete' && editing) {
        await deleteLineProduct(editing.productline)
        return null
      }
      return createLineProduct({ productline: form.productline.trim(), prolinedescrip: form.prolinedescrip.trim() })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }
      const rows = importFile ? await parseLineProductFile(importFile) : parseLineProductCsv(importText)
      if (rows.length === 0) throw new Error('No rows found. Expected columns: productline, prolinedescrip')
      return importLineProducts(rows)
    },
    onSuccess: () => {
      invalidate()
      closeImport()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyLineProductForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: LineProductItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ productline: row.productline, prolinedescrip: row.prolinedescrip })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: LineProductItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ productline: row.productline, prolinedescrip: row.prolinedescrip })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows = q.data?.filter(
    (r): r is LineProductItem =>
      'productline' in r && typeof (r as { productline: unknown }).productline === 'string',
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
          Import file
        </Button>
      </div>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Product line</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.productline}>
                <TableCell className="font-mono text-body-sm">{row.productline}</TableCell>
                <TableCell>{row.prolinedescrip}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="แก้ไข">
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openDelete(row)} aria-label="ลบ">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Line product' : mode === 'edit' ? 'Edit Line product' : 'Delete Line product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="productline">Product line</Label>
              <Input id="productline" value={form.productline} disabled={mode !== 'create'} onChange={(e) => setForm((f) => ({ ...f, productline: e.target.value }))} />
              {errors.productline ? <p className="mt-1 text-xs text-red-600">{errors.productline}</p> : null}
            </div>
            <div>
              <Label htmlFor="prolinedescrip">Description</Label>
              <Input id="prolinedescrip" value={form.prolinedescrip} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, prolinedescrip: e.target.value }))} />
              {errors.prolinedescrip ? <p className="mt-1 text-xs text-red-600">{errors.prolinedescrip}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? <p className="text-body-sm text-red-600">This action cannot be undone. Delete {form.productline}?</p> : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="button" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={!form.productline.trim() || mut.isPending} onClick={() => mut.mutate()}>
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(next) => (next ? setImportOpen(true) : closeImport())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Line product (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            For Excel files, the first 2 rows are skipped (PHP parity). Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="lineproduct-import-file">Select file</Label>
              <Input id="lineproduct-import-file" type="file" accept=".csv,.xls,.xlsx,.xlsm,.xlsb" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="text-xs text-app-muted">Or paste CSV: productline,prolinedescrip</div>
          </div>
          <Textarea rows={8} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'PL01,Product line 01'} />
          {importMut.isSuccess ? <p className="text-body-sm text-emerald-700">Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed}</p> : null}
          {importMut.isError ? <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>Close</Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LineSchdulPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'lineschdul'],
    queryFn: () => fetchMasterData('lineschdul'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<LineSchdulFormMode>('create')
  const [editing, setEditing] = useState<LineSchdulItem | null>(null)
  const [form, setForm] = useState<LineSchdulFormState>(emptyLineSchdulForm)
  const [errors, setErrors] = useState<Partial<Record<keyof LineSchdulFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'lineschdul'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyLineSchdulForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const parseDayToEpoch = (v: string): number | null => {
    const s = v.trim()
    const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s)
    if (!m) return null
    const dd = Number(m[1])
    const mm = Number(m[2])
    const yyyy = Number(m[3])
    const dt = new Date(yyyy, mm - 1, dd)
    return Number.isFinite(dt.getTime()) ? Math.floor(dt.getTime() / 1000) : null
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }
    const next: Partial<Record<keyof LineSchdulFormState, string>> = {}
    const idproductline = form.idproductline.trim()
    const linedayText = form.lineday.trim()
    const uptimeText = form.uptime.trim()
    const linereason = form.linereason.trim()

    if (!idproductline) next.idproductline = 'Line is required.'
    else if (idproductline.length > 64) next.idproductline = 'Line must be 64 characters or less.'

    const lineday = parseDayToEpoch(linedayText)
    if (!linedayText) next.lineday = 'Date is required.'
    else if (!lineday) next.lineday = 'Invalid date format. Expected DD.MM.YYYY'

    if (uptimeText && !Number.isFinite(Number(uptimeText))) next.uptime = 'Uptime must be a number.'
    if (linereason.length > 2000) next.linereason = 'Reason must be 2000 characters or less.'

    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      const lineday = parseDayToEpoch(form.lineday.trim())
      if (!lineday) throw new Error('Invalid date format. Expected DD.MM.YYYY')
      const uptime = form.uptime.trim() ? Number(form.uptime.trim()) : undefined
      const payload = {
        idproductline: form.idproductline.trim(),
        lineday,
        uptime: uptime != null && Number.isFinite(uptime) ? uptime : undefined,
        linereason: form.linereason.trim(),
      }
      if (mode === 'edit' && editing) {
        return updateLineSchdul(editing.idline, payload)
      }
      if (mode === 'delete' && editing) {
        await deleteLineSchdul(editing.idline)
        return null
      }
      return createLineSchdul(payload)
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }
      const rows = importFile ? await parseLineSchdulFile(importFile) : parseLineSchdulCsv(importText)
      if (rows.length === 0) throw new Error('No rows found. Expected columns: productline, lineday(DD.MM.YYYY), uptime, linereason')
      return importLineSchduls(rows)
    },
    onSuccess: () => {
      invalidate()
      closeImport()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyLineSchdulForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: LineSchdulItem) => {
    setMode('edit')
    setEditing(row)
    setForm({
      idproductline: row.idproductline,
      lineday: formatEpochSecondsToDdMmYyyy(row.lineday),
      uptime: row.uptime ? String(row.uptime) : '',
      linereason: row.linereason ?? '',
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: LineSchdulItem) => {
    setMode('delete')
    setEditing(row)
    setForm({
      idproductline: row.idproductline,
      lineday: formatEpochSecondsToDdMmYyyy(row.lineday),
      uptime: row.uptime ? String(row.uptime) : '',
      linereason: row.linereason ?? '',
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const rows =
    q.data?.filter(
      (r): r is LineSchdulItem => 'idline' in r && typeof (r as { idline: unknown }).idline === 'number',
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
          Import file
        </Button>
      </div>

      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Line</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.idline}>
                <TableCell className="font-mono text-body-sm">{formatEpochSecondsToDdMmYyyy(row.lineday)}</TableCell>
                <TableCell>{row.productline || row.idproductline}</TableCell>
                <TableCell className="font-mono text-body-sm">{row.uptime || ''}</TableCell>
                <TableCell>{row.linereason}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="แก้ไข">
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openDelete(row)} aria-label="ลบ">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Line schedule' : mode === 'edit' ? 'Edit Line schedule' : 'Delete Line schedule'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="idproductline">Line</Label>
              <Input id="idproductline" value={form.idproductline} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, idproductline: e.target.value }))} />
              {errors.idproductline ? <p className="mt-1 text-xs text-red-600">{errors.idproductline}</p> : null}
            </div>
            <div>
              <Label htmlFor="lineday">Date (DD.MM.YYYY)</Label>
              <Input id="lineday" value={form.lineday} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, lineday: e.target.value }))} />
              {errors.lineday ? <p className="mt-1 text-xs text-red-600">{errors.lineday}</p> : null}
            </div>
            <div>
              <Label htmlFor="uptime">Uptime</Label>
              <Input id="uptime" value={form.uptime} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, uptime: e.target.value }))} />
              {errors.uptime ? <p className="mt-1 text-xs text-red-600">{errors.uptime}</p> : null}
            </div>
            <div>
              <Label htmlFor="linereason">Reason</Label>
              <Input id="linereason" value={form.linereason} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, linereason: e.target.value }))} />
              {errors.linereason ? <p className="mt-1 text-xs text-red-600">{errors.linereason}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? <p className="text-body-sm text-red-600">This action cannot be undone. Delete this line schedule?</p> : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="button" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={!form.idproductline.trim() || mut.isPending} onClick={() => mut.mutate()}>
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(next) => (next ? setImportOpen(true) : closeImport())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Line schedule (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            For Excel files, the first 2 rows are skipped (PHP parity). Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="lineschdul-import-file">Select file</Label>
              <Input id="lineschdul-import-file" type="file" accept=".csv,.xls,.xlsx,.xlsm,.xlsb" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="text-xs text-app-muted">Or paste CSV: productline,lineday(DD.MM.YYYY),uptime,linereason</div>
          </div>
          <Textarea rows={8} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'PL01,18.05.2026,4,Close'} />
          {importMut.isSuccess ? <p className="text-body-sm text-emerald-700">Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed}</p> : null}
          {importMut.isError ? <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>
              Close
            </Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ZonePanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'zone'],
    queryFn: () => fetchMasterData('zone'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ZoneFormMode>('create')
  const [editing, setEditing] = useState<ZoneItem | null>(null)
  const [form, setForm] = useState<ZoneFormState>(emptyZoneForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ZoneFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'zone'] })

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyZoneForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }
    const next: Partial<Record<keyof ZoneFormState, string>> = {}
    const idzone = form.idzone.trim()
    const zone = form.zone.trim()
    if (!idzone) next.idzone = 'Zone code is required.'
    else if (idzone.length > 64) next.idzone = 'Zone code must be 64 characters or less.'
    if (!zone) next.zone = 'Zone is required.'
    else if (zone.length > 2000) next.zone = 'Zone must be 2000 characters or less.'
    if (form.zonedescrip.trim().length > 2000) next.zonedescrip = 'Description must be 2000 characters or less.'
    if (form.idproductline.trim().length > 64) next.idproductline = 'Line product must be 64 characters or less.'
    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateZone(editing.idzone, {
          zone: form.zone.trim(),
          zonedescrip: form.zonedescrip.trim(),
          idproductline: form.idproductline.trim() || undefined,
        })
      }
      if (mode === 'delete' && editing) {
        await deleteZone(editing.idzone)
        return null
      }
      return createZone({
        idzone: form.idzone.trim(),
        zone: form.zone.trim(),
        zonedescrip: form.zonedescrip.trim(),
        idproductline: form.idproductline.trim() || undefined,
      })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }
      const rows = importFile ? await parseZoneFile(importFile) : parseZoneCsv(importText)
      if (rows.length === 0) {
        throw new Error('No rows found. Expected columns: zone, zonedescrip, productline')
      }
      return importZones(rows)
    },
    onSuccess: () => {
      invalidate()
      closeImport()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyZoneForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: ZoneItem) => {
    setMode('edit')
    setEditing(row)
    setForm({
      idzone: row.idzone,
      zone: row.zone,
      zonedescrip: row.zonedescrip,
      idproductline: row.idproductline,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: ZoneItem) => {
    setMode('delete')
    setEditing(row)
    setForm({
      idzone: row.idzone,
      zone: row.zone,
      zonedescrip: row.zonedescrip,
      idproductline: row.idproductline,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />
  const rows = q.data?.filter((r): r is ZoneItem => 'idzone' in r && typeof (r as { idzone: unknown }).idzone === 'string') ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          เพิ่ม
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="mr-1 size-4" />
          Import file
        </Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Zone code</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Line product</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.idzone}>
                <TableCell className="font-mono text-body-sm">{row.idzone}</TableCell>
                <TableCell>{row.zone}</TableCell>
                <TableCell>{row.zonedescrip}</TableCell>
                <TableCell>{row.productline || row.idproductline}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="แก้ไข">
                      <Pencil className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openDelete(row)} aria-label="ลบ">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create Zone' : mode === 'edit' ? 'Edit Zone' : 'Delete Zone'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="idzone">Zone code</Label>
              <Input id="idzone" value={form.idzone} disabled={mode !== 'create'} onChange={(e) => setForm((f) => ({ ...f, idzone: e.target.value }))} />
              {errors.idzone ? <p className="mt-1 text-xs text-red-600">{errors.idzone}</p> : null}
            </div>
            <div>
              <Label htmlFor="zone">Zone</Label>
              <Input id="zone" value={form.zone} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))} />
              {errors.zone ? <p className="mt-1 text-xs text-red-600">{errors.zone}</p> : null}
            </div>
            <div>
              <Label htmlFor="zonedescrip">Description</Label>
              <Input id="zonedescrip" value={form.zonedescrip} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, zonedescrip: e.target.value }))} />
              {errors.zonedescrip ? <p className="mt-1 text-xs text-red-600">{errors.zonedescrip}</p> : null}
            </div>
            <div>
              <Label htmlFor="idproductline">Line product</Label>
              <Input id="idproductline" value={form.idproductline} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, idproductline: e.target.value }))} />
              {errors.idproductline ? <p className="mt-1 text-xs text-red-600">{errors.idproductline}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? <p className="text-body-sm text-red-600">This action cannot be undone. Delete {form.idzone}?</p> : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="button" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={!form.idzone.trim() || mut.isPending} onClick={() => mut.mutate()}>
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(next) => (next ? setImportOpen(true) : closeImport())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Zone (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            For Excel files, the first 2 rows are skipped (PHP parity). Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="zone-import-file">Select file</Label>
              <Input id="zone-import-file" type="file" accept=".csv,.xls,.xlsx,.xlsm,.xlsb" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="text-xs text-app-muted">Or paste CSV: zone,zonedescrip,productline</div>
          </div>
          <Textarea rows={8} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'ZONE 01,Zone description,PL01'} />
          {importMut.isSuccess ? <p className="text-body-sm text-emerald-700">Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed}</p> : null}
          {importMut.isError ? <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>Close</Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MachinePanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'machine'],
    queryFn: () => fetchMasterData('machine'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<MachineFormMode>('create')
  const [editing, setEditing] = useState<MachineItem | null>(null)
  const [form, setForm] = useState<MachineFormState>(emptyMachineForm)
  const [errors, setErrors] = useState<Partial<Record<keyof MachineFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'machine'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyMachineForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }
    const next: Partial<Record<keyof MachineFormState, string>> = {}
    const machine = form.machine.trim()
    if (!machine) next.machine = 'Machine is required.'
    else if (machine.length > 64) next.machine = 'Machine must be 64 characters or less.'
    if (form.idzone.trim().length > 64) next.idzone = 'Zone code must be 64 characters or less.'
    if (form.idwkctrtype.trim().length > 64) next.idwkctrtype = 'Type code must be 64 characters or less.'
    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      if (mode === 'edit' && editing) {
        return updateMachine(editing.machine, {
          idzone: form.idzone.trim() || undefined,
          idwkctrtype: form.idwkctrtype.trim() || undefined,
        })
      }
      if (mode === 'delete' && editing) {
        await deleteMachine(editing.machine)
        return null
      }
      return createMachine({
        machine: form.machine.trim(),
        idzone: form.idzone.trim() || undefined,
        idwkctrtype: form.idwkctrtype.trim() || undefined,
      })
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }
      const rows = importFile ? await parseMachineFile(importFile) : parseMachineCsv(importText)
      if (rows.length === 0) throw new Error('No rows found. Expected columns: machine, zone, wkctrtype')
      return importMachines(rows)
    },
    onSuccess: () => {
      invalidate()
      closeImport()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyMachineForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: MachineItem) => {
    setMode('edit')
    setEditing(row)
    setForm({ machine: row.machine, idzone: row.idzone, idwkctrtype: row.idwkctrtype })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: MachineItem) => {
    setMode('delete')
    setEditing(row)
    setForm({ machine: row.machine, idzone: row.idzone, idwkctrtype: row.idwkctrtype })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />
  const rows = q.data?.filter((r): r is MachineItem => 'machine' in r && typeof (r as { machine: unknown }).machine === 'string') ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openCreate}><Plus className="mr-1 size-4" />Create</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-1 size-4" />Import file</Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Machine</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.machine}>
                <TableCell className="font-mono text-body-sm">{row.machine}</TableCell>
                <TableCell>{row.zone || row.idzone}</TableCell>
                <TableCell>{row.wkctrtype || row.idwkctrtype}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="แก้ไข"><Pencil className="size-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openDelete(row)} aria-label="ลบ"><Trash2 className="size-4 text-red-600" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create Machine' : mode === 'edit' ? 'Edit Machine' : 'Delete Machine'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="machine">Machine</Label>
              <Input id="machine" value={form.machine} disabled={mode !== 'create'} onChange={(e) => setForm((f) => ({ ...f, machine: e.target.value }))} />
              {errors.machine ? <p className="mt-1 text-xs text-red-600">{errors.machine}</p> : null}
            </div>
            <div>
              <Label htmlFor="idzone">Zone code</Label>
              <Input id="idzone" value={form.idzone} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, idzone: e.target.value }))} />
              {errors.idzone ? <p className="mt-1 text-xs text-red-600">{errors.idzone}</p> : null}
            </div>
            <div>
              <Label htmlFor="idwkctrtype">Type code</Label>
              <Input id="idwkctrtype" value={form.idwkctrtype} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, idwkctrtype: e.target.value }))} />
              {errors.idwkctrtype ? <p className="mt-1 text-xs text-red-600">{errors.idwkctrtype}</p> : null}
            </div>
          </div>
          {mode === 'delete' ? <p className="text-body-sm text-red-600">This action cannot be undone. Delete {form.machine}?</p> : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="button" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={!form.machine.trim() || mut.isPending} onClick={() => mut.mutate()}>
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(next) => (next ? setImportOpen(true) : closeImport())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Machine (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            For Excel files, the first 2 rows are skipped (PHP parity). Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="machine-import-file">Select file</Label>
              <Input id="machine-import-file" type="file" accept=".csv,.xls,.xlsx,.xlsm,.xlsb" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="text-xs text-app-muted">Or paste CSV: machine,zone,wkctrtype</div>
          </div>
          <Textarea rows={8} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'MACHINE-01,ZONE 01,Type 01'} />
          {importMut.isSuccess ? <p className="text-body-sm text-emerald-700">Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed}</p> : null}
          {importMut.isError ? <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>Close</Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MaterialPanel() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['master-data', 'material'],
    queryFn: () => fetchMasterData('material'),
  })

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<MaterialFormMode>('create')
  const [editing, setEditing] = useState<MaterialItem | null>(null)
  const [form, setForm] = useState<MaterialFormState>(emptyMaterialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof MaterialFormState, string>>>({})
  const [errorSummary, setErrorSummary] = useState<string | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importText, setImportText] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['master-data', 'material'] })

  const close = () => {
    setOpen(false)
    setMode('create')
    setEditing(null)
    setForm(emptyMaterialForm)
    setErrors({})
    setErrorSummary(null)
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportText('')
  }

  const validate = () => {
    if (mode === 'delete') {
      setErrors({})
      setErrorSummary(null)
      return true
    }
    const next: Partial<Record<keyof MaterialFormState, string>> = {}
    if (!form.wkorder.trim()) next.wkorder = 'Order is required.'
    const pstngIso = parseDdMmYyyyToIso(form.pstngdate)
    if (!pstngIso) next.pstngdate = 'Posting date is required (DD.MM.YYYY).'
    if (!form.materialdesc.trim()) next.materialdesc = 'Material description is required.'
    const amount = Number(form.amountinlc)
    if (!Number.isFinite(amount)) next.amountinlc = 'Amount in LC must be a number.'
    if (!form.mvt.trim()) next.mvt = 'MvT is required.'
    setErrors(next)
    setErrorSummary(Object.values(next).find(Boolean) ?? null)
    return Object.keys(next).length === 0
  }

  const mut = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Please fix validation errors and try again.')
      const pstngdate = parseDdMmYyyyToIso(form.pstngdate) as string
      const body = {
        wkorder: form.wkorder.trim(),
        pstngdate,
        materialdesc: form.materialdesc.trim(),
        amountinlc: Number(form.amountinlc),
        mvt: form.mvt.trim(),
        material: form.material.trim(),
        matquantity: form.matquantity.trim() ? Number(form.matquantity) : undefined,
        crcy: form.crcy.trim(),
      }
      if (mode === 'edit' && editing) {
        return updateMaterial(editing.idmaterial, body)
      }
      if (mode === 'delete' && editing) {
        await deleteMaterial(editing.idmaterial)
        return null
      }
      return createMaterial(body)
    },
    onSuccess: () => {
      invalidate()
      close()
    },
  })

  const importMut = useMutation({
    mutationFn: async () => {
      if (!importFile && !importText.trim()) {
        throw new Error('Select a file or paste CSV text before importing.')
      }
      const rows = importFile ? await parseMaterialFile(importFile) : parseMaterialCsv(importText)
      if (rows.length === 0) {
        throw new Error('No rows found. Required columns: wkorder, pstngdate, materialdesc, amountinlc, mvt')
      }
      return importMaterials(rows)
    },
    onSuccess: () => {
      invalidate()
      closeImport()
    },
  })

  const openCreate = () => {
    setMode('create')
    setEditing(null)
    setForm(emptyMaterialForm)
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openEdit = (row: MaterialItem) => {
    setMode('edit')
    setEditing(row)
    setForm({
      wkorder: row.wkorder,
      pstngdate: formatIsoDateToDdMmYyyy(row.pstngdate),
      materialdesc: row.materialdesc,
      amountinlc: String(row.amountinlc),
      mvt: row.mvt,
      material: row.material,
      matquantity: row.matquantity ? String(row.matquantity) : '',
      crcy: row.crcy,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }
  const openDelete = (row: MaterialItem) => {
    setMode('delete')
    setEditing(row)
    setForm({
      wkorder: row.wkorder,
      pstngdate: formatIsoDateToDdMmYyyy(row.pstngdate),
      materialdesc: row.materialdesc,
      amountinlc: String(row.amountinlc),
      mvt: row.mvt,
      material: row.material,
      matquantity: row.matquantity ? String(row.matquantity) : '',
      crcy: row.crcy,
    })
    setErrors({})
    setErrorSummary(null)
    setOpen(true)
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />
  const rows = q.data?.filter(
    (r): r is MaterialItem => 'idmaterial' in r && typeof (r as { idmaterial: unknown }).idmaterial === 'number',
  ) ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openCreate}><Plus className="mr-1 size-4" />Create</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-1 size-4" />Import file</Button>
      </div>
      <div className="app-table-shell overflow-x-auto">
        <Table embedded stickyHeader zebra>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Posting Date</TableHead>
              <TableHead>Material Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>MvT</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.idmaterial}>
                <TableCell className="font-mono text-body-sm">{row.wkorder}</TableCell>
                <TableCell>{formatIsoDateToDdMmYyyy(row.pstngdate)}</TableCell>
                <TableCell>{row.materialdesc}</TableCell>
                <TableCell className="text-right">{row.amountinlc}</TableCell>
                <TableCell>{row.mvt}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="แก้ไข"><Pencil className="size-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openDelete(row)} aria-label="ลบ"><Trash2 className="size-4 text-red-600" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create Material' : mode === 'edit' ? 'Edit Material' : 'Delete Material'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="wkorder">Order</Label>
              <Input id="wkorder" value={form.wkorder} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, wkorder: e.target.value }))} />
              {errors.wkorder ? <p className="mt-1 text-xs text-red-600">{errors.wkorder}</p> : null}
            </div>
            <div>
              <Label htmlFor="pstngdate">Posting date (DD.MM.YYYY)</Label>
              <Input id="pstngdate" value={form.pstngdate} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, pstngdate: e.target.value }))} />
              {errors.pstngdate ? <p className="mt-1 text-xs text-red-600">{errors.pstngdate}</p> : null}
            </div>
            <div>
              <Label htmlFor="mvt">MvT</Label>
              <Input id="mvt" value={form.mvt} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, mvt: e.target.value }))} />
              {errors.mvt ? <p className="mt-1 text-xs text-red-600">{errors.mvt}</p> : null}
            </div>
            <div className="col-span-2">
              <Label htmlFor="materialdesc">Material description</Label>
              <Input id="materialdesc" value={form.materialdesc} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, materialdesc: e.target.value }))} />
              {errors.materialdesc ? <p className="mt-1 text-xs text-red-600">{errors.materialdesc}</p> : null}
            </div>
            <div>
              <Label htmlFor="amountinlc">Amount in LC</Label>
              <Input id="amountinlc" value={form.amountinlc} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, amountinlc: e.target.value }))} />
              {errors.amountinlc ? <p className="mt-1 text-xs text-red-600">{errors.amountinlc}</p> : null}
            </div>
            <div>
              <Label htmlFor="crcy">Currency</Label>
              <Input id="crcy" value={form.crcy} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, crcy: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="matquantity">Quantity</Label>
              <Input id="matquantity" value={form.matquantity} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, matquantity: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="material">Material</Label>
              <Input id="material" value={form.material} disabled={mode === 'delete'} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} />
            </div>
          </div>
          {mode === 'delete' ? <p className="text-body-sm text-red-600">This action cannot be undone. Delete material row?</p> : null}
          {errorSummary && mode !== 'delete' ? <p className="text-body-sm text-red-600">{errorSummary}</p> : null}
          {mut.isError ? <p className="text-body-sm text-red-600">{(mut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="button" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={mut.isPending} onClick={() => mut.mutate()}>
              {mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(next) => (next ? setImportOpen(true) : closeImport())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Material (CSV/Excel)</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-app-muted">
            For Excel files, the first 2 rows are skipped (PHP parity). Dates are stored as date in PostgreSQL. Supported: .csv, .xls, .xlsx, .xlsm, .xlsb
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="material-import-file">Select file</Label>
              <Input id="material-import-file" type="file" accept=".csv,.xls,.xlsx,.xlsm,.xlsb" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="text-xs text-app-muted">Or paste CSV (same column order as legacy export)</div>
          </div>
          <Textarea rows={8} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={'4000001,,, ,18.05.2026,,Material desc,1,EA,100,THB,2610,,2026,MAT01'} />
          {importMut.isSuccess ? <p className="text-body-sm text-emerald-700">Inserted {importMut.data.inserted} · Updated {importMut.data.updated} · Failed {importMut.data.failed}</p> : null}
          {importMut.isError ? <p className="text-body-sm text-red-600">{(importMut.error as Error).message}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeImport}>Close</Button>
            <Button type="button" disabled={importMut.isPending} onClick={() => importMut.mutate()}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GenericMasterTable({
  rows,
}: {
  rows: Extract<MasterDataItem, { code: string }>[]
}) {
  return (
    <div className="app-table-shell overflow-x-auto">
      <Table embedded stickyHeader zebra>
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
              <TableCell className="font-mono text-body-sm">{row.code}</TableCell>
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

function MasterTable({ entity }: { entity: string }) {
  const enableGenericQuery =
    entity !== 'activitytype' &&
    entity !== 'department' &&
    entity !== 'equipment' &&
    entity !== 'functional' &&
    entity !== 'reason' &&
    entity !== 'workstatus' &&
    entity !== 'worktype' &&
    entity !== 'zb' &&
    entity !== 'level' &&
    entity !== 'position' &&
    entity !== 'group' &&
    entity !== 'tasklist' &&
    entity !== 'lineproduct' &&
    entity !== 'lineschdul' &&
    entity !== 'zone' &&
    entity !== 'machine' &&
    entity !== 'material'
  const q = useQuery({
    queryKey: ['master-data', entity],
    queryFn: () => fetchMasterData(entity),
    enabled: enableGenericQuery,
    placeholderData: keepPreviousData,
  })

  if (entity === 'activitytype') {
    return <ActivityTypePanel />
  }

  if (entity === 'department') {
    return <DepartmentPanel />
  }

  if (entity === 'equipment') {
    return <EquipmentPanel />
  }

  if (entity === 'functional') {
    return <FunctionalPanel />
  }

  if (entity === 'reason') {
    return <ReasonPanel />
  }

  if (entity === 'workstatus') {
    return <WorkStatusPanel />
  }

  if (entity === 'worktype') {
    return <WorkTypePanel />
  }

  if (entity === 'zb') {
    return <ZbPanel />
  }

  if (entity === 'level') {
    return <LevelPanel />
  }

  if (entity === 'position') {
    return <PositionPanel />
  }

  if (entity === 'group') {
    return <GroupPanel />
  }

  if (entity === 'tasklist') {
    return <TasklistPanel />
  }

  if (entity === 'lineproduct') {
    return <LineProductPanel />
  }

  if (entity === 'lineschdul') {
    return <LineSchdulPanel />
  }

  if (entity === 'zone') {
    return <ZonePanel />
  }

  if (entity === 'machine') {
    return <MachinePanel />
  }

  if (entity === 'material') {
    return <MaterialPanel />
  }

  if (q.isLoading && !q.data) return <MasterDataPanelSkeleton />
  if (q.isError) return <MasterDataPanelError error={q.error} onRetry={() => void q.refetch()} />

  const items = q.data ?? []
  if (items.length === 0) {
    return <MasterDataPanelEmpty />
  }

  const generic = items.filter((r): r is Extract<MasterDataItem, { code: string }> => 'code' in r)
  return <GenericMasterTable rows={generic} />
}

export function MasterDataPage() {
  const { canRead, canWrite } = useMasterDataPermissions()
  const [searchParams, setSearchParams] = useSearchParams()
  const entityFromUrl = searchParams.get('entity')?.trim() ?? ''
  const [tab, setTab] = useState<string>('activitytype')

  useEffect(() => {
    if (!entityFromUrl) return
    if (!tabs.some((t) => t.id === entityFromUrl)) return
    setTab((prev) => (prev === entityFromUrl ? prev : entityFromUrl))
  }, [entityFromUrl])

  if (!canRead) {
    return (
      <AppPageShell title="ข้อมูลหลัก" description="จัดการ master data สำหรับ PM">
        <EmptyState
          icon={AlertCircle}
          title="ไม่มีสิทธิ์เข้าถึง"
          description={
            <>
              ต้องมีสิทธิ์ <code className="text-xs">master-data.read</code>
            </>
          }
        />
      </AppPageShell>
    )
  }

  const currentTab = (tabs.find((t) => t.id === tab) ?? tabs[0])?.id ?? 'activitytype'

  return (
    <AppPageShell
      title="ข้อมูลหลัก"
      description="อุปกรณ์ · Functional loc. · แผนก · Task list · สายผลิต · วัสดุ และอื่น ๆ"
      contentClassName="space-y-4"
      headerActions={
        <>
          <Badge variant="secondary" className="text-xs">
            {tabs.length} แท็บ
          </Badge>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/admin/master">Master Hub</Link>
          </Button>
          <CanPermission permission="master-data.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/line-calendar">ปฏิทินสาย</Link>
            </Button>
          </CanPermission>
          <CanPermission permission="iw37n.read">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/iw37n">IW37N</Link>
            </Button>
          </CanPermission>
        </>
      }
    >
        {!canWrite ? (
          <AppCard pad="compact" className="border-amber-200/80 bg-amber-50/60 text-body-sm text-amber-950">
            โหมดอ่านอย่างเดียว — ต้องมี <code className="text-xs">master-data.write</code> เพื่อเพิ่ม/แก้/ลบ/นำเข้า
          </AppCard>
        ) : null}
        {entityFromUrl && tabs.some((t) => t.id === entityFromUrl) ? (
          <p className="text-caption">
            <Link to="/admin/master" className="text-[var(--app-accent,#007AFF)] hover:underline">
              ← Master Data Hub
            </Link>
            <span className="mx-2 text-app-muted">|</span>
            <span>
              เปิดจาก hub: <code className="text-xs">{entityFromUrl}</code>
            </span>
          </p>
        ) : null}
        <Tabs
          value={currentTab}
          onValueChange={(v) => {
            setTab(v)
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev)
                next.set('entity', v)
                return next
              },
              { replace: true },
            )
          }}
        >
          <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1 bg-[var(--app-surface)] p-1">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs sm:text-body-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.id} value={t.id}>
              <AppCard pad="default">
                <p className="mb-4 text-xs text-app-muted">
                  Legacy PHP: <code className="text-code">{t.legacy}</code>
                </p>
                <MasterTable entity={t.id} />
              </AppCard>
            </TabsContent>
          ))}
        </Tabs>
    </AppPageShell>
  )
}

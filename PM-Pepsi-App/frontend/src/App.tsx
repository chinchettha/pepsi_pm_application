import { AppShell } from '@/components/layout/AppShell'
import { GuestOnly, NavRouteGuard, RequireAuth } from '@/features/auth/AuthGuards'
import { LoginPage } from '@/features/auth/LoginPage'
import { LogoutPage } from '@/features/auth/LogoutPage'
import { BacklogPage } from '@/features/backlog/BacklogPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { HttpErrorPage } from '@/features/errors/HttpErrorPage'
import { HomePage } from '@/features/home/HomePage'
import { Iw37nPage } from '@/features/iw37n/Iw37nPage'
import { ManhourAdminPage } from '@/features/manhours/ManhourAdminPage'
import { ManhoursHrPage } from '@/features/manhours/ManhoursHrPage'
import { ManhoursPage } from '@/features/manhours/ManhoursPage'
import { WorktimePage } from '@/features/manhours/WorktimePage'
import { MasterDataPage } from '@/features/master-data/MasterDataPage'
import { PersonnelAdminPage } from '@/features/personnel/PersonnelAdminPage'
import { PersonnelConfirmPage } from '@/features/personnel/PersonnelConfirmPage'
import { PersonnelPage } from '@/features/personnel/PersonnelPage'
import { PlanningPage } from '@/features/planning/PlanningPage'
import { LineCalendarPage } from '@/features/line-calendar/LineCalendarPage'
import {
  ConfirmationExportParityPage,
  ConfirmationParityPage,
} from '@/features/parity/SidebarParityPages'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { SummaryWeeklyChartFullPage } from '@/features/reports/SummaryWeeklyChartFullPage'
import { SummaryWeeklyPage } from '@/features/reports/SummaryWeeklyPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { UserLogPage } from '@/features/user-log/UserLogPage'
import { WorkOrdersPage } from '@/features/work-orders/WorkOrdersPage'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/error/:code" element={<HttpErrorPage />} />
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route path="/logout" element={<LogoutPage />} />
      <Route element={<RequireAuth />}>
        <Route path="summary-weekly/chart/full" element={<SummaryWeeklyChartFullPage />} />
        <Route element={<AppShell />}>
          <Route element={<NavRouteGuard />}>
          <Route index element={<HomePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="calendar/wc/:code" element={<CalendarPage />} />
          <Route path="line-calendar" element={<LineCalendarPage />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="work-orders" element={<WorkOrdersPage />} />
          <Route path="work-orders/:id" element={<WorkOrdersPage />} />
          <Route path="confirmation" element={<ConfirmationParityPage />} />
          <Route path="confirmation/export" element={<ConfirmationExportParityPage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="iw37n" element={<Iw37nPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
          <Route path="manhours" element={<ManhoursPage />} />
          <Route path="manhours/admin" element={<ManhourAdminPage />} />
          <Route path="worktime" element={<WorktimePage />} />
          <Route path="personnel" element={<PersonnelPage />} />
          <Route path="personnel/admin" element={<PersonnelAdminPage />} />
          <Route path="personnel/confirm" element={<PersonnelConfirmPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="manhours-hr" element={<ManhoursHrPage />} />
          <Route path="summary-weekly" element={<SummaryWeeklyPage />} />
          <Route path="user-log" element={<UserLogPage />} />
          <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<HttpErrorPage forcedCode={404} />} />
    </Routes>
  )
}

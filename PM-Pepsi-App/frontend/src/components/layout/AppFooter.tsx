import { useAppVersion } from '@/lib/use-app-version'
import { cn } from '@/lib/utils'
import { usePublicSettings } from '@/providers/SettingsProvider'

/** เทียบ sap/pages/footer.php */
export function AppFooter({ dockSafe = false }: { dockSafe?: boolean }) {
  const { settings } = usePublicSettings()
  const { label: versionLabel } = useAppVersion()
  const footerText = settings?.footerText?.trim() || '© S.Y. Interactive Development Limited'

  return (
    <footer
      className={cn(
        'app-footer app-surface shrink-0 border-t px-4 py-3 sm:px-6',
        dockSafe && 'app-footer--dock-safe',
      )}
    >
      <div className="app-footer__inner flex flex-col items-center justify-between gap-2 text-caption text-[var(--app-text-muted)] sm:flex-row">
        <span className="text-center sm:text-left">{footerText}</span>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-end">
          <span className="app-footer__version font-mono text-[0.7rem] tracking-tight" title="เวอร์ชันแอป">
            {versionLabel}
          </span>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <a href="#" className="hover:text-[var(--app-text)] hover:underline">
            Privacy Policy
          </a>
          <span aria-hidden>·</span>
          <span>7151 &amp; Lays Lamphun</span>
        </div>
      </div>
    </footer>
  )
}

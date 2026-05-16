/** เทียบ sap/pages/footer.php */
export function AppFooter() {
  return (
    <footer className="shrink-0 border-t border-zinc-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-zinc-500 sm:flex-row">
        <span>Copyright © 2020</span>
        <div className="flex items-center gap-2">
          <a href="#" className="hover:text-zinc-800 hover:underline">
            Privacy Policy
          </a>
          <span aria-hidden>·</span>
          <span className="text-zinc-600">7151 &amp; Lays Lamphun</span>
        </div>
      </div>
    </footer>
  )
}

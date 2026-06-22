/** Split `code — name` labels from fetchPersonnelLookups. */
export function splitPersonnelLookupLabel(label: string): { primary: string; secondary: string } {
  const sep = ' — '
  const i = label.indexOf(sep)
  if (i < 0) return { primary: label.trim(), secondary: '' }
  return {
    primary: label.slice(0, i).trim(),
    secondary: label.slice(i + sep.length).trim(),
  }
}

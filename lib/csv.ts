type CsvValue = string | number | boolean | null | undefined | Date

function csvEscape(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  const raw = value instanceof Date ? value.toISOString() : String(value)
  const needsQuotes = /[",\n\r]/.test(raw)
  const escaped = raw.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export function downloadCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
  filename: string
) {
  const headerLine = columns.map((c) => csvEscape(c.header)).join(',')
  const lines = rows.map((row) =>
    columns.map((c) => csvEscape(row[c.key] as CsvValue)).join(',')
  )
  const csv = [headerLine, ...lines].join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}


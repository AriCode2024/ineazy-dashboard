const labels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const colors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 border border-gray-200',
  in_progress: 'bg-amber-100 text-amber-900 border border-amber-200',
  completed: 'bg-green-100 text-green-900 border border-green-200',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = colors[status] ?? 'bg-gray-100 text-gray-700'
  const label = labels[status] ?? status
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${cls}`}
    >
      {label}
    </span>
  )
}

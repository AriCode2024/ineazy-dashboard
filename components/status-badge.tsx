const colors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = colors[status] ?? 'bg-gray-100 text-gray-800'
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${cls}`}
    >
      {status}
    </span>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { updateTaskNotes, updateTaskStatus } from './actions'

type Task = {
  id: string
  name: string
  status: string
  notes: string | null
  est_date: string | null
  started_at: string | null
  completed_at: string | null
}

export function TaskRow({ task }: { task: Task }) {
  const [status, setStatus] = useState(task.status)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onStatusChange(next: string) {
    setStatus(next)
    startTransition(async () => {
      await updateTaskStatus(task.id, next)
      setSavedAt(new Date().toLocaleTimeString())
    })
  }

  function onNotesBlur() {
    if (notes === (task.notes ?? '')) return
    startTransition(async () => {
      await updateTaskNotes(task.id, notes)
      setSavedAt(new Date().toLocaleTimeString())
    })
  }

  return (
    <li className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-medium">{task.name}</h3>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={isPending}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={onNotesBlur}
        rows={2}
        placeholder="Notes for the client (optional)"
        className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>
          {task.est_date && `Est. ${new Date(task.est_date).toLocaleDateString()}`}
        </span>
        {savedAt && <span className="text-green-700">Saved {savedAt}</span>}
      </div>
    </li>
  )
}

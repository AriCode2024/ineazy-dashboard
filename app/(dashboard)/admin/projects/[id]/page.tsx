import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TaskRow } from './task-row'

export default async function AdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select(
      `
      id,
      name,
      location,
      est_handover,
      client:profiles!projects_client_id_fkey(email, full_name)
    `
    )
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('id, name, status, notes, est_date, started_at, completed_at, order_index')
    .eq('project_id', id)
    .order('order_index', { ascending: true })

  const client = Array.isArray(project.client)
    ? project.client[0]
    : project.client

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/projects"
        className="text-sm text-gray-600 underline mb-4 inline-block"
      >
        ← All projects
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-gray-600 mt-1">
          {client?.full_name ?? client?.email}
          {project.location && ` · ${project.location}`}
          {project.est_handover &&
            ` · Handover ${new Date(project.est_handover).toLocaleDateString()}`}
        </p>
      </header>

      <ol className="space-y-3">
        {(tasks ?? []).map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ol>

      {(!tasks || tasks.length === 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
          No stages yet. Add them in Supabase Table Editor.
        </div>
      )}
    </div>
  )
}

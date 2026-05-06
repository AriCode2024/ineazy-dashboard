import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/status-badge'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, location, started_at, est_handover')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const project = projects?.[0]

  if (!project) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Welcome</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600">
            Your project hasn&apos;t been set up yet.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Our team will configure it shortly. You&apos;ll see your timeline
            here once it&apos;s ready.
          </p>
        </div>
      </div>
    )
  }

  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('id, name, status, notes, est_date, started_at, completed_at, order_index')
    .eq('project_id', project.id)
    .order('order_index', { ascending: true })

  const tasksList = tasks ?? []
  const completed = tasksList.filter((t) => t.status === 'completed').length
  const total = tasksList.length
  const pct = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        {project.location && (
          <p className="text-sm text-gray-600 mt-1">{project.location}</p>
        )}
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700">
              {completed} of {total} stages complete
            </span>
            <span className="font-medium text-gray-900">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          {project.est_handover && (
            <p className="text-xs text-gray-500 mt-3">
              Estimated handover:{' '}
              {new Date(project.est_handover).toLocaleDateString()}
            </p>
          )}
        </div>
      </header>

      <ol className="space-y-3">
        {tasksList.map((task) => (
          <li
            key={task.id}
            className={`bg-white rounded-lg border p-4 ${
              task.status === 'in_progress'
                ? 'border-amber-300 ring-1 ring-amber-200'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium">{task.name}</h3>
                {task.notes && (
                  <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {task.status === 'completed' && task.completed_at
                    ? `Completed ${new Date(task.completed_at).toLocaleDateString()}`
                    : task.status === 'in_progress' && task.started_at
                    ? `Started ${new Date(task.started_at).toLocaleDateString()}`
                    : task.est_date
                    ? `Estimated ${new Date(task.est_date).toLocaleDateString()}`
                    : null}
                </p>
              </div>
              <StatusBadge status={task.status} />
            </div>
          </li>
        ))}
      </ol>

      {tasksList.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
          No stages added yet.
        </div>
      )}
    </div>
  )
}

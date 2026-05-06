import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, location, est_handover, created_at, client_id')
    .order('created_at', { ascending: false })

  const clientIds = Array.from(
    new Set((projects ?? []).map((p) => p.client_id))
  )

  const { data: profiles } = clientIds.length
    ? await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', clientIds)
    : { data: [] }

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  )

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">All projects</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {projects && projects.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Project</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Est. handover</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const client = profileById.get(p.client_id)
                return (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-medium underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client?.full_name ?? client?.email ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.location ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.est_handover
                        ? new Date(p.est_handover).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-sm text-gray-500">
            No projects yet. Create one in Supabase or seed using the snippet at
            the bottom of <code>supabase/schema.sql</code>.
          </div>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/status-badge'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = {
    total: orders?.length ?? 0,
    pending: orders?.filter((o) => o.status === 'pending').length ?? 0,
    completed: orders?.filter((o) => o.status === 'completed').length ?? 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Welcome back</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total orders" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/orders" className="text-sm underline text-gray-600">
            View all
          </Link>
        </div>
        {orders && orders.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-mono text-sm">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3 text-right font-medium">
                    ${Number(order.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  )
}

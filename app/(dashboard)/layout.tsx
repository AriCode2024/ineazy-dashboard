import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-gray-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">My Account</h2>
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="space-y-1 flex-1">
          <NavLink href="/dashboard">Overview</NavLink>
          <NavLink href="/orders">Orders</NavLink>
          <NavLink href="/profile">Profile</NavLink>
        </nav>
        <form action={signOut} className="pt-8 border-t border-gray-800">
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded text-sm hover:bg-gray-800"
    >
      {children}
    </Link>
  )
}

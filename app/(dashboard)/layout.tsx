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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-gray-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">Ineazy</h2>
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="space-y-1 flex-1">
          <NavLink href="/dashboard">My Project</NavLink>
          <NavLink href="/profile">Profile</NavLink>
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-800 text-xs uppercase tracking-wide text-gray-500 px-3 pb-2">
                Admin
              </div>
              <NavLink href="/admin/projects">All projects</NavLink>
            </>
          )}
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
      <main className="flex-1 p-8 overflow-auto bg-gray-50">{children}</main>
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

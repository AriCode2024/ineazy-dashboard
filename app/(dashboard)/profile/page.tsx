import { createClient } from '@/lib/supabase/server'
import { updateProfile } from './actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, address')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      {message && (
        <div className="mb-4 p-3 text-sm bg-green-50 text-green-800 rounded border border-green-200">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 text-sm bg-red-50 text-red-800 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium mb-1"
            >
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ''}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ''}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium mb-1"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              defaultValue={profile?.address ?? ''}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 font-medium"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  )
}

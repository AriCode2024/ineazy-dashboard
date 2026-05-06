import Link from 'next/link'
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-semibold mb-1">Log in</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back.</p>

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

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 font-medium"
          >
            Log in
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          No account?{' '}
          <Link href="/signup" className="underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

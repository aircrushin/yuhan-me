import { createFileRoute } from '@tanstack/react-router'

import { buildSessionCookie, signSession } from '#/lib/admin-auth'

export const Route = createFileRoute('/api/admin/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON' }, { status: 400 })
        }
        const password =
          body && typeof body === 'object' && 'password' in body
            ? String((body as Record<string, unknown>).password ?? '')
            : ''

        const expected = process.env.ADMIN_PASSWORD
        if (!expected) {
          return Response.json(
            { error: 'ADMIN_PASSWORD env is not configured on the server.' },
            { status: 500 },
          )
        }
        if (password.length === 0 || password !== expected) {
          return Response.json({ error: 'Invalid password' }, { status: 401 })
        }

        const token = await signSession()
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'set-cookie': buildSessionCookie(token),
          },
        })
      },
    },
  },
})

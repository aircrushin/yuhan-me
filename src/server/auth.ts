import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

import { ADMIN_COOKIE, getCookie, verifySession } from '#/lib/admin-auth'

export const checkAdminAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const cookie = getRequestHeader('cookie') || ''
  const token = getCookie(cookie, ADMIN_COOKIE)
  const session = await verifySession(token)
  return { authenticated: session !== null }
})

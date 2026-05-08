import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AdminShell } from '#/components/admin/AdminShell'
import { checkAdminAuth } from '#/server/auth'

export const Route = createFileRoute('/admin/_app')({
  beforeLoad: async () => {
    const { authenticated } = await checkAdminAuth()
    if (!authenticated) {
      throw redirect({ to: '/admin/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  )
}

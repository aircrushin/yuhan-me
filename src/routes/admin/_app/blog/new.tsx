import { createFileRoute } from '@tanstack/react-router'

import { PostEditor } from '#/components/admin/PostEditor'

export const Route = createFileRoute('/admin/_app/blog/new')({
  component: () => <PostEditor initial={null} />,
  head: () => ({ meta: [{ title: 'Admin · New post' }] }),
})

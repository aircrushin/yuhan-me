import { createFileRoute, notFound } from '@tanstack/react-router'

import { PostEditor } from '#/components/admin/PostEditor'
import { getPostAdmin } from '#/server/admin'

export const Route = createFileRoute('/admin/_app/blog/$id')({
  loader: async ({ params }) => {
    const id = Number(params.id)
    if (!Number.isFinite(id)) throw notFound()
    const post = await getPostAdmin({ data: { id } })
    if (!post) throw notFound()
    return post
  },
  component: EditPostRoute,
  head: ({ loaderData }) => ({ meta: [{ title: `Admin · ${loaderData?.title ?? 'Post'}` }] }),
})

function EditPostRoute() {
  const post = Route.useLoaderData()
  return <PostEditor initial={post} />
}

import { client } from '@/sanity/lib/client'
import { PortableText } from '@portabletext/react'

// Layout components for pages
// import DefaultLayout from '@/components/Layouts/DefaultLayout'
// import AboutLayout from '../components/Layouts/AboutLayout'
// import ContactLayout from '@/components/Layouts/ContactLayout'
// import WorksLayout from '@/components/Layouts/WorksLayout'

const layoutComponents: Record<string, React.ComponentType<{ page: any }>> = {
  // default: DefaultLayout,
  // about: AboutLayout,
  // contact: ContactLayout,
  // work: WorksLayout
}

async function getContent(slug: string) {
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug }
  )

  if (post) {
    return { type: 'post', content: post }
  }

  const page = await client.fetch(
    `*[_type == "page" && slug.current == $slug][0]`,
    { slug }
  )

  if (page) {
    return { type: 'page', content: page }
  }

  return null
}

export default async function DynamicPost({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const result = await getContent(slug)

  if (!result) {
    return <div>Page not found.</div>
  }

  // Render Post
  if (result.type === 'post') {
    const post = result.content;
    return (
      <main>
        <h1>{post.title}</h1>
        <PortableText value={post.body} />
      </main>
    )
  }
  // Render Page
  // if (result.type === 'page') {
  //   const page = result.content;
  //   const LayoutComponent = layoutComponents[page.layout] || DefaultLayout;
  //   return <LayoutComponent page={page} />
  // }
}
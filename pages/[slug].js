import DefaultLayout from '@/layouts/default'
import FullWidthLayout from '@/layouts/fullwidth'
import { getAllPosts, getSubPost, getPostBlocks } from '@/lib/notion'
import BLOG from '@/blog.config'

const BlogPost = ({ post, blockMap }) => {
  if (!post) return null
  return (
    <>
      {post.fullWidth ? (
        <FullWidthLayout
          blockMap={blockMap}
          frontMatter={post}
        ></FullWidthLayout>
      ) : (
        <DefaultLayout blockMap={blockMap} frontMatter={post}></DefaultLayout>
      )}
    </>
  )
}

export async function getStaticPaths() {
  let posts = await getAllPosts()
  posts = posts.filter(post => post.status === 'Published')
  return {
    paths: posts.map(row => `${BLOG.path}/${row.slug}`),
    fallback: true
  }
}

export async function getStaticProps({ params: { slug } }) {
  console.log('getStaticProps', slug)
  let posts = await getAllPosts()
  posts = posts.filter(post => post.status === 'Published')
  let post = posts.find(t => t.slug === slug)
  if (post === undefined) {
    post = await getSubPost(slug)
  }
  const blockMap = await getPostBlocks(post.id)
  return {
    props: { post, blockMap },
    revalidate: 1
  }
}

export default BlogPost

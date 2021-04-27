import Image from 'next/image'
import Container from '@/components/Container'
import { useRouter } from 'next/router'
import { NotionRenderer, Equation, Code, CollectionRow } from 'react-notion-x'
import BLOG from '@/blog.config'
import formatDate from '@/lib/formatDate'
import dynamic from 'next/dynamic'
import 'gitalk/dist/gitalk.css'
import { useLocale } from '@/lib/locale'
import { useEffect, useState } from 'react'

const GitalkComponent = dynamic(
  () => {
    return import('gitalk/dist/gitalk-component')
  },
  { ssr: false }
)

const DefaultLayout = ({ children, blockMap, frontMatter }) => {
  const locale = useLocale()
  const router = useRouter()
  console.log(blockMap)
  const [toc, setToc] = useState([])
  useEffect(() => {
    const { block } = blockMap
    const tocArr = []
    for (const key in block) {
      if (block[key]?.value?.type === 'sub_sub_header' || block[key]?.value?.type === 'sub_header') {
        tocArr.push(block[key]?.value?.properties?.title?.join())
      }
    }
    setToc(tocArr)
  })
  return (
    <Container
      layout="blog"
      title={frontMatter.title}
      description={frontMatter.summary}
      // date={new Date(frontMatter.publishedAt).toISOString()}
      type="article"
    >
      <article>
        <div className='hidden xl:flex flex-col fixed p-2' style={{width: 220, right: 50, top: 280}}>
          {toc.map((item, index) => {
            return (
              <a className='truncate mb-2 text-gray-500 hover:bg-blue-100'>
                {item}
              </a>
            )
          })}
        </div>
        {frontMatter.parent && (
          <a className="font-sans font-bold font-medium dark:text-gray-400"
             style={{fontSize: 16, marginBottom: 5, color: '#666666'}}
             href={frontMatter.parent.slug}
          >
            {'← ' + frontMatter.parent.title}
          </a>
        )}
        <h1 className="font-bold text-3xl text-black dark:text-white">
          {frontMatter.title}
        </h1>
        {frontMatter.type !== 'Page' && (
          <nav className="flex mt-4 mb-1 items-center font-medium text-gray-600 dark:text-gray-400"
               style={{flexDirection: 'column', alignItems: 'flex-start', fontSize: 16}}>
            {console.log('frontMatter', frontMatter)}
            {frontMatter.date && (
              <div className="mx-2 md:ml-0">
                {formatDate(frontMatter.date, BLOG.lang)}
              </div>
            )}
            {frontMatter.tags && (
              <div className="flex flex-wrap">
                {frontMatter.tags.map(tag => (
                  <p
                    key={tag}
                    className="mr-1 cursor-pointer"
                    onClick={() =>
                      router.push(`/tag/${encodeURIComponent(tag)}`)
                    }
                  >
                    #{tag}
                  </p>
                ))}
              </div>
            )}
            {frontMatter.attribute && (
              <div style={{display: 'flex'}}>
                <div className="mx-2 md:ml-0">
                  {frontMatter.attribute}
                </div>
                {frontMatter.source && (
                  <div className="mx-2 md:ml-0">
                    <a href={frontMatter.source} target="_blank">{frontMatter.source}</a>
                  </div>
                )}
              </div>
            )}
          </nav>
        )}
        {children}
        {blockMap && (
          <div className="">
            <NotionRenderer
              recordMap={blockMap}
              components={{
                equation: Equation,
                code: Code,
                collectionRow: CollectionRow
              }}
            />
          </div>
        )}
      </article>
      <div className="flex justify-between font-medium text-black dark:text-gray-100">
        <button
          onClick={() => router.push(BLOG.path || '/')}
          className="mt-2 cursor-pointer"
        >
          ← {locale.POST.BACK}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-2 cursor-pointer"
        >
          ↑ {locale.POST.TOP}
        </button>
      </div>
      {BLOG.comment && BLOG.comment.provider === 'gitalk' && (
        <GitalkComponent
          options={{
            id: frontMatter.id,
            title: frontMatter.title,
            clientID: BLOG.comment.gitalkConfig.clientID,
            clientSecret: BLOG.comment.gitalkConfig.clientSecret,
            repo: BLOG.comment.gitalkConfig.repo,
            owner: BLOG.comment.gitalkConfig.owner,
            admin: BLOG.comment.gitalkConfig.admin,
            distractionFreeMode: BLOG.comment.gitalkConfig.distractionFreeMode
          }}
        />
      )}
    </Container>
  )
}

export default DefaultLayout

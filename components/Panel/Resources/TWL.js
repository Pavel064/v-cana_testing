import { useEffect, useState } from 'react'

import ReactMarkdown from 'react-markdown'

import { useTranslation } from 'next-i18next'

import { Placeholder, TNTWLContent } from '../UI'

import { useGetResource, useScroll } from 'utils/hooks'
import { checkLSVal, filterNotes, getWords } from 'utils/helper'
import { getFile } from 'utils/apiHelper'
import Down from 'public/arrow-down.svg'
import Back from 'public/left.svg'
import { currentVerse } from 'components/state/atoms'
import dynamic from 'next/dynamic'
import { useRecoilState } from 'recoil'
import { Disclosure } from '@headlessui/react'

const TWords = dynamic(() => import('@texttree/v-cana-rcl').then((mod) => mod.TWords), {
  ssr: false,
})

function TWL({ config, url, toolName }) {
  const [currentScrollVerse, setCurrentScrollVerse] = useRecoilState(currentVerse)
  const { isLoading, data } = useGetResource({ config, url })
  const [word, setWord] = useState(null)
  const [wordObjects, setWordObjects] = useState([])
  const [isLoadingTW, setIsLoadingTW] = useState(false)
  const [filter, setFilter] = useState(() => {
    return checkLSVal('filter_words', 'disabled', 'string')
  })
  useEffect(() => {
    localStorage.setItem('filter_words', filter)
  }, [filter])

  useEffect(() => {
    const getData = async () => {
      setIsLoadingTW(true)
      const zip = await getFile({
        owner: config.resource.owner,
        repo: config.resource.repo.slice(0, -1).replace('obs-', ''),
        commit: config.resource.commit,
        apiUrl: '/api/git/tw',
      })
      const words = await getWords({
        zip,
        repo: config.resource.repo.slice(0, -1).replace('obs-', ''),
        wordObjects: data,
      })
      const finalData = {}
      words?.forEach((word) => {
        if (!word) return null

        const {
          ID,
          Reference,
          TWLink,
          isRepeatedInBook,
          isRepeatedInChapter,
          isRepeatedInVerse,
          text,
          title,
        } = word
        const wordObject = {
          id: ID,
          title,
          text,
          url: TWLink,
          isRepeatedInBook,
          isRepeatedInChapter,
          isRepeatedInVerse,
        }

        const [, verse] = Reference.split(':')
        filterNotes(wordObject, verse, finalData)
      })
      setIsLoadingTW(false)
      setWordObjects(finalData)
    }
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <>
      {!word && (
        <div className="text-center mb-2">
          {<FilterRepeated filter={filter} setFilter={setFilter} />}
        </div>
      )}
      <TWords
        twords={wordObjects}
        nodeContentBack={
          <span>
            <Back className="w-8 stroke-th-primary-200" />
          </span>
        }
        classes={{
          main: 'relative h-full',
          content: {
            container:
              'absolute top-0 bottom-0 pr-2 ,bg-th-secondary-10 overflow-auto left-0 right-0',
            header: 'sticky flex top-0 pb-4 bg-th-secondary-10',
            backButton:
              'w-fit h-fit p-1 mr-2.5 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100',
            title: 'font-bold text-xl mt-1',
            text: 'markdown-body',
          },
          list: {
            verseNumber: 'text-2xl',
            container:
              'divide-y divide-th-text-primary divide-dashed h-full overflow-auto',
            verseBlock: 'pl-7 flex-1',
            currentWord: 'bg-th-secondary-100',
            word: 'p-2 cursor-pointer rounded-lg hover:bg-th-secondary-100',
            verseWrapper: 'p-4 flex mx-4',
            filtered: 'text-th-secondary-300',
          },
        }}
        nodeLoading={<Placeholder />}
        isLoading={isLoadingTW || isLoading}
        scrollTopOffset={20}
        startHighlightIds={checkLSVal('highlightIds', {}, 'object')}
        currentScrollVerse={currentScrollVerse}
        toolId={toolName}
        idContainerScroll={config.idContainerScroll}
        setCurrentScrollVerse={setCurrentScrollVerse}
        filter={filter}
        word={word}
        setWord={setWord}
      />
    </>
  )
}

export default TWL

function FilterRepeated({ setFilter, filter, isOpen = false }) {
  const { t } = useTranslation('common')
  const options = [
    { value: 'verse', name: t('ByVerse') },
    { value: 'book', name: t('ByBook') },
    { value: 'disabled', name: t('Disabled') },
  ]

  return (
    <Disclosure defaultOpen={isOpen}>
      {({ open }) => (
        <>
          <Disclosure.Panel>
            <div className="flex items-center justify-center gap-2">
              <div className="hidden sm:block md:w-1/2">{t('FilterRepeatedWords')}</div>
              <div className="relative w-full sm:w-1/2 mr-2">
                <select
                  className="input-primary appearance-none truncate"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ padding: '10px' }}
                >
                  {options?.map((option) => (
                    <option className="mr-2" value={option.value} key={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <Down className="w-5 h-5 absolute -translate-y-1/2 top-1/2 right-4 stroke-th-text-primary pointer-events-none" />
              </div>
            </div>
          </Disclosure.Panel>
          <Disclosure.Button>
            <div className="flex gap-1 justify-center w-full pt-3 border-t border-th-secondary-300 text-th-secondary-300">
              <span>{t(open ? 'Hide' : 'Open')}</span>
              <Down
                className={`w-6 max-w-[1.5rem] stroke-th-secondary-300 ${
                  open ? 'rotate-180 transform' : ''
                }`}
              />
            </div>
          </Disclosure.Button>
        </>
      )}
    </Disclosure>
  )
}

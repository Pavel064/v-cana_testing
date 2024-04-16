import { useEffect, useState } from 'react'

import { Placeholder } from '../UI'

import { useGetResource } from 'utils/hooks'

import { useQuotesTranslation } from '@texttree/tn-quote'

// import { filterNotes } from 'utils/helper'

import Back from 'public/left.svg'
import dynamic from 'next/dynamic'
import { currentVerse } from 'components/state/atoms'
import { useRecoilState } from 'recoil'
import { checkLSVal } from 'utils/helper'

const TNotes = dynamic(() => import('@texttree/v-cana-rcl').then((mod) => mod.TNotes), {
  ssr: false,
})

function TN({ config, url, toolName }) {
  const [currentScrollVerse, setCurrentScrollVerse] = useRecoilState(currentVerse)
  const [tnotes, setTnotes] = useState([])
  const { isLoading, data } = useGetResource({ config, url })
  const { extraTNotes, setTnotes: updateTnotes } = useQuotesTranslation({
    domain: process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org',
    book: config.reference.book,
    tnotes: data,
    usfm: {
      link:
        config?.config?.quote_resource ??
        (process.env.NEXT_PUBLIC_NODE_HOST ?? 'https://git.door43.org') +
          '/' +
          config.mainResource.owner +
          '/' +
          config.mainResource.repo,
    },
  })
  useEffect(() => {
    if (extraTNotes) {
      function filterNotes(dataArray) {
        const notesByVerse = {}
        if (!dataArray) return
        dataArray.forEach((note) => {
          note.verse.forEach((v) => {
            const verseNumber = parseInt(v)

            if (!notesByVerse[verseNumber]) {
              notesByVerse[verseNumber] = [note]
            } else {
              notesByVerse[verseNumber].push(note)
            }
          })
        })

        return notesByVerse
      }

      // const _data = []
      // for (const el of extraTNotes) {
      //   filterNotes(el, el.verse, _data)
      // }
      const newNotes = filterNotes(extraTNotes)
      setTnotes(newNotes)
    }
  }, [extraTNotes])

  useEffect(() => {
    if (updateTnotes && data) {
      updateTnotes(data)
    }
  }, [data, updateTnotes])

  return (
    <>
      <TNotes
        tnotes={tnotes}
        nodeContentBack={
          <span>
            <Back className="w-8 stroke-th-primary-200" />
          </span>
        }
        classes={{
          content: {
            container:
              'absolute top-0 bottom-0 pr-2 ,bg-th-secondary-10 overflow-auto left-0 right-0',
            header: 'sticky flex top-0 pb-4 bg-th-secondary-10',
            backButton:
              'w-fit h-fit p-1 mr-2.5 cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100',
            title: 'font-bold text-xl mt-1',
            text: 'markdown-body',
          },
          main: 'relative h-full',
          list: {
            verseNumber: 'text-2xl',
            container:
              'divide-y divide-th-text-primary divide-dashed h-full overflow-auto',
            verseBlock: 'pl-7 flex-1',
            currentNote: 'bg-th-secondary-100',
            note: 'p-2 cursor-pointer rounded-lg hover:bg-th-secondary-100',
            verseWrapper: 'p-4 flex mx-4',
          },
        }}
        nodeLoading={<Placeholder />}
        isLoading={isLoading}
        scrollTopOffset={20}
        startHighlightIds={checkLSVal('highlightIds', {}, 'object')}
        currentScrollVerse={currentScrollVerse}
        toolId={toolName}
        idContainerScroll={config.idContainerScroll}
        setCurrentScrollVerse={setCurrentScrollVerse}
      />
    </>
  )
}

export default TN

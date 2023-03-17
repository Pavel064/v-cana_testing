import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

import toast, { Toaster } from 'react-hot-toast'

import Modal from 'components/Modal'

import { supabase } from 'utils/supabaseClient'

import { readableDate, compileChapter, downloadPdf, downloadFile } from 'utils/helper'
import { useBriefState, useGetChapters, useGetCreatedChapters } from 'utils/hooks'
import Download from './Download'

function ChapterList({ selectedBook, project, highLevelAccess, token }) {
  const [openCreatingChapter, setOpenCreatingChapter] = useState(false)
  const [openDownloading, setOpenDownloading] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [currentSteps, setCurrentSteps] = useState(null)
  const [currentChapter, setCurrentChapter] = useState([])
  const { briefResume, isBrief } = useBriefState({
    token,
    project_id: project?.id,
  })

  const { t } = useTranslation(['common', 'books'])

  const {
    query: { book, code },
    push,
    locale,
  } = useRouter()
  const [chapters, { mutate: mutateChapters }] = useGetChapters({
    token,
    code: project?.code,
    book_code: book,
  })
  const [createdChapters, { mutate: mutateCreatedChapters }] = useGetCreatedChapters({
    token,
    code: project?.code,
    chapters: chapters?.map((el) => el.id),
  })
  const handleCreate = async (chapter_id, num) => {
    try {
      const res = await supabase.rpc('create_verses', { chapter_id })
      if (res.data) {
        mutateChapters()
        mutateCreatedChapters()
        push('/projects/' + code + '/books/' + selectedBook.code + '/' + num)
      }
    } catch (error) {
      toast.error(t('CreateFailed'))
    }
  }

  useEffect(() => {
    if (project?.id) {
      supabase
        .rpc('get_current_steps', { project_id: project.id })
        .then((res) => setCurrentSteps(res.data))
    }
  }, [project?.id])

  const getCurrentStep = (chapter, index) => {
    const step = currentSteps
      ?.filter((step) => step.book === book)
      ?.find((step) => step.chapter === chapter.num)
    if (step) {
      return (
        <>
          {!(!isBrief || briefResume) ? (
            <Link href={`/projects/${project?.code}/edit/brief`}>
              <a onClick={(e) => e.stopPropagation()} className="btn btn-white mt-2 mx-1">
                {t(highLevelAccess ? 'EditBrief' : 'OpenBrief')}
              </a>
            </Link>
          ) : (
            <Link
              key={index}
              href={`/translate/${step.project}/${step.book}/${step.chapter}/${step.step}/intro`}
            >
              <a onClick={(e) => e.stopPropagation()} className="btn btn-white mt-2">
                {step.title}
              </a>
            </Link>
          )}
        </>
      )
    }
  }
  return (
    <div className="overflow-x-auto relative">
      <div className="my-4">
        <Link href={`/projects/${project?.code}`}>
          <a onClick={(e) => e.stopPropagation()} className="text-blue-450 decoration-2">
            {project?.code}
          </a>
        </Link>
        /{t(`books:${selectedBook?.code}`)}
      </div>
      <table className="shadow-md mb-4 text-center w-fit text-sm table-auto text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="py-3 px-3">{t('Chapter')}</th>
            <th className="py-3 px-3">{t('chapters:StartedAt')}</th>
            <th className="py-3 px-3 ">{t('chapters:FinishedAt')}</th>
            <th className="py-3 px-6">{`${t('Download')} / ${t('Open')}`}</th>
          </tr>
        </thead>
        <tbody>
          {project?.code &&
            chapters
              ?.sort((a, b) => a.num - b.num)
              .map((chapter, index) => {
                const { id, num, started_at, finished_at } = chapter
                return (
                  <tr
                    key={index}
                    onClick={() => {
                      if (highLevelAccess) {
                        if (!createdChapters?.includes(id)) {
                          setSelectedChapter(chapter)
                          setOpenCreatingChapter(true)
                        } else {
                          push(
                            '/projects/' +
                              project?.code +
                              '/books/' +
                              selectedBook?.code +
                              '/' +
                              num
                          )
                        }
                      }
                    }}
                    className={`${
                      highLevelAccess ? 'cursor-pointer hover:bg-gray-50' : ''
                    } ${
                      !createdChapters?.includes(id) ? 'bg-gray-100' : 'bg-white'
                    } border-b`}
                  >
                    <th
                      scope="row"
                      className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {num}
                    </th>
                    <td className="py-4 px-6">
                      {started_at && readableDate(started_at, locale)}
                    </td>
                    <td className="py-4 px-6 ">
                      {finished_at && readableDate(finished_at, locale)}
                    </td>
                    <td className="py-4 px-6">
                      {finished_at ? (
                        <button
                          className="text-blue-600 hover:text-gray-400 p-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCurrentChapter(chapter)
                            setOpenDownloading(true)
                          }}
                        >
                          {t('Download')}
                        </button>
                      ) : (
                        getCurrentStep(chapter, index)
                      )}
                    </td>
                  </tr>
                )
              })}
        </tbody>
      </table>
      <Modal
        isOpen={openCreatingChapter}
        closeHandle={() => setOpenCreatingChapter(false)}
      >
        <div className="text-center mb-4">
          {t('WantCreateChapter')} {selectedChapter?.num}?
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              setOpenCreatingChapter(false)
              handleCreate(selectedChapter.id, selectedChapter.num)
            }}
            className="btn-cyan"
          >
            {t('Create')}
          </button>
          <div className="ml-4">
            <button className="btn-cyan" onClick={() => setOpenCreatingChapter(false)}>
              {t('common:Close')}
            </button>
          </div>
        </div>
      </Modal>
      <Download
        openDownloading={openDownloading}
        setOpenDownloading={setOpenDownloading}
        downloadPdf={downloadPdf}
        downloadFile={downloadFile}
        compileChapter={compileChapter}
        project={project}
        downloadingBook={selectedBook}
        currentChapter={currentChapter}
        t={t}
      />
      <Toaster
        toastOptions={{
          style: {
            marginTop: '-6px',
            color: '#6b7280',
          },
        }}
      />
    </div>
  )
}
export default ChapterList

import { useEffect, useRef, useState } from 'react'

import dynamic from 'next/dynamic'

import { useTranslation } from 'next-i18next'

import axios from 'axios'
import { toast } from 'react-hot-toast'

import { useCurrentUser } from 'lib/UserContext'
import useSupabaseClient from 'utils/supabaseClient'

import Modal from 'components/Modal'

import { usePersonalNotes } from 'utils/hooks'
import { removeCacheNote, saveCacheNote } from 'utils/helper'

import Close from 'public/close.svg'
import Trash from 'public/trash.svg'
import FileIcon from 'public/fileIcon.svg'
import CloseFolder from 'public/closeFolder.svg'
import OpenFolder from 'public/open-folder.svg'
import ArrowDown from 'public/folder-arrow-down.svg'
import ArrowRight from 'public/folder-arrow-right.svg'

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ContextMenu = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ContextMenu),
  {
    ssr: false,
  }
)

const TreeView = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.TreeView),
  {
    ssr: false,
  }
)

function PersonalNotes() {
  const treeRef = useRef(null)
  const [contextMenuEvent, setContextMenuEvent] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [noteId, setNoteId] = useState('')
  const [activeNote, setActiveNote] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [currentNodeProps, setCurrentNodeProps] = useState(null)
  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()
  const [notes, { mutate }] = usePersonalNotes({
    sort: 'sorting',
  })
  const [dataForTreeView, setDataForTreeView] = useState(convertNotesToTree(notes))

  const removeCacheAllNotes = (key) => {
    localStorage.removeItem(key)
  }

  const saveNote = () => {
    axios
      .put(`/api/personal_notes/${noteId}`, activeNote)
      .then(() => {
        saveCacheNote('personal-notes', activeNote, user)
        mutate()
      })
      .catch((err) => {
        toast.error(t('SaveFailed'))
        console.log(err)
      })
  }

  const onDoubleClick = () => {
    const currentNote = notes.find((el) => el.id === noteId)
    setActiveNote(currentNote)
  }

  const addNode = (isFolder) => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    const title = isFolder ? 'new folder' : 'new note'
    const isFolderValue = isFolder ? true : false
    axios
      .post('/api/personal_notes', {
        id,
        user_id: user.id,
        isFolderValue,
        title,
      })
      .then(() => mutate())
      .catch(console.log)
  }

  const handleRenameNode = (newTitle, id) => {
    axios
      .put(`/api/personal_notes/${id}`, { title: newTitle })
      .then(() => {
        console.log('Note renamed successfully')
        removeCacheNote('personal_notes', id)
        mutate()
      })
      .catch((error) => {
        console.log('Failed to rename note:', error)
      })
  }

  const removeNode = () => {
    currentNodeProps?.tree.delete(currentNodeProps.node.id)
  }

  const handleRemoveNode = ({ ids }) => {
    axios
      .delete(`/api/personal_notes/${ids[0]}`)
      .then(() => {
        removeCacheNote('personal_notes', ids[0])
        mutate()
      })
      .catch(console.log)
  }

  useEffect(() => {
    if (!activeNote) {
      return
    }
    const timer = setTimeout(() => {
      saveNote()
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote])

  const removeAllNote = () => {
    axios
      .delete(`/api/personal_notes`, { data: { user_id: user?.id } })
      .then(() => {
        removeCacheAllNotes('personal-notes')
        mutate()
      })
      .catch(console.log)
  }

  function convertNotesToTree(notes, parentId = null) {
    const filteredNotes = notes?.filter((note) => note.parent_id === parentId)

    filteredNotes?.sort((a, b) => a.sorting - b.sorting)
    return filteredNotes?.map((note) => ({
      id: note.id,
      name: note.title,
      ...(note.is_folder && {
        children: convertNotesToTree(notes, note.id),
      }),
    }))
  }

  useEffect(() => {
    setDataForTreeView(convertNotesToTree(notes))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes])

  const handleContextMenu = (event) => {
    setNoteId(hoveredNodeId)
    setContextMenuEvent({ event })
  }

  const handleRename = () => {
    currentNodeProps?.node.edit()
  }

  const menuItems = [
    { id: 'adding_a_note', label: '+ add note', action: () => addNode(false) },
    { id: 'adding_a_folder', label: '+ add folder', action: () => addNode(true) },
    { id: 'rename', label: '✏️ Rename', action: handleRename },
    { id: 'delete', label: '🗑️ Delete', action: () => setIsOpenModal(true) },
  ]

  const supabase = useSupabaseClient()

  const handleDragDrop = async ({ dragIds, parentId, index }) => {
    const { error } = await supabase.rpc('move_node', {
      new_sorting_value: index,
      dragged_node_id: dragIds[0],
      new_parent_id: parentId,
    })

    if (error) {
      console.error('Error when moving node:', error)
    } else {
      removeCacheAllNotes('personal-notes')
      mutate()
    }
  }

  return (
    <div className="relative">
      {!activeNote ? (
        <div>
          <div className="flex">
            <button
              className="btn-gray-red mb-4 mr-2 right-0"
              onClick={() => {
                setCurrentNodeProps(null)
                setIsOpenModal(true)
              }}
              disabled={!notes?.length}
            >
              <Trash className={'w-4 mb-1 inline'} /> {t('RemoveAll')}
            </button>
            <button className="btn-gray mb-4 mr-2" onClick={() => addNode(false)}>
              <FileIcon className={'my-2'} />
            </button>
            <button className="btn-gray mb-4" onClick={() => addNode(true)}>
              <CloseFolder className={'w-4'} />
            </button>
          </div>
          <TreeView
            data={dataForTreeView}
            setSelectedNodeId={setNoteId}
            nodeHeight={57}
            treeRef={treeRef}
            onDoubleClick={onDoubleClick}
            classes={{
              nodeWrapper:
                'flex px-5 leading-[47px] text-lg cursor-pointer rounded-lg bg-gray-100 hover:bg-gray-200',
              nodeTextBlock: 'items-center',
            }}
            treeHeight={440}
            fileIcon={<FileIcon className={'w-6 h-6'} />}
            arrowDown={<ArrowDown className={'stroke-2'} />}
            arrowRight={<ArrowRight className={'stroke-2'} />}
            closeFolderIcon={<CloseFolder className={'w-6 h-6'} />}
            openFolderIcon={<OpenFolder className={'w-6 h-6 stroke-[1.7]'} />}
            handleContextMenu={handleContextMenu}
            selectedNodeId={noteId}
            customContextMenu={true}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            treeWidth={320}
            getCurrentNodeProps={setCurrentNodeProps}
            handleRenameNode={handleRenameNode}
            handleTreeEventDelete={handleRemoveNode}
            handleDragDrop={handleDragDrop}
          />
          <ContextMenu
            setSelectedNodeId={setNoteId}
            selectedNodeId={noteId}
            data={contextMenuEvent}
            menuItems={menuItems}
            treeRef={treeRef}
            classes={{
              menuItem: 'py-1 pr-7 pl-2.5 cursor-pointer bg-gray-100 hover:bg-gray-200',
              menuWrapper: 'fixed z-50',
              menuContainer:
                'absolute border rounded z-[100] whitespace-nowrap bg-white shadow',
              emptyMenu: 'p-2.5 cursor-pointer text-gray-300',
            }}
          />
        </div>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 w-10 pr-3 cursor-pointer"
            onClick={() => {
              saveNote()
              setActiveNote(null)
              setNoteId(null)
            }}
          >
            <Close />
          </div>
          <Redactor
            classes={{
              title: 'p-2 my-4 mr-12 bg-gray-100 font-bold rounded-lg shadow-md', //
              redactor:
                'pb-20 pt-4 my-4 bg-gray-100 overflow-hidden break-words rounded-lg shadow-md', //
            }}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
            placeholder={t('TextNewNote')}
          />
        </>
      )}
      <Modal isOpen={isOpenModal} closeHandle={() => setIsOpenModal(false)}>
        <div className="flex flex-col gap-7 items-center">
          <div className="text-center text-2xl">
            {t('AreYouSureDelete') +
              ' ' +
              t(
                currentNodeProps
                  ? currentNodeProps.node.data.name
                  : t('AllNotes').toLowerCase()
              ) +
              '?'}
          </div>
          <div className="flex gap-7 w-1/2">
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                if (currentNodeProps) {
                  removeNode()
                  setCurrentNodeProps(null)
                } else {
                  removeAllNote()
                }
              }}
            >
              {t('Yes')}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                setIsOpenModal(false)
                setTimeout(() => {
                  setCurrentNodeProps(null)
                }, 1000)
              }}
            >
              {t('No')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PersonalNotes

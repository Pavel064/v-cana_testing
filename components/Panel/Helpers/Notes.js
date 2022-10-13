import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import axios from 'axios'

import { useCurrentUser } from 'lib/UserContext'
import { useNotes } from 'utils/hooks'

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ListOfNotes = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ListOfNotes),
  {
    ssr: false,
  }
)

function Notes() {
  const inputStyle = {
    width: '650px',
    height: '38px',
    fontSize: 'large',
    border: 'none',
    outline: 'none',
  }

  const [noteDBId, setNoteDBId] = useState('test_noteDBId')
  const [addedNoteId, setAddedNoteId] = useState('test_addedNoteId')
  const [note, setNote] = useState(null)
  const { user } = useCurrentUser()
  const [notes, { loading, error, mutate }] = useNotes({
    token: user?.access_token,
    id: user.id,
  })

  useEffect(() => {
    const currentNote = notes?.find((el) => el.id === addedNoteId)
    setNote(currentNote) //TODO - это устанавливает не текущий едитор, а загруженный с базы
  }, [addedNoteId])
  console.log('hello', note);

// Clear
  useEffect(() => {
    if (notes?.length === 0) {
      setNote({
        title: '',
        id: ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9),
        data: {
          blocks: [
            {
              type: 'paragraph',
              data: {},
            },
          ],
        },
      })
    }
  }, [notes])

  const addNote = () => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/personal_notes', { id, user_id: user.id })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }

  const removeNote = (id) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/personal_notes/${id}`, { id, user_id: user.id })
      .then(() => mutate())
      .catch((err) => console.log(err))
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      axios.defaults.headers.common['token'] = user?.access_token
      axios
        .put(`/api/personal_notes/${addedNoteId}`, note)
        .then(() => mutate())
        .catch((err) => console.log(err))

      return () => {
        clearTimeout(timer)
      }
    }, 1000)

    // return () => {}
  }, [note])

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <ListOfNotes
          notes={notes}
          passIdToDel={removeNote}
          addNote={addNote}
          setAddedNoteId={setAddedNoteId}
        />
      </div>

      <div style={{ width: '50%' }}>
        <Redactor
          initId={addedNoteId}
          setNoteDBId={setNoteDBId}
          note={note}
          setNote={setNote}
          inputStyle={inputStyle}
        />
      </div>
    </div>
  )
}

export default Notes

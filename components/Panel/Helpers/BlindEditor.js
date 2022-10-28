import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'

import { useSetRecoilState } from 'recoil'

import { supabase } from 'utils/supabaseClient'

import AutoSizeTextArea from '../UI/AutoSizeTextArea'

import { checkedVersesBibleState } from '../state/atoms'

import Pencil from 'public/pencil.svg'
import Check from 'public/check.svg'

function BlindEditor({ config }) {
  const [enabledIcons, setEnabledIcons] = useState([])
  const [enabledInputs, setEnabledInputs] = useState([])
  const [verseObjects, setVerseObjects] = useState([])
  const [translatedVerses, setTranslatedVerses] = useState([])
  const [isShowFinalButton, setIsShowFinalButton] = useState(false)
  const { t } = useTranslation(['common'])

  const setCheckedVersesBible = useSetRecoilState(checkedVersesBibleState)

  useEffect(() => {
    setVerseObjects(config.reference.verses)
    let updatedArray = []
    const _verseObjects = config.reference.verses
    config.reference.verses.forEach((el) => {
      if (el.verse) {
        updatedArray.push(el.num.toString())
      }
    })
    setCheckedVersesBible(updatedArray)
    setTranslatedVerses(updatedArray)
    if (!updatedArray.length) {
      return
    }
    if (updatedArray.length === _verseObjects.length) {
      setEnabledIcons(['0'])
    } else {
      for (let index = 0; index < _verseObjects.length; index++) {
        if (
          _verseObjects[index].num.toString() === updatedArray[updatedArray.length - 1] &&
          index < _verseObjects.length - 1
        ) {
          setEnabledIcons([_verseObjects[index + 1].num.toString()])
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!verseObjects || !verseObjects.length) {
      return
    }
    if (verseObjects[verseObjects.length - 1].verse) {
      setIsShowFinalButton(
        enabledIcons?.[0] === verseObjects[verseObjects.length - 1].num.toString()
      )
    }
  }, [enabledIcons, verseObjects])

  const updateVerse = (id, text) => {
    setVerseObjects((prev) => {
      prev[id].verse = text.trim()
      return [...prev]
    })
  }

  const sendToDb = async (index) => {
    setTranslatedVerses((prev) => [...prev, verseObjects[index].num.toString()])
    const res = await supabase.rpc('save_verse', {
      new_verse: verseObjects[index].verse,
      verse_id: verseObjects[index].verse_id,
    })
  }

  return (
    <div>
      {verseObjects.map((el, index) => {
        const currentNumVerse = el.num.toString()
        const nextNumVerse =
          index < verseObjects.length - 1 ? verseObjects[index + 1].num.toString() : ''
        const prevNumVerse = index !== 0 ? verseObjects[index - 1].num.toString() : ''
        const disabledButton = !(
          (index === 0 && !enabledIcons.length) ||
          enabledIcons.includes(currentNumVerse)
        )
        const isTranslating = enabledInputs.includes(el.num.toString())
        const isTranslated = translatedVerses.includes(currentNumVerse)
        return (
          <div key={el.verse_id} data-id={el.num} className="flex my-3">
            <button
              onClick={() => {
                if ((index !== 0 && !verseObjects[index - 1].verse) || isTranslating) {
                  return
                }
                setEnabledIcons((prev) => {
                  return [
                    ...prev,
                    ...(index === 0 ? [currentNumVerse, nextNumVerse] : [nextNumVerse]),
                  ].filter((el) => el !== prevNumVerse)
                })
                setCheckedVersesBible((prev) => [...prev, currentNumVerse])

                setEnabledInputs((prev) =>
                  [...prev, currentNumVerse].filter((el) => el !== prevNumVerse)
                )
                if (index === 0) {
                  return
                }

                sendToDb(index - 1)
              }}
              className={`${isTranslating ? 'btn-cyan' : 'btn-white'}`}
              disabled={disabledButton}
            >
              {isTranslated ? (
                <Check className="w-4 h-4" />
              ) : (
                <Pencil
                  className={`w-4 h-4 ${
                    disabledButton
                      ? 'svg-gray'
                      : !isTranslating
                      ? 'svg-cyan'
                      : 'svg-white'
                  }`}
                />
              )}
            </button>

            <div className="ml-4">{el.num}</div>
            <AutoSizeTextArea
              disabled={!isTranslating}
              updateVerse={updateVerse}
              index={index}
              verseObject={el}
            />
          </div>
        )
      })}
      {isShowFinalButton && (
        <button
          onClick={() => {
            setEnabledIcons(['0'])
            setEnabledInputs([])
            sendToDb(verseObjects.length - 1)
          }}
          className="btn-white"
        >
          {t('Save')}
        </button>
      )}
    </div>
  )
}

export default BlindEditor

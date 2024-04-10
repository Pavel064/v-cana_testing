import { Switch } from '@headlessui/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { currentVerse } from '../../state/atoms'
import { useRecoilValue } from 'recoil'
import Loading from 'public/progress.svg'
import ReactMarkdown from 'react-markdown'

function Aquifer(config) {
  const [images, setImages] = useState([])
  const [image, setImage] = useState(null)
  const [dictionaryJson, setDictionaryJson] = useState(null)

  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(false)
  const [isLoadingDictionaryJson, setIsLoadingDictionaryJson] = useState(false)
  const [wholeChapter, setWholeChapter] = useState(false)
  const [dictionary, setDictionary] = useState(null)
  const verse = useRecoilValue(currentVerse)

  useEffect(() => {
    if ((!config.config.reference?.book, !config.config.reference?.chapter)) return
    setImage(null)
    const handleShowImagesList = async () => {
      setIsLoadingImages(true)
      const images = await axios.get(
        '/api/aquifer/' +
          config.config.reference?.book +
          '/' +
          config.config.reference?.chapter +
          '/' +
          `${wholeChapter ? 'whole' : verse}` +
          '/resources'
      )

      if (images) setImages(images.data)
      setIsLoadingImages(false)
    }
    handleShowImagesList()
  }, [
    config.config.reference?.book,
    config.config.reference?.chapter,
    verse,
    wholeChapter,
  ])

  useEffect(() => {
    const handleShowDictionary = async () => {
      setIsLoadingDictionary(true)
      const _dictionary = await axios.get(
        '/api/aquifer/' +
          config.config.reference?.book +
          '/' +
          config.config.reference?.chapter +
          '/' +
          `${wholeChapter ? 'whole' : verse}` +
          '/dictionary'
      )
      if (_dictionary) setDictionary(_dictionary.data)
      setIsLoadingDictionary(false)
      console.log({ _dictionary })
    }
    handleShowDictionary()
  }, [
    config.config.reference?.book,
    config.config.reference?.chapter,
    verse,
    wholeChapter,
  ])

  const handleShowSpecific = async (id) => {
    setIsLoadingImage(true)
    setImage(null)
    const image = await axios.get('/api/aquifer/images/' + id)

    if (image) setImage({ url: image.data?.content?.url, id })
    setIsLoadingImage(false)
  }
  const handleShowSpecificDictionary = async (id) => {
    setIsLoadingDictionaryJson(true)
    setImage(null)
    const _dictionary = await axios.get('/api/aquifer/dictionary/' + id)

    if (_dictionary) setDictionaryJson(_dictionary.data)
    setIsLoadingDictionaryJson(false)
  }

  return (
    <>
      <div>
        <Switch
          checked={wholeChapter}
          onChange={() => {
            setWholeChapter((prev) => !prev)
            setImage(null)
            setImages([])
          }}
          className={`${
            wholeChapter ? 'bg-th-primary-100' : 'bg-th-secondary-100'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              wholeChapter ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        <span>показывать всю главу</span>
      </div>
      <button className="italic">Images</button>
      {isLoadingImages ? (
        <Loading className="progress-custom-colors  mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
      ) : (
        <ul>
          {images?.items &&
            images.items.map((item) => (
              <li
                key={item.id}
                className={`font-bold text-2xl ${
                  image?.id === item.id ? 'bg-gray-300' : ''
                }`}
                onClick={() => handleShowSpecific(item.id)}
              >
                {item.name}
              </li>
            ))}
        </ul>
      )}

      {isLoadingImage && (
        <Loading className="progress-custom-colors  mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
      )}
      {image && (
        <Image src={image.url} width={300} height={300} alt="Picture of the author" />
      )}
      <div className="italic">Dictionary</div>
      {isLoadingDictionary ? (
        <Loading className="progress-custom-colors  mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
      ) : (
        <ul>
          {dictionary?.items &&
            dictionary.items.map((item) => (
              <li
                key={item.id}
                className={`font-bold text-2xl ${
                  dictionary?.id === item.id ? 'bg-gray-300' : ''
                }`}
                onClick={() => {
                  handleShowSpecificDictionary(item.id)
                  setDictionaryJson(null)
                }}
              >
                {item.name}
              </li>
            ))}
        </ul>
      )}
      {isLoadingDictionaryJson ? (
        <Loading className="progress-custom-colors mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
      ) : (
        dictionaryJson?.content.map((item, index) => (
          <ReactMarkdown key={index}>{item}</ReactMarkdown>
        ))
      )}
    </>
  )
}

export default Aquifer

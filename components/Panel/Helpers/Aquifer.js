import { Switch } from '@headlessui/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { currentVerse } from '../../state/atoms'
import { useRecoilValue } from 'recoil'
import Loading from 'public/progress.svg'
import ReactMarkdown from 'react-markdown'
import 'slick-carousel/slick/slick.css'
import Slider from 'react-slick'

import 'slick-carousel/slick/slick-theme.css'
import { useGetAquaphierImages } from 'utils/hooks'
import PrevImage from 'public/arrow-left.svg'
import NextImage from 'public/arrow-right.svg'
import Close from 'public/close.svg'

import Modal from 'components/Modal'
import { TNTWLContent } from '../UI'

function Aquifer(config) {
  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    beforeChange: function (currentSlide, nextSlide) {
      if (nextSlide > 0) {
        setNavigation((prev) => {
          return { ...prev, prev: true }
        })
      } else {
        setNavigation((prev) => {
          return { ...prev, prev: false }
        })
      }
      if (nextSlide === images.length - 3) {
        setNavigation((prev) => {
          return { ...prev, next: false }
        })
      } else {
        setNavigation((prev) => {
          return { ...prev, next: true }
        })
      }
    },

    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  // const [images, setImages] = useState([])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [image, setImage] = useState(null)
  const [dictionaryJson, setDictionaryJson] = useState(null)
  const [initialImageIndex, setInitialImageIndex] = useState(0)
  const [currentDictionaryId, setCurrentDictionaryId] = useState(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  // const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(false)
  const [isLoadingDictionaryJson, setIsLoadingDictionaryJson] = useState(false)
  const [wholeChapter, setWholeChapter] = useState(false)
  const [dictionary, setDictionary] = useState(null)
  const verse = useRecoilValue(currentVerse)
  const [note, setNote] = useState(null)
  // const { data: images, isLoading: isLoadingImages } = useGetAquaphierImages({
  //   ...config,
  //   verse,
  // })
  const [navigation, setNavigation] = useState({ prev: false, next: true })

  const containerRef = useRef(null)
  const sliderRef = useRef(null)

  const [showGradient, setShowGradient] = useState(true)
  const checkForScroll = () => {
    const container = containerRef.current

    if (container) {
      const hasScroll = container.scrollWidth > container.clientWidth
      setShowGradient(hasScroll)
    }
  }
  const sliderContainerRef = useRef(null)

  useEffect(() => {
    checkForScroll() // При монтировании компонента

    window.addEventListener('resize', checkForScroll)

    return () => {
      window.removeEventListener('resize', checkForScroll)
    }
  }, [])
  const images = [
    { url: '/aquaphier/1.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/2.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/3.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/4.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/5.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/6.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/7.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
    { url: '/aquaphier/8.jpg', name: 'Patriarchs' },
  ]

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

  // const handleShowSpecific = async (id) => {
  //   setIsLoadingImage(true)
  //   setImage(null)
  //   const image = await axios.get('/api/aquifer/images/' + id)

  //   if (image) setImage({ url: image.data?.content?.url, id })
  //   setIsLoadingImage(false)
  // }
  const handleShowSpecificDictionary = async (id) => {
    setIsLoadingDictionaryJson(true)
    setImage(null)
    const _dictionary = await axios.get('/api/aquifer/dictionary/' + id)

    if (_dictionary) {
      setNote({
        title: _dictionary.data.localizedName,
        text: _dictionary.data.content[0],
      })
      // setDictionaryJson(_dictionary.data)
    }
    setIsLoadingDictionaryJson(false)
  }
  const handleOpenBigImage = (index) => {
    setInitialImageIndex(index)
    setIsOpenModal(true)
  }
  return (
    <div className="relative h-full">
      {/* <div>
        <Switch
          checked={wholeChapter}
          onChange={() => {
            setWholeChapter((prev) => !prev)
            setImage(null)
            // setImages([])
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
      </div> */}
      {!note ? (
        <div>
          <h2 className="font-bold">Images</h2>
          {false ? (
            <Loading className="progress-custom-colors  mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
          ) : (
            <div className="relative mb-10">
              <div ref={containerRef} className="scroll-container flex py-6">
                {images?.map((image, index) => (
                  <div key={index}>
                    <div className="w-28 h-20 relative mx-1 py-2 rounded-lg">
                      <Image
                        src={image.url} // URL изображения
                        alt={image.name}
                        objectFit="cover"
                        layout="fill"
                        className="rounded-lg cursor-pointer"
                        onClick={() => handleOpenBigImage(index)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className={`${showGradient ? 'gradient-overlay' : 'hidden'}`}></div>
            </div>
          )}
          {false ? (
            <Loading className="progress-custom-colors  mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
          ) : (
            <div className="relative">
              <button
                className={`absolute top-1/2  -translate-y-1/2  p-1  cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100 ${
                  !navigation.prev ? 'opacity-30 pointer-events-none' : 'opacity-100'
                }`}
                onClick={() => {
                  sliderRef.current.slickPrev()
                }}
                disabled={!navigation.prev}
              >
                <PrevImage className="w-4 stroke-th-primary-200" />
              </button>
              <div className="px-8 " ref={sliderContainerRef}>
                <Slider {...settings} ref={sliderRef}>
                  {images?.map((image, index) => (
                    <div key={index}>
                      <div className="w-2/3 lg:w-24 h-20 relative  py-4 rounded-lg mx-auto">
                        <Image
                          src={image.url}
                          alt={image.name}
                          objectFit="cover"
                          layout="fill"
                          className="rounded-lg cursor-pounter"
                          onClick={() => handleOpenBigImage(index)}
                        />
                        <div className="truncate">{image.name}</div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
              <button
                className={`absolute top-1/2 right-0 -translate-y-1/2  p-1  cursor-pointer hover:opacity-70 rounded-full bg-th-secondary-100 ${
                  !navigation.next ? 'opacity-30 pointer-events-none' : 'opacity-100'
                }`}
                onClick={() => {
                  sliderRef.current.slickNext()
                }}
                disabled={!navigation.next}
              >
                <PrevImage className="w-4 stroke-th-primary-200 rotate-180" />
              </button>
            </div>
          )}

          <div className="font-bold mt-4">Dictionary</div>
          {isLoadingDictionary ? (
            <Loading className="progress-custom-colors  m-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
          ) : (
            <ul>
              {dictionary?.items &&
                dictionary.items.map((item) => (
                  <li
                    key={item.id}
                    className={`relative p-2 bg-th-secondary-100 rounded-xl text-lg mb-2 flex justify-between items-center hover:opacity-70 ${
                      currentDictionaryId === item.id ? 'bg-th-secondary-200' : ''
                    } cursor-pointer`}
                    onClick={() => {
                      setCurrentDictionaryId(item.id)
                      handleShowSpecificDictionary(item.id)
                      setDictionaryJson(null)
                    }}
                  >
                    {isLoadingDictionaryJson && item.id === currentDictionaryId && (
                      <Loading className="absolute progress-custom-colors  mx-auto my-auto inset-0 w-6 animate-spin stroke-th-primary-100" />
                    )}

                    <div
                      className={`flex justify-between items-center w-full ${
                        isLoadingDictionaryJson && item.id === currentDictionaryId
                          ? 'opacity-30 pointer-events-none'
                          : 'opacity-100'
                      }`}
                    >
                      <span>{item.name}</span>
                      <NextImage className="w-4 stroke-th-primary-200" />
                    </div>
                  </li>
                ))}
            </ul>
          )}

          <Modal
            isOpen={isOpenModal}
            closeHandle={() => {
              setIsOpenModal(false)
            }}
            className={{
              main: 'z-50 relative',
              dialogTitle: 'text-center text-2xl font-medium leading-6',
              dialogPanel:
                'w-full max-w-5xl p-6 align-middle transform overflow-y-auto transition-all text-th-text-primary-100 rounded-3xl',
              transitionChild: 'fixed inset-0 bg-opacity-25 backdrop-brightness-90',
              content:
                'inset-0 fixed flex items-center justify-center p-4 min-h-full  overflow-y-auto',
            }}
          >
            <Carousel
              images={images}
              initialIndex={initialImageIndex}
              onClose={() => setIsOpenModal(false)}
            />
          </Modal>
        </div>
      ) : (
        <TNTWLContent item={note} setItem={setNote} />
      )}
    </div>
  )
}

export default Aquifer

const Carousel = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0

    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1

    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1

    const newIndex = isLastSlide ? 0 : currentIndex + 1

    setCurrentIndex(newIndex)
  }

  return (
    <div className="relative w-full flex items-center justify-center">
      <button
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-th-text-primary rounded-full p-1"
      >
        <PrevImage className="w-4 stroke-th-secondary-10" />{' '}
      </button>
      <div className="mb-4 absolute top-0 w-full">
        <div className="relative flex justify-center items-center">
          <h3 className="">{images[currentIndex].name}</h3>
          <Close
            className="absolute right-14  w-5 stroke-th-text-primary cursor-pointer"
            onClick={onClose}
          />
        </div>
      </div>
      <div className="max-w-full h-[70vh] text-center flex flex-col justify-center items-center py-8">
        <img
          src={images[currentIndex].url}
          alt={`Slide ${currentIndex}`}
          className="mx-auto px-12 object-contain h-full w-auto"
        />
      </div>

      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-th-text-primary rounded-full p-1"
      >
        <NextImage className="w-4 stroke-th-secondary-10" />{' '}
      </button>
    </div>
  )
}

const axios = require('axios')
const apiKey = process.env.NEXT_API_KEY_AQUAPHOR
const url = 'https://api.aquifer.bible/resources/search'

export default async function allresources(req, res) {
  const { query, method } = req
  const fetchImageDetails = async (id) => {
    console.log(id)
    try {
      const response = await axios.get('https://api.aquifer.bible/resources/' + id, {
        headers: {
          'api-key': apiKey,
        },
      })
      return await response.data
    } catch (error) {
      console.log(error)
    }

    // if (!response.ok) {
    //   throw new Error('Network response was not ok')
    // }
  }
  switch (method) {
    case 'GET':
      const params = {
        startChapter: query.chapterNum,
        endChapter: query.chapterNum,
        startVerse: query.verse === 'whole' ? 0 : query.verse,
        endVerse: query.verse === 'whole' ? 0 : query.verse,
        bookCode: query.bookCode,
        languageId: 1,
        resourceType: 'images',
      }
      try {
        const resources = await axios.get(url, {
          headers: {
            'api-key': apiKey,
          },
          params: params,
        })
        console.log('dfsfd', resources.data)
        const imageIds = resources.data.items.map((resource) => resource.id)
        console.log({ imageIds })

        // return
        const fetchImages = async () => {
          const fetchedImages = []

          for (const id of imageIds) {
            try {
              const imageData = await fetchImageDetails(id)

              fetchedImages.push(imageData)
            } catch (error) {
              console.error('There was a problem fetching image data:', error)
            }
          }
          console.log(fetchedImages)
          return fetchedImages
        }
        const resp = await fetchImages()
        return res.status(200).json(resp)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

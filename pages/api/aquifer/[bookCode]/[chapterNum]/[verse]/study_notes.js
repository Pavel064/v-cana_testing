const axios = require('axios')
const apiKey = process.env.NEXT_API_KEY_AQUAPHOR
const url = 'https://api.aquifer.bible/resources/search'
export default async function allresources(req, res) {
  const { query, method } = req
  switch (method) {
    case 'GET':
      const params = {
        startChapter: query.chapterNum,
        endChapter: query.chapterNum,
        startVerse: query.verse === 'whole' ? 0 : query.verse,
        endVerse: query.verse === 'whole' ? 0 : query.verse,
        bookCode: query.bookCode,
        languageId: 1,
        resourceType: 'Dictionary',
      }
      try {
        const resources = await axios.get(url, {
          headers: {
            'api-key': apiKey,
          },
          params: params,
        })
        return res.status(200).json(resources.data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

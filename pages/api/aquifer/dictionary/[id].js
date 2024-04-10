const axios = require('axios')
const apiKey = process.env.NEXT_API_KEY_AQUAPHOR
const url = 'https://api.aquifer.bible/resources/'
export default async function allresources(req, res) {
  const { query, method } = req
  switch (method) {
    case 'GET':
      try {
        const image = await axios.get(url + query.id + '?contentTextType=Markdown', {
          headers: {
            'api-key': apiKey,
          },
        })
        return res.status(200).json(image.data)
      } catch (error) {
        return res.status(404).json({ error })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

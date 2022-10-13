import { supabase } from 'utils/supabaseClient'

/** TODO проверить */
export default async function notesHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const { body, method } = req
  switch (method) {
    case 'POST':
      try {
        const { id, project_id } = body
        // TODO валидацию
        const { data, error } = await supabase.from('team_notes').insert([
          {
            id,
            project_id,
            title: 'new note',
            data: {
              blocks: [
                {
                  type: 'paragraph',
                  data: {},
                },
              ],
            },
          },
        ])
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(404).json({ error })
        return
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

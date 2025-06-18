import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password, firstName, lastName, mode } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) return res.status(400).json({ error: error.message })

      await supabase.from('profiles').insert([
        { id: data.user?.id, first_name: firstName, last_name: lastName },
      ])

      return res.status(200).json({ user: data.user })
    }

    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) return res.status(401).json({ error: error.message })

      return res.status(200).json({ user: data.user })
    }

    return res.status(400).json({ error: 'Invalid mode' })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}

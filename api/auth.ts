import { createClient } from '@supabase/supabase-js'

console.log("🔧 ENV:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET: process.env.SUPABASE_SECRET?.slice(0, 10) + "..."
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET!
)

export default async function handler(req: any, res: any) {
  console.log("📨 Incoming request:", req.body)

  const { email, password, firstName, lastName, mode } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    console.log("🔁 Mode:", mode)

    if (mode === 'signup') {
      console.log("👤 Signing up:", email)
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        console.error("❌ Signup error:", error.message)
        return res.status(400).json({ error: error.message })
      }

      console.log("✅ Signup success:", data.user?.id)

      const insert = await supabase.from('profiles').insert([
        { id: data.user?.id, first_name: firstName, last_name: lastName },
      ])

      console.log("📄 Insert result:", insert)

      return res.status(200).json({ user: data.user })
    }

    if (mode === 'signin') {
      console.log("🔐 Signing in:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("❌ Signin error:", error.message)
        return res.status(401).json({ error: error.message })
      }

      return res.status(200).json({ user: data.user })
    }

    return res.status(400).json({ error: 'Invalid mode' })
  } catch (err: any) {
    console.error("💥 Unexpected server error:", err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}

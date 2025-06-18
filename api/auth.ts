import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET!
)

export default async function handler(req: Request) {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", {
            status: 405,
            headers: { "Access-Control-Allow-Origin": "*" },
        })
    }

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json",
    }

    // Handle preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers,
        })
    }

    let body: any
    try {
        body = await req.json()
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers,
        })
    }

    const { email, password, firstName, lastName, mode } = body

    if (!email || !password || !mode) {
        return new Response(
            JSON.stringify({ error: "Missing fields" }),
            { status: 400, headers }
        )
    }

    let result

    if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers,
            })
        }

        const user = data.user

        if (user) {
            await supabase.from("profiles").insert([
                {
                    id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                },
            ])
        }

        result = { user }
    } else if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers,
            })
        }

        result = { user: data.user }
    } else {
        return new Response(JSON.stringify({ error: "Invalid mode" }), {
            status: 400,
            headers,
        })
    }

    return new Response(JSON.stringify(result), {
        status: 200,
        headers,
    })
}

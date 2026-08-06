export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = body.token

    if (!token) {
      return Response.json({
        success: false,
        error: "MISSING_TOKEN",
      })
    }

    const GAS_URL = process.env.GAS_API_URL
    if (!GAS_URL) {
      console.error("GAS_API_URL is not defined")
      return Response.json({
        success: false,
        error: "SERVER_ERROR",
      })
    }

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "validate_session",
        token,
      }),
    })

    const data = await res.json()

    return Response.json({
      success: data.success,
      data: data.data,
      error: data.error,
    })
  } catch (err) {
    console.error("VALIDATE SESSION ERROR:", err)
    return Response.json({
      success: false,
      error: "SERVER_ERROR",
    })
  }
}
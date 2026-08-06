export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("VERIFY ACCESS BODY:", body)

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "verify_access",
        ...body,
      }),
    })

    const data = await res.json()

    console.log("APPS SCRIPT VERIFY RAW:", data)

    return Response.json({
      success: data.success,
      data: data.data,
      error: data.error,
    })

  } catch (err) {
    console.error("VERIFY API ERROR:", err)
    return Response.json({
      success: false,
      error: "SERVER_ERROR",
    })
  }
}
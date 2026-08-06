export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("=== ACTIVATE CODE REQUEST BODY ===", body)

    const GAS_URL = process.env.GAS_API_URL
    if (!GAS_URL) {
      console.error("GAS_API_URL is not defined")
      return Response.json({ success: false, error: "SERVER_ERROR" })
    }

    console.log("Calling GAS URL:", GAS_URL)

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate_code", ...body }),
    })

    console.log("GAS Response Status:", res.status, res.statusText)

    const rawText = await res.text()
    console.log("GAS RAW RESPONSE TEXT:", rawText)

    let data
    try {
      data = JSON.parse(rawText)
    } catch (e) {
      console.error("Failed to parse JSON from GAS", e)
      return Response.json({ success: false, error: "SERVER_ERROR" })
    }

    console.log("Parsed GAS data:", data)

    return Response.json({
      success: data.success,
      data: data.data,
      error: data.error,
    })
  } catch (err) {
    console.error("API ERROR:", err)
    return Response.json({ success: false, error: "SERVER_ERROR" })
  }
}
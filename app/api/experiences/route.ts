import { NextResponse } from "next/server"
import { experiences } from "@/lib/data/experiences"

export async function GET() {
  return NextResponse.json(experiences)
}

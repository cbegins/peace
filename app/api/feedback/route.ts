import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json()

    // Create feedback directory if it doesn't exist
    const feedbackDir = join(process.cwd(), "feedback")
    try {
      await mkdir(feedbackDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `feedback-${timestamp}.json`
    const filepath = join(feedbackDir, filename)

    // Write feedback to file
    await writeFile(filepath, JSON.stringify(feedbackData, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save feedback:", error)
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
  }
}

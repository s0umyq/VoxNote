import { NextRequest, NextResponse } from "next/server";
import { analyzeAudio, analyzeTranscript } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const transcript = String(form.get("transcript") || "").trim();
    const audio = form.get("audio");
    if (audio instanceof File && audio.size > 0) {
      const maxMb = Number(process.env.MAX_AUDIO_MB || 15);
      if (audio.size > maxMb * 1024 * 1024) {
        return NextResponse.json({ error: `Audio exceeds the ${maxMb} MB MVP limit. Upload a smaller file or paste its transcript.` }, { status: 413 });
      }
      if (!audio.type.startsWith("audio/")) return NextResponse.json({ error: "Please upload a supported audio file." }, { status: 400 });
      const data = await analyzeAudio(audio);
      return NextResponse.json(data);
    }
    if (!transcript) return NextResponse.json({ error: "Upload an audio file or paste a transcript." }, { status: 400 });
    if (transcript.length > 180000) return NextResponse.json({ error: "Transcript is too long. Please split it into smaller sections." }, { status: 413 });
    return NextResponse.json(await analyzeTranscript(transcript));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
---
name: youtube-transcript
description: Extracts transcripts, subtitles, and caption text from YouTube videos. Use when the user shares a YouTube URL/video id or asks for a video summary, transcript, subtitles, or captions.
---

# YouTube Transcript

Use this skill whenever the user gives a YouTube link/video id or asks to summarize a YouTube video.

## Workflow
1. If the input looks like a YouTube URL (`youtube.com/watch`, `youtu.be`) or a video id, use this skill first.
2. Run the transcript script.
3. Save, convert, or summarize the transcript.

## Script

Default readable transcript:

```bash
node scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID"
```

Choose language:

```bash
node scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --lang en
```

Plain text without timestamps:

```bash
node scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --plain
```

JSON output:

```bash
node scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --json
```

SRT or VTT output:

```bash
node scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --srt
node scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --vtt
```

Write to a file:

```bash
node scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --output transcript.txt
```

## Requirements
- Internet access
- `npm install` once for local development, or install the package with `pi install .`
- The video must have captions, auto-captions, or transcript availability

## Notes
- The script uses the `youtube-transcript` package first.
- It falls back to YouTube's web transcript flow when needed.
- If no transcript exists or captions are disabled, say so clearly and then optionally summarize from the title/metadata.
- Prefer official captions when available.

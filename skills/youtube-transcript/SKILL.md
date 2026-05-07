---
name: youtube-transcript
description: Extracts transcripts, subtitles, and caption text from YouTube videos. Use when you need a readable transcript, subtitle file, or caption text from a YouTube URL or video id.
---

# YouTube Transcript

Use this skill to turn a YouTube video into transcript text.

## Workflow
1. Get the YouTube URL or video id.
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
- If no transcript exists, the script exits with a clear error.
- Prefer official captions when available.

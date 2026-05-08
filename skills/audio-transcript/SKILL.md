---
name: audio-transcript
description: Transcribes local audio or video files into text. Use when the user shares an audio/video file path or asks to transcribe a recording.
---

# Audio Transcript

Use this skill when the user wants text from a local audio or video file.

## Workflow
1. Confirm the file path is local and readable.
2. Convert the media to a mono 16 kHz WAV with ffmpeg.
3. Send it to the transcription script.
4. Return the transcript, or JSON if requested.

## Script

Default transcript:

```bash
node scripts/audio-transcript.mjs "/path/to/file.m4a"
```

With a language hint:

```bash
node scripts/audio-transcript.mjs "/path/to/file.m4a" --lang en
```

JSON output with segments:

```bash
node scripts/audio-transcript.mjs "/path/to/file.m4a" --json
```

Write to a file:

```bash
node scripts/audio-transcript.mjs "/path/to/file.m4a" --output transcript.txt
```

Custom model:

```bash
node scripts/audio-transcript.mjs "/path/to/file.m4a" --model whisper-1
```

## Requirements
- `ffmpeg` installed
- `OPENAI_API_KEY` set
- Internet access

## Notes
- The script normalizes audio before upload for better transcription quality.
- Common audio and video formats are supported as long as ffmpeg can read them.
- If transcription fails, report the file path and the error clearly.

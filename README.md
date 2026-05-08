# huski-pi

Reusable [pi](https://pi.dev) package for Huski workflows, skills, extensions, and web tools.

## What this package includes
- `extensions/` for TypeScript extensions
- `skills/` for reusable Agent Skills
  - `web-fetch` — shared skill for online research
  - `youtube-transcript` — YouTube subtitle/transcript extraction (use for YouTube links, ids, and video summaries)
  - `audio-transcript` — local audio/video file transcription
- `web_search` and `web_fetch` tools for direct model access

## Repository layout

```text
extensions/
skills/
package.json
README.md
```

## Build and run

### 1) Install dependencies

```bash
npm install
```

This pulls the transcript helper used by the YouTube transcript skill.

### 2) Run locally
Use it directly from this folder:

```bash
pi -e .
```

### 3) Install into your pi config

```bash
pi install .
pi
```

### 4) Reload after edits
Inside pi, run:

```text
/reload
```

## How to extend

### Add a new skill
1. Create `skills/<name>/SKILL.md`
2. Add helper scripts in `skills/<name>/scripts/` if needed
3. Keep the skill generic and reusable

Current skills:
- `huski-workflow`
- `web-fetch`
- `youtube-transcript`
- `audio-transcript`

### YouTube transcript skill

Use this skill first when a user pastes a YouTube URL or asks for a summary/transcript of a YouTube video.

```bash
node skills/youtube-transcript/scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID"
node skills/youtube-transcript/scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --lang en --plain
node skills/youtube-transcript/scripts/youtube-transcript.mjs "https://www.youtube.com/watch?v=VIDEO_ID" --json
```

### Audio transcript skill

Use this skill for local audio or video files.

```bash
node skills/audio-transcript/scripts/audio-transcript.mjs "/path/to/file.m4a"
node skills/audio-transcript/scripts/audio-transcript.mjs "/path/to/file.m4a" --lang en --json
node skills/audio-transcript/scripts/audio-transcript.mjs "/path/to/file.m4a" --output transcript.txt
```

### Add a new extension
1. Add `extensions/<name>.ts` or `extensions/<name>/index.ts`
2. Export a default function that receives `ExtensionAPI`
3. Register tools, commands, or event hooks

## Web fetch usage

The included web tools can be used directly by the model:
- `web_search`
- `web_fetch`

Example manual fetch:

```bash
node skills/web-fetch/scripts/fetch-url.mjs https://example.com
```

## Publishable package notes

This repo is structured like a pi package, so it can later be published to npm or installed from git.

If you publish it:
- keep `keywords` containing `pi-package`
- keep the `pi` manifest in `package.json`
- include `extensions/` and `skills/` in the published files

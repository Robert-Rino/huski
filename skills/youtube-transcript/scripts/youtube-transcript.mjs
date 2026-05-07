#!/usr/bin/env node

import fs from "node:fs";
import { fetchTranscript, YoutubeTranscriptError, YoutubeTranscriptDisabledError, YoutubeTranscriptNotAvailableLanguageError, YoutubeTranscriptNotAvailableError, YoutubeTranscriptTooManyRequestError, YoutubeTranscriptVideoUnavailableError } from "youtube-transcript";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const plain = args.includes("--plain") || args.includes("--no-timestamps");
const json = args.includes("--json");
const srt = args.includes("--srt");
const vtt = args.includes("--vtt");
const langIndex = args.indexOf("--lang");
const outputIndex = args.indexOf("--output");
const lang = langIndex >= 0 ? args[langIndex + 1] : "";
const outputFile = outputIndex >= 0 ? args[outputIndex + 1] : "";

process.stdout.on("error", (err) => {
  if (err?.code === "EPIPE") process.exit(0);
  throw err;
});

if (!input) {
  console.error(
    'Usage: node scripts/youtube-transcript.mjs <youtube-url|video-id> [--lang en] [--plain] [--json|--srt|--vtt] [--output file]',
  );
  process.exit(1);
}

function toSeconds(value) {
  return Math.max(0, Number(value) || 0);
}

function formatTime(seconds) {
  const total = Math.floor(toSeconds(seconds));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function stripText(text) {
  return String(text)
    .replace(/\s+/g, " ")
    .trim();
}

function escapeSrt(text) {
  return String(text).replace(/\r?\n/g, " ").trim();
}

function renderText(transcript, includeTimestamps) {
  return transcript
    .map((chunk) => (includeTimestamps ? `[${formatTime(chunk.offset / 1000)}] ${stripText(chunk.text)}` : stripText(chunk.text)))
    .join(includeTimestamps ? "\n" : " ")
    .trim();
}

function renderSrt(transcript) {
  return transcript
    .map((chunk, index) => {
      const start = formatSrtTime(chunk.offset / 1000);
      const end = formatSrtTime((chunk.offset + chunk.duration) / 1000);
      return `${index + 1}\n${start} --> ${end}\n${escapeSrt(chunk.text)}\n`;
    })
    .join("\n")
    .trim();
}

function renderVtt(transcript) {
  return [
    "WEBVTT",
    "",
    ...transcript.map((chunk) => {
      const start = formatTimecode(chunk.offset / 1000, ".");
      const end = formatTimecode((chunk.offset + chunk.duration) / 1000, ".");
      return `${start} --> ${end}\n${escapeSrt(chunk.text)}`;
    }),
  ].join("\n").trim();
}

function formatSrtTime(seconds) {
  return formatTimecode(seconds, ",");
}

function formatTimecode(seconds, separator) {
  const total = Math.max(0, Math.floor(toSeconds(seconds)));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  const ms = String(Math.round((toSeconds(seconds) - total) * 1000)).padStart(3, "0");
  return `${h}:${m}:${s}${separator}${ms}`;
}

function printError(err) {
  if (err instanceof YoutubeTranscriptNotAvailableLanguageError) {
    console.error(`No transcript in language ${lang}.`);
    console.error(`Available languages: ${err.message.match(/Available languages: (.*)$/)?.[1] || "unknown"}`);
    return;
  }
  if (err instanceof YoutubeTranscriptDisabledError) {
    console.error("Transcript is disabled on this video.");
    return;
  }
  if (err instanceof YoutubeTranscriptVideoUnavailableError) {
    console.error("Video is unavailable.");
    return;
  }
  if (err instanceof YoutubeTranscriptTooManyRequestError) {
    console.error("YouTube rate-limited this request. Try again later or use yt-dlp.");
    return;
  }
  if (err instanceof YoutubeTranscriptNotAvailableError) {
    console.error("No transcript is available for this video.");
    return;
  }
  if (err instanceof YoutubeTranscriptError) {
    console.error(err.message);
    return;
  }
  console.error(err?.message || String(err));
}

try {
  const transcript = await fetchTranscript(input, lang ? { lang } : undefined);

  let output;
  if (json) output = `${JSON.stringify(transcript, null, 2)}\n`;
  else if (srt) output = `${renderSrt(transcript)}\n`;
  else if (vtt) output = `${renderVtt(transcript)}\n`;
  else output = `${renderText(transcript, !plain)}\n`;

  if (outputFile) fs.writeFileSync(outputFile, output, "utf8");
  else process.stdout.write(output);
} catch (err) {
  printError(err);
  process.exit(1);
}

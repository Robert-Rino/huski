#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const json = args.includes("--json");
const langIndex = args.indexOf("--lang");
const outputIndex = args.indexOf("--output");
const modelIndex = args.indexOf("--model");
const lang = langIndex >= 0 ? args[langIndex + 1] : "";
const outputFile = outputIndex >= 0 ? args[outputIndex + 1] : "";
const model = modelIndex >= 0 ? args[modelIndex + 1] : "whisper-1";

process.stdout.on("error", (err) => {
  if (err?.code === "EPIPE") process.exit(0);
  throw err;
});

function usage() {
  console.error(
    'Usage: node scripts/audio-transcript.mjs <audio-or-video-file> [--lang en] [--json] [--model whisper-1] [--output file]',
  );
}

function cleanupDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

function ensureFileExists(filePath) {
  if (!filePath) {
    usage();
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    console.error(`Not a file: ${filePath}`);
    process.exit(1);
  }
}

function normalizeAudio(inputPath, outputPath) {
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-i", inputPath, "-vn", "-ac", "1", "-ar", "16000", "-f", "wav", outputPath],
      { stdio: "ignore" },
    );
  } catch (err) {
    console.error("Failed to convert media with ffmpeg.");
    console.error("Make sure ffmpeg is installed and the file is readable.");
    if (err?.message) console.error(err.message);
    process.exit(1);
  }
}

async function transcribe(audioPath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set.");
    console.error("This skill currently uses the OpenAI transcription API.");
    process.exit(1);
  }

  const bytes = await readFile(audioPath);
  const form = new FormData();
  form.append("model", model);
  form.append("file", new Blob([bytes], { type: "audio/wav" }), path.basename(audioPath));
  form.append("response_format", json ? "verbose_json" : "text");
  if (lang) form.append("language", lang);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `OpenAI transcription request failed with status ${res.status}`);
  }

  return json ? JSON.parse(text) : text;
}

if (!input) {
  usage();
  process.exit(1);
}

ensureFileExists(input);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `audio-transcript-${randomUUID()}-`));
const wavPath = path.join(tempDir, "normalized.wav");

try {
  normalizeAudio(input, wavPath);
  const result = await transcribe(wavPath);

  const output = json ? `${JSON.stringify(result, null, 2)}\n` : `${String(result).trim()}\n`;
  if (outputFile) fs.writeFileSync(outputFile, output, "utf8");
  else process.stdout.write(output);
} catch (err) {
  console.error(err?.message || String(err));
  process.exit(1);
} finally {
  cleanupDir(tempDir);
}

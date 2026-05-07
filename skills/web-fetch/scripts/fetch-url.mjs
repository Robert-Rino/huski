#!/usr/bin/env node

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
const raw = args.includes("--raw");

if (!url) {
  console.error("Usage: node scripts/fetch-url.mjs <url> [--raw]");
  process.exit(1);
}

const res = await fetch(url, {
  headers: {
    "user-agent": "huski-pi-web-fetch/0.2",
    accept: raw ? "text/html,*/*" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  },
});

if (!res.ok) {
  console.error(`HTTP ${res.status} ${res.statusText}`);
  process.exit(1);
}

const contentType = res.headers.get("content-type") || "";
const text = await res.text();

if (raw || !contentType.includes("text/html")) {
  console.log(text);
  process.exit(0);
}

const titleMatch = text.match(/<title[^>]*>(.*?)<\/title>/is);
const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "(no title)";

const stripped = text
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

console.log(`# ${title}\n`);
console.log(stripped);

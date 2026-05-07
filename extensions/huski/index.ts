import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";

const USER_AGENT = "huski-pi-web/0.2";

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

function cleanHtml(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, " $1 ")
      .replace(/<img[^>]*>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n- ")
      .replace(/<h([1-6])[^>]*>/gi, (_m, n) => `\n\n${"#".repeat(Number(n))} `)
      .replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => `[${text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}](${href})`)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? cleanHtml(match[1]) : "(no title)";
}

function truncate(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[truncated]`;
}

function resolveDuckDuckGoUrl(href: string) {
  try {
    const url = new URL(href, "https://html.duckduckgo.com");
    const redirected = url.searchParams.get("uddg");
    return redirected ? decodeURIComponent(redirected) : url.toString();
  } catch {
    return href;
  }
}

async function webSearch(query: string, maxResults: number) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
  });

  if (!res.ok) {
    throw new Error(`Search failed: HTTP ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const results: Array<{ title: string; url: string; snippet: string }> = [];
  const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const title = cleanHtml(match[2]);
    const snippet = cleanHtml(match[3]);
    results.push({ title, url: resolveDuckDuckGoUrl(match[1]), snippet });
    if (results.length >= maxResults) break;
  }

  if (!results.length) {
    const fallbackRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = fallbackRe.exec(html))) {
      const title = cleanHtml(match[2]);
      results.push({ title, url: resolveDuckDuckGoUrl(match[1]), snippet: "" });
      if (results.length >= maxResults) break;
    }
  }

  return results;
}

async function webFetch(url: string, maxChars: number) {
  const target = normalizeUrl(url);
  const res = await fetch(target, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: HTTP ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  const body = await res.text();

  if (!contentType.includes("text/html")) {
    return {
      title: target,
      url: res.url || target,
      contentType,
      text: truncate(body, maxChars),
    };
  }

  const title = extractTitle(body);
  const text = truncate(cleanHtml(body), maxChars);

  return {
    title,
    url: res.url || target,
    contentType,
    text,
  };
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.setStatus("huski", "web tools loaded");
  });

  pi.registerCommand("huski", {
    description: "Show huski-pi package info",
    handler: async (_args, ctx) => {
      ctx.ui.notify("huski-pi web tools are active.", "info");
    },
  });

  pi.registerTool({
    name: "web_search",
    label: "Web Search",
    description: "Search the web for a query and return top results.",
    parameters: Type.Object({
      query: Type.String({ description: "Search query" }),
      maxResults: Type.Optional(Type.Number({ minimum: 1, maximum: 10, default: 5 })),
    }),
    async execute(_toolCallId, params) {
      const results = await webSearch(params.query, params.maxResults ?? 5);
      const lines = results.length
        ? results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}${r.snippet ? `\n   ${r.snippet}` : ""}`).join("\n\n")
        : "No results found.";
      return {
        content: [{ type: "text", text: lines }],
        details: { results },
      };
    },
  });

  pi.registerTool({
    name: "web_fetch",
    label: "Web Fetch",
    description: "Fetch a web page and return cleaned markdown-like text.",
    parameters: Type.Object({
      url: Type.String({ description: "Page URL" }),
      maxChars: Type.Optional(Type.Number({ minimum: 500, maximum: 50000, default: 12000 })),
    }),
    async execute(_toolCallId, params) {
      const page = await webFetch(params.url, params.maxChars ?? 12000);
      const text = `# ${page.title}\n\nSource: ${page.url}\nType: ${page.contentType}\n\n${page.text}`;
      return {
        content: [{ type: "text", text }],
        details: page,
      };
    },
  });
}

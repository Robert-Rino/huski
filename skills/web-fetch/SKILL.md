---
name: web-fetch
description: Shared web research skill for fetching pages and finding online information. Use when a task needs current docs, facts, or source pages.
---

# Web Fetch

Use this as the base online research skill for the package.

## Goal
- Find the right page
- Fetch the page
- Extract readable text
- Return source URLs with the answer

## Preferred tools
- `web_search` to find pages
- `web_fetch` to read a page

## Workflow
1. Search for the target site/page.
2. Fetch the best result.
3. Summarize only what the page says.
4. Keep the URL in the answer.

## Examples
Search:
```text
Use web_search for: "pi package skills docs"
```

Fetch:
```text
Use web_fetch for: "https://pi.dev/docs/skills"
```

## Notes
- Prefer primary sources.
- If the page is blocked or empty, try a different URL.
- Keep this skill generic so other skills can reuse it.

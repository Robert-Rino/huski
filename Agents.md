# Agents.md

This repository is a reusable Pi package scaffold.

## Goal
- Build and maintain custom Pi skills, extensions, and reusable web tools.
- Keep the package simple, reusable, and easy to publish later.

## Current package contents
- `extensions/huski/index.ts` — extension with `web_search` and `web_fetch` tools
- `skills/huski-workflow/SKILL.md` — repo/workflow guidance
- `skills/web-fetch/SKILL.md` — shared online info fetching skill
- `skills/youtube-transcript/SKILL.md` — YouTube transcript extraction skill

## How to work in this repo
- Prefer editing existing files over creating duplicates.
- Keep skills self-contained in `skills/<name>/`.
- Keep extensions in `extensions/`.
- Update `README.md` when behavior or usage changes.
- If a change affects package structure, update `package.json` too.

## Build / run
- Load locally: `pi -e .`
- Install into Pi: `pi install .`
- After changes in Pi, run `/reload`

## Web research rules
- Prefer primary sources.
- For online facts, fetch the official page when possible.
- Return source URLs when summarizing web content.

## Coding conventions
- Use TypeScript for extensions.
- Use clear, reusable names.
- Keep helper scripts in `scripts/`.
- Avoid unnecessary dependencies unless they make a skill reliably work.

## When adding a skill
- Create `skills/<skill-name>/SKILL.md`
- Use lowercase hyphenated names
- Make the description specific
- Add helper scripts or references only if needed

## When adding an extension
- Create `extensions/<name>.ts` or `extensions/<name>/index.ts`
- Register tools, commands, or event hooks as needed
- Keep the extension focused on one job

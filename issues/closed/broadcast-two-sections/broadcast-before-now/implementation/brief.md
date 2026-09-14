# Implementation brief: broadcast-before-now

## 1. Goal

Cut the completed-issue broadcast from three sections to two (`Before`, `Now`) and retarget the writing rules at non-developer readers, per plan decisions D1–D5. Two sequential units: `brief-1.md` covers the sender and its tests (D1–D3); `brief-2.md` covers SKILL.md and the merge guide (D4–D5).

## 2. Acceptance criteria

1. `bun test` inside `skills/broadcast-issue/` passes with two-key fixtures; a `next` key or missing `now` fails validation before any request.
2. `bun run typecheck` inside `skills/broadcast-issue/` passes.
3. Rendered message starts `## 🧪 ` + summary + ` (MM/DD/YY)`, then `**Before**`, then `**Now**`, no `**Next**`; chunk-splitting coverage retained.
4. SKILL.md states the two-section rules, headline rule, extended forbidden list and new scaling rule; JSON example has `summary`, `before`, `now` only.
5. `docs/guide/merge.html` shows the two-section shape and scaling rule; `grep -rn '\*\*Next\*\*' skills docs README.md --exclude-dir=node_modules` returns nothing.
6. No file under `issues/` changes on the leaf branch.

## 3. Read-first list

- `issues/open/broadcast-two-sections/broadcast-before-now/plan.md` (registered checkout) — binding decisions.
- `skills/broadcast-issue/scripts/discord-send.ts`, `discord-send.test.ts`, `SKILL.md`, `docs/guide/merge.html` — owned surfaces.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

See `brief-1.md` and `brief-2.md`. Payload shape: `{"summary": string, "before": string[], "now": string[]}` strict; rendered parts title/`**Before**`/`**Now**` joined by blank lines, split under 2000 chars.

## 5. Do-not

- No changes to retry, redaction, env reading, target validation, CLI, `skills/merge-issue/SKILL.md`, `README.md`, other guide pages, or anything under `issues/`.
- No mechanical readability guard in the sender; schema validates structure only.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. `brief-1.md`: sender + tests.
2. `brief-2.md`: SKILL.md + merge.html.

## 7. Commands

Workers: `bun install --cwd skills/broadcast-issue --frozen-lockfile` then `cd skills/broadcast-issue && bun test` (brief-1); the `**Next**` grep (brief-2). B runs the full suite and all blocking checks after.

## 8. Done-when

All six criteria hold with pasted command evidence.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Review A: broadcast-before-now

Base: 0147d10483aa22dd3ae1d4ca5d71c00b0a12730a
Reviewed head: c227248 (branch `broadcast-before-now`)
Debate: no — no positions/rebuttals, none expected.

## Verification evidence

- `bun install --cwd skills/broadcast-issue --frozen-lockfile`: 7 packages installed.
- `cd skills/broadcast-issue && bun test`: 14 pass, 0 fail, 80 expects.
- `cd skills/broadcast-issue && bun run typecheck` (tsc -p tsconfig.json): clean.
- `bun run format`: all files unchanged.
- `bun run typecheck` (root tsc --noEmit): clean.
- `bun test` (root): 223 pass, 0 fail.
- `AKROGON_BASE=0147d10... bun test --changed`: 4 changed files, no test files affected.
- `grep -rn '\*\*Next\*\*' skills docs README.md --exclude-dir=node_modules`: no matches (exit 1).
- `git status --porcelain issues/` and `git diff -- issues/`: empty; no AREA.md files in diff.

## Findings vs plan

- D1: `next` removed from `Message` and `messageSchema`; strict object still rejects unknown keys. Confirmed.
- D2: title and reduce unchanged; `chunks()` emits title + Before + Now. Confirmed.
- D3: two-chunk fixtures, payload, partial-delivery `[c0,c1,c1]`/`[c0,c1]`, exhaustion `[0,1]` with `unattempted: 1 - delivered`, recovered-retries `[c0,c0,c1,c1]`/`[c0,c1,c1]`, split test, validation cases (extra `next` key, missing `now`), and `not.toContain('**Next**')` all match the plan. The `**${'Next'}**` interpolation keeps the literal out of the grep surface; functionally identical.
- D4: SKILL.md states two-section rules, `before` always present naming what was missing for additions, `now` states what is better not what code changed, headline rule, extended forbidden list (file names, command names, code identifiers, unexplained acronyms added), new scaling rule, two-key JSON example. Confirmed.
- D5: merge.html metric `2 / sections: before, now`, `**Next**` block removed from `<pre>`, scaling paragraph replaced. Confirmed.
- Do-not scope respected: no changes to retry, redaction, env reading, targets, CLI, merge-issue SKILL.md, README.md, or `issues/`.

## Nits

- N1: SKILL.md second paragraph now reads "Detail scales with the work: scale detail to what a broad-audience reader needs" — the lead-in duplicates the new rule's verb. Cosmetic; a shorter lead-in would read cleaner.

## Verdict

nits

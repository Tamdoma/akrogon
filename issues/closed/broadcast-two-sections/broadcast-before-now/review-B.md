# Review B: broadcast-before-now

Base: `0147d10483aa22dd3ae1d4ca5d71c00b0a12730a` (AKROGON_BASE). Reviewed head: `c227248` on branch `broadcast-before-now`. Worktree clean, no `issues/` files on the branch.

## Scope checked

Four files: `discord-send.ts`, `discord-send.test.ts`, `SKILL.md`, `docs/guide/merge.html`. No `AREA.md` in the diff. `skills/merge-issue/SKILL.md`, `README.md` and other guide pages name the broadcast without its shape; verified by grep, correctly untouched per design exclusions.

## Evidence

- `cd skills/broadcast-issue && bun test`: 14 pass, 0 fail, 80 expect() calls (rerun by reviewer).
- `bun run typecheck` in the skill folder: clean.
- `grep -rn '\*\*Next\*\*' skills docs README.md --exclude-dir=node_modules`: no output, exit 1.
- Implementation report: root `bun test` 223/223, root typecheck and format clean.

## Findings

None.

- Schema is `z.strictObject({summary, before, now})`: a `next` key and a missing `now` both fail before any request, covered by the validation test including the restored oversized-bullet case.
- `chunks()` renders title/`**Before**`/`**Now**`; the boundary reduce and 2000-char guard are unchanged, so splitting still works across the two parts.
- The `` `**${'Next'}**` `` interpolation in the negative assertion is deliberate: the done-criterion grep forbids the literal anywhere under `skills docs README.md`, and the assertion still proves the rendered message lacks the marker. Not a defect.
- SKILL.md carries all required rules: two sections, `Before` always present (names what was missing for additions), `Now` states what is better about the system, one-plain-sentence headline, extended forbidden list, readability scaling rule, two-key JSON example.
- merge.html metric, example and scaling paragraph match the two-section shape.

## Verdict

ready

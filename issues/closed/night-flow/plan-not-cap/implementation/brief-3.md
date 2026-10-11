# Sub-brief 3: guide texts — cap language removal

## 1. Goal

Plan decisions D6, D7. Doc text changes only. `docs/guide/phases.md` and `docs/guide/setup.md` must describe no failure at a repair cap: the count still rises and stays visible, the leaf no longer fails at the configured value.

## 2. Acceptance criteria

1. `docs/guide/phases.md` contains no "repair cap", "failed at the cap", or "cap is exhausted" claim; it still says a handoff to A counts toward `fix_rounds` and recovery keeps the count.
2. `docs/guide/setup.md` `fix_rounds` bullet describes the direct-route bound, not a leaf failure cap.
3. `grep -rn "repair cap\|the cap\|exhausted" docs/guide/` returns no hit describing a fix-round cap (existing `exhausted` uses outside this meaning may be reported, not edited).

## 3. Read-first

- `docs/guide/phases.md` — line ~18 (verdict table paragraph), line ~76 (recovery paragraph), line ~108 (cap paragraph at the end of the check-issue section).
- `docs/guide/setup.md` — the `fix_rounds` bullet (~line 60).
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns `docs/guide/phases.md`, `docs/guide/setup.md`. No units must land first. No shared test resource.

Edits:

1. `docs/guide/phases.md` line ~18: `Only a handoff to A counts against the configured repair-round limit.` — the limit no longer fails the leaf; rewrite to state the handoff to A is counted (e.g. `Only a handoff to A increments the recorded repair count.`).
2. `docs/guide/phases.md` line ~76: `Recovery keeps the repair count (\`fix_rounds\`), so a leaf failed at the cap gets one more A repair and a B-only re-check on each recovery.` — drop the at-the-cap clause; keep that recovery keeps `fix_rounds` (e.g. `Recovery keeps the repair count (\`fix_rounds\`), so a re-check after a repair round stays B-only.`).
3. `docs/guide/phases.md` line ~108: `The configured repair cap prevents an endless review cycle and counts handoffs to A. Merge \`check.fix\` bounces count toward \`fix_rounds\` as well. If the cap is exhausted, the leaf fails with a recorded cause.` — rewrite: handoffs to A and merge `check.fix` bounces count toward `fix_rounds`, the count stays visible in `akrogon status`, and there is no cap that fails the leaf (one or two sentences, file's voice).
4. `docs/guide/setup.md` `fix_rounds` bullet: `**fix_rounds** limits review repair handoffs to A and merge \`check.fix\` bounces.` — rewrite to name what the key still bounds: `**fix_rounds** bounds the chart door's direct-route repair rounds; leaf handoffs and merge bounces are counted in \`fix_rounds\` and shown in status.`

Keep the guide's voice: short declarative sentences, no new sections.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/` (unit 2's job), `src/` (unit 1's job), other guide pages, or tests.
- Do not delete the `fix_rounds` bullet — the key stays in the schema and bounds direct-route repairs.
- Do not add a description of cap failure — that behavior is being removed.
- Text elsewhere in the guide describing a cap failure returns a mismatch with the line quoted; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the two files at the cited regions.
2. Apply the four edits.
3. Run `grep -rn "repair cap\|the cap\|exhausted\|fix_rounds" docs/guide/` and eyeball every remaining hit; none may describe a leaf failing at a round count.
4. Commit the two files in one commit.

Advisory size: 2 files, under 8 turns.

## 7. Commands

The grep check above; `bun install --frozen-lockfile` is not needed (markdown only, no changed tests).

## 8. Done-when, evidence and report

Both files edited, no cap-failure description remains, `fix_rounds` still described as the recorded count and the direct-route bound, one commit. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

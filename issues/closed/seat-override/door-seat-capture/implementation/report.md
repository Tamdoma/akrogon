# Implementation report: door-seat-capture

Base: `1c3a1ca08e1039f0061be4b7cae6826c5226a81e`. Head: `e5e6775` (see `git log`).

## Changed files and reasons

- `skills/chart-issues/assets/shapes.md` — criterion 1. Both index templates (EPIC.md, ISSUE.md) show the optional `slots:` front matter verbatim; the "Container indexes" sentence is amended to permit `slots:` as configuration; adjacent prose states the complete accepted shape (keys `a`/`b` only, each optional; exactly `{harness, model, effort}`; nonblank after trim; no `'`/`"` in decoded values; no other key at any level; `harness` names a machine `harnesses:` template), the literal `---` detection, the resolution order (ISSUE.md → EPIC.md → issues/config.yaml → machine config.yaml, nearest set seat wins), the before-any-`state.yaml` write order, and that `state.yaml` carries no seat field. Blank lines between paragraphs and code fences were removed to keep `grep -n restatement` output byte-identical at lines 126/130/138 per criterion 3.
- `skills/chart-issues/SKILL.md` — criterion 2. One clause in the first Handoff paragraph, same sentence style as the `debate` election: seat question asked at the handoff review only when intake, map or a leaf design names model-sensitive work; default writes no block; an answer goes into the operator's chosen owner index before any leaf `state.yaml`; review lists each leaf's effective seats.
- `docs/guide/chart.md` — criterion 3, first half. One sentence in "Turn the answers into a buildable contract" noting the door can ask about different execution seats per issue/epic when work names a different model or harness.

No other skill or doc changed. `git diff 1c3a1ca..HEAD --stat`: 3 files only.

## Commands run

- `bun test --changed="1c3a1ca..." --timeout=30000` after each cherry-pick: "changed file(s), but no test files are affected. 0 pass, 0 fail" — prose-only diff.
- `bun run format`: all files unchanged.
- `bun run typecheck` (`tsc --noEmit`): exit 0.
- `bun test --timeout=30000`: 533 pass, 0 fail, 25 files (~27s, wall time under one minute).
- Criterion 1 proof: `grep -n 'slots' shapes.md` shows the block in both templates (lines 111, 123) and the amended contract sentence (line 132); schema probe parsed the documented block through `indexSchema` (accepts `{a,b}`, rejects an extra key, accepts `model: 'opus'` decoding to `opus`).
- Criterion 2 proof: `grep -n 'seat' SKILL.md` line 67 shows the added clause inside the Handoff paragraph.
- Criterion 3 proof: `grep -n 'seat' docs/guide/chart.md` line 209 shows the one added sentence; `grep -n restatement` output diffed against base `1c3a1ca` — byte-identical for all four files (SKILL.md, questions.md, shapes.md, chart-usage.ts).
- Worker worktrees `door-seat-capture-u{1,2,3}` created under `worktree_store`, cherry-picked (`0d9ffd3`, `a28905b`, `4e95c77`), removed. A lane commit `e5e6775` reverts a temporary whitespace-restore commit `a4d5e08` after confirming sa-1's spacing already satisfied the literal restatement-line criterion.

## Wave execution

Plan wave 1 ran as three parallel workers (u1 shapes.md `2c9037b`, u2 SKILL.md `b3a1c2e`, u3 chart.md `d2c682c`), each in a detached worktree, each committing only its owned file. No conflicts on cherry-pick.

## Known limitations

- The seat-question rule is door guidance in prose; nothing enforces when the door asks. Schema enforcement lives in the merged `index-seats` resolver (`src/config.ts`), outside this leaf.
- shapes.md spacing between prose and code fences is tighter than the original style (forced by the byte-identical restatement criterion); rendering is identical.

## Unverified criteria

None.

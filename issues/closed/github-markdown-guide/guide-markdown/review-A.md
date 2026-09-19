# Review A: guide-markdown

Base: b1bdde3105a673cf57f350b8e3c636ce3b9eee6b
Head: 51c8e53 guide-markdown: markdown operator guide, link test, drop HTML guide and playwright
Verdict: fix

## Verification evidence

- `bun test`: 273 pass, 0 fail, 13 files (includes docs-links positive + 2 negative tests).
- `bun run typecheck` (`tsc --noEmit`): clean.
- `bun run format`: all files pass.
- `bash -n` on extracted `gacp()` from gacp.md: OK; body is verbatim the design script wrapped in `gacp() ( ... )`.
- `ls docs/guide/`: exactly 17 `.md`, zero `.html`/`.css`. `ls tests/browser` fails. `grep playwright package.json bun.lock tests/ docs/ README.md`: empty.
- tests/AREA.md paths all exist (helpers.ts, phase.test.ts, command-reference.test.ts, docs-links.test.ts, bunfig.toml).
- Spot-verified against src/: leaf depth 2-3 (state.ts:86-91), failed routes to all active phases (routing.ts:35-38), attempts reset on delivery / fail at 3 (next.ts:350-391), `next --all` inside vs outside repo (next.ts:674-682), blocked-by checked every dispatch (next.ts:534-542), sync eligible-records-only + staged-path refusal (sync.ts:11-33), phase command resets bookkeeping (phase.ts:95-112), four skill roots (install.ts:11-21), `--from` optional (akrogon.ts:32-37, init.ts:13-23), priority/slot ignored (state.ts:35-77), check.review A-only after fixes (routing.ts requiredSlots), merged/failed not counted (next.ts:270-276), AKROGON_BASE in panes (next.ts:309), worktree-path targeting (next.ts:582-615), foreign-leaf JSON report (next.ts:127-136), `herdr plugin log list --plugin` exists, issue-complete move + chart move + source close (phase.ts:136-168), broadcast 2000-char chunks (discord-send.ts:37,57), chart handoff marker + no `next` (chart-issues:57), seed issues_repo/origin (seed-issue:16-22), merge skill conflict/push/broadcast/tab-close flow.

## Fix findings

F1. `docs/guide/next.md` claims `akrogon next <slug>` prints the reason "blocked, hand-built, no seat" and "If it says no seat, max_active is full". Wrong: when `allocate` returns null (seat limit), `dispatchLeaf` returns 'waiting' and nothing is printed (src/next.ts:539-540). Only thrown errors print via `report` (next.ts:71-77): "Leaf dependencies are not merged" and "Hand-built leaf cannot be dispatched". A full machine prints silence, so the documented diagnostic does not exist. Violates done-criterion 3 (claim does not match src/).

F2. `docs/guide/in-practice.md` claims "a leaf that already has a tab keeps its tab — dispatch still checks blockers every time, but an already-running leaf will keep getting prompted for its current phase". Wrong: the blocked-by check (src/next.ts:534-537) runs before dispatch for every leaf including tabbed ones; a non-merged blocker returns 'waiting' and no prompt is sent. Adding a blocker to a running leaf does stop its next prompt. The guide teaches the opposite of the code. Violates done-criterion 3.

## Nits

N1. `docs/guide/idea.md:9` "That'ssue holds a leaf" — typo, should be "That issue".
N2. `docs/guide/parts.md` Fork row "every material question in it's taken" — "it's" should be "it is" (or reworded).
N3. `docs/guide/cheat.md:3` "I've it taped to my monitor" — missing "got".

## Notes

- Debate off; no positions/rebuttal artifacts expected.
- Report carries 16 corrections with file:line (≥12 required) and a walkthrough; both verified plausible against the pages.
- `problems.md` "or nothing because no seat" is accurate and consistent with F1's correction.

## Re-check after check.fix (head eef24a0)

Repair diff 51c8e53..eef24a0 inspected; only the four touched pages changed.

- F1 confirmed fixed: next.md now states errors print ("dependencies not merged", "hand-built can't be dispatched") and seat-limit waits are silent, matching src/next.ts:534-540 and report() at next.ts:71-77.
- F2 confirmed fixed: in-practice.md now states a blocker on a running leaf stops its next prompt, matching the pre-dispatch dependency check at src/next.ts:534-537.
- N1, N2, N3 confirmed fixed (idea.md, parts.md, cheat.md).
- No new defects in the repair diff. `bun test tests/docs-links.test.ts`: 3 pass.

Verdict: ready

## Merge evidence

- Rebase target: origin/main b1bdde3105a673cf57f350b8e3c636ce3b9eee6b (unchanged since base; rebase was a no-op, no conflicts).
- Checks in worktree: `bun run format` clean, `bun run typecheck` clean, `bun test` 273 pass / 0 fail, `bun test --changed` 7 pass / 0 fail.
- Push: `git push origin HEAD:main` fast-forward b1bdde3..eef24a0.
- Pushed head: eef24a0.

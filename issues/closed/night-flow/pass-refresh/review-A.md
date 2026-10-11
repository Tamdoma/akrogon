# Review A: pass-refresh

Base: 22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192 · Reviewed head: 0ca50b9

Evidence: `git diff 22ede6c..0ca50b9` read in full (4 files, skills/check-issue, implement-issue, AREA.md, phases.md + new test file); `bun test tests/skill-refresh.test.ts` 10/10 green; `bun test --timeout=30000` 826/826 green; `tsc --noEmit` clean; `bun run format` clean; `akrogon status` no `Missing:` lines; AREA.md paths verified exist (`wc -l` = 33, four required sections).

## Verdict: fix

## Fix

**F1 — Merge-origin `check.fix` runs the Shared context refresh twice back-to-back in one pass.**

Source: a real merge-origin `check.fix` pass — the routine path every leaf takes when a merge run goes red (`skills/merge-issue/SKILL.md:73` routes red checks to `check.fix`).

Defect: `skills/implement-issue/SKILL.md` `## check.fix` opens with `Run the Shared context refresh before reading the findings.` Then the merge-origin paragraph instructs `Before judging the failure, the pass runs the Shared context refresh and replays the recorded commands`. Between the two refreshes the pass only reads findings — minutes of local file reads, no worker wave — so the second fetch+rebase+`AKROGON_BASE` refresh can never find anything the first could not, while it costs a redundant remote call per merge-origin pass and opens a second fetch-failure window: under the new rule a refresh error ends the pass with no phase move, so a transient remote failure at the second refresh stalls a pass that had already successfully refreshed.

Consequence today: every merge-origin `check.fix` performs a redundant `git fetch`+rebase and carries a redundant stall point. The design names the shared rule's use points as the start of `implement`, the start of every `check.fix`, and before final proof (`design.md` Leaf architecture, first bullet); the pre-judging invocation is a fourth use point the design does not name, and criterion 2's "states its fetch and rebase once, through the shared refresh" is defeated in behavior even though the text states it once.

Repair: drop the pre-judging invocation — `Before judging the failure, the pass replays the recorded commands` — keeping `a green replay needs no repair`, `against the refreshed base` (the opener's refresh supplies it), and the post-repair refresh invocation (that one is the before-final-proof use point). If the implementer instead keeps a refresh there for staleness-after-findings reasons, the opener should be scoped to non-merge check.fix — either way one refresh per pass start.

## Nits

- `skills/implement-issue/SKILL.md` `## implement` handoff keeps the pre-existing `repair any failure by the protocol` clause positioned after the proof list; unchanged by this diff, but a repair that fails still ends inside the proof sequence. Deferred: pre-existing wording, not introduced here; evidence to promote: none needed if B agrees the ordering reads ambiguously.

No operator actions. No `Test-Change:` trailers in `22ede6c..HEAD` — none required (the only test-path change is the new file added at planning).

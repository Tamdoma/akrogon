# Log coverage

## Question
Q1. Chart direct logs (`issues/chart/*/direct/check-*.log`, written by `akrogon verify --holder`) never reach completeOwner. Where do they go: packed when the chart ends (`Closed`, `Held`, `Handed off`), committed plain as today, or ignored and kept on this host only? (B,C,D)

Q2. Seats save logs by hand (framework: 2,054 in `implementation/`, 219 in `merge-evidence-*`, no skill names them). The close-time pack covers every `*.log` under an owner, so size is handled. Do skills keep allowing hand-saved logs, or must every check output go through `akrogon run-check` so each log has one writer and one naming rule?

### Carries
- [Evidence location](evidence-location.md) (taken): one `evidence.tar.zst` per owner at close; `issues/open/**/*.log` and `issues/parked/**/*.log` ignored; read with `akrogon log <path>`.
- Operator Q1 correction 2026-10-15, verbatim: "The problem is that these logs need to be read often when I refer to them. If we zip them they won't be able to be read."
- Operator, worktree-cleanup Round 2 answer 5, verbatim: "I want all folders to be clean of junk and leftover files".

## Findings
- Notes 2026-10-15: [merged](../slots/coverage-merged.md), rebuttals `coverage-rebuttal-{B,C,D}.md`.
- Direct folders: six across both repos, 56 logs, 4,535,900 bytes; pack to 327 KiB (akrogon) and 194 KiB (framework) at zstd -19 (B,C,D). One framework direct verify writes 1.8 MB (D).
- Direct logs are written by `akrogon verify --holder <chart>/direct` (src/run-check.ts:126-127; chart-issues SKILL.md:108). flaky opens them through verify-runs.jsonl receipts: 7 in akrogon, 1 in framework (src/flaky.ts:11,35) (B,C,D).
- Chart ends are text appends in the skill (SKILL.md:85,114,121); no code moves a chart (B,C,D). system-flow handed off with 18 direct logs, none tracked (C).
- Q1 picks: pack at chart end (A,B,C,D); C moved from commit plain on condition that Handed off packs too. Trigger: one command the door runs before the end marker (A,B,C) vs a hook in chart-usage.ts plus a sync pass (D).
- Hand-saved: 2,854 framework closed files, 466.5 MiB; 118 byte-identical to a `check-*` log in the same leaf (C); `merge-B-verify-terminal.log` equals `check-verify-*` plus a 41-byte `run <uuid>` line (D); `repair-B-cheap-console.log` equals its check log (B).
- Causing sentences: "anything needed later goes in the leaf folder" (implement-issue SKILL.md:25, check-issue:18, merge-issue:18), "records its output in review-B.md" (merge-issue:41,53), "pasted results and artifact paths" (implement-issue:65), red and green output per finding (check-issue:67,83,85) (B,C,D).
- `akrogon run-check` prints no kept path (src/run-check.ts:143); verify does (src/verify.ts:163,170) (D). That this caused the hand copies is a hypothesis (B).
- Non-check evidence exists: range-diff (merge-issue SKILL.md:55), push failures, timed HTTP polls, child-written artifacts (B,C). run-check can run any of these commands (B,D).
- Q2 picks: every kept command output through run-check, no hand-saved `*.log` (A,D); route checks through run-check and forbid duplicate copies, allow purposeful extra logs (B,C). Guard: none (A,B,C); C would accept a byte-identical-duplicate check; filename guard at phase moves (D).

## Taken
- Operator 2026-10-15: `1a | 2a | 3a`. Chart direct logs are packed when the chart ends, by one command the door runs, with a status warning for an ended chart holding loose logs. Every kept command output goes through `akrogon run-check`, which prints the saved path; skills stop telling seats to copy logs. No guard against stray logs; the close-time pack takes them.
- Final shape after the final-shape check ([draft](../slots/coverage-final-shape-draft.md); returns `coverage-final-shape-B.md` and `coverage-final-shape-C.md`, the latter by the pi seat, renamed from D to C by the operator; the old Claude C pane was removed and sent no return):
  1. The pack is one shared function used by completeOwner and by a new command `akrogon pack <chart>`, which packs only `<chart>/direct` (B). The log set is every `*.log` under the folder, recursive, dotfiles included, the same set for pack, status warning and ignore (C).
  2. `.closing`: completeOwner writes it before packing and keeps it through the rename, removing it after the move (B). `akrogon pack` writes it and removes it on success; a failed pack leaves it and exits non-zero naming it, and rerunning the pack finishes and removes it (B,C).
  3. The chart door runs `akrogon pack <chart>` before appending `Closed`, `Held` or `Handed off` when `<chart>/direct` holds a log (chart-issues SKILL.md:85,114,121). Archive `<chart>/direct/evidence.tar.zst`, members relative to `direct/`. A reopened chart writes new plain logs and the next pack merges them.
  4. `.gitignore` additions from `akrogon init` (src/init.ts:67-76) cover `issues/chart/*/direct/**/*.log`.
  5. The `akrogon log` resolver and flaky add `chart/<chart>/direct/<member>`.
  6. Plain `akrogon status` (the Failed/Missing loop, src/status.ts:381-396) warns for each chart whose last marker is an end marker and whose `direct/` still holds a plain log, naming `akrogon pack <chart>` (C). The 53 loose logs in five ended akrogon charts today are its first cases (C).
  7. The `runCheck` CLI wrapper (src/run-check.ts:143), not `checkedRun`, prints `check <name>: <exit> <kept path>` to stderr, starting on a new line (B,C). tests/check-names.test.ts:26 and tests/run-check.test.ts:428 match whole stderr and change with it (C).
  8. Skills: a seat keeps command output only through `akrogon run-check --name <label> -- <cmd>` and cites the printed path, pasting at most a short excerpt into Markdown. Exempt: printed check commands and `akrogon verify`, which already keep logs (C); `akrogon phase ... merged`, which moves its own owner (B); coordination commands (fetch, push), whose errors are quoted in the report as text (C). On the direct route the holder is the absolute `<chart>/direct` path, and check-issue SKILL.md:101 allows those logs (C). Standalone implement-issue has no registered repo and is outside this rule (C). Lines: implement-issue SKILL.md:25,38,65,80, worker-protocol.md:29, brief-template.md:43; check-issue SKILL.md:18,67,69,83,85,101; merge-issue SKILL.md:18,41,53,55,75; plan-issue SKILL.md:69; chart-issues SKILL.md:85,114,121 (C).
  9. No guard refuses stray logs.

# Merged notes: log-coverage

## Q1 chart direct logs

### Options
- O1. Pack the direct folder's `*.log` when the chart ends with `Closed`, `Held` or `Handed off`, using the same verified, retry-safe pack as owners (A,B,D). Reason: one storage rule for every check log; B's review, CHART.md and verify-runs.jsonl cite these logs and a handed-off leaf needs them later (B). Cost: charts end by a text append in the skill (chart-issues SKILL.md:85,114,121), so packing needs an explicit trigger plus a `chart/<chart>/...` case in the resolver (A,B,D).
  - Trigger: a door step in the ending protocol (A,B); a hook inside chart-usage.ts plus a safety net in `akrogon sync` (D).
  - Archive place: `<chart>/direct/evidence.tar.zst`, members relative to `direct/` (B); `<chart>/evidence.tar.zst`, members relative to `<chart>/` (D).
  - Open-time ignore: `issues/chart/**/*.log` while the chart is open (D); B keeps new plain logs local until the end too.
- O2. Commit plain as today (C). Reason: small (4.5 MB over six charts in both repos), no code-level chart end exists, the operator reads charts directly. Cost: two rules; a skill sentence for `Handed off` (system-flow handed off with 18 direct logs, none tracked).
- O3. Ignored, host-only (none). Rejected: CHART.md, review-B files and verify-runs.jsonl cite these logs; no backup besides GitHub (B,C,D).

### Evidence
- Six direct folders: 56 logs, 4,535,900 bytes; packs to 327 KiB (akrogon) and 194 KiB (framework) at zstd -19 (B,C,D).
- Writer: `akrogon verify --holder <chart>/direct` through run-check's holder branch (src/run-check.ts:126-127; SKILL.md:108) (B,C,D).
- Readers: door A and B during the attempt (check-issue SKILL.md:99-101); direct-guards reads only the receipt (B,C,D); flaky can open a direct red log via verify-runs.jsonl, 7 receipts in akrogon, 1 in framework (B,D); C says flaky never looks under chart (C's flaky.ts:10-17 reading vs D's receipt count differ).
- Non-check log in direct: `system-speed/direct/.ask-B1.log` is a peer-command record (B,D).
- system-flow: Handed off, 18 direct logs, 0 tracked (C).

### Pitfalls
- Chart end is a Markdown edit, so packing can be skipped: explicit step plus a check that a chart with an end marker has no plain logs (A,B,D).
- A chart reopened after an end marker: same archive-plus-plain retry union; the holder must be writable again (B,D).
- Handed off is not "the evidence moved to the leaf": keep the chart archive in place (B). C instead: commit or delete direct logs at handoff so one copy survives.

### Open
- Q1a. Can a chart with an end marker be reopened for another direct attempt? (B)

## Q2 hand-saved logs

### Options
- O4. Every kept command output goes through `akrogon run-check --name <label> -- <cmd>` or `akrogon verify` (A,C,D). Reason: one writer, one name rule, timings, admission, scope cleanup and the late-writer guard apply to every run (D). Cost: three skill sentences (implement-issue SKILL.md:25,65; check-issue SKILL.md:18,67,83; merge-issue SKILL.md:18,41,53,75) (C,D).
  - Boundary: forbid all hand-saved `*.log` under issues/ (D); allow non-check outputs run-check cannot produce, named in the skill step (C); keep supplemental evidence (range-diff, push, timed polls) allowed and forbid only second copies of check stdout (B).
- O5. Keep allowing hand-saved logs (none fully; B keeps supplemental only). Rejected: duplicates and eight folder naming schemes.

### Evidence
- Duplicates: 118 hand-saved files byte-identical to a `check-*` copy in the same leaf (C); `repair-B-cheap-console.log` identical to its check log (B); `merge-B-verify-terminal.log` equals `check-verify-*` plus a 41-byte `run <uuid>` line (D).
- Hand-saved logs under framework closed: 2,854 files, 466.5 MiB (C). Still being added 2026-10-15 (C,D).
- Causing sentences: "anything needed later goes in the leaf folder" (implement-issue:25, check-issue:18, merge-issue:18), "records its output in review-B.md" (merge-issue:41,53), "pasted results and artifact paths" (implement-issue:65), red and green proof per finding (check-issue:67,83,85) (B,C,D).
- `akrogon run-check` does not print the kept log path (src/run-check.ts:143), unlike verify (src/verify.ts:163,170) (D). That is why seats redirect by hand (D).
- Non-check evidence exists: range-diff required by merge-issue SKILL.md:55, push failures, timed HTTP polls, child-written artifacts (B,C).

### Pitfalls
- Seat cannot cite the path: run-check prints `check <name>: <code> <path>` (D).
- Ad-hoc repair runs inflate `check_end` counts in timings (C). flaky reads only verify-runs.jsonl, so it is unaffected (D).
- Exit lost through tee or pipes: the checked command's own exit is the proof (B).
- Child-written artifacts (screenshots, traces, JSON) are not logs and keep their own contract (B).
- The `$TMPDIR` half of the sentence stays; only "anything needed later goes in the leaf folder" changes (C).

### Open
- Q2a. Enforce mechanically: a phase guard refusing `*.log` under a leaf that is not `implementation/check-*.log` (D)?

## Where slots differ
- D-q1. Pack at end (A,B,D) vs commit plain (C).
- D-trigger. Door step (A,B) vs chart-usage.ts hook and sync net (D).
- D-q2. Forbid all hand-saved logs (D) vs allow named non-check outputs (C) vs allow supplemental evidence, forbid only duplicate check stdout (B).

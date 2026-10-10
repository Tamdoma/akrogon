# Report: live-proof-line

Base: 9e2dfbebcfd98e647d34bed995741410ce95c2e4
Head: 975139ddda571ae01f5a5d4cc3b4b5ad629ab43e

## Changed files and reasons

- `skills/chart-issues/SKILL.md` — `## Handoff` first paragraph gained the live-run review line as door prose beside the chart-usage sentence: session count, how many run at once (rounds counted), estimated elapsed time, timeout worst case, estimate label, timeout basis named by file and value, measured-case replacement, `unknown` with reason, information-only rule. Criterion 1.
- `skills/chart-issues/assets/standing-design.md` — appended the side-by-side rule to the "A slow or live-run leaf" line: side-by-side sessions each with own working root and log, named shared-resource exception, unnamed shared resource ends the pass `failed` via the existing red-criterion exit. Criterion 2.
- `skills/chart-issues/assets/shapes.md` — extended the audit-refusal sentence in `## Preflight and validation` with two refusals (serial sessions without named shared resource; session count in a live-run criterion); test-count refusal unchanged. Criterion 3.
- `docs/guide/chart.md` — one describing sentence in the handoff review paragraph; describes, does not restate rules. Criterion 4.

## Commands run

- `bun run format` — pass; rewrote pre-existing prettier drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`, both reverted (known format lesson, 2026-10-08). Wall time: ~1 s.
- `bun test --timeout=30000` — 673 pass, 0 fail, 34 files. Wall time: ~64 s.
- `bun run typecheck` — pass. Wall time: ~5 s.
- `AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed="$AKROGON_BASE" --timeout=30000` — "4 changed files, but no test files are affected", 0 tests ran (text-only diff). Wall time: <1 s.
- Criterion proof: `git diff "$AKROGON_BASE" -- <four files>` read end to end; all criterion fields present.
- Criterion 5 gate: `git diff "$AKROGON_BASE" --word-diff-regex='[^[:space:]]+' -- <four files> | grep -oE "\{\+[^+]*\+\}" | grep -nE "[0-9]|budget|timer|duration|deadline|cap on|limit"` — no output (exit 1); added tokens contain no numerals or gate words. `timeout` appears only as the required basis field name.

## Known limitations

None known.

## Unverified criteria

None. Worker return (sub-brief `implementation/brief-1.md`): commit `19d4049acb6eb27f2e5eba19d4bd5f1209a8ed07` cherry-picked as 975139d onto the lane; all four report sections verified against the actual diff; worker worktree removed.

# Review A: dead-fields

Base: `2a759dd9daf3c8f917b5723eabfd50bbca5f670e`
Reviewed head: `093ee084d4652925f3acc723379ba9e05d117723`
Verdict: **ready**

## Scope

Eight files changed, all inside the owned surfaces: `src/state.ts`, `src/next.ts`, `tests/helpers.ts`, `tests/state.test.ts`, `tests/next.test.ts`, `tests/status.test.ts`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`. No `issues/` or `docs/` edits. Worktree clean.

## Criteria

- C1: `priority` and top-level `slot` removed from `stateSchema`; strict unknown-key rejection and the duplicate-done refine kept. Tests reject either legacy key directly.
- C2: `readState` filters exactly the two keys from a plain-object parse before `stateSchema.parse`. Non-object YAML passes through untouched and still fails. Tests cover priority-only, slot-only and both, arbitrary legacy value types, open/closed/parked paths, unchanged file on read, key removal on save and stable second save.
- C3: Unknown-key test asserts the ZodError names `unexpected`. Missing required, invalid phase, duplicate done and seven non-mapping YAML shapes remain rejected.
- C4: Shorthand `slot` removed from the attempt object in `dispatchSlot`; counter and guards untouched. `tests/next.test.ts` inspects raw saved YAML after a real fake-Herdr `next`. Fixture writer drops priority. shapes.md template, h/n/l sentence and command-authored list, and SKILL.md handoff sentence updated per D4.
- C5: `tests/status.test.ts` seeds legacy keys in overview and detail fixtures, asserts the detail state section omits them and history records keep `slot: B`, with snapshot proof of no writes. No `src/status.ts` change was needed; it serializes `readState` output.
- C6: See verification.

Remaining `priority` matches are the reader filter and tests. Remaining `slot` matches are lifecycle `Slot`, CLI/prompt slot, per-seat maps and log records, consistent with D3/D5.

## Verification (rerun by A from the worktree)

- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 160 pass, 0 fail, 11 files.
- `bun src/akrogon.ts status`: exit 0. `bun src/akrogon.ts status dead-fields`: exit 0. The authoritative `state.yaml` on disk still holds `priority: "n"` and `slot: B`, and the printed state section omits both while history retains log `slot`.
- `git diff --check 2a759dd..HEAD`: clean.
- Implementer artifacts confirmed at `/tmp/akrogon-dead-fields-evidence/` (full-suite, format, typecheck, status, detail, detail-before, worker-red, worker-green).

## Findings

None blocking. Nit: the plan named `/tmp/akrogon-dead-fields-evidence/fixture-cli.txt`; it was not written. The report explains that `worker-green.txt` contains the same next/status subprocess scenarios, which is adequate evidence, so this is not material.

Stale `docs/state.html`, `docs/create.html`, `docs/next.html` references remain as R2, outside this leaf.

## Merge (slot A)

Rebased `093ee08` onto `origin/main` at `a4f0b5d88080026860be4837f97f6a89a7c52a1c` without conflict; new head `f3b25f5`. Checks in the worktree after rebase: `bun run format` exit 0, `bun run typecheck` exit 0, `bun test` exit 0 (166 pass, 0 fail), `test_changed` with `AKROGON_BASE=a4f0b5d8…` exit 0 (161 pass, 0 fail). Worktree clean before push.

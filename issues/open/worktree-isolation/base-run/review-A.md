# Review A — check.review

Base: `01ca1fbe8654b11b3cec04e56d6ec498dae87196`. Reviewed head: `8eb32c0978cd5c0037f04daeab726ba4016cd284`.

Verdict: **fix**

## Evidence

- `bun test tests/base-run.test.ts --timeout=30000`: 9/9 pass on the reviewed head.
- `bun test --timeout=30000`: 753 pass, 0 fail (clean rerun after a load-flake run).
- `bun run typecheck`: clean. `bun run format`: only pre-existing drift elsewhere, untouched.
- Refactor fidelity verified by reading the full `run-check.ts`/`next.ts` diff: env contents, spawn, passthrough and `.env` emission are byte-equivalent aside from the `names` parameter and moved `AKROGON_BASE`.
- AREA.md path sweep: every path named by changed AREA.md files exists (`src/base-run.ts`, `tests/base-run.test.ts`, helpers, skills); `src/AREA.md` is exactly 40 lines after the worker's bullet merges.
- `Test-Change` trailers: two, on `tests/command-reference.test.ts` (contracts entry, added case) and `tests/AREA.md` (added line) — both name what was added and no source needed.
- Doc claims checked: README row and AREA lines describe the verb accurately; `docs/guide/phases.md` describes behavior only, still true.

## Fix findings

F1 — `src/base-run.ts`: the per-run root under `leafTemp(repo, slug)` (`mkdtempSync` `run-*` + `.owner`) is never removed. `check-env`'s locked contract: a run root is "removed when it ends"; the reconciler's `.owner` sweep is the crash backstop, not the deleter, and it has not landed. Realistic source: every `akrogon base-run` invocation. Consequence today: one `run-*` dir accumulates under `~/.akrogon/scratch/<repo>/<slug>-<hash>/` per run with no remover until worktree-reconciler ships. Hits the check-env run-root contract consumed per this leaf's design ("run root `.owner` file consumed by worktree-reconciler"). Repair: `rmSync(runRoot, { recursive: true, force: true })` in the finally alongside the worktree removal (keep it alive during the run so `.owner` still marks a live attempt). Add an assertion in `tests/base-run.test.ts` that no `run-*` dir survives a run — by the rule that a realistic Fix needs a test.

F2 — `src/base-run.ts` `runCwd`/`baseRun`: `--cwd <rel>` and the computed `inside` are trusted into `resolve(target, inside)`, `mkdirSync` and `cd <inside>`; a value containing `..` (or absolute) escapes the base checkout, so the command runs outside it while the record claims a relative cwd — the seat then judges red-on-base evidence produced in the wrong directory. Realistic source: the merge-issue skill now instructs B to run `akrogon base-run ... --attempt <id>` "from the matching directory", and `--cwd` is the supplied flag; a mistyped or wrongly-derived path is a real user action. Consequence: misleading evidence recorded for a leaf, plus stray directories created outside the store. Repair: refuse when `!within(resolve(target, inside), target)` before mkdir/spawn (equivalently reject `..`/absolute `inside`).

## Nits

N1 — `baseRunSchema.slot` is `z.string()` rather than `slotSchema`; all writers emit A|B, and a malformed line fails closed for the reconciler. Deferred: consistency with `attemptRecordSchema`'s loose fields.
N2 — a SIGKILL mid-rewrite can leave `base-runs.jsonl.<pid>.tmp` under `issues/`; same exposure as `writeYaml`'s existing temp pattern, narrower window.
N3 — `readBaseRuns` throws on a torn line; same exposure as `log.jsonl`/`merge-attempts.jsonl` (no defensive parsing there either).

# Review A: blocked-report

Blind initial review. No peer review read. `debate: no`, so no positions or rebuttals expected.

Base: `3e034dee43f0853446c2ba8f97bb72668ab213dc`. Reviewed head: `0303a1132bd7d2bca9a9e4fc2687d835f6b7e985` (lane branch `blocked-report`, clean).

## What was checked

- Full diff `base...HEAD`: 7 files, no `AREA.md` (no area-path listing needed), no `issues/` files.
- Plan D1-D10 against code: picked flag threading (selection single still true, selection sweep true, `--all` inside true, `sweepAll` true, `--resume`/hook/tab-closed/`dispatchDependents`/merge paths false), order merged then failed then deps then inputs then silent dispatch, labels via `unmergedDeps`, messages per D7, docs section placement, `selectLeaves`/`eligibility`/`mergeQueue`/capacity untouched.
- New doc section opened and read against live behavior; grepped `parts.md`, `phases.md`, `cheat.md` for stale silence claims: none.
- All 18 updated assertions: each flips old manual silence to a picked report and contradicts it against brief criteria 1-4 or 6, cited in the U4 commit trailers.
- New tests use only slug, folder path, bare `next`, `--all`, `--resume`, and `phase`: no owner names.
- Report accuracy: base, head, diff stat, and file list all match live `git` state.

## Verification evidence

- `bun test tests/next.test.ts -t "blocked-report"`: 13 pass, 0 fail.
- `bun test tests/batch-dispatch.test.ts`: 22 pass, 0 fail.
- `bun test tests/docs-links.test.ts`: 3 pass, 0 fail.
- `bun run typecheck`: pass.
- Live temp-repo probe (deleted after): folder target over ready, dep-blocked (by `ghost`, `ready`), and failed leaves exits 1 with exactly the failed-recovery line and `depblocked: ghost (missing), ready (plan.synthesis)`; ready dispatched silently.
- `prettier --check` on all owned in-scope files: clean. `config.yaml` warns but is outside the `format` script scope and warns identically on base (pre-existing).
- `git diff --check`: clean. Deliberate-red evidence in the report (R1-R5 with exact red output) is specific and credible; not rerun.

## Findings

### Nits

- N1 Report-then-start in one pass. Reproduction: updated `a landed batch moves member and holder once...` second `--all` both reports the dep-blocked leaf (exit 1) and dispatches it after `mergePass` lands its blocker. The line was true when evaluated at sweep time, and sweep-before-mergePass is the locked design order, so this is deferred. Promote to Fix if operators report confusion from report-then-start lines, with a design amendment deferring picked evaluation past `mergePass`.

## Verdict

`nits`

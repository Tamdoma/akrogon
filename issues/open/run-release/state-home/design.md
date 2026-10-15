# Design: state-home

## Binding decisions, verbatim

### Run location
From [run-location.md](../../../chart/run-release/forks/run-location.md). Operator 2026-10-16: "ok, then whatever you recommend, let's go", given after A recommended O1b: one immutable release folder per merged main commit behind a `current` pointer. Reason: no editable checkout serves execution, the switch is atomic, rollback is one pointer flip. Foreclosed: running from the workspace; a second git checkout; warning or refusal on a dirty root; read-only files; stash or reset during update; compiled single binary.

### Release shape, Q1 (this leaf)
From [release-shape.md](../../../chart/run-release/forks/release-shape.md). Operator 2026-10-16: `1a | 2a | 3a | 4a`.
Q1: state moves to `~/.akrogon`. Reason: settings never sit in a git checkout, so `akrogon init` or a records move cannot dirty or swap them. Binding: the move and the release switch are separate leaves in order; the cutover never runs two state homes at once, never leaves `akrogon` failing between deploy and migration, and never deletes a tracked file in the workspace during the cutover; tracked copies leave git only after the host runs from `~/.akrogon`. Foreclosed: state left in the workspace behind a pointer.
Excluded here: Q2 to Q4 (release-deploy, release-rollback).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: criteria are proven at the CLI boundary with a temporary HOME and a temporary tool-root copy, using the existing test fixtures (tests set `AKROGON_HOME` and HOME already, tests/helpers.ts). Cutover is new behavior: one deliberate break (cutover skipped) turns its test red. No machinery, no live calls. The real host cutover happens at this leaf's deploy and is not a done-criterion.

## Leaf architecture

Owned surfaces: `src/config.ts` (`globalHome`, `readGlobal`, relative repo resolution), the cutover (new, called once at CLI start in `src/akrogon.ts` before any state read), `src/init.ts` (config write), README.md, docs/guide/install.md.

Rules:
- `globalHome()` returns `AKROGON_HOME` when set, else `~/.akrogon`. `toolRoot` keeps meaning the code tree only.
- Cutover runs only when the state home has no `config.yaml` and the tool root has one. Until it completes, `globalHome()` keeps resolving the tool root, so old and new code share one home. It runs only while the tool-root `runs/` holds no live run record, holding the tool-root global `.lock` and the admission locks (`runs/locks/<slice>`, src/admission.ts) that old-code processes use; otherwise it is retried by the next command. Tracked tool-root files are copied, never deleted. Untracked tool-root state (ignored files) may be moved. (B)
- After cutover the tool-root copies are dead: nothing reads them.

State changed and its consumers:
- Every `globalHome()` reader moves with it: config (src/config.ts), `.lock` (src/next.ts, src/phase.ts, src/park.ts, src/pause.ts, src/stop.ts, src/sync.ts), `paused.yaml` (src/pause.ts), `stopped.yaml` (src/stop.ts), `runs/` (src/admission.ts), reconcile reports (src/reconcile.ts), readiness holder resolution (src/readiness.ts), status and evidence repo paths (src/status.ts, src/evidence.ts).
- Open for the plan: files in the tool root not reached through `globalHome()` today (`held.yaml`, `admission.lock`, `run.lock`, `run-holder.yaml`, `runs/last-start`, `reconcile-host.json`): find each writer and reader and move it with the rest, or record why it stays.
- An old-code process still running after cutover would write to the tool root: criterion 4 rules this out by cutting over only with no live run record and under the admission locks. Open for the plan: an old-code process that holds no admission record (a plain `akrogon status`) and its writes, if any. (B)
- Skills that import `src/config.ts` through the resolved `akrogon` path (skills/chart-issues/SKILL.md presence check) read the state home through `globalHome()` and need no change.

Exclusions: release folders, links and deploy (release-deploy); removing the tracked tool-root copies from git (a door step after the host runs from `~/.akrogon`, chart Pending steps).

# Release shape

## Question
Q1. Where does akrogon's machine state live once code runs from a release folder (config.yaml, held.yaml, admission.lock, runs/, .lock, paused.yaml, stopped.yaml, run.lock, reconcile/): stays in the workspace root where it is today, found by a fixed pointer; or moves to `~/.akrogon` with a one-time migration?

Q2. When are old release folders deleted: keep the previous one for going back and delete older ones once no process runs inside them; or keep a fixed number of recent ones?

Q3. What happens when building a new release fails (fetch, `bun install`, link step): `current` stays on the old release and the failure is printed on the next pass, retried at the next trigger; or akrogon stops dispatching until a person acts?

Q4. When a new release is bad, how do you go back: an `akrogon rollback` command that points `current` at the previous release and holds deploys until main moves past the bad commit; or no command, fix forward with a revert commit on main?

### Carries
- [run-location](run-location.md) Taken: O1b release folders behind `current`.
- Operator 2026-10-16: "but I can still run everything from the main folder, like what we're doing here?"
- Operator 2026-10-16: "hopefully that doesn't break anything else systemically."


## Findings
- Notes 2026-10-16: [A](../slots/release-shape-A.md), [B](../slots/release-shape-B.md) (codex), [C](../slots/release-shape-C.md) (pi), [merged](../slots/release-shape-merged.md); rebuttals [B](../slots/release-shape-rebuttal-B.md), [C](../slots/release-shape-rebuttal-C.md).
- Q1: A,B picked stay-with-pointer; C picked move. C rebuttal: `akrogon init` writes the global config into the tracked workspace file (src/init.ts:88), so registration dirties the workspace and can recreate the overlapping-edit block; and the records move of the workspace branch (src/self-update.ts moveCheckout) can swap config under live seats. Every live `repos:` entry is absolute, so the relative base in src/config.ts:210 changes nothing here. A changed its pick to the move after this rebuttal. B holds: do not combine the state move with the runtime switch (B Q1).
- State today: tracked config.yaml, held.yaml, admission.lock, runs/last-start; ignored .lock, paused.yaml, stopped.yaml, run.lock, run-holder.yaml, reconcile/ (.gitignore). `~/.akrogon` already holds worktrees/, run.lock, framework-tests.lock (C). Docs name the tool-root config: README.md:68, docs/guide/install.md:64.
- Q2: cwd/fd scans cannot attribute a bun process to a release (argv shows the ~/.local/bin link, bun keeps no .ts open) (B,C). A claim record per consumer needs coordinated selection, claim and delete, plus a defined consumer set (B R1). A release is ~98 MB (C). Longest of 61 recorded verify runs: 4.9 min (issues/verify-runs.jsonl, read 2026-10-16) (A).
- Q3: all slots pick stay on old, keep dispatching, report and retry (A,B,C); build in a temp sibling and rename only when complete (C); show a not-current release in status (C); first install fails plainly (B).
- Q4 raised by C: what stops the next deploy flipping forward onto the bad commit.
- Design carries for the leaf (B R2, B Q3): define activation and failure recovery for the CLI link, each skill link (added and removed skills), herdr plugin and systemd; a rolled-back release must read state a newer one wrote, or fail loudly (strict schema src/config.ts:23-30) (B).

## Taken
- Operator 2026-10-16: `1a | 2a | 3a | 4a`.
- Q1: state moves to `~/.akrogon`. Reason: settings never sit in a git checkout, so `akrogon init` or a records move cannot dirty or swap them (C rebuttal). Binding: the move and the release switch are separate leaves in order (B); the cutover never runs two state homes at once, never leaves `akrogon` failing between deploy and migration, and never deletes a tracked file in the workspace during the cutover; tracked copies leave git only after the host runs from `~/.akrogon` (C).
- Q2: keep current and previous; delete any other release 24 h after it was replaced. Reason: no new tracking; longest recorded verify 4.9 min. Cost accepted: a command running over 24 h from a replaced release could break.
- Q3: on a failed build `current` stays, dispatch continues, `akrogon status` shows the failure with attempted and active commit, retry at the next trigger. A release is built under a temporary name and renamed only when complete; `current` flips by rename of a temporary link (C).
- Q4: `akrogon rollback` points `current` at the previous release and holds that bad commit from redeploy until main moves past it; rollback works while the current release is broken.
- Foreclosed: state left in the workspace behind a pointer (1b); claim-tracked deletion (2b); stop dispatch on a failed build (3b); fix forward only (4b).

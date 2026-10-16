# Chart: run-release

## Destination
The installed `akrogon` command runs a complete release built from merged main, behind one `current` pointer. A workspace edit never goes live, never blocks a deploy and is never undone into a "revert". Work, charts and records stay in the workspace.

Route: lifecycle (debate no)

Handoff review 2026-10-16: operator `r1a`. Leaf drafts reviewed by [B](slots/leaf-review-B.md) and [C](slots/leaf-review-C.md); applied: cutover under the old global and admission locks with no live run record (B F1); hold reader moved into release-deploy and manual rollback steps for a broken current (B F2, C F1); link restore on rollback (B F3); schema error naming file and key with `readGlobal` owned by release-rollback (C F2). Leaves: issues/open/run-release/{state-home, release-deploy, release-rollback}.

## Forks taken
- [run-location](forks/run-location.md): release folders behind `current` (O1b).
- [release-shape](forks/release-shape.md): state to `~/.akrogon` first; keep current + previous, delete others 24 h after replaced; failed build keeps current and shows in status; `akrogon rollback` with a hold on the bad commit.

## Open forks
none

## Fog
none

## Off route
- Compiled single binary, read-only files, dirty-root refusal, stash/reset on update: see run-location Foreclosed.

## Pending steps
- After state-home merges and the host runs from `~/.akrogon` (`~/.akrogon/config.yaml` present and `akrogon status` works): remove the tracked tool-root `config.yaml`, `held.yaml`, `admission.lock` and `runs/last-start` from the akrogon repo, in a separate worktree, B review, push. Owner: the door. Check: `git ls-files config.yaml held.yaml admission.lock runs/last-start` prints nothing on origin/main and `akrogon status` still works. Done 2026-10-16 ~04:00 local: a813007 removed config.yaml, held.yaml, admission.lock, reconcile-host.json and runs/** (same class, wider than named) and the test that read the tracked config (tests/harness-template.test.ts; the claude template is machine state); B review ready (pending/review-B-1.md); verify green; deployed; origin/main lists none of them; root copies and dead ignored state (paused.yaml, stopped.yaml, reconcile/, .lock) removed from the tool root; `akrogon status` works.

Handed off 2026-10-16

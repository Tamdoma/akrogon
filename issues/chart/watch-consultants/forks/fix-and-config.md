# What a fix may touch, how leaves resume, and the consultant recipe

## Question

Q1 Base fix path: where does the consultant build and push a fix for a red base, and what must it check against concurrent merge turns?
Q2 Leaf-local fix: for a defect inside one failed leaf's own work, does the consultant commit in that leaf's worktree, hand a repair to the leaf's seats, or something else?
Q3 Resume: what moves a failed leaf back into the lifecycle after a fix, and from which phase (including a failed merge leaf holding a `batch` record)?
Q4 Never list and S3 pre-filter: which Never items change and how; and does a failure whose reason plainly names an S3 need (a key, a grant) still get a consult?
Q5 Config: key and shape of the consultant recipe in `~/.akrogon/config.yaml`, how `akrogon seat` or another verb reads it, and what happens when it is absent.
Q6 Name and cleanup: the consultant's hc name and labels (chart doors hold `<prefix>-slot-<x>`; hc names are unique among live terminals), and cleanup on case end, `watch-issues stop` and watcher exit.

### Carries

- Locks: forks/seed-decision.md `## Taken`; forks/signposts.md `## Taken`; forks/consult-loop.md `## Taken` (A's pick: items 4, 6, 7, 9 and 11 bind here: start through the existing start path with a first task, `stop.ts` ends the timer before the consultant, a fix stands on the failing command plus `checks` plus `merge_checks`, notices on push and leaf move).
- Map: slots/map-merged.md sections 2 and 3.

## Findings

- Notes: slots/fix-and-config-A.md, -b.md, -c.md; merged -merged.md; rebuttals -rebuttal-b/c.md; shape -final-shape.md; checks -final-check-b/c.md.
- better-than-training, src/phase.ts `moveGuards` (clean worktree except a `blocked` failure; recovery into work skips citation gates), `transition` (`check.review` needs a green `leaf` receipt), `commitMove` (keeps `batch` leaving failed, clears `notified`); src/next.ts `reconcileBatch` (returns early in `merge` without an applied candidate); src/run-check.ts (refuses `merge_checks`); src/config.ts `worktreeStore`, `repoSchema` (`merge_checks`, `env`, `setup`); `hc run --help` (names unique among live terminals). Read 2026-11-21.
- better-than-training, framework issues/log.jsonl 7558-7561: a real `failed -> merge` recovery merged 12 minutes later; batch fields not shown (B rebuttal).
- Standing dissent: B on item 2 (advise only); C on item 5 (S3 pre-filter); item 6 key placement, B's first note top-level.

## Taken

A's pick under autopilot, 2026-11-21T17:47:12Z. Decided by S2 2b and S3 (fix authority), S5 (one alive), consult-loop items 1, 6, 9 and 11, the seed lock's "following the existing `slots:` + `harnesses:` convention" (key placement, A's reading: inside `slots:`; other reading: top-level `consultant:`), and removing over adding (no prescribed batch code change, no pre-filter).

1. Base fix: the consultant makes a detached worktree under the case folder (`<case>/worktree`) from freshly fetched `<remote>/<default_branch>`, commits only the base repair, proves it by consult-loop item 9, and pushes `HEAD:refs/heads/<default_branch>` fast-forward, never `--force`, never repo.root. On a non-fast-forward refusal: fetch, check whether the new base already fixes the failure, else rebase, re-prove, push again; each attempt re-proven, no fixed retry count. The worktree path is in the case; the worktree is removed after the push is read back, and reconcile removes an orphan. Open for the plan: how `merge_checks` run outside an attempt (run-check refuses them), and how `repo.config.env` and `setup` reach the worktree without anyone opening `.env`. (C location; A,B,C rest)
2. Leaf-local fix: the consultant may commit in a failed leaf's worktree only while every seat of that leaf is idle or absent, inside the leaf's decided brief and design (S3), leaving it clean, touching no issues/, with the repo's `Test-Change:` and frozen trailers; uncommitted seat work found there is kept, never discarded, and committed only when both peers agree it belongs to the fix (A,C; S2 2b). Standing dissent B: advise and let the leaf's own seat edit.
3. Resume (watch only, no `--slot`, after re-observing seats idle or absent): `akrogon phase <slug> <target>` then `akrogon next <slug>`. Target: `failure.phase` after a base fix or when work remains; `check.review` when the consultant's commit completes the leaf's work, which needs a green `leaf` receipt for HEAD (`transition` `requireGreenReceipt`; Open for the plan: the receipt command the consultant runs); the consultant states which in its return (model choice recorded). `failed=unknown`: the `from` of the last `P -> failed` record in issues/log.jsonl; none keeps the case open.
4. Stale batch (C rebuttal Q3, B rebuttal Q3): no code change is prescribed. Leaf done-criterion with one right answer written now: a leaf failed at merge with `batch` `applied: true` and no candidate, moved `failed -> merge` by `akrogon phase` and then `akrogon next`, after the base moved, is rebased onto the new base and never dispatched on the stale attempt or top. Red-first; C's `commitMove` clear is the candidate fix.
5. Never: add "kill and remove the watch's own verified consultant (consult-loop items 6, 7)"; "Answer a seat" reads "Answer a leaf seat" and the peer exchange with the watch's own consultant is allowed; "Edit `state.yaml`, worktrees or `issues/`" stays for the watch, and the consultant's brief states its limits (items 1, 2, S3, never issues/, `.env` or state.yaml). Judge "Failed on a human prerequisite ... Never recover" becomes: consult; recover only after the case's verified fix or the consultant's evidence that the named prerequisite is met. No S3 pre-filter: every trigger-class failure gets a consult (consult-loop item 1); standing dissent C.
6. Config: optional `slots.consultant: {harness, model, effort}` in the machine `~/.akrogon/config.yaml` only (`globalSchema.slots`), checked against `harnesses:`, shown by `akrogon config`; repo `issues/config.yaml` slots and index `slots:` stay a/b only. A's reading of the seed lock "following the existing `slots:` + `harnesses:` convention": inside `slots:` (C); other reading, a top-level `consultant:` key with the slot shape (A,B first notes).
7. Verb: `akrogon seat --watch-consultant --task <text>` reads `slots.consultant`, takes no `--slot/--harness/--model/--effort`, starts through `startConsultant`'s existing start proof and `agyTask` path, names the terminal `<prefix>-watch-consult`, labels `akrogon: 1`, `akrogon.repo`, `akrogon.watch-consult=<repo>` (never `akrogon.leaf`), parent the calling watcher with `outlive: false`. hc's live-name uniqueness keeps one alive per repo. Absent recipe: exit non-zero naming `slots.consultant` in `~/.akrogon/config.yaml`; the watch keeps today's notify behavior for that failure and sends one non-attention notice per watch (B,C).
8. Cleanup: case end and replacement close the verified consultant (name, label, parent) with `hc kill` + `hc rm`, tolerating not_found. `stop.ts` kills and removes the verified timer first, then the verified consultant; its first line stays `stopped <timer>` and a second line `stopped consultant <address>` appears only when one was closed. Watcher exit ends the consultant through `outlive: false`; a watcher replaced inside a surviving terminal is observed in the live proof.


Corrections after the final check (B F1-F4, C items 2-3), adopted as A's pick:
2'. A direct leaf commit needs a clean worktree on entry; when the worktree holds uncommitted seat work, the consultant does not commit there: it advises, the seat's work stays intact, and the leaf resumes into its work phase for its own seat (B F2, C).
3'. After a consultant leaf commit, the target is `check.fix` when `failure.phase` is `merge` or `check.repair` (A's repair turn verifies the tree and re-enters review through its normal moves; a fresh `verify` is refused while the leaf is failed, `src/verify.ts`/`src/run-check.ts` `failedRefusal`), otherwise `failure.phase`; `check.review` is never a direct target (B F1). `failed=unknown` with no `P -> failed` record: the peers choose the target from the leaf's artifacts and record why; when they cannot, the case closes with signature `unknown` and one non-attention notice (C).
7'. A missing recipe's sole watch notice is the non-attention one; no attention notice for that failure (B F4).
8'. When the timer detects that its watcher process left a surviving terminal, its exit path also kills and removes that watch's verified consultant (B F3).
These four narrow or define items already checked; 8' adds one cleanup step, re-checked in the leaf-writing review.

## Charting proofs (2026-11-21, free, throwaway hc session akr-probe-wc and a scratch bare remote; both removed, absence checked)

- P1 hc 0.1.21 names: a second live `--name akp-watch-consult` is refused `name_taken`; after `hc kill` alone the name is free again (a finished terminal does not hold it). One-alive per repo is mechanical through the name.
- P2 a child's `hc send <parent>` woke the parent's `hc wait --children any --json` with `reason: children` (parent was a shell, not a harness); killing the parent ended the child (`finished`, signal 1). Watcher exit ends its consultant.
- P3 git: a detached worktree's push to a moved `main` is refused `(fetch first)`; fetch, rebase, push lands fast-forward; `git worktree remove` cleans it.
- Not observed while charting: a real harness watcher receiving a consultant's `hc send` inside its own `hc wait` turn. The paid launch was refused by this session's permission classifier, so it moves into the leaf's live proof under N1 (signposts Needs N1, 6 leaf sessions).

Correction after the leaf review (B F2, F3), A's pick, 2026-11-21: 3''. After a consultant leaf commit the target is `check.fix` also when `failure.phase` is `check.review` (`src/routing.ts` allows `check.review -> failed`; `check.review` is never a direct target). Item 7 and 7' unchanged; a case that ends on an operator stop sends one attention notice naming it (consult-loop item 6), technical exhaustion or disagreement a non-attention one.

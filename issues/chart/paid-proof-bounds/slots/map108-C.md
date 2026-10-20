# Slot C map: report 108

## Verdict

**Confirmed.** The suspected cause is exact. One correction to the framing: this was not an unrelated later reopen. One chart's epic was transferred in waves, the first wave closed it, and the door then transferred the chart's remaining leaves under the same name.

## Verified cause

F108-1. `completeOwner` computes the owner from the leaf path (standalone issue, or the epic when the issue's parent is not `issues/open`), computes completeness only from leaves currently under `issues/open`, then throws `Completion destination exists` when `issues/closed/<basename(owner)>` exists. The throw is at `src/phase.ts:191-201` in `completeOwner`, before `closeSources`, before `packFolder`, and before the final `renameSync(owner, destination)` at `src/phase.ts:224-228`. So on every retry nothing completes, and the second wave's GitHub sources are never even attempted by completion.

F108-2. The retry paths guarantee the repeated failure the report shows: any `phase` call on a merged leaf calls `completeOwner` (`src/phase.ts:784`, `phaseCommand`), `commitMove` calls it on the move to `merged` (`src/phase.ts:163`), and `next` calls it for every merged leaf it visits (`src/next.ts:773`). Six merged leaves, six identical failures.

F108-3. Framework state matches every precondition. All six leaves under `/home/ivan/Work/infra/tamdoma/framework/issues/open/satellite-plan-fit/*/*/state.yaml` are `phase: merged`. `issues/closed/satellite-plan-fit/` holds `EPIC.md`, `brand-override`, `page-draw-preview`, and `evidence.tar.zst`. The six child issue names in open are disjoint from the two in closed.

F108-4. `ownerCompletes`, the reconcile mirror, also ignores the destination (`src/reconcile.ts:238-246`). It therefore keeps telling cleanup "this owner completes this pass," so a retained merged worktree and tab are kept forever awaiting a completion that always throws (`src/reconcile.ts:691-693,711`). This is why `pool-parity` still has its worktree.

## How the leaves got past the shapes preflight

The refusal exists only as audit prose: "refuse an existing `issues/closed/<top-level-owner-folder-name>`" in `## Preflight and validation` (`skills/chart-issues/assets/shapes.md:351`, there since 2026-09-11 per `git log -S`, commit `1956e56c`). No code enforces it. `akrogon preflight` checks only the git remote base (`src/preflight.ts`, `preflightCommand`). The post-write `akrogon status` parses state and readiness only, which `shapes.md:357` itself states does not prove the prose audit. Dispatch even has a test that a closed same-name owner does not block an open one (`tests/next.test.ts:5700`, name-resolution scope).

The actual sequence, from `/home/ivan/Work/infra/tamdoma/framework/issues/chart/satellite-plan-fit/CHART.md` (Destination, Pending steps, Handoff):

1. 2026-10-17: only `page-draw-preview` and `brand-override` were transferred into the open epic. The other five leaves were held as scratchpad drafts pending a Sonnet launch probe. At that handoff `issues/closed/satellite-plan-fit` did not exist, so the prose rule passed truthfully.
2. `brand-override` merged 2026-10-18T03:38Z and `page-draw-preview` 2026-10-18T04:38Z (`/home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl:3505,3520`). Completeness is computed from leaves on disk under open, so the epic "completed" and moved to closed. The five held drafts were invisible to the command.
3. 2026-10-18, after the probe: the door transferred the five held leaves plus `persona-text-bounds`, recording "(new EPIC.md, earlier leaves closed)" and "Gaps empty, no collisions" in CHART.md's Handoff section. The recreated open `EPIC.md` also states the earlier leaves are closed. So the closed folder's existence was known and recorded. Whether the door missed the shapes sentence or judged a same-epic continuation exempt is not recorded. No mechanical gate existed to fire either way.

## Root cause, one level deeper

Two assumptions compose into the defect:

1. **Premature completion.** Owner completeness means "every leaf currently written under open is merged." A staged handoff of one owner therefore closes the owner mid-chart, before its remaining leaves exist on disk.
2. **Single-lifetime destination.** Completion is one atomic `renameSync` into a destination that must be absent. Owner identity is only a folder basename with one lifetime.

Meanwhile the chart door treats an epic as a durable grouping that can receive waves, and dispatch tolerates the duplicate. The system holds two contradictory contracts: `shapes.md:351` and `completeOwner` say an owner name closes once; door practice and `next` say it can be reused. The throw is the single-lifetime contract winning at the worst possible time, after all second-wave work has merged.

While the duplicate exists, archived first-wave logs are also at risk: `locate` returns owner dirs in open, closed, parked order (`src/evidence.ts:49`), and `readLog` falls back to the archive of only the *first existing* owner dir (`src/evidence.ts`, `readLog`). The open twin currently has no `evidence.tar.zst`, so a first-wave log that exists only in the closed archive can read as no-match.

## The pack question the report left open

`packFolder` would not clash for this instance, and it is the reusable piece. It unions an existing folder archive with that folder's plain `*.log` files, refusing only a shared member with differing bytes (`src/pack.ts:12-33`, `packFolder`). Member names are owner-relative: the closed archive's 89 members sit under `brand-override/…` and `page-draw-preview/…`; the open owner's 708 plain logs sit under six disjoint child names. Packing the closed folder after moving the children in unions them cleanly.

Deleting only the throw is not a fix: `renameSync` onto an existing non-empty directory then fails *after* sources were closed and after `packFolder` packed the open folder and deleted its plain logs, leaving `.closing` behind to fail identically on retry. The only true collisions in a merge are the owner-root files both sides own: `EPIC.md` (or `ISSUE.md` for a standalone), `evidence.tar.zst`, and `.closing`. The two `EPIC.md` files here list different children, and neither is the union.

## Smallest systemic fix

D108. **Make completion append into an existing closed owner, and delete the single-lifetime contract.** An existing destination stops being an error and becomes the same owner's earlier wave:

- In `completeOwner` (`src/phase.ts:191`): keep the destination check before `closeSources`, but turn it into a collision precheck. When the destination exists, verify every child entry of the open owner is either absent in the destination or one of the root files the merge owns (`EPIC.md`/`ISSUE.md`, `evidence.tar.zst`, `.closing`). A real child collision refuses loudly before any source is closed.
- Move the child entries into the destination, install the open owner's index as the closed index, then run the existing `packFolder` on the destination so its archive-union and byte-conflict refusal do the evidence merge (`src/pack.ts`, `packFolder`). Remove the emptied open shell. No schema, state, or new store is needed.
- Delete the refusal sentence at `skills/chart-issues/assets/shapes.md:351` and replace it with the reopen rule that makes the merge well-defined: a reopened owner's index lists the closed children as well as its own, because it becomes the closed index verbatim (the current open `EPIC.md` only notes the earlier leaves in prose, so this instance needs that index fix before its completion can land cleanly). Slug uniqueness across open/closed is already required by the same paragraph.
- `ownerCompletes` needs no change: under append semantics its answer becomes true again (`src/reconcile.ts:238`).

This removes the problem class rather than guarding it: premature first-wave closure becomes harmless, a later chart reusing the epic completes, and the current six leaves finish through the normal `akrogon next` retry with no hand moves. Still needed: the child-move loop and its tests, an interrupted-merge retry case (below), and the index fix for the live epic.

The alternative, O108-2, is to enforce the single-lifetime contract instead: keep the throw, add a mechanical duplicate-owner refusal early (in the `akrogon status` the door must run after handoff writes, `shapes.md:357`, and in dispatch), and make reopening an explicit move of `closed/<owner>` back to `open/<owner>` before new leaves are written, following the folder-move pattern in `src/park.ts`, `parkCommand`. That adds no merge code and keeps completion atomic, but it rejects the report's expected behavior, leaves the current six needing exactly the manual merge it avoids in code, and has a real race: between the move-back and the first new `state.yaml`, the old all-merged leaves are open alone and any `next` pass recloses the epic, possibly carrying half-written child folders with it.

## Material forks

O108-1. **Append completion (recommended, D108).** Matches the report's expected behavior and the door's recorded practice. Costs the merge's edge cases, all enumerable: root index authority, child collisions, archive union, interrupted merge.

O108-2. **Single-lifetime owner names, reopen by move-back.** Matches `shapes.md:351` as written and keeps the atomic rename. Costs a door move-back procedure with a reclose race, an early duplicate guard, and a one-off manual rescue of `satellite-plan-fit`. A later wave must also either move the whole closed owner back or take a new name such as `satellite-plan-fit-2`, splitting one epic's history.

O108-3. **Ban partial owner population.** A chart writes either all of an owner's leaves at once (unready ones gated by readiness gaps or `blocked-by`) or none, so first-wave closure is never premature. This prevents this instance's sequence but does nothing for a genuine later reuse of a closed name, and it removes staged transfer, which the probe-gated hold legitimately used. Not sufficient alone.

## Questions

Q108-1. Is an owner name reusable with append semantics (report's Expected behavior), or single-lifetime (`shapes.md:351`)? The operator has to retire one of the two contracts; code and prose currently implement both.

Q108-2. Under append, is the open owner's `EPIC.md`/`ISSUE.md` the authoritative union index at completion, authored by the door at reopen transfer? Code merging markdown child lists is the kind of machinery to avoid; verbatim replacement plus a door rule is the small version.

Q108-3. Can a later wave add a leaf under a child issue that already exists in closed (same child folder, new leaf slug)? That turns the child move into a recursive per-folder merge with an `ISSUE.md` collision at that level too. Refusing it (new leaves need new child folders under a reopened epic) keeps D108 a shallow move.

Q108-4. What stops an unrelated future chart from silently adopting a closed epic by reusing its name? Under append, the handoff review should surface "closed owner will absorb these leaves" as an explicit line, same as it confirms grants.

## Lifetime pitfalls

R108-1. A merge is several renames, not the current atomic one (`src/phase.ts:224-228`). An interrupted merge can leave children split across open and closed. The design must be restartable from the existing signals: remaining open merged leaves drive `completeOwner` retries (`src/next.ts:773`), and `status` already prints `Unpacked:` guidance for closed folders holding logs or `.closing` and for open owners holding `.closing` (`src/status.ts`, `unpackedLines`). The dangerous residue is "all children moved, open shell remains": no open leaf remains to drive a retry, so pack and shell removal must be ordered so that state is either impossible or visible in `status`.

R108-2. Collision precheck must stay before `closeSources`. Closing GitHub sources for an owner whose local move then refuses repeats an external effect on every retry (idempotent per-source, `src/pull.ts`, `closeSource` returns on CLOSED, but noisy and wrongly ordered).

R108-3. A second completion prints `epic complete` again on the just-merged path (`src/phase.ts:224`), so merge broadcasts will announce a reopened epic's completion per wave. That matches per-wave sources, but the completion owner identity for broadcasts should be checked against the broadcast rule before append ships.

R108-4. Duplicate-owner evidence reads stay ambiguous during any reopened owner's open lifetime (`src/evidence.ts`, `readLog` first-existing archive). Under O108-1, `readLog` should try each existing owner dir's archive, or first-wave logs are unreadable exactly while second-wave seats may cite them. Under O108-2 this state cannot arise.

R108-5. Do not put a duplicate-owner guard inside `allLeaves`/`readState` inventory if O108-2 is chosen: one bad owner would then block unrelated commands repo-wide, which is report 102's defect class. The guard belongs on the affected owner's dispatch and status paths.

## Relation to #102–#107

S108-1. **#103: same function, same stuck outcome, masking order. Fold together under O108-1.** Both are `completeOwner` assuming an ideal terminal pass: #103 requires the entry leaf's ephemeral worktree to still exist for the `merged <commit>` source comment (`src/pull.ts:184-190`, `closeSources`); #108 requires the closed destination to be absent (`src/phase.ts:201`). #108 throws first, so it masks #103. In this very epic, five of the six merged states have no `worktree:` (only `pool-parity` does, per their `state.yaml` files): fix #108 alone and completing via any sourced worktree-less leaf immediately hits #103; only the `pool-parity` entry could close all sources. The shared root is that owner completion is not idempotent against states the lifecycle itself produces (worktree cleaned before owner completion, owner closed by an earlier wave). One chart can own both with a single destination: a merged owner always finishes into `issues/closed` on retry, whether its checkouts are gone or an earlier wave already sits there. Under O108-2 they separate again, since #108 becomes a door/status guard rather than completion code.

S108-2. #102 shares only the guard-placement lesson (R108-5). #104 shares the `commitMove` → `completeOwner` call: a stacked landing of a reopened epic's last leaves would surface the same throw wrapped as a committed-move failure, but stack selection is not the cause. #105, #106, #107: no shared mechanism (#106's "existing destination, compare contents instead of refusing by name" is analogous in spirit, different code in `src/sync.ts` vs `src/phase.ts`).

## Recommended split change

No new chart. Expand the existing C2 from the #102–#107 map and retitle its destination:

**C2 (amended). Owner completion always finishes:** A merged completion owner closes its sources and moves into `issues/closed` on retry, without depending on a surviving leaf worktree (#103) and appending into the same owner's earlier closed wave when one exists (#108).

C1, C3, C4, C5, C6 unchanged. If the operator instead picks O108-2, revert this amendment: C2 keeps its #103 destination and #108 becomes a small separate chart, "an owner name exists in exactly one of open/closed, refused at status and dispatch, reopened only by moving the closed folder back."

## Source tiers and searches

- Operator: the brief and its preference for removal over added machinery; the report's Expected behavior is agent-view intake, not a taken operator answer (`issues/seeds/108-merged-leaves-of-a-reopened-epic-never.md`, "Whose view: agent").
- Primary local evidence: akrogon `src/phase.ts`, `src/pull.ts`, `src/pack.ts`, `src/reconcile.ts`, `src/evidence.ts`, `src/status.ts`, `src/preflight.ts`, tests, and `skills/chart-issues/assets/shapes.md` at HEAD `b5a877c1`; framework `issues/open`, `issues/closed`, `issues/chart/satellite-plan-fit/CHART.md`, `issues/log.jsonl` at `/home/ivan/Work/infra/tamdoma/framework`.
- Searches run: local `rg` for `completeOwner`/`ownerCompletes`/`packFolder` and completion tests; `git log -S` for the shapes refusal line (`1956e56c`, 2026-09-11) and the destination throw; framework tree/state inspection and a read-only Bun listing of the closed `evidence.tar.zst` members (89 members). No `akrogon next/phase` was run against the framework repo; the failure is traced statically through `src/next.ts:773` → `src/phase.ts:201`.
- Practitioner, better-than-training, model-knowledge tiers: none used. No web search.

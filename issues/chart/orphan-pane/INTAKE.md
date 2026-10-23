# Intake: orphan-pane

## Scope

An interrupted `akrogon next` seat allocation leaves no pane in the leaf tab that state does not record. #116.

## Provenance

- GitHub: Tamdoma/akrogon#116
- Operator: door session f254b4d3 pane w8:pNP, 2026-10-22

## Source: Tamdoma/akrogon#116

# next leaves an untracked extra pane in a leaf tab after seat pane allocation (suspected: interrupted allocate)

Source: Tamdoma/akrogon#116
URL: https://github.com/Tamdoma/akrogon/issues/116

Origin repo: Tamdoma/lingua-relay

Unverified intake.

## Observation

In lingua-relay, leaf `stvaranje-okruzenja` (tab `w2:t6`) had three panes: `w2:pA`, `w2:pB`, `w2:pC`. Its `state.yaml` recorded `pane.A: w2:pA` and `pane.B: w2:pC`. `w2:pB` was an idle shell at the worktree prompt, with no agent, used by no seat. Every other leaf tab dispatched in the same batch (pravila-podataka, hrvatski-tekst, dizajn-sustav, blepsis-pokretac) had exactly two panes. The operator closed `w2:pB` by hand with `herdr pane close w2:pB`.

## Location

`akrogon next` seat allocation, `allocate()` in `src/next.ts` (release 92dddada7b2d0a1b37fcb3b1bce9993d535bb62b), reached from the dispatch path at `src/next.ts:779` and from `broadcastPass` at `src/next.ts:1093`.

## Reproduction

Not provided. Seen once, on 2026-10-22 around 18:20 UTC, when the leaves blocked on `kostur-aplikacije` were dispatched after it merged.

## Expected behavior

A failed or interrupted seat allocation leaves no pane in the leaf tab that state does not record, or a later `next` reuses it.

## Urgency

Low. An extra idle shell sits in the leaf tab and clutters the workspace, and seats are unaffected. Workaround: close the pane that `state.yaml` does not record with `herdr pane close <pane>`.

## Suspected cause

Agent view, inferred from code. No direct failure record was found.

In `allocate()` (`src/next.ts:371-511`), the tab id is saved first (`saveState` with `tab`), then the B pane is split (`src/next.ts:500-508`) and `box(second)` runs, and only after that does `saveState` record `pane: { A, B }`. If `box()` throws (systemd scope adoption has a 5s deadline and throws `... is not in its own scope after adoption`) or the process is interrupted after the split, the tab is recorded but neither pane is. On the next `next`, the tab matches via `state.tab`, `state.pane.A` and `state.pane.B` are both undefined, so `bootstrap` is true. `first` becomes `members[0]` (pA) and `recordedB` is undefined, so a new B is split (pC). The first B pane (pB) is never recorded or cleaned up. `members[0]` is taken by position, so which of the extra panes is reused depends on herdr's ordering.

Two concurrent `next` runs are a less likely cause: callers wrap allocation in `withLock(resolve(globalHome(), '.lock'))` (`src/next.ts:913`, `1085`, and others).

Files read: `src/next.ts:371-511`, `:770-782`, `:1080-1096` in `/home/ivan/Work/infra/akrogon` at HEAD 92dddada (identical to the installed release copy `~/.akrogon/releases/92dddada…/src/next.ts`), lingua-relay `issues/open/osnova-aplikacije/temelj/stvaranje-okruzenja/state.yaml`, `issues/log.jsonl`, `issues/timings.jsonl`.

Not inspected: `inOwnScope`/`adoptShell` internals, herdr server logs, and stdout/stderr of the `next` run that dispatched this leaf (it ran from the merge slot of `kostur-aplikacije`). Evidence that `box()` or an interruption fired between split and save would confirm this. A record of a single allocate run producing both pB and pC would disprove it.

Related reports: none found (searched Tamdoma/akrogon, all states, `--author @me` since 2026-10-20, limit 30, and keyword `orphan pane split`, limit 10).

## Source: operator 2026-10-22 door start

I pulled another series of issues. Consolidate them and categorize them. Use slot b and slot c (active panes in your herdr tab) to consult. Come up with solutions and chart them out. Best, simplest, most elegant solutions. Always see if you can reduce code first rather than just cramming new complex code on. Keep the code lean. Full autopilot mode, I give you all the permissions. watch-akrogon is the watcher agent tab in this herdr workspace.

## Agent findings

Opening maps (A,B,C): slots/map-A.md, slots/map-B.md, slots/map-C.md. Proofs: see forks.

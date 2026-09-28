# Rebuttal B: base-preflight

Read both positions. Verified A's git claims live in temp repos before resolving.

## Agreements (no fork)

Two single-purpose probes, C1 via `git remote get-url`, C2 on `ls-remote` exit 2 only, everything else unproven, `trackingRef()` feeding `base()` and `worktree add`, `target()` kept for `phase.ts`, README plus command-reference plus `shapes.md` changes, real-git tests. Live verification confirmed: missing remote makes `get-url` exit 2 while `ls-remote` exits 128 for both missing and unreachable remotes, empty bare remote exits 2, present branch exits 0, `rev-parse --verify --quiet <tracking>^{commit}` exits 1 when absent, and abbreviated `origin/main` resolves to a divergent `refs/heads/origin/main` over the tracking ref. The hijack is real, so the `trackingRef()` change at both consumers stands.

## F1: gate location — adopt A

A gates inside `ensureWorktree` after the path-mismatch check; B gated in `dispatchLeaf` before `allocate()`. A wins. The mismatch check at `src/next.ts:232-236` must stay first: a moved repo reporting C3 would mislead. Gating inside reuses the existing `existsSync` branch for `mustCreate` instead of duplicating the expected-path computation, and it covers every current and future `ensureWorktree` caller from one choke point. B's earlier placement saved a few Herdr reads on the failure path but duplicated path logic and inverted the mismatch ordering. Conceded.

Capacity note: gating after the capacity check means an at-capacity leaf waits silently instead of reporting the base. Acceptable: broken-base leaves never acquire tabs so they never consume capacity, and the error surfaces on the next dispatch once capacity frees.

## F2: orchestration shape — adopt A

A's `checkBase(repo, remoteRequired)` centralizes the local-fail-then-classify sequence; B duplicated it in `preflight()` and `gateBase()`. A wins on DRY: the boolean is caller-observed filesystem state (whether creation will happen), not a mode flag inside a probe, and both probes stay single-purpose as the design requires. B's split only multiplied the classify sequence. Conceded.

## F3: preflight success output — adopt A (silent)

B printed `<remote>/<branch> <sha>`; A stays silent. The brief contracts exit 0 only, with no output requirement, and tests can `rev-parse` the tracking ref directly. Silent is less surface to maintain. Conceded.

## F4: fixture repair — adopt A, conceded miss

B missed that `tests/helpers.ts:21` plants `refs/remotes/origin/main` without any configured remote, so the new gate turns every worktree-creating dispatch test C1. A's repair (bare `remote.git` under `home`, `remote add`, push, drop `update-ref`) plus the thirteen `remote add` collision sites in `next`, `pull`, and `sync` tests belongs in the plan. No debate; B failed to check the fixture against the gate.

## F5: rev-parse strictness — adopt A

A maps exit 1 to C3 and rethrows anything else as `CommandError`; B treated every failure as local-missing. Verified exit 1 for the absent ref. A corrupt repo or unexpected code must surface as itself, never as a fetch instruction. Conceded, including `--quiet` to keep expected C3 failures out of stderr.

## F6: CLI error plumbing — hold B (catch PreflightError, print, exit 1)

A propagates the error to Bun's default handler; B catches the specific `PreflightError`, prints its message to stderr, and exits 1. Holding B: the remediation text is the handoff user interface per Q1-A, and a stack trace buries it. The catch is specific to one error type, other errors still propagate, and the dispatch path is unaffected since it already presents through `report()` JSON. Four lines for a readable refusal.

## Correction to A

A lists `src/log.ts:11` alongside `phase.ts` as remaining ambiguous. Live code shows `log.ts` calls `base()`, which both positions fix, so it inherits full qualification. The known limitation is `phase.ts:259,266-267` only, locked by the design's explicit scope.

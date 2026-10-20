# Brief: shared-inventory

## What

All reading of leaf `state.yaml` files under `issues/open`, `issues/closed` and `issues/parked` goes through one inventory in `src/state.ts` (C). It keeps strict parsing and returns the readable leaves plus each bad leaf, unreadable folder and foreign-repo leaf separately (path and error) instead of throwing (B,C). Every command that reads leaves uses it, so one bad file stops only its own leaf: commands for other leaves work, the bad leaf is reported by path, and naming the bad leaf gives its own error. The separate walks it replaces are deleted, and so are the legacy shims in `readState` (the 4-key skip list and the empty `batch.members` normalization).

## Why

Today about six separate walks each decide alone what a bad file does. `allLeaves` (and through it `findLeaf`, `config`, `run-check`, `phase`) and `status` stop the whole repo on one bad leaf, while `next` `discover` already isolates it. In the framework repo one seat added two notes keys to its own `state.yaml` and every command in the repo failed twice (#102). One shared inventory gives one rule and removes the duplicate walks. Strict parsing stays so a stray or misspelled key is reported, never silently dropped.

## Done-criteria

1. In a repo where one open leaf's `state.yaml` has an unknown top-level key, for a different healthy leaf: `akrogon next <healthy slug>` dispatches it, `akrogon phase <healthy slug> <phase>` moves it, and `akrogon config` and `akrogon run-check` run from its worktree resolve it; `akrogon status` lists the repo's healthy leaves plus one entry naming the bad file and its error, and exits 1. Shown failing before the change and passing after, through the CLI test fixture.
2. Criterion 1 holds when the bad leaf instead has malformed YAML, an invalid known value, or sits under `issues/closed`.
3. Naming the bad leaf itself (`akrogon next <bad slug>`, `akrogon phase <bad slug> <phase>`) fails with that leaf's parse error naming its file, not a missing-leaf error.
4. A bad leaf is never dispatched and never takes the merge turn, but still counts as owned: reconcile keeps its worktree and tab, it still holds a capacity slot, its own owner does not complete, and a leaf whose `blocked-by` names it stays blocked; another owner with no bad leaf completes in the same pass.
5. The watch observer (`skills/watch-issues/scripts/observe.ts`) still reports a healthy open leaf beside a bad sibling and names the bad file (B).
6. A `state.yaml` carrying `priority`, `slot`, `failed_notified`, `solo` or an empty `batch.members` is reported as that leaf's error.
7. No module other than `src/state.ts`, in `src` or `skills`, walks `issues/open`, `issues/closed` or `issues/parked` for `state.yaml` files or parses a leaf state outside `readState` (B,C).

# unknown-keys

## Question

Ignore unknown top-level keys and delete the hand-made skip list, or keep strict parsing and fail only the bad leaf through one shared inventory?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

## Findings

Merged notes: slots/notes-merged.md (A,B,C blind notes, B and C rebuttals applied).

- All three slots picked strict parsing with one shared inventory. Strip covers only extra top-level keys, erases them on the next save and accepts typos (B measured).
- Six separate walks read leaves: `allLeaves`/`findLeaf` throw repo-wide, `status` `scanRepo` fails the whole repo, `next` `discover` already isolates per leaf, plus `reconcile` `collectSlugs`, `park`, `stop`, `timing-report`, `config`, `run-check`.
- Live 2026-10-19: 821 states across 11 registered repos; the 4-key skip list served only 2 closed akrogon leaves (`priority: n`); no live state carries `batch.members`.
- No seat skill (plan, implement, check, merge) mentions `state.yaml`; only watch-issues forbids editing it.

## Taken

Operator 2026-10-19: `1a | 2a | 3a`.

1. 1a: keep strict parsing; one shared inventory returns readable leaves plus retained failures (path, error); every walker uses it and the duplicate walks are deleted. A bad leaf stops only itself; naming it still gives its own error. Reason: covers every kind of bad file and removes duplicate code.
2. 2a: the door removes `priority: n` from the 2 closed akrogon leaves on main, then the leaf deletes the 4-key skip list and the empty `batch.members` shim. Reason: dead code once 1a contains any old file to its own leaf.
3. 3a: no guard against seats writing `state.yaml`. Reason: 1a contains the damage to one leaf with a named error.

Done 2026-10-19 (step on main for 2a): removed `priority: n` from `issues/closed/akrogon-loop/bootstrap/{command,core-skills}/state.yaml` (uncommitted, left for the operator's issues commit). Verified: all 821 live states across the 11 repos pass `stateSchema` with no skip list and no shim; `akrogon status` exit 0.


# Implementation report: readiness-contract

## Changed files and reasons

- `src/readiness.ts` (new) — `readinessSchema` and section schemas verbatim from design.md, `readReadiness`, `holderRoot`, `gaps`, `Readiness`, `Gap`.
- `src/next.ts` — `dispatchLeaf` gate directly after `blocked-by`, before `seats`/`checkBase`/`allocate`: explicit throws naming every missing input (JSON-reported, exit 1); implicit returns `'waiting'`. Invalid `readiness.yaml` propagates through `report` naming the file.
- `src/status.ts` — `ScannedLeaf` carries `missing: Gap[]`; `scanRepo` takes `global`, points `path` at the leaf's `readiness.yaml` before gap computation so a bad contract reports that file via the existing `{unreadable}` diagnostic; overview prints `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` after `Failed:` lines for non-merged leaves; detail prints the same lines after state YAML, before `History:`.
- `src/AREA.md` — one Key-files line.
- `tests/readiness.test.ts` (new), `tests/next.test.ts`, `tests/status.test.ts` — done-criteria coverage below.

Worker deviation (accepted): `readReadiness` throws `ReadinessError` (subclass of `Error`, message preserved) so `scanRepo`'s catch whitelist converts an invalid contract into the unreadable-leaf diagnostic instead of crashing `status`. Criterion 6 holds: exit non-zero, file path in output.

## Commands run

| Command | Result | Wall time |
|---|---|---|
| `AKROGON_BASE=b2c15ec bun test --changed=$AKROGON_BASE --timeout=30000` (after each pick) | 14 → 168 → 190 pass, 0 fail | ~7s |
| `bun run format` | applied; formatting committed | <1s |
| `bun run typecheck` | clean | ~5s |
| `bun test --timeout=30000` (whole suite, `checks.test`) | 380 pass, 0 fail, 17 files | 11.57s |

## Done-criteria → evidence

1. Schema accepts complete example, refuses unknown key / whitespace-only field / fixture without cleanup / retained without `exposure` / unknown `kind` → `tests/readiness.test.ts` (6 tests).
2. `holderRoot` registered key → registered root; absolute path → directory; unregistered key and relative path → throw naming holder → `tests/readiness.test.ts`.
3. env `FOO` gap matrix (.env absent, name absent, `FOO=`, `FOO="  "`) → exit non-zero naming `FOO`, no worktree/branch/tab/pane; `FOO=x` dispatches. File input absent/zero-byte refused, non-empty dispatches. Implicit `--all` leaves gapped leaf waiting, dispatches sibling → `tests/next.test.ts`.
4. Unregistered absolute-dir holder checked against that dir's `.env` → `tests/next.test.ts`.
5. `status` and `status <slug>` print `Missing:` with kind/name/holder/steps; `OTHER=secretvalue123` never appears → `tests/status.test.ts`.
6. Invalid `readiness.yaml` → `next <slug>` reports file path, leaf skipped → `tests/next.test.ts`.

## Base and head

- Base: `b2c15ec5d2fe889e158934b084dd93cfeafc9f72`
- Head: `fb10e25` on branch `readiness-contract`

## Known limitations

- `status <slug>` on a merged/closed leaf still prints its `Missing:` lines when `readiness.yaml` exists (design literal).
- An invalid holder fails that leaf's whole gap computation, treated like an invalid contract (leaf skipped as unreadable).

## Unverified criteria

None.

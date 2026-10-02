# Brief 3: `akrogon status` Missing lines (U3)

## 1. Goal

`akrogon status` prints one `Missing:` line per readiness gap across open leaves, and `akrogon status <slug>` prints the same lines for that leaf. An invalid `readiness.yaml` is reported with its path and the leaf skipped, like any unreadable leaf. Plan decision D8. Owns `src/status.ts` and `tests/status.test.ts` (append tests).

## 2. Acceptance criteria

1. `akrogon status` prints `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` for every gap of every non-merged open leaf, after the `Failed:` lines.
2. `akrogon status <slug>` prints the same lines for that leaf after the state YAML, before `History:`.
3. With `.env` holding `OTHER=secretvalue123` and `FOO` absent, neither `status` nor `status <slug>` output contains `secretvalue123`.
4. An invalid `readiness.yaml` in `status` overview is reported with the file path (the leaf behaves like an unreadable leaf: `{unreadable: <repo>, path: <readiness.yaml path>, error}` diagnostic on stdout, exit 1); in `status <slug>` it exits non-zero naming the path.
5. A leaf without `readiness.yaml` behaves exactly as today (no lines, no errors).

## 3. Read-first list

- `src/status.ts` — `scanRepo` walk: the leaf `try` block sets `path` then calls `validateLeafDepth`/`readState`; errors inside become `{ok:false, repo, path, error}`. `statusCommand`: `Failed:` loop, per-repo sections, `<slug>` detail path prints state YAML then `History:`.
- `src/readiness.ts` — `readReadiness(leafPath)` (null when absent, throws naming file when invalid), `gaps(global, readiness)`, `Gap {kind,name,holder,steps}`.
- `src/config.ts` — `GlobalConfig`; `statusCommand` already has `global` from `readGlobal()`.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`; `tests/status.test.ts` — `register(f, repos)`, snapshot assertions.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/status.ts`:
  - Import `{ readReadiness, gaps, type Gap }` from `./readiness`.
  - `scanRepo` takes a third parameter `global: GlobalConfig`. In the leaf `try` block, after `readState`/repo checks and before pushing the leaf, set `path = resolve(folder, 'readiness.yaml')`, call `readReadiness(folder)` and compute `missing: Gap[]` (`readiness === null ? [] : gaps(global, readiness)`). Errors propagate to the existing catch → `{ok:false}` with `path` = the readiness.yaml path, matching unreadable-leaf handling.
  - Carry `missing` per leaf: extend `Scan.ok` `leaves` elements to `{ path, state, missing }` (a new `ScannedLeaf` type) or keep a parallel `Map<Leaf, Gap[]>` — pick the smallest diff; do not change `Leaf` in `src/state.ts`.
  - `statusCommand`: after the `Failed:` lines loop, iterate ok scans' leaves where `state.phase !== 'merged'` and `console.log(\`Missing: ${scan.repo.name}/${leaf.state.slug} ${g.kind} ${g.name} in ${g.holder}: ${g.steps}\`)` per gap.
  - `<slug>` detail: after `findLeaf`, compute the leaf's `missing` the same way and print the same `Missing:` lines after the state YAML console.log, before `History:`.

## 5. Do-not, reasons and exceptions

- Do not alter `Leaf`, `state.yaml` schema or `src/readiness.ts` — `Leaf` is shared state surface, readiness API is landed; exception: revised brief.
- Do not compute gaps during `walk` for `state.phase === 'merged'` leaves — merged leaves produce no `Missing:` lines; but an invalid `readiness.yaml` on a merged leaf may still mark the repo unreadable (it lives inside the leaf `try`); do not special-case beyond the design.
- No env values in output — `Gap` has no value field; no exception.
- Do not touch `src/next.ts` or `tests/next.test.ts` — U2 owns them.
- Return a mismatch with evidence instead of changing scope; exception is a revised brief from A.

Reasons restated: shared `Leaf` type and landed schema are fixed surfaces; secrets never print; ownership bounds prevent conflicts. Exceptions: only a revised brief from A.

## 6. Ordered steps

1. Append tests to `tests/status.test.ts` (criteria 1–5): leaf with `readiness.yaml` env `FOO` holder `repo` and `steps` text; run `cli(f, ['status'])` and `cli(f, ['status', slug])`; assert `Missing:` line contains kind `env`, name `FOO`, holder `repo`, steps text; write `.env` with `OTHER=secretvalue123` and assert outputs exclude it; add merged leaf with gaps → no `Missing:` for it; invalid `readiness.yaml` → exit 1 with file path in output; no readiness.yaml → unchanged output.
2. Edit `src/status.ts` per section 4.
3. Run the changed-tests command; paste output.

Advisory size: 2 files, under 12 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/readiness-contract-u3
AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Criteria 1–5 proven by new tests, pasted output, commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

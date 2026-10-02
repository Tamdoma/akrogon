# Brief 2: `akrogon next` dispatch gate on readiness gaps (U2)

## 1. Goal

`dispatchLeaf` in `src/next.ts` refuses to dispatch a leaf whose `readiness.yaml` has gaps, at the point directly after the `blocked-by` gate and before `seats(global, repo)`, `checkBase` and `allocate`. Plan decision D7. Owns `src/next.ts` and `tests/next.test.ts` (append tests at the end of the file).

## 2. Acceptance criteria

1. Leaf whose `readiness.yaml` declares env `FOO` held by `repo` (its own repo): `akrogon next <slug>` exits non-zero and stderr names `FOO`, and creates no worktree, branch, tab or pane — when `.env` is absent, when `FOO` is absent from `.env`, when `FOO=`, and when `FOO="  "`. With `FOO=x` it dispatches (tab created, prompt sent).
2. A declared `file` input absent or zero bytes refuses the same way; a non-empty file dispatches.
3. An implicit `next --all` leaves the gapped leaf undispatched (no worktree/tab/pane) and dispatches an ungapped sibling.
4. An input held by an unregistered absolute directory is checked against that directory's `.env`.
5. An invalid `readiness.yaml` (malformed YAML or schema violation) makes `akrogon next <slug>` exit non-zero with stderr naming the `readiness.yaml` file path; leaf stays undispatched.

## 3. Read-first list

- `src/next.ts` — `dispatchLeaf` around the `blocked-by` check; `report` writes the JSON stderr line; `invocation.skipped` drives exit code 1.
- `src/readiness.ts` — `readReadiness(leafPath)`, `gaps(global, readiness)`, `Gap {kind,name,holder,steps}`; both throw on invalid contract/holder.
- `tests/helpers.ts` — `dispatchFixture`-style setup lives inside `tests/next.test.ts`; `leaf(f, slug, phase)` writes `state.yaml`; `yaml(path, obj)` writes YAML.
- `tests/next.test.ts` — existing patterns: `dispatchFixture`, `next(f, ['slug'])`, `database(f).prompts/tabs/panes`, `skips(result)` parses stderr JSON lines, `readState`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `src/next.ts`: import `{ readReadiness, gaps }` from `./readiness`. In `dispatchLeaf`, directly after the `blocked-by` dependency check block (`if (!dependencies.every(...))`) and before `seats(global, repo)`:

```ts
const readiness = readReadiness(leaf.path);           // throws naming the file when invalid → caught by report → leaf skipped
const missing = readiness === null ? [] : gaps(global, readiness);
if (missing.length > 0) {
  if (explicit)
    throw new Error(`Leaf inputs are missing: ${slug}: ${missing.map((g) => `${g.kind} ${g.name} in ${g.holder}`).join(', ')}`);
  return 'waiting';
}
```

Keep it in the existing `try` so `report` handles both the throw and a `readReadiness` failure identically to today. The thrown message names every missing input; no env value may appear (it cannot — `Gap` carries no value).

- `tests/next.test.ts`: append tests. Minimal readiness fixture: `yaml(resolve(leafPath, 'readiness.yaml'), { inputs: [{kind:'env', name:'FOO', holder:'repo', purpose:'p', consumers:['x'], steps:'s', source:'t', done:'d'}], produces: [], grants: [], retained: [], proofs: [] })`. For a `file` input use `kind:'file', name:'need.txt'`. Write `.env` with `writeFileSync(resolve(f.root, '.env'), 'FOO=x\n')`. For unregistered-dir holder (criterion 4) use a `mkdtemp` dir outside `f.root` with its own `.env`. No-worktree proof: `existsSync(resolve(f.root, 'issues/worktrees'))` false and `(await run(['git','branch','--list',slug], f.root)).stdout` empty; no tabs/panes/prompts in `database(f)`. For implicit sweep (criterion 3) use `next(f, ['--all'])` and assert gapped leaf has no worktree while the sibling dispatched.
- For criterion 5 write `readiness.yaml` with malformed content e.g. `inputs: [` — assert stderr contains the file path.

## 5. Do-not, reasons and exceptions

- Do not move the gate earlier or later — the design fixes it directly after `blocked-by` and before seat/base/allocate so no worktree, branch, tab or pane is created; exception: revised brief.
- Do not touch `src/readiness.ts`, `src/status.ts`, `src/state.ts` or other files — owned elsewhere or out of scope; exception: revised brief.
- Do not change `Gap` or print env values — secrets never reach output; no exception.
- Do not add tests for `status` — U3 owns them.
- Return a mismatch with evidence instead of changing scope or an interface; exception is a revised brief from A.

Reasons restated: gate position is a locked decision (no allocation before inputs resolve); secrets never print; ownership bounds prevent worker conflicts. Exceptions: only a revised brief from A.

## 6. Ordered steps

1. Append tests to `tests/next.test.ts` covering criteria 1–5 (one test may cover several criteria; e.g. one test loops the four `.env` states for criterion 1).
2. Edit `src/next.ts` per section 4.
3. Run the changed-tests command; paste output.

Advisory size: 2 files, under 12 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/readiness-contract-u2
AKROGON_BASE=b2c15ec5d2fe889e158934b084dd93cfeafc9f72 bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Criteria 1–5 proven by new tests, pasted output, commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

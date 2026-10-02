# Plan: readiness-contract

Synthesis direct from brief and locked design (`debate: "no"`); no positions exist.

## Read first

- `src/next.ts` — `dispatchLeaf` gate order: `blocked-by` → this leaf's gap check → `seats`/`checkBase`/`allocate`.
- `src/status.ts` — `scanRepo` walk and `{ok:false}` reporting; `statusCommand` `Failed:` loop and `<slug>` detail path.
- `src/config.ts` — `GlobalConfig`, `expandPath`, `globalHome`; `readRepo` computes `root` as `realpathSync(expandPath(path, globalHome()))`.
- `src/state.ts` — `Leaf`, `findLeaf`, `readState`.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `yaml`, `fakeHerdr`; `fixture` registers `repos: { repo: root }`.
- `tests/next.test.ts` — `dispatchFixture`, `skips`, `database(f).prompts`, explicit-vs-sweep patterns.
- `tests/status.test.ts` — `register` for multi-repo, snapshot no-write assertions.
- Design schema block — literal field names are binding for door-readiness and seat-input-rules.

## Decisions

- D1: `src/readiness.ts` owns the zod-4 schema verbatim from design.md (`readinessSchema` plus `inputSchema`, `produceSchema`, `fixtureSchema`, `grantSchema`, `retainedSchema`, `proofSchema`) and exports `Readiness`, `Gap`, `readReadiness`, `holderRoot`, `gaps`. One rule definition; door-readiness only tests agreement.
- D2: `readReadiness(leafPath)` reads `<leafPath>/readiness.yaml` with `readFileSync` + `Bun.YAML.parse` + `readinessSchema.parse`; returns `null` only when the file is absent; throws an `Error` whose message includes the file path on parse or schema failure.
- D3: env gap: holder's `.env` absent, name absent from `node:util` `parseEnv` output, or value trims to empty. Verified on bun 1.4.2: `parseEnv('A=1\nB=\n# c\nexport D="x y"\nE="  "')` → `{A:"1",B:"",D:"x y",E:"  "}`. Parsed contents never leave `gaps`; no output contains a value.
- D4: file gap: `resolve(holderRoot, name)` is absent or `statSync` size is 0.
- D5: `holderRoot(global, holder)`: `holder` in `global.repos` → `realpathSync(expandPath(global.repos[holder], globalHome()))` (same as `Repo.root`); else absolute path → the path itself; else throw naming the holder (covers unregistered key and relative path).
- D6: `produces`, `grants`, `retained`, `proofs` validate for schema only and never produce a `Gap` (key-sheet Taken: produced values are proven before dependents hand off).
- D7: `next`: in `dispatchLeaf`, after the `blocked-by` gate and before `seats(global, repo)`/`checkBase`/`allocate`, compute `gaps`. Any gaps → explicit throws `Leaf inputs are missing: <slug>: <kind> <name> in <holder>` (comma-joined), existing `report` prints the JSON error and the process exits 1; implicit returns `'waiting'`. Nothing is allocated, branched or prompted. `readReadiness` throwing propagates to the same `report`, naming the file, leaf skipped. Merged/failed leaves return before this gate, unchanged.
- D8: `status`: `scanRepo` gains a `GlobalConfig` parameter; inside the leaf `try` block it sets `path = resolve(folder, 'readiness.yaml')`, calls `readReadiness` and computes `gaps`, attached to the emitted `Leaf` record (`Scan` carries `{ leaf, gaps }` pairs). An invalid contract propagates like any unreadable leaf: `{unreadable: repo, path: <readiness.yaml>, error}` on stdout, exit 1. `statusCommand` prints `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` per gap for every non-merged scanned leaf after the `Failed:` lines. `status <slug>` computes gaps for the found leaf and prints the same lines after the state YAML, before `History:`; an invalid contract throws naming the path.
- D9: No `state.yaml` schema, phase routing, seat prompt or skill changes; no live calls; no env reads beyond `gaps` internals; no env writes.

## Interfaces

```ts
// src/readiness.ts (new) — exact schemas per design.md
export type Readiness = z.infer<typeof readinessSchema>;
export type Gap = { kind: 'env' | 'file'; name: string; holder: string; steps: string };
export function readReadiness(leafPath: string): Readiness | null;
export function holderRoot(global: GlobalConfig, holder: string): string;
export function gaps(global: GlobalConfig, readiness: Readiness): Gap[];
```

- `src/next.ts`: `import { readReadiness, gaps } from './readiness'`; gate in `dispatchLeaf`.
- `src/status.ts`: `import { readReadiness, gaps, type Gap } from './readiness'`; `scanRepo(name, registeredPath, global)`; `Scan.ok` leaves become `{ path, state, missing: Gap[] }` (or a sibling `gaps` map — implementer picks the smallest diff keeping `Leaf` untouched).

## Checklist

### Wave 1

- **U1** — `src/readiness.ts`, `tests/readiness.test.ts`, `src/AREA.md`
  - Verbatim schemas; `readReadiness`/`holderRoot`/`gaps` per D2–D5.
  - Tests (criteria 1, 2): complete example holding every section parses; refuses unknown key, whitespace-only text field, fixture without cleanup step, retained record without `exposure`, unknown `kind`. `holderRoot` returns registered root for a repo key, directory for an absolute path, throws naming the holder for an unregistered key and a relative path.
  - `src/AREA.md`: one key-file line for `src/readiness.ts`.

### Wave 2

- **U2** — `src/next.ts`, `tests/next.test.ts` — needs U1
  - Gate per D7. Tests (criteria 3, 4, 6): `readiness.yaml` declaring env `FOO` holder `repo`; `.env` absent / `FOO` absent / `FOO=` / `FOO="  "` → `next <slug>` exits non-zero, stderr names `FOO`, no worktree dir, no `git branch --list <slug>` match, `database(f)` has no tabs/panes/prompts/starts; `FOO=x` → dispatches. `file` input absent or zero bytes → same refusal, non-empty → dispatches. Implicit `next --all`: gapped leaf stays undispatched, ungapped sibling dispatches. Unregistered absolute holder dir: checked against `<dir>/.env`. Invalid `readiness.yaml`: `next <slug>` exits non-zero, stderr names the file path, leaf undispatched.
- **U3** — `src/status.ts`, `tests/status.test.ts` — needs U1
  - Missing lines per D8. Tests (criterion 5): `status` and `status <slug>` print `Missing:` lines carrying kind, name, holder and steps for each gap; with `.env` holding `OTHER=secretvalue123` and `FOO` absent, neither output contains `secretvalue123`.

Units in wave 2 own disjoint paths and share only landed U1, no shared fixture. No shared test resource: all fixtures are temp dirs.

## Done-criteria → proof

| # | Command | Catches | Size | Rerun trigger |
|---|---------|---------|------|---------------|
| 1, 2 | `bun test tests/readiness.test.ts --timeout=30000` | schema drift, holder resolution regressions | seconds | diff in `src/readiness.ts` or the test |
| 3, 4, 6 | `bun test tests/next.test.ts --timeout=30000` | gate order, value leakage into dispatch | minutes | diff in `src/next.ts`, `src/readiness.ts` or the test |
| 5 | `bun test tests/status.test.ts --timeout=30000` | missing-line format, value leakage into status | seconds | diff in `src/status.ts`, `src/readiness.ts` or the test |
| all | `bun run typecheck`, `bun run format` | type and format drift | seconds | any diff |
| all | `bun test --timeout=30000` (repo `checks.test`; the brief names this suite) | cross-command regressions (discover, capacity, locked sweep) | minutes | final gate before check.review |

No merge_checks are configured; none are added.

## Doc checklist

- `src/AREA.md`: one key-file line (U1). README command table and `docs/guide/` stay accurate — `next` still "dispatches eligible work", `status` still "shows the board"; readiness is an eligibility detail, not a signature change. No other agent or human doc is affected.

## Credentials

The design names no env variable this leaf itself needs (the schema's `credential`/`holder` fields are data, not leaf inputs). No `.env` presence check is required for execution.

## Limitations and exclusions (preserved)

- `status <slug>` on a closed/merged leaf still prints its `Missing:` lines when a `readiness.yaml` exists (design literal).
- A single invalid or unreachable holder fails that leaf's whole gap computation; the leaf is treated as unreadable, like an invalid contract.
- Door-written content, proof calls, save operations and the env-link feature are owned by sibling leaves; this leaf owns only the schema those records use and the gap check.

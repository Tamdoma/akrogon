# Brief 4 — state/config/dispatch literals (unit U4)

## 1. Goal

Plan decisions D1–D6: replace literals naming a fixture's registered repo identity with
`f.repo`/`f.prefix`/`g.repo`/`g.prefix` in dispatch, config and state files, including
`next.test.ts`'s `otherRepo` helper and `seatName` assertions.

## 2. Acceptance criteria

1. No fixture-identity literal remains in your files: `repos: { repo: f.root }` keys, `repo: 'repo'`
   leaf-states, `readRepo('repo', f.root)`, `setPrefixes({ repo: … })`, `seatName('repo', 'rp', …)`
   or `rp-*` assertions, `configure(f, { repos: { repo: … } })` writes.
2. Foreign-leaf literals stay: `next.test.ts`'s "foreign" cases deliberately store leaves under
   wrong repo names (`{ repo: 'other' }` in `f`'s repo when asserting `stored: 'other'`, `{ repo:
   'repo' }`/`{ repo: f.repo }` ambiguity — resolve by which fixture's `repos` key the leaf's root
   belongs to; a leaf in `g.root` asserting foreign-ness in `f`'s view keeps a name `f` doesn't
   register, so it becomes `repo: f.repo` only when `f.repo` is what the test asserts as stored —
   read each case and keep the deliberate wrong name where the test needs it, but the leaf's own
   state must record the key under which its root's fixture was registered when the test asserts
   `stored:` on that leaf — see `two repos summarize once per repo` test: `fa` is stored as `other`
   because `leaf(f,…,{repo:'other'})` puts it in `f.root`'s repo under name `other` which `f`'s
   config doesn't register → keep a foreign name; `fb` is in `g.root` with `repo: 'repo'` where
   `g`'s registered key is `g.repo` → `stored:` asserts `'repo'` as foreign in `g`'s view — the
   literal may stay `'repo'` since it is intentionally not `g.repo`).
3. `otherRepo(f)` keys on `g.repo`/`g.prefix`; `hcCore(g, { repo: g.repo })`; its `name`/`prefix`
   params dropped or defaulted to `g`'s own.
4. Touched files pass `bun test`; `bun run typecheck` clean.

## 3. Read-first list

- `tests/helpers.ts` — `Fixture.repo`/`prefix`, `fixture()`, `leaf()`, `storeDir()`.
- `tests/hc-fixture.ts` — `hcCore`, `setPrefixes`, `setSeat`, `hcFixture`.
- `src/config.ts` — `readRepo`, `repoPrefix`, `globalSchema`.
- `src/hc.ts` — `seatName`.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files you own: `tests/next.test.ts`, `tests/phase.test.ts`, `tests/config.test.ts`,
`tests/pull.test.ts`, `tests/init.test.ts`, `tests/reconcile.test.ts`, `tests/pause-next.test.ts`,
`tests/pause.test.ts`, `tests/pause-status.test.ts`, `tests/solo-turns.test.ts`,
`tests/dependents-first.test.ts`, `tests/release-any-phase.test.ts`.

Per-file (each file: `grep -n "'repo'\|rp-\|'rp'\|repos:\|prefixes"` first):

- `next.test.ts`: `otherRepo(f)` — `hcCore(g, { repo: g.repo })`, `setPrefixes(f, { …global.prefixes,
  [g.repo]: g.prefix })`; callers' `{ repos: { repo: f.root, other: g.root } }` →
  `{ [f.repo]: f.root, [g.repo]: g.root }`; `leaf(g, …, { repo: 'other' })` → `{ repo: g.repo }`
  (or keep when it asserts `stored:` foreign-ness — see AC2); `seatName('repo', 'rp', …)` →
  `seatName(f.repo, f.prefix, …)`; `'repo'` in skip assertions → `f.repo`/`g.repo` as the test's
  registered key dictates; `configure(f, { repos: { repo: root } })` → `{ [f.repo]: root }`.
- `phase.test.ts`, `pause-next.test.ts`, `pause.test.ts`, `pause-status.test.ts`,
  `solo-turns.test.ts`, `dependents-first.test.ts`, `release-any-phase.test.ts`: leaf-state
  `repo: 'repo'` → `f.repo`; `setPrefixes`/`repos` keys → `f.repo`/`f.prefix`; `rp-*` names →
  `${f.prefix}-*` or `consultantName`/`seatName`.
- `config.test.ts`: `repos: { repo: f.root }` → `{ [f.repo]: f.root }`; `repos: { repo: f.root,
  other: g.root }` → `{ [f.repo]: f.root, [g.repo]: g.root }`; `repo: 'repo'` leaf-state → `f.repo`;
  `prefixes: { repo: 'rp' }` writes/assertions → `{ [f.repo]: f.prefix }`; the `config` output
  assertion `repo: 'repo'` → `f.repo`, `repo: 'other'` → `g.repo` (line ~323).
- `pull.test.ts`: `{ repo: 'repo', origin: … }` assertion → `f.repo`; `repos: { missing, repo: f.root
  }` → `[f.repo]: f.root`.
- `init.test.ts`: `repos: { repo: f.root }` → `{ [f.repo]: f.root }` (the `toMatchObject({ repos: {
  repo: f.root } })` assertion too); `prefixes`-related literals → `f.repo`/`f.prefix`.
- `reconcile.test.ts`: leaf-state `repo: 'repo'` → `f.repo`.

Generic rule: a literal names the fixture's own registered identity only when it is the
`repos`/`prefixes` key of the fixture's root, a `readRepo(name, <fixture root>)` arg, a
`leafSlice({name})`/systemctl stop for a leaf of that fixture, `state.yaml`'s `repo` field of a
leaf under that fixture's root, a `setPrefixes`/`repos` write, or an asserted name derived from
them. Foreign names a test asserts as foreign stay.

## 5. Do-not, reasons and exceptions

- Do not edit `helpers.ts`, `hc-fixture.ts`, `fake-proc.ts`, or files of other units.
- Do not change assertion semantics; wrong/red tests are a mismatch returned to me.
- Do not blindly replace `'repo'` inside `{ repo: 'other' }` foreign-leaf states or `stored:`
  assertions — those are deliberate wrong names. Exception: the leaf-state field `repo:` must equal
  the key under which that leaf's root is registered when the test does not assert foreign-ness.
- Reasons and exceptions stay attached; return a mismatch with evidence instead of changing scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in your worktree.
2. Per file: `grep -n`, apply, run the file's test.
3. `bun run typecheck`.
4. One commit with `Test-Change:` trailers per changed test file.

Advisory size: 12 files, ~50 turns.

## 7. Commands

- `akrogon run-check --name u4-<file> -- bun test tests/<file>.test.ts --timeout=30000` per touched
  file.
- `bun run typecheck`.

## 8. Done-when, evidence and report

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

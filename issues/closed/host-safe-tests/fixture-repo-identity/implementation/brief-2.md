# Brief 2 — real-slice files (unit U2)

## 1. Goal

Plan decisions D1–D4, D7: replace every literal that names a fixture's registered repo identity
with `f.repo`/`f.prefix` so no `leafSlice`/slice assertion uses a shared `'repo'` name. Tests
change identity references only — no expectation, assertion shape, or behavior changes.

## 2. Acceptance criteria

1. No `'repo'` or `rp`-identity literal remains in your files where it names a fixture's own
   registered repo, its prefix, or a name derived from them (slice names, seat names `rp-*`,
   `akrogon.repo` labels, repos/prefixes keys).
2. Literals that never name a fixture identity stay: `Repo` literals with `root: '/r'` or fake
   roots, notice-id inputs, foreign-leaf `stored`/`repo` fields, deliberate other-repo names like
   `hcCore(f, { repo: 'another' })` in hc-identity.
3. `bun test` on each touched file is green on your worktree.

## 3. Read-first list

- `tests/helpers.ts` — `Fixture.repo`, `Fixture.prefix`, `fixture()`, `leaf()`, `storeDir()`.
- `tests/hc-fixture.ts` — `hcCore` (`opts.repo ?? f.repo`), `setPrefixes`, `setSeat`.
- `src/scope.ts` — `leafSlice(repo, slug)`.
- `src/config.ts` — `readRepo`, `repoPrefix` (`^[a-z]{2}$` prefix).
- `src/hc.ts` — `seatName(repo, prefix, slug, seat)`, `consultantName`.
- Skill folder: `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files you own (do not touch others): `tests/hc-delivery.test.ts`, `tests/hc-identity.test.ts`,
`tests/hc-start.test.ts`, `tests/hc-teardown.test.ts`, `tests/hc-window-calls.test.ts`,
`tests/leaf-slices.test.ts`, `tests/green-merge.test.ts`, `tests/store-sweep-safety.test.ts`,
`tests/run-units.test.ts`, `tests/run-check.test.ts`.

Per-file:

- `hc-delivery.test.ts`: remove both `setPrefixes(f, { repo: 'rp' })` calls; the two
  `leafSlice({ name: 'repo' }, slug)` stops become `{ name: f.repo }`.
- `hc-identity.test.ts`: `setup`'s default arg becomes `undefined`-default via
  `setPrefixes(f, { [f.repo]: f.prefix })` — simplest is `setup(prefixes = { [f.repo]: f.prefix })`
  is impossible before `f` exists, so restructure: create `f` first, then
  `setPrefixes(f, prefixes ?? { [f.repo]: f.prefix })`. `leafSlice` → `f.repo`. Seat-name assertion
  `'rp-hi-find-a'` → `${f.prefix}-hi-find-a`. `setPrefixes(f, { repo: 'rp', second: 'rp' })` →
  `{ [f.repo]: f.prefix, second: f.prefix }` (keeps the deliberate duplicate). `toEqual(['repo'])`
  → `[f.repo]`. `repo: 'repo'` leaf-state → `f.repo`.
- `hc-start.test.ts`: `setPrefixes` removed; `leafSlice` → `f.repo`; seat names `rp-*` →
  `${f.prefix}-*`; `'akrogon.repo': 'repo'` label → `f.repo`; the slug-cut test's `sha256('repo/…')`
  → `sha256(`${f.repo}/${slug}`)`; cgroup regex `rp-hs-one-a` → `${f.prefix}-hs-one-a`.
- `hc-teardown.test.ts`, `hc-window-calls.test.ts`: `setPrefixes` removed; `leafSlice` → `f.repo`;
  seat-name asserts `rp-ht-restart-a` → `${f.prefix}-ht-restart-a`.
- `leaf-slices.test.ts`: `repos: { repo: f.root, other: other.root }` →
  `{ [f.repo]: f.root, [other.repo]: other.root }`; `setPrefixes(f, { repo: 'rp', other: 'ot' })` →
  `{ [f.repo]: f.prefix, [other.repo]: other.prefix }`; `leaf(other, ..., { repo: 'other', ... })` →
  `{ repo: other.repo }`; every `leafSlice({ name: 'repo' })` → `{ name: f.repo }`;
  `leafSlice({ name: 'other' })` → `{ name: other.repo }`.
- `green-merge.test.ts`: `repo: 'repo'` leaf-state → `f.repo`; `leafSlice` → `f.repo`.
- `store-sweep-safety.test.ts`: `readRepo('repo', f.root)` → `readRepo(f.repo, f.root)` (also inside
  the `-e` script string — the subprocess runs in `f`'s config home where `f.repo` is the key);
  `leafSlice({ name: 'repo' })` → `{ name: f.repo }`.
- `run-units.test.ts`: `repo: 'repo'` run-record fields → `f.repo`; `expectedSlice('repo', …)` →
  `expectedSlice(f.repo, …)`.
- `run-check.test.ts`: `readRepo('repo', f.root)` → `readRepo(f.repo, f.root)`.

The generic rule: a literal names the fixture's own registered identity only when it is the
`repos`/`prefixes` key of the fixture's root, a `readRepo(name, f.root)` arg, a `leafSlice({name})`
or systemctl stop for a leaf of that fixture, `state.yaml`'s `repo` field of a leaf under that
fixture's root, a `setPrefixes`/`repos` write, or an asserted name derived from them. Everything
else stays. `expectedSlice` is in `tests/fake-proc.ts` — not yours; call it with `f.repo`.

## 5. Do-not, reasons and exceptions

- Do not change assertions' *meaning* (what is compared to what); only the identity strings change.
  Reason: expectations are locked; a red or wrong test is a mismatch returned to me, not a fix.
  Exception: a revised brief.
- Do not add `setPrefixes` where `fixture()` already registered the map; reason: duplicate writes
  overwrite the fixture's own key. Exception: hc-identity's deliberate duplicate-prefix case.
- Do not touch `tests/fake-proc.ts`, `helpers.ts`, `hc-fixture.ts`, or any file not listed.
- Do not write or edit tests beyond the literal swaps named above.
- Reasons and exceptions stay attached to these exclusions; return a mismatch with evidence instead
  of changing scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in your worktree.
2. Per file: `grep -n "'repo'\|rp-\|'rp'"`, apply the list above, run the file's test.
3. `bun run typecheck`.
4. Commit all changed files in one commit with `Test-Change:` trailers (one per changed test file).

Advisory size: 10 files, ~45 turns.

## 7. Commands

- `bun test tests/<file>.test.ts --timeout=30000` per touched file, each through
  `akrogon run-check --name u2-<file> -- bun test tests/<file>.test.ts --timeout=30000`.
- `bun run typecheck`.

## 8. Done-when, evidence and report

All files green via run-check, typecheck clean, one commit with trailers.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

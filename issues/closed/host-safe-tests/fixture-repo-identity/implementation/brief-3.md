# Brief 3 — hc/dispatch helpers and name assertions (unit U3)

## 1. Goal

Plan decisions D1–D6: replace literals naming a fixture's registered repo identity with
`f.repo`/`f.prefix`/`g.repo`/`g.prefix` in hc-adjacent helpers and assertion files. Identity
references only; no assertion semantics change.

## 2. Acceptance criteria

1. No `'repo'`/`rp`/`akrogon`-identity literal remains where it names a fixture's own registered
   repo or derived name in your files.
2. `deployFixture`'s `repos` key becomes `f.repo`; deploy `Repo` literals stay `'akrogon'`
   (they feed `selfUpdate`/`rollback` directly, not the fixture's registered key) — except where a
   file reads `global.repos['akrogon']`, which becomes `[d.f.repo]`.
3. `otherRepo(f)` keys on `g.repo`/`g.prefix`; `hcCore(g, { repo: g.repo })`.
4. Touched files pass `bun test`; `bun run typecheck` clean.

## 3. Read-first list

- `tests/helpers.ts` — `Fixture.repo`/`prefix`, `fixture()`, `leaf()`, `storeDir()`.
- `tests/hc-fixture.ts` — `hcCore` (`opts.repo ?? f.repo`), `setPrefixes`, `setSeat`, `hcFixture`.
- `src/config.ts` — `readRepo`, `repoPrefix`.
- `src/hc.ts` — `seatName`, `consultantName`, `leafTab`.
- `tests/deploy-fixture.ts` — `deployFixture`.
- `~/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Files you own: `tests/hc-status.test.ts`, `tests/hc-observe.test.ts`,
`tests/session-routing.test.ts`, `tests/session-reads.test.ts`, `tests/door-exchange.test.ts`,
`tests/door-reset.test.ts`, `tests/leaf-stop.test.ts`, `tests/state-inventory.test.ts`,
`tests/deploy-fixture.ts`, `tests/deploy-shapes.test.ts`, `tests/release-deploy.test.ts`,
`tests/rollback.test.ts`, `tests/self-update.test.ts`, `tests/next.test.ts` (the `otherRepo`
helper and its callers only where they feed fixture identity — shared file is NOT yours; see
Do-not).

Wait — `tests/next.test.ts` is owned by U4. Your only `next.test.ts` touch is zero; `otherRepo`
lives inside it and belongs to U4. Do not edit it.

Per-file:

- `hc-status.test.ts`, `door-exchange.test.ts`, `door-reset.test.ts`, `session-routing.test.ts`:
  `setPrefixes(f, { repo: 'rp' })` → removed (fixture already registers `f.repo → f.prefix`);
  `setPrefixes(f, { repo: 'rp', second: 'sc' })` → `{ [f.repo]: f.prefix, second: 'sc' }` where
  `second` is a deliberate extra key; `rp-slot-*` / `rp-door-*` seat-name literals →
  `${f.prefix}-*`; any `repo: 'repo'` leaf-state → `f.repo`.
- `session-reads.test.ts`: audit with `grep -n "'repo'\|rp-\|'rp'"`; only fixture-identity literals
  change; likely zero edits — record the audit result in your report.
- `leaf-stop.test.ts`: its `slice(path)` already reads `state.repo`, which `leaf()` now fills with
  `f.repo` — verify no literal remains; `repo: 'repo'` leaf-states → `f.repo`.
- `state-inventory.test.ts`: `repo: 'repo'` leaf-states → `f.repo`; `setPrefixes`/repos literals →
  `f.repo`/`f.prefix`; `rp-*` names → `${f.prefix}-*`.
- `deploy-fixture.ts`: `repos: { akrogon: f.root }` → `repos: { [f.repo]: f.root }`.
- `deploy-shapes.test.ts`: `Repo` literal `{ name: 'akrogon', root: d.f.root, … }` stays (it feeds
  `selfUpdate` in-process, not the registered key) — audit only, record result.
- `release-deploy.test.ts`: `global.repos['akrogon']` → `global.repos[d.f.repo]`; audit the rest.
- `rollback.test.ts`, `self-update.test.ts`: `Repo` literals `'akrogon'` stay; audit for registered
  `repos` keys or leaf-state `repo:` fields and switch only those to `f.repo`/`d.f.repo`.

Generic rule: a literal names the fixture's own registered identity only when it is the
`repos`/`prefixes` key of the fixture's root, a `readRepo(name, <fixture root>)` arg, a
`leafSlice({name})`/systemctl stop for a leaf of that fixture, `state.yaml`'s `repo` field of a
leaf under that fixture's root, a `setPrefixes`/`repos` write, or an asserted name derived from
them. Everything else stays.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/next.test.ts` (U4 owns it), `helpers.ts`, `hc-fixture.ts`, or `fake-proc.ts`.
- Do not change assertion semantics; wrong/red tests are a mismatch returned to me.
- Do not remove `setPrefixes` calls that carry deliberate extra keys or a `second`/`other` repo —
  keep those keys, re-key the fixture entry to `f.repo`/`f.prefix`.
- Reasons and exceptions stay attached to these exclusions; return a mismatch with evidence instead
  of changing scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in your worktree.
2. Per file: `grep -n "'repo'\|rp-\|'rp'\|'akrogon'"`, apply the list, run the file's test.
3. `bun run typecheck`.
4. One commit with `Test-Change:` trailers per changed test file.

Advisory size: 13 files, ~55 turns.

## 7. Commands

- `akrogon run-check --name u3-<file> -- bun test tests/<file>.test.ts --timeout=30000` per touched
  file.
- `bun run typecheck`.

## 8. Done-when, evidence and report

All files green via run-check, typecheck clean, one commit with trailers.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

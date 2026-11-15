# Review A — fixture-repo-identity

Base: `8647fc24`. Reviewed head: `432eeba2` (diff identical to `8141f505`, the verified head;
`432eeba2` is a trailer-only commit carrying the `tests/AREA.md` `Test-Change:` citation).

## Verification evidence

- `akrogon verify` on `8141f505`: green, 1145 pass / 0 fail
  (`implementation/check-test-1794218925024-290614.log`).
- Criterion 1 proof on head: green
  (`implementation/check-fixture-repo-identity-green-1794218934841-628635.log`); red on the
  pre-sweep head with both fixtures hashing to `akrogon-l42a88ed912a0.slice`
  (`check-fixture-repo-identity-red2-1794217294718-1765716.log`). Fail-before/pass-after shown.
- Reviewer's own spot run: `tests/session-routing.test.ts` green standalone
  (`check-sess-routing-1794219013353-711075.log`).

## Sweep audit

All eight `leafSlice`-teardown files read `f.repo`; `leaf()`, `storeDir`, `seedRun`,
`verified`, `holding` default to `f.repo`; seat-name assertions read `f.prefix`; `hcCore`'s
doc space is `opts.repo ?? f.repo`. Remaining `'repo'` literals are foreign/pure inputs
(`Repo` literals in `config.test.ts`, `isolation.test.ts`; foreign-leaf `stored`/`repo`
fields in `next.test.ts:1376`, `state.test.ts`, `batch.test.ts`, `run-permit.test.ts:706`,
`solo-turns.test.ts:88`; raw-home `resolve(home,'repo')` in `state-home.test.ts`), matching
plan D4's keep rule. `deployFixture` keeps `repos: {akrogon: f.root}` and strips `prefixes`
(product name + strict old-release schema; plan D5 amended and correct — `deployStage`
returns null for `repo.name !== 'akrogon'`).

## Fixes

- **F1 — tests/AREA.md states `hcFixture` adds prefix `rp`.** `hcFixture` no longer calls
  `setPrefixes` (the diff removed it); the fixture's prefix is `f.prefix`, registered by
  `fixture()` itself. Source: the leaf's own diff. Consequence: the tests/ contract
  document (grounding per `docs/reference-index.md`) describes a removed mechanism — a
  reader writing a second-repo test would copy a stale picture and could reintroduce the
  shared-identity pattern this leaf removes. Criterion hit: the leaf's own AREA contract
  line (criterion 1's stated boundary). Fix: reword to `f.prefix`.
- **F2 — derived `prefix` collides across two fixtures in one suite at 1/676 per pair.**
  `fixtureRepo` maps two sha256 bytes mod 26; `otherRepo()` (`tests/next.test.ts:117`) and
  `leaf-slices.test.ts:25` merge `[other.repo]: other.prefix` into one `prefixes` map, and
  `repoPrefix` (`src/config.ts:229`) throws `repos <a> and <b> both hold prefix <p>` — so
  `next`/`seat`/`init` against that config refuses while the collision stands. Source: a
  normal `verify` run of `next.test.ts`/`leaf-slices.test.ts` — no special input. Consequence:
  a statistically reproducible suite flake (~0.15 % per fixture pair), the class this leaf
  exists to remove. Criterion 2. Smallest fix: give the merged second repo a prefix derived
  from its repo name plus a discriminator, or let the two helpers pick a distinct letter pair.

## Nits

- **N1 — `tests/session-routing.test.ts:97` and `:158` `toContain('repo')` no longer assert an
  identity.** Base asserted the workspace name `repo`; with `f.repo` the substring matches the
  JSON key `"workspace"`/error payload instead. Still detects refusal via `code` and the
  session assertions, so nothing fails today; promoted to a Fix only if those assertions start
  matching an unintended stderr field (would show up as a wrong-file test run).
- **N2 — `door-reset.test.ts` `exited()` accepts `code === 0 || code === 3`** — breadth on
  `hc wait` exit codes. Justified by three observed suite-run 3s and the retained
  finished/absent assertion (the real gate); a promotion would need a case where wait returns
  3 while the terminal is still live (not observed).
- **N3 — `basename(home)` drops the TMPDIR/suite component of the home path** — repo identity
  collides only on equal mkdtemp suffixes across different suite roots (~10^-9); statistical
  uniqueness is the design's chosen model (D1/D2 record it), so no action unless an actual
  collision is observed.
- **N4 — `abandoned-capture.test.ts` couples to `phaseWake` creating the worktree during
  recovery** (`z.string().parse(readState(leafPath).worktree)`). Holds today; if dispatch
  ever defers worktree creation the test fails for scaffolding reasons — no product impact.

## Verdict

`fix` — two small Fixes (a stale contract line and a 1/676 prefix collision flake); Nits are
deferred per their promotion evidence.

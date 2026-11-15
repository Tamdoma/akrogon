# Plan: fixture-repo-identity

slot A, phase plan.synthesis. Sources: `brief.md`, `design.md`, live worktree
`/home/ivan/.akrogon/worktrees/akrogon/fixture-repo-identity`.

## Decisions

- D1: `fixture()` gives each fixture a repo identity derived from itself: `repo = basename(home)`
  (mkdtemp's `akrogon-XXXXXX`, unique per fixture). `Fixture` gains `repo: string` and
  `prefix: string`; `home`'s `config.yaml` gets `repos: { [f.repo]: f.root }` and
  `prefixes: { [f.repo]: f.prefix }` written by `fixture()` itself.
- D2 (answers design's open question): the prefix schema is `^[a-z]{2}$` (`src/config.ts:30`),
  with `repoPrefix` refusing a prefix shared by two repos in one config. `f.prefix` is the two
  letters `26`-mapped from the first two bytes of `sha256(home)`: schema-valid, deterministic,
  derived from the fixture, unique only statistically — host-global state never keys on it, so a
  two-letter collision is harmless (`leafSlice` uses `repo.name`, not the prefix).
- D3: `hcCore(f)`'s discovery document uses `opts.repo ?? f.repo`. Callers passing a literal
  (`hc-identity.test.ts` `{ repo: 'another' }`, `leaf-slices` `{ repo: 'other' }`) are deliberate
  *other*-repo names, not the fixture identity; they stay keyed on their own semantics (linked
  sessions need a second space name). `hcFixture()` drops its `setPrefixes` call (D1 already
  registers `f.repo → f.prefix`).
- D4: a literal names the fixture's own registered identity only when it is the `repos`/`prefixes`
  key of the fixture's root, a `readRepo(name, f.root)` call, a `leafSlice({ name })` or `systemctl`
  stop targeting a leaf of that fixture, `state.yaml`'s `repo` field of a leaf under that fixture's
  root, a `setPrefixes({ repo: … })`/`repos: { repo: f.root }` write, or an assertion of a name
  derived from it (seat names `rp-*`, slice names, repos-key lists, `akrogon.repo` label). Each is
  replaced by `f.repo`/`f.prefix`/`seatName(f.repo, f.prefix, …)`. Literals that never name a
  fixture identity — `noticeId('repo', …)` and `Repo` literals in `notices.test.ts`,
  `isolation.test.ts`, deploy fixtures' `{ name: 'akrogon' }` (no fixture, fake systemctl only),
  foreign-leaf `stored`/`repo` fields in `next.test.ts`'s "foreign" cases — stay as written.
  The sweep is `grep -n "'repo'\|rp-\|'rp'"` over each listed file; judgment per D4, not blanket
  replace.
- D5: e2e tiers (`tests/e2e/*`, `akre2e`) are out of scope: they are not `fixture()` homes and are
  excluded from `bun test`'s `concurrentTestGlob`; they never collide through the `test` runner.
  `deployFixture` keeps `repos: { akrogon: f.root }` — `'akrogon'` is load-bearing
  (`src/self-update.ts` `deployStage` returns null for `repo.name !== 'akrogon'`;
  `src/install.ts`/`src/rollback.ts` read `repos['akrogon']`), so it is a product name, not the
  fixture identity (D4 keeps it), and `deployFixture` strips the `prefixes` key so an installed
  previous release's strict `globalSchema` still parses `config.yaml`.
- D6: helpers updated in place: `leaf()` writes `repo: f.repo`; `storeDir(f, repo = f.repo)`;
  `seedRun`/`greenReceipt`/`verified`/`holding` read `f.repo`; `seedRun` already takes `run.repo`
  overrides so only its default `'repo'` literal becomes `f.repo`. `otherRepo(f)` keys on
  `g.repo`/`g.prefix` (its `name`/`prefix` params deleted or defaulted to `g`'s own).
- D7: teardown helpers in the eight `leafSlice({ name: 'repo' }, …)` files read the name from the
  fixture. Simplest is a `stopSlice(f, slug)` helper in the new test file or per-file
  `leafSlice({ name: f.repo }, slug)`; either satisfies the contract — pick per file whichever the
  file already imports.

## Read-first paths

- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `storeDir`, `seedRun`/`greenReceipt`/`verified`.
- `tests/hc-fixture.ts` — `hcCore` (`opts.repo`, `recordedDoc`), `hcFixture`, `setPrefixes`, `setSeat`.
- `src/scope.ts` — `leafSlice` (the only host-global name from `repo.name`).
- `src/config.ts` — `globalSchema.prefixes` (`^[a-z]{2}$`), `repoPrefix`, `readRepo`.
- `src/seat.ts` — `startSeat` (`--slice`, unit name, `/proc/<pid>/cgroup` check), `firstTask`.
- `src/hc.ts` — `seatName`, `consultantName`, `leafTab`, `repoSpace`.
- `src/next.ts` — `allocate` (`placeFor` before `repoPrefix`; non-hc fixtures never reach `repoPrefix`).
- `tests/stand-in.sh`, `tests/isolation.ts` — gate FIFO hook, suite runtime symlinks for `systemctl`.
- `learnings/LESSONS.md` — `run-check` hides DBUS (systemctl still reaches the user manager through
  `XDG_RUNTIME_DIR` symlinked `bus`/`systemd`), run-check TMPDIR cross-device (fixtures only `rename`
  inside one tree here).

## Interfaces used (no new machinery)

- Existing: `fixture()`, `hcCore`, `setPrefixes`, `setSeat`, `leaf`, `cli`, `core.waitFor`,
  `core.get`, `core.tasks`, `leafSlice`, `systemctl --user stop` (real user manager via isolation's
  `XDG_RUNTIME_DIR` symlinks), stand-in `hook` + FIFO gate.
- New in tests/helpers.ts: `Fixture.repo`, `Fixture.prefix`; `fixture()` derives and registers them.
- New test file: `tests/fixture-repo-identity.test.ts` (committed; red on base below).

## Waves and file/criterion checklist

Wave 1 — U1 (helpers + proof):
- `tests/helpers.ts`, `tests/hc-fixture.ts`, `tests/fixture-repo-identity.test.ts`, `tests/AREA.md`.
- Owns the identity seam every other file depends on. Must land first.
- No shared test resource (workers don't run each other's files; this unit runs only its own).

Wave 2 (depends on U1; disjoint paths; U2 owns every file that runs a real
`systemctl --user stop leafSlice` or real `--slice=` unit so no other unit stops its slices):
- U2 (real-slice files): `tests/hc-delivery.test.ts`, `tests/hc-identity.test.ts`,
  `tests/hc-start.test.ts`, `tests/hc-teardown.test.ts`, `tests/hc-window-calls.test.ts`,
  `tests/leaf-slices.test.ts`, `tests/green-merge.test.ts`, `tests/store-sweep-safety.test.ts`,
  `tests/run-units.test.ts`, `tests/run-check.test.ts`.
- U3 (hc/dispatch helpers and name assertions): `tests/hc-status.test.ts`, `tests/hc-observe.test.ts`,
  `tests/session-routing.test.ts`, `tests/session-reads.test.ts` (only if sweep hits),
  `tests/door-exchange.test.ts`, `tests/door-reset.test.ts`, `tests/leaf-stop.test.ts`,
  `tests/state-inventory.test.ts`, `tests/deploy-fixture.ts`, `tests/deploy-shapes.test.ts`,
  `tests/release-deploy.test.ts`, `tests/rollback.test.ts`, `tests/self-update.test.ts`.
- U4 (state/config/dispatch literals): `tests/next.test.ts`, `tests/phase.test.ts`,
  `tests/config.test.ts`, `tests/pull.test.ts`, `tests/init.test.ts`, `tests/reconcile.test.ts`,
  `tests/pause-next.test.ts`, `tests/pause.test.ts`, `tests/pause-status.test.ts`,
  `tests/solo-turns.test.ts`, `tests/dependents-first.test.ts`, `tests/release-any-phase.test.ts`.

Wave 3 (depends on U1; disjoint):
- U5 (records/status): `tests/status.test.ts`, `tests/status-json.test.ts`,
  `tests/status-fixture.ts`, `tests/timing.test.ts`, `tests/timing-report.test.ts`,
  `tests/merge-attempts.test.ts`, `tests/log-reader.test.ts`, `tests/preflight.test.ts`.
- U6 (records/batches): `tests/batch.test.ts`, `tests/batch-merge.test.ts`,
  `tests/batch-dispatch.test.ts`, `tests/state.test.ts`, `tests/state-home.test.ts`,
  `tests/worktree-store.test.ts`, `tests/readiness.test.ts`, `tests/receipt-gates.test.ts`,
  `tests/verify.test.ts`.
- U7 (leftover literals): `tests/flaky.test.ts`, `tests/keep-rule.test.ts`,
  `tests/hold-retired.test.ts`, `tests/retired-debate.test.ts`, `tests/slow-merge.test.ts`,
  `tests/run-permit.test.ts`, `tests/direct-guards.test.ts`, `tests/chart-shapes.test.ts`,
  `tests/lessons.test.ts`, `tests/park.test.ts`, `tests/close.test.ts`, `tests/close-pack.test.ts`,
  `tests/durable-capture.test.ts`, `tests/abandoned-capture.test.ts`, `tests/folder-pack.test.ts`,
  `tests/guard.test.ts`, `tests/sync.test.ts`, `tests/notices.test.ts` (audit only — D4 likely keeps
  all literals), `tests/isolation.test.ts` (audit only), `tests/test-files.test.ts` (audit only).
  Each file's sweep ends in `git status` clean of that file or a `grep` residue note in the report.

Docs: one line each — `tests/AREA.md` gains the new file's line; no other agent or human doc is
affected (no rule text changes; `src/` untouched).

## Done-criteria → observations

### Criterion 1 (cross-fixture teardown survival)

- Test: `tests/fixture-repo-identity.test.ts` — two `fixture()` homes, two real `hcCore`s, same leaf
  slug `fx-identity`. Fixture two's seat is held `working` on a FIFO; fixture one's teardown
  (`core.stop`, `systemctl --user stop leafSlice(f.repo, slug)`, `f.clean`) lands then. Assertions:
  `leafSlice(nameOne) !== leafSlice(nameTwo)`, `/proc/<seatTwo.pid>/cgroup` exists and contains
  `/<sliceTwo>/`, then the gate releases and the seat completes its delivery sequence (turn ≥ 2,
  tasks = plan + implement prompts).
- Command: `akrogon run-check --name fixture-repo-identity -- bun test tests/fixture-repo-identity.test.ts --timeout=30000`.
- Real boundary: the operator user's systemd manager via `XDG_RUNTIME_DIR` symlinked `bus`/`systemd`;
  state before = two seats live on two cores sharing/carrying their own `leafSlice` name; after =
  one slice stopped, the other's seat process unchanged.
- Product failure caught: Tamdoma/akrogon#130 — a run's teardown stopping a concurrent run's seat
  (the `cli` exit-3 class at hc-delivery.test.ts:145).
- Size: seconds. Rerun trigger: any change to `fixture()`/`hcCore`/`leafSlice`/`setPrefixes`
  identity derivation, or a teardown file; inputs are the test file, `tests/helpers.ts`,
  `tests/hc-fixture.ts`, `src/scope.ts`, `src/seat.ts` — the same files replayed, no recording.

Red on base (this head, run-check log `check-fixture-repo-identity-red2-1794217294718-1765716.log`):

```text
expect(leafSlice({ name: nameOne }, slug)).not.toBe(leafSlice({ name: nameTwo }, slug))
Expected: not "akrogon-l42a88ed912a0.slice"   — both fixtures registered `repo`
(fail) one fixture's teardown stops only its own slices … [1451.46ms]
check fixture-repo-identity-red2: 1 …/check-fixture-repo-identity-red2-1794217294718-1765716.log
```

Earlier run (before the deterministic `/proc` assert) also showed the seat's terminal row read as
`finished` after the shared-slice stop (`check-fixture-repo-identity-red-1794217268006-1743230.log`).

Conditions checked against D1–D4, traced from value made to last use:

- "teardown lands while the second seat is live (not a launch delay)" — gate FIFO holds seat two
  `working`; `coreTwo.waitFor(working)` precedes `stopSlice`. Shown by construction; the base run's
  `finished` read proves the landing actually hit a live seat.
- "the other seat survives and completes its delivery sequence" — violated on base (shared slice);
  red above. Case covers it.
- "prefix satisfies `^[a-z]{2}$` and `repoPrefix`'s per-config uniqueness" — derivation emits
  `[a-z]{2}` by construction and `fixture()` registers one repo per home, so `repoPrefix` cannot
  see a duplicate unless a test adds one itself (hc-identity's duplicate-prefix case keeps its
  deliberate literal). Traced: `repoPrefix` is only reached in `next`/`seat`/`init` on fixtures
  whose map `fixture()` wrote.
- "name/prefix derived from the fixture" — `basename(home)`/`sha256(home)` are read where `home`
  is created in `fixture()`, used for `repos`/`prefixes` keys and `Fixture` fields only; no other
  consumer computes them. Traced.
- "no literal remains where a test reaches host-global state or asserts a derived name" —
  proven by the per-file sweep + `git grep -n "'repo'\|rp-\|'rp'"` residue audit in the
  implementation report; criterion 2's suite run is the behavioural check. A `grep` count is a
  count over holds, so the behavioural proof stays criterion 1's test plus criterion 2.

### Criterion 2 (changed tests pass in the configured `test` command)

- Command: `bun test --timeout=30000 --parallel=4 --no-isolate` (configured `checks.test`), run as
  the `akrogon verify` head pass on the committed head; per-file gates during implementation use
  `akrogon run-check --name <file> -- bun test tests/<file>.test.ts --timeout=30000`.
- Real boundary: the suite's real fixture paths end to end; state before/after = suite red with
  shared identity, green with per-fixture identity.
- Failure caught: a missed consumer or assertion still bound to `repo`/`rp` identity.
- Size: unknown (suite; hc files are the slow members). Rerun trigger: any swept file or helper
  change. Reds outside the leaf (the hc-listener pair recorded 2026-11-09) are judged by
  `akrogon verify --known-red`, per the brief.
- Restart boundaries: none — the leaf is not slow-run (suite runs inside one `verify`).

## Notes for review

- Brief vs design: none conflict; design's signpost picks (2a remove the cause, 3a shared
  boundary, 6a no paid calls/live mutations) hold — no timeout change, no product wait change,
  tests only.
- Excluded by design, unchanged here: #129 skill text, hd-send's fixed wait, env-less spawn audit.
- The hc-listener red pair (2026-11-09) is outside this leaf; judged by `verify --known-red`.
- `fixture()`'s home path can carry uppercase in `basename` — valid: `repos` keys are `z.record(text)`;
  only the prefix is schema-checked (`^[a-z]{2}$`), and the hash derivation guarantees it.

## Implementation notes

- 2026-11-09: To satisfy brief done-criterion 2 and the design's schema-valid prefix requirement, fixtures joining a two-repo config avoid its other prefix; apply this at `next`'s `otherRepo`, `leaf-slices`' second fixture, and the fixed `sc`/`yp` secondary repos in session-routing/pause-next. Default derivation remains D2's hash mapping, with the first letter advanced on collision, so the claim that collisions are harmless no longer applies to shared configs.

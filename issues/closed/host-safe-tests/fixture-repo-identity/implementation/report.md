# fixture-repo-identity — implement report (slot A)

Base: `8647fc24` (origin/main). Committed head: `8141f505`.

## What changed and why

`fixture()` now gives every test home its own registered repo identity, so a
leaf slice is unique per fixture run and one fixture's teardown can never stop
a second fixture's same-slug seat.

- `tests/helpers.ts` — `Fixture` gains `repo` and `prefix`; `fixtureRepo(home)`
  derives `repo = basename(home)` and `prefix` = two letters from `sha256(home)`
  (deterministic, satisfies `^[a-z]{2}$`). `fixture()` registers
  `repos: {[identity.repo]: root}` and `prefixes`; the repo dir is
  `<home>/<basename(home)>` so `akrogon init`'s own `basename(root)` naming
  stays idempotent under re-init. `leaf()`, `storeDir`, `seedRun`, `verified`
  default to `f.repo`.
- `tests/hc-fixture.ts` — `hcCore` records the doc space under
  `opts.repo ?? f.repo`; `setPrefixes` calls dropped.
- 56 test files — every literal `'repo'`/`'rp'` that named the fixture's
  registered identity now reads `f.repo`/`f.prefix`; foreign names
  (`noticeId('repo',...)`, `Repo` literals in notices/isolation, deploy
  `{name:'akrogon'}`, `leafTempRoot` stubs) kept per plan D4.
- `tests/fixture-repo-identity.test.ts` — criterion proof (below).
- `tests/AREA.md` — fixture contract documented.

## Commands and results

- `akrogon run-check --name fixture-repo-identity-red[2] -- bun test tests/fixture-repo-identity.test.ts` on the pre-sweep head: **red** (`check-fixture-repo-identity-red2-1794217294718-1765716.log`): both fixtures hashed to `akrogon-l42a88ed912a0.slice`.
- Same command on head `8141f505`: **green** (`check-fixture-repo-identity-green-1794218934841-628635.log`): two slices, second seat's cgroup under its own slice, delivery finishes.
- `akrogon verify` on head `8141f505`: **green**, 1145 pass / 0 fail (`check-test-1794218925024-290614.log`).
- `bun run typecheck`: clean (`check-typecheck-…`).

## Repairs during the sweep (post-wave findings)

1. `deployFixture` must keep `repos: {akrogon: root}` — `deployStage`/`install`/`rollback` gate on the product name `akrogon`, and it strips `prefixes` when rewriting `config.yaml` because old installed releases' strict `globalSchema` rejects the key (`66a9c95c`; plan.md D5 amended).
2. `close-pack`: `akrogon init` names a repo `basename(root)`; the fixture root moved from `<home>/repo` to `<home>/<basename(home)>` so re-init stays idempotent (`a49cc3cb`).
3. `abandoned-capture`: `phaseWake` after failed→implement recovery now reaches `allocate` (prefix registered), creating the leaf worktree; the final `phase --check` needs a commit plus leaf receipt, added in the test (`a49cc3cb`).
4. `timing.test.ts` flock shim read `$AKROGON_HOME/repo/issues/timings.jsonl`; now resolves from `f.root` (`87dc7883`).
5. `door-reset.test.ts`: `hc wait` on a `--rm` terminal already exited answers 3 — tolerated; the pi session folder is mkdir'd before the fixture writes (`8141f505`). These were suite-only races, green standalone.

## Limitations

- `deployFixture`'s `prefixes` strip exists because installed old releases parse `config.yaml` strictly; covered by release-deploy tests.
- Proof asserts cgroup membership of the live seat (`/proc/<pid>/cgroup` contains the second slice), the strongest direct evidence of the collision channel without stopping anything.

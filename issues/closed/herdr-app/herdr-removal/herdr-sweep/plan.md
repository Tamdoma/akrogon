# Plan: herdr-sweep

Base `AKROGON_BASE` = `75f61f001f0a1e2e3b98626b8ffad896f4736b21` (main, all four hc leaves merged). Readiness input `issues/chart/herdr-app/forks/e2e-proof.md` exists on main (7 of 7 parts). No grants, no paid or live launches, no env names (`akrogon status herdr-sweep` prints no `Missing:` line).

## Read first

- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`.
- `skills/lesson-rule.md` (Retire and Match clauses) and `skills/learn-issues/SKILL.md` (Checkable definition).
- `learnings/LESSONS.md` lines 11, 21, 43; `learnings/history/2026-09-10-stderr-json-parse.md`; `learnings/history/2026-09-28-plugin-cwd-pull.md`.
- `src/install.ts` (`planSkillLinks`, `linkServices`, `unlinkPlugin`, `install`), `src/self-update.ts` `deployStage` (steps `links`, `reload`, `unlink`), `src/rollback.ts:29` (guard stays).
- `src/shell.ts:156-360` (old exports), `src/hc.ts:70-80` (`errorKind`, the guarded stderr parse).
- `tests/install.test.ts`, `tests/deploy-shapes.test.ts`, `tests/deploy-fixture.ts`, `tests/helpers.ts` (`fakeHerdr`, new `herdrStub`/`herdrCalls`), `tests/isolation.ts:70-84`, `tests/hc-fixture.ts:200-230`.
- Chart: `issues/chart/herdr-app/CHART.md` `## Pending steps` (removal 1 to 5), `forks/cutover.md`, `forks/config.md` Q2, `forks/tests.md`.
- Lessons that apply here as history: 10 and 18 (grep the old term, not only the old path), 13 (grep criteria vs verbatim text), 25 (`bun run format` drift), 40 (run-check TMPDIR is cross-device), 37 (spawn PATH: use a driver child).

## Planning checks already done

- `plugin/` is gone (operator 1a check): `git ls-files plugin | wc -l` prints `0`, `ls -d plugin` prints `No such file or directory`.
- Live links on this machine: `~/.config/herdr-app/mods/tasks -> /home/ivan/.akrogon/current/herdr-app/tasks`; `~/.config/herdr-app-sessions/infra/mods/tasks -> /home/ivan/.config/herdr-app/mods/tasks`. `~/.config/herdr-app/mods` also holds real folders (`agents`, `changes`, ...) and herdr-setup links (`board`, `agents-by-tab`, ...) that must stay.
- `src/` calls `herdr` only in `src/install.ts:150,151,164` and the dead `src/shell.ts` helpers. The only `JSON.parse` of stderr left after the sweep is `src/hc.ts:74`, inside a `SyntaxError` guard.

## Decisions

- **D1 No herdr call in install or deploy.** Delete `shipsPlugin`, the `herdr integration install` / `herdr plugin link` branch of `linkServices`, and `unlinkPlugin` with its call in `install` and deploy's `unlink` step. `linkServices` drops its `kinds` parameter; `install` and deploy call `linkServices()`. Deploy's step names lose `unlink`.
- **D2 Mod linking removed, pruning kept (answers the design's Open-for-the-plan question).** `planSkillLinks` drops the `mods` listing and the planned `~/.config/herdr-app/mods/<mod>` links, and keeps the one `staleIn` call over `~/.config/herdr-app/mods` with `modRoots` and `sourceMods`. Every install and deploy then removes an akrogon-owned link there whose target is gone (the machine's `tasks` link points into `current/herdr-app/tasks`, absent from every release after this one) and keeps real folders and foreign links. This reuses the existing prune rule instead of adding a one-off path, and it is a no-op once the link is gone.
- **D3 Tasks mod deleted.** Remove `herdr-app/` (its only mod is `tasks`), `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`. Reason: forks/config.md Q2; no behavior remains, so no hc counterpart.
- **D4 Old `src/shell.ts` exports deleted.** Remove `paneSchema`, `tabSchema`, `workspaceSchema`, `Workspace`, `sessionSchema`, `Session`, `SessionResolution`, `herdrError`, `retryable`, `herdrArgv`, `herdr`, `repoSession` and the private helpers below them. Keep `DISCOVERY_DEADLINE_MS` (used by `src/hc.ts:112`) with its comment reworded for hc. Drop imports left unused (`z`, `Repo`).
- **D5 Fake herdr deleted.** Remove `tests/fake-herdr.ts`, the bundle build and `fakeHerdrBin` in `tests/isolation.ts`. `helpers.ts` `fakeHerdr` keeps only its non-herdr env (`AKROGON_PROC_ROOT`, `XDG_RUNTIME_DIR`, leaf and retired temp roots) under the name `procFixture(f): { env }`, with no `db`; variables named `herdr` that hold it become `proc`. `hc-fixture.ts` drops its notices-only fake herdr (`FAKE_HERDR`, herdr PATH). `park.test.ts` drops its own fake herdr. `src/verify.ts:643` drops `FAKE_HERDR` from its env list.
- **D6 Deleted tests, each with its reason.** A test or assertion is deleted when it tests a removed function or reads the fake herdr's call log or database (vacuous once `src/` has no herdr call, which the criterion 2 grep shows). Each deletion is listed in `implementation/report.md` with file, test name, reason and, when the behavior still exists on hc, its hc counterpart. A test that guards a past regression is not dropped while its behavior exists on hc.
- **D7 Lesson 11 counterpart.** `tests/shell.test.ts` `retryable is false on non-JSON stderr without throwing` guards lesson 11's regression, and its behavior lives on in `src/hc.ts` `errorKind`. It is replaced in the same file by one case: an `hc` on PATH that prints plain text to stderr and exits 1 makes `hc(...)` reject with `HcError` of kind `exit 1` carrying the raw stderr, with no `SyntaxError`. It runs through a driver child like `tests/shell.test.ts:93` (lesson 37).
- **D8 src wording.** `src/reconcile.ts` remedy `restore the Herdr pane inventory and retry cleanup` becomes `restore hc terminal reads and retry cleanup`, with every test asserting it. Comments naming old herdr as current are rewritten. Text describing pre-hc data or the rollback guard (`src/state.ts` `predatesHc`, `src/rollback.ts:29`, `src/verify.ts:230`) stays because it is accurate history. Labels `herdr.tab` / `herdr.space` are herdr-app's label keys and stay.
- **D9 Docs and skills wording.** README, `docs/` (`start/install.md`, `start/what-it-is.md`, `start/one-change.md`, `use/autopilot.md`, `use/plan-work.md`, `use/run-work.md`, `reference/state-and-phases.md`, `reference/releases-and-updates.md` if it names the plugin, `reference-index.md`, `pictures/machine-parts.svg` title and two pane labels), AREA files, `skills/implement-issue/brief-template.md:47` and any other skills hit describe herdr-core (`hc` terminals, events, `hc send`) and herdr-app (window, tabs, labels). `docs/start/install.md` replaces `herdr --version` with the real `hc` and `herdr-app` version commands (checked live) and replaces the plugin paragraph with the listener unit. Recorded data that quotes old herdr (`skills/watch-issues/scripts/fixtures/*.jsonl`) stays.
- **D10 LESSONS.** Line 11 is generalized in place to the outside-CLI stderr boundary (`hc` and `gh` now, herdr then), keeping its history path, and its history gets a dated note naming `src/hc.ts` `errorKind` and the D7 test. No seed: after the sweep the unguarded pattern is not reachable (D4 removes the only unguarded site), so it fails the Checkable clause "still reachable". Line 21 retires under the Retire clause: its mechanism (akrogon commands running as herdr plugin hooks with the plugin folder as cwd) is removed on every path, since `plugin/` is gone and D1 removes every plugin link and integration call. Its history gets `Applied <date> by src/install.ts:<line>: ...` in the same diff. Line 43 stays.
- **D11 Rollback guard and deploy fixture.** `src/rollback.ts` guard stays. `tests/deploy-fixture.ts` keeps its `plugin/` seed: the rollback guard test needs a plugin release, and the deploy cases use it to show no herdr call when `plugin/` is present.
- **D12 Operator command list (criterion 4)** is written by A at implement end in `implementation/report.md` from CHART.md's Pending removal steps 1 to 5. A refines each command with read-only inspection only (`systemctl --user list-units 'herdr*' --all`, `herdr plugin list`, `herdr integration status`, `pacman -Q herdr`, `ls` of each path, `git -C <checkout> status/stash list/branch -vv/worktree list`, `git log --branches --not --remotes`), through `akrogon run-check`, and changes nothing on the machine.
- **D13 Timing (criterion 5)** comes from the `test` check duration in the receipt of the leaf's `akrogon verify` at implement end, compared with the 75 s median baseline. A rise above about 10 s is explained in the report. Expected change: down (the Tasks mod tests and the per-worker fake herdr bundle build are removed).

## Notes for review

- Brief and design agree. Brief's "`plugin/` is gone" check is recorded above, not a code change.
- Open limitation: `akrogon status --json`'s `watch` field had only the Tasks mod as consumer. The brief does not name it, so it stays.
- `tests/e2e/watch-tier.ts:106-107` (`/usr/bin/false` as `herdr`) guards against an old-herdr call that no longer exists; U2 removes it. The e2e tiers are attended runs and are not run here; `typecheck` covers the edit.

## Waves

Every unit uses only the local suite (no live fixture, account or site).

### Wave 1

- **U1 install, deploy, Tasks mod** (D1, D2, D3, D11). Owns `src/install.ts`, `src/self-update.ts`, `herdr-app/` (delete), `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts` (delete), `tests/install.test.ts`, `tests/deploy-shapes.test.ts`, `tests/self-update.test.ts` (drop the in-process `FAKE_HERDR` setup at 71-89), `tests/release-deploy.test.ts` (drop the plugin link assertion at 193-194), `tests/rollback.test.ts` (wording only, if needed). Prerequisites: none. Targeted proof: `bun test --timeout=30000 tests/install.test.ts tests/deploy-shapes.test.ts tests/self-update.test.ts tests/release-deploy.test.ts tests/rollback.test.ts`.
- **U3 docs, skills, AREA, lessons** (D9, D10). Owns `README.md`, `docs/**`, `skills/**` (wording only), `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md`, `learnings/history/2026-09-10-stderr-json-parse.md`, `learnings/history/2026-09-28-plugin-cwd-pull.md`. Writes AREA lines for the end state set by D1 to D8 (install links no mods and makes no herdr call, no fake herdr, no Tasks mod). Prerequisites: none. Targeted proof: `bun test --timeout=30000 tests/docs-links.test.ts tests/command-reference.test.ts tests/lessons.test.ts`.

### Wave 2

- **U2 fake herdr, old shell exports, src and tests wording** (D4 to D8). Owns `src/shell.ts`, `src/verify.ts`, `src/reconcile.ts`, every other `src/*.ts` comment hit, `tests/fake-herdr.ts` (delete), `tests/isolation.ts`, `tests/helpers.ts`, `tests/hc-fixture.ts`, `tests/deploy-fixture.ts`, `tests/shell.test.ts`, `tests/e2e/*`, and every other `tests/*.ts` that uses `fakeHerdr`, `HerdrFixture`, `herdr.json`, `FAKE_HERDR` or the remedy text (merge-attempts, batch-merge, phase, status, status-json, park, store-sweep-safety, session-routing, abandoned-capture, receipt-gates, verify, slow-merge, durable-capture, next, close-pack, leaf-slices, release-any-phase, session-reads, green-merge, reconcile, pause-next and the rest the grep shows). Prerequisite: U1 (install and deploy tests stop using the fake herdr and deploy stops calling herdr, so the deploy fixture can drop it). Targeted proof: the touched test files with `bun test --timeout=30000 <files>`, then `bun run typecheck`.

Waves hold U1+U3, then U2, so the run is delegated, not serial-solo.

## Docs affected

- `README.md`: requirements and the seat sentence name herdr-core and herdr-app.
- `docs/reference-index.md`: Command line drops "every herdr call carries `--session`".
- `docs/start/install.md`: requirements, version check, plugin paragraph.
- `docs/start/what-it-is.md`, `docs/start/one-change.md`, `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/use/run-work.md`: seat and event wording.
- `docs/reference/state-and-phases.md`: `tab`, `pane`, delivery and `command` rows.
- `docs/reference/releases-and-updates.md`: deploy steps if they name the plugin.
- `docs/pictures/machine-parts.svg`: title and pane labels.
- `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`: install, shell, Tasks mod, fake herdr and deploy-shapes lines.
- `skills/implement-issue/brief-template.md`: test boundary sentence.
- `learnings/LESSONS.md` and two history files (D10).

## Criteria, observations and proofs

### C1 install and deploy make no herdr call, link no herdr-app mod, and remove the old link

- Boundary: `akrogon install` as a process (`cli(f, ['install'])`, HOME in a scratch fixture, `systemctl` and `herdr` as recording stubs on PATH) and `selfUpdate` deploy in-process on the deploy fixture (git remote, built release, flip).
- Before: install from the checkout links `~/.config/herdr-app/mods/tasks` and calls `herdr plugin unlink akrogon`; a release with `plugin/` gets `herdr integration install <kind>` and `herdr plugin link`; deploy calls `herdr plugin link` or `herdr plugin unlink akrogon`. After: no herdr argv logged, no `~/.config/herdr-app` created, the old `tasks` link removed, foreign links and real folders kept.
- Product failure caught: a release that still touches old herdr after its binary is uninstalled, or leaves a dangling Tasks mod link in herdr-app.
- Command: `akrogon run-check --name c1-install-deploy -- bun test --timeout=30000 tests/install.test.ts tests/deploy-shapes.test.ts`, plus the whole `test` check in `akrogon verify`. Size: about a minute. Rerun trigger: any change to `src/install.ts`, `src/self-update.ts`, `src/release.ts`, `tests/install.test.ts`, `tests/deploy-shapes.test.ts`, `tests/deploy-fixture.ts`, `tests/helpers.ts`, `herdr-app/`.
- Tests (written now, `herdrStub`/`herdrCalls` in `tests/helpers.ts`):
  - install.test.ts `install creates all four absent harness roots, links no herdr-app mod, calls no herdr and repeats without changing links` (install from this checkout).
  - install.test.ts `install removes the old herdr-app mods/tasks link and keeps every other entry in the mods folder`.
  - install.test.ts `install from a release holding plugin/ makes only the reload call and no herdr call`.
  - install.test.ts `install from a listener release links, enables and restarts the unit and calls no herdr`.
  - install.test.ts self-update `links a skill added on the remote, prunes links to a removed skill and links no herdr-app mod after deploying`.
  - deploy-shapes.test.ts `a release holding plugin/ deploys with only the reload call and no herdr call`.
  - deploy-shapes.test.ts `a listener release links and enables the unit, records, restarts it and calls no herdr`.
  - deploy-shapes.test.ts `a deploy links no herdr-app mod, calls no herdr, and removes the old mods/tasks link`.
  - Existing no-call assertions in install.test.ts (`prunes only dangling owned links`, `prunes before refusing`, `still refuses an executable destination conflict`) read the stub log instead of the fake herdr's.
  - Deleted with them, reason "install and deploy make no herdr call at all, so a missing `herdr` binary is not a separate path; the no-call cases above cover it": install.test.ts `install from a listener release succeeds with no herdr binary on PATH`, deploy-shapes.test.ts `a listener release deploys with no herdr binary on PATH and skips the unlink`.

Conditions checked against the decisions:

| Condition | Decision | Case | Red at planning |
| --- | --- | --- | --- |
| no herdr call from install, any release shape | D1 | install checkout, plugin release, listener release cases | current code (the violation) |
| no herdr call from deploy, with `plugin/` present or a listener release | D1 | deploy-shapes plugin, listener, mod cases | current code |
| no herdr-app mod linked from a tree that holds `herdr-app/tasks` | D2 | install checkout case, install.test self-update case, deploy mod case | current code |
| old `tasks` link removed by install and by deploy | D2 (kept `staleIn`) | install prune case, deploy mod case | temp edit: D1+D2 applied, `herdr-app/` moved aside, then the mods `staleIn` line deleted |
| foreign mod links and real folders kept | D2 (owned-only rule) | install prune case, deploy mod case | temp edit: mods `staleIn` predicate made to prune every link |

Red outputs: see `## Red evidence` below.

### C2 scoped grep leaves only hits read for substance

- Command (A, at implement end, through run-check): `git grep -n -i -I herdr -- README.md docs src skills tests '*AREA.md' ':!learnings/history' ':!issues' | grep -viE 'herdr-app|herdr-core|herdr-setup|HERDR_APP_HOME|herdr\.d\.ts|from .herdr.|herdr skill|/herdr\b'`. Every remaining hit is listed in `implementation/report.md` with a one-line reading. Expected allowed-by-reading classes: `herdr.tab` / `herdr.space` labels, `herdrapp` (herdr-setup's session CLI) in `tests/e2e`, recorded transcript fixtures, pre-hc history text (D8), the C1 stub asserting no call, the rollback guard. Size: seconds. Rerun trigger: any edit under the scoped paths.

### C3 LESSONS line 11 generalized, line 21 retired, line 43 kept

- Observation: `git --no-pager diff "$AKROGON_BASE" -- learnings/` pasted in the report, showing the edited line 11 with its history path, line 21 removed, the `Applied` line in `history/2026-09-28-plugin-cwd-pull.md`, the dated note in `history/2026-09-10-stderr-json-parse.md`, and line 43 unchanged. Size: seconds. Rerun trigger: any edit under `learnings/`.

### C4 operator command list in the report

- Observation: `implementation/report.md` section listing removal steps 2 to 5 and the checkout step (CHART.md Pending 1 to 5), each command with its check, including `rm ~/.config/herdr-app-sessions/infra/mods/tasks` with `test ! -e ~/.config/herdr-app-sessions/infra/mods/tasks && test ! -L ~/.config/herdr-app-sessions/infra/mods/tasks`, and the save-before-delete listing commands for `infra/herdrdev/` and `infra/herdr-plugins/` with what each listed (D12). Size: minutes. Rerun trigger: none (read-only inventory at report time).

### C5 test duration vs baseline

- Observation: the `test` check duration in the leaf's verify receipt (`issues/verify-runs.jsonl` row for this leaf and head) and the 75 s median baseline, both in the report, with an explanation when the rise exceeds about 10 s (D13). Size: the verify run, about 2 minutes. Rerun trigger: each new `akrogon verify` on a new head.

## Red evidence

Tests committed on the leaf branch as `b39d82fd` before any product code. Logs live under this leaf's `implementation/`.

- Intended red on current code: `check c1-red: 1 .../implementation/check-c1-red-1794127508201-1409645.log`. 24 pass, 9 fail, every failure for the missing behavior:
  - deploy plugin release: herdr log `["plugin link <home>/current/plugin"]`, expected `[]` (deploy-shapes.test.ts:84).
  - deploy listener release: `["plugin link ...", "plugin unlink akrogon"]` (deploy-shapes.test.ts:105).
  - deploy mod case: `existsSync(~/.config/herdr-app)` true after deploying a release holding `herdr-app/tasks` (deploy-shapes.test.ts:124).
  - install checkout case: `~/.config/herdr-app` created (install.test.ts:97).
  - install prune-owned case: herdr log `["plugin unlink akrogon"]` (install.test.ts:192).
  - install mods/tasks prune case: the `tasks` link still present (install.test.ts:136).
  - install listener release: `["plugin unlink akrogon"]` (install.test.ts:345).
  - install plugin release: `["integration install claude", "integration install codex", "integration install pi", "plugin link .../current/plugin"]` (install.test.ts:330).
  - install.test self-update case: `~/.config/herdr-app` created by deploy (install.test.ts:668).
- Decision applied (temporary edit: D1 and D2 in `src/install.ts` and `src/self-update.ts`, `herdr-app/` moved aside inside the tree): `check c1-decision-applied: 0 .../implementation/check-c1-decision-applied-1794127527331-1414956.log`, 33 pass.
- Violation of D2's kept prune (same edit, the mods `staleIn` line deleted): `check c1-violate-prune: 1 .../implementation/check-c1-violate-prune-1794127534917-1418484.log`, 2 fail: install mods/tasks prune case and deploy mod case, `tasks` link still present (`lstatSync` returned Stats).
- Violation of D2's owned-only rule (mods prune made to remove every link): `check c1-violate-foreign: 1 .../implementation/check-c1-violate-foreign-1794127542716-1422067.log`, 2 fail: same two cases, `readdirSync(mods)` lost `board`.
- All temporary edits were discarded (`git checkout -- src/install.ts src/self-update.ts`, `herdr-app/` moved back) before the test commit. `bun run typecheck` with the new tests: `check typecheck-tests: 0 .../implementation/check-typecheck-tests-1794127503345-1407030.log`.

C2 to C5 are report observations with no test.

## Implementation notes (2026-11-08)

- Refines D5 and D6: the brief's own deliverable is deleting `tests/fake-herdr.ts`, herdr fixtures and tests of removed behavior. Edits to `tests/**` that remove that machinery (fixture env, call-log assertions, deleted cases, the `fakeHerdr` rename forced by the deletion) are that deliverable, not new tests. Each changed old test file carries a `Test-Change:` trailer citing the brief's `tests:` item and the reason. No seat adds a new case at implement.
- Refines D7: implement writes no new test, so the planned hc counterpart case is not written. `tests/shell.test.ts` `retryable is false on non-JSON stderr without throwing` is deleted with `retryable` (D4): the guarded behavior was `retryable`'s retry decision, which has no hc equivalent (hc has no retry-on-code). The same failure class on hc sits in `src/hc.ts` `errorKind` (guarded `JSON.parse` with a `SyntaxError` catch, raw stderr kept on `HcError`). It has no dedicated test. This is recorded as an open limitation for review, not hidden.
- D9: live version commands are `hc --version` (prints `hc 0.1.18`) and `herdr-app --version` (prints `herdr-app 0.1.13`).
- 2026-11-08 check.fix (review-B F1, Handed to A), corrects the D7 refinement above: the design's Standing design rule requires the hc counterpart, so D7's case is written as check.fix A's case. `tests/shell.test.ts` "hc plain-text stderr rejects with HcError kind exit 1 carrying the raw stderr" runs a driver child with a stub `hc` that prints plain text and exits 1, and asserts `HcError` kind `exit 1` with the raw stderr. Check: `bun test --timeout=30000 tests/shell.test.ts -t "hc plain-text stderr"`. It goes green on the head and red when the `SyntaxError` guard in `src/hc.ts` `errorKind` is removed.

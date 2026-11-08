# Implementation report: herdr-sweep

Base `47186f909bd5dd8fb7373dc9f9b82b28889dccc5`, committed head `f672fb781cfdc82cb17aead387c7336ded752383`. No grants, no paid or live launches, no env names.

## Current status: verify green

- Second implement pass (2026-11-08, after the `failed` stop below). Refresh: `git fetch origin main` then `git rebase origin/main` moved the branch. Base went from `75f61f00` to `47186f90` and head from `6d6ef4bc` to `f672fb78`. The rebase was clean.
- Main's new commit `47186f90` updated `tests/fixtures/hc-schema.json` to hold `first_message`, which resolves blocker 1. The operator cleared the leaked units, which resolves blocker 2: 10 `hc-shutdown-*` units left, load average 0.44.
- C1 rerun on `f672fb78`: `check c1-install-deploy-2: 0 .../check-c1-install-deploy-2-1794129533648-3296479.log`, 33 pass.
- `akrogon verify` on `f672fb78`: `verify leaf f672fb781cfdc82cb17aead387c7336ded752383: green`. Format, typecheck and test all exit 0; test is 1135 pass, 0 fail (`.../check-test-1794129596400-3299032.log`). Wall time was 63 s (10:18:53 to 10:19:56 local).
- C2 rerun on `f672fb78`: `check c2-grep-2: 0 .../check-c2-grep-2-1794129603264-3562196.log`, 138 hits, the same hits as the first run apart from line numbers. The readings below hold.
- The commit SHAs listed under "Changed files and reasons" are the pre-rebase ones. The rebased commits are `87523ea0`, `71761d83`, `01a86e0a`, `10148cd3`, `952008ff`, `f672fb78`, in the same order.

## First pass: blocked on two operator actions (resolved)

`akrogon verify` on `6d6ef4bc` was red in the `test` check only (format and typecheck green). Every failure traces to the operator's machine, not the leaf diff:

1. **`tests/hc-identity.test.ts` "the parts of hc schema akrogon parses match the pinned copy"** fails on every run, on the head and on the base `75f61f00` alike. `hc schema` adds a `first_message` property that the pinned `tests/fixtures/hc-schema.json` lacks. The test's `spawnCaptured(['hc','schema'])` forks Bun's startup env and so reaches the operator's real `default` hc core. `issues/chart/herdr-app/forks/e2e-proof.md` part 7 records that core as still running hc 0.1.17 from a deleted executable. With no core reachable, `hc schema` (client `hc 0.1.18`) prints no `first_message`. Filed: https://github.com/Tamdoma/akrogon/issues/131.
2. **Seat start-proof timeouts under load.** Each full run fails 2 different `next.test.ts` hc cases with `Seat A of <slug> failed to start at t1`: run 1 had `a live tab freezes .env ...` and `next --all, --resume and manual next record ...`; the retry had `blocked-report automatic silence ...` and `blocked-report manual forms ...`; a debug run had `invalid merged depth stays excluded during --all/. ...`. `tests/next.test.ts` alone with the suite flags is green (196 pass, `check next-file: 0 .../check-next-file-1794128649513-2270216.log`), and so is each pair rerun alone (`check next-two: 0 .../check-next-two-1794128550586-2013946.log`). The user manager holds **6,220 leaked `hc-shutdown-*` units** and the load average was 12.1. This is the cause recorded in `learnings/history/2026-11-08-hc-shutdown-unit-leak.md` (registered checkout), which was confirmed there by clearing the units.

Blocker record:
- Input: the operator's hc cores `default` and `mdconsultingny` (0.1.17), and the systemd user manager's `hc-shutdown-*` units.
- Attempted operation: the `test` check in `akrogon verify` on `6d6ef4bc`.
- Identity: user `ivan`'s user manager and hc runtime `/run/user/1000/herdr-core`.
- Error: the schema diff above (`first_message`, +11 lines), and `Seat A of <slug> failed to start at t1`.
- Owner: operator.
- Exact operator actions:
  1. Restart the `default` and `mdconsultingny` hc cores on the installed hc 0.1.18 (as e2e-proof part 7 already asks). Check: `HC_SESSION=default hc schema | grep -c first_message` prints `0`.
  2. Stop the leaked units: `systemctl --user stop 'hc-shutdown-*'`. Check: `systemctl --user list-units 'hc-shutdown*' --all --no-legend | wc -l` is near 0.
- Next action: re-prompt this leaf (`akrogon phase herdr-sweep implement`). The pass reruns `akrogon verify` on the same head and hands off to `check.review` when green. No code change is expected.

Retry and known-red record:
- `verify test: 1 .../check-test-1794128534689-1763790.log` (3 fail).
- Retry of the same configured command: `check test: 1 .../check-test-1794128620473-2016890.log` (3 fail, a different `next` pair).
- `akrogon verify --known-red` printed `verify known-red 6d6ef4bc...: fail` at once: the merge-base tree holds a whole-green row, so no base pass ran, and a green base never covers a red head.
- My own base run of the schema test: `check base-hc-identity: 1 .../check-base-hc-identity-1794128822469-3025275.log`, same `first_message` diff. Filed as #131 under seed-issue Lifecycle filing.
- The diagnostic run used a temporary stderr print in `tests/next.test.ts`, discarded with `git checkout` before any commit: `check debug-suite: 1 .../check-debug-suite-1794128773928-2603353.log`.

## Changed files and reasons

Commits on the leaf branch after the base:
- `b39d82fd` test (planning): C1 cases in `tests/install.test.ts`, `tests/deploy-shapes.test.ts`, plus `herdrStub`/`herdrCalls` in `tests/helpers.ts`.
- `079a7cb7` (U1, worker): `src/install.ts` and `src/self-update.ts` make no herdr call (D1). Mod linking is removed and the mods prune kept (D2). `herdr-app/`, `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts` are deleted (D3). The fake herdr setup is removed from `tests/self-update.test.ts`, and the plugin link assertion from `tests/release-deploy.test.ts`.
- `6460be14` (A): `src/install.ts` spawn comment no longer names herdr.
- `b42d2360` (U3, worker):
  - README and docs pages (`start/install.md`, `start/what-it-is.md`, `start/one-change.md`, `use/autopilot.md`, `use/plan-work.md`, `use/run-work.md`, `reference/state-and-phases.md`, `reference/releases-and-updates.md`, `reference-index.md`) are rewritten.
  - `pictures/machine-parts.svg` and `skills/implement-issue/brief-template.md` are rewritten.
  - `src/AREA.md` and `tests/AREA.md` are updated.
  - LESSONS line 11 is generalized, line 21 retired, and both history files have their appends (D9, D10).
- `b41166b4` (U2, worker):
  - `src/shell.ts` loses its dead herdr code (D4). `src/verify.ts` drops `FAKE_HERDR`, `src/reconcile.ts` gets the new remedy text, and a `src/land.ts` comment is reworded.
  - `tests/fake-herdr.ts` and the bundle build in `tests/isolation.ts` are deleted. `fakeHerdr` becomes `procFixture` across the callers, and `tests/hc-fixture.ts` loses its fake herdr (D5).
  - Call-log assertions and the shell herdr cases are deleted (D6).
  - `tests/rollback.test.ts` gets a recording `herdrStub` for the pinned pre-hc release's install. See the U2 note below.
- `6d6ef4bc` (A): `tests/install.test.ts` self-update fixture drops the dead fake herdr link, `herdr.json` seed and `FAKE_HERDR` env.

Every changed old test file carries a `Test-Change:` trailer in the commit that changes it (24 in `b41166b4`, 4 in `079a7cb7`, 1 each in `b42d2360` and `6d6ef4bc`, 3 in `b39d82fd`).

U2 note on `tests/rollback.test.ts`: the "roll-back page manual steps" case pins release `6121559e`, whose `install` still calls `herdr integration install` and `herdr plugin link`. With the fake herdr gone, that call would reach whatever `herdr` is on PATH, which on this machine is the real `~/.local/bin/herdr`. The recording stub answers it instead. No expectation changed.

## Deleted tests and assertions (D6)

- `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`: whole files. The Tasks mod is deleted (brief, forks/config.md Q2).
- `tests/shell.test.ts`: `Herdr response retains native cause for ...` (2 cases), `herdrError decodes structured stderr`, `herdrError maps unstructured stderr to exit code`, `herdrError truncates long stderr to 500 chars`, `retryable is false on non-JSON stderr without throwing`, `paneSchema requires kind when agent_session present`. The functions are gone. The lesson 11 failure class on hc lives in `src/hc.ts` `errorKind` (a guarded parse that keeps the raw stderr). It has no dedicated test, and implement writes no new test (plan Implementation notes). This is an open limitation.
- `tests/install.test.ts` `install from a listener release succeeds with no herdr binary on PATH`, `tests/deploy-shapes.test.ts` `a listener release deploys with no herdr binary on PATH and skips the unlink`: install and deploy make no herdr call, so a missing herdr is no separate path. The no-call cases cover it (planning commit).
- Vacuous fake-herdr reads (`src/` makes no herdr call):
  - `phase.test.ts`: `herdrCalls` and 3 uses.
  - `status.test.ts`: 3 `herdr.json.calls` checks.
  - `status-json.test.ts`: 1 such check.
  - `next.test.ts`: `herdrDb` and 2 reads.
  - `session-routing.test.ts`: `herdrCalls`, `herdrOther`, the `HERDR_SOCKET_PATH` stale-socket env and its assertions in two hc cases (whose decoy-core parts stay), and the unused pane/session seed helpers.
  - `release-deploy.test.ts`: the plugin link assertion.
  - `tests/install.test.ts` and `tests/deploy-shapes.test.ts`: call lists replaced by no-call assertions.

## Criteria and proof

### C1: install and deploy make no herdr call, link no herdr-app mod, remove the old link

- Command: `akrogon run-check --name c1-install-deploy -- bun test --timeout=30000 tests/install.test.ts tests/deploy-shapes.test.ts` on `6d6ef4bc`: 33 pass, 0 fail, `check c1-install-deploy: 0 .../check-c1-install-deploy-1794128465288-1760708.log`.
- Planning: red on base code with 9 fail, green with D1+D2 applied, and red for each violated condition (plan.md `## Red evidence`).
- The same cases passed inside both full `test` runs. The `test` check overall is red only for the blockers above.

### C2: scoped grep

Command:

```
git grep -n -i -I herdr -- README.md docs src skills tests '*AREA.md' ':!learnings/history' ':!issues' | grep -viE 'herdr-app|herdr-core|herdr-setup|HERDR_APP_HOME|herdr\.d\.ts|from .herdr.|herdr skill|/herdr\b'
```

`check c2-grep: 0 .../check-c2-grep-1794128940479-3169652.log`, 138 hits in 45 files on `6d6ef4bc`, all read. None describes old herdr as current. By class:
- `herdr.tab` / `herdr.space` label keys (`src/seat.ts`, `src/next.ts`, `src/reconcile.ts`, `src/AREA.md`, many tests): herdr-app's current labels.
- `src/hc.ts:515` `'no Herdr window'`: herdr-app's current error text.
- Pre-hc history: `src/state.ts:22,56,146,157` (`predatesHc`), `src/verify.ts:230`, `src/reconcile.ts:211`, `src/rollback.ts:29` and its tests (the rollback guard that stays), and seeded `delivery_error.command: ['herdr','agent','prompt']` in `phase`, `status`, `state` and `state-inventory` tests.
- The C1 no-call stub: `herdrStub`/`herdrCalls` in `tests/helpers.ts`, `tests/install.test.ts`, `tests/deploy-shapes.test.ts`, `tests/rollback.test.ts`. The `no-herdr-bin` PATH in `tests/rollback.test.ts:299` is an existing hc-to-hc rollback case.
- Env names cleared or checked as absent: `HERDR_PANE_ID: ''` and land-unit `HERDR_SOCKET_PATH` checks (`green-merge`, `session-routing`, `phase`, `pause-next`, `run-permit`, `run-units` and others).
- Past-tense notes about the removed fake herdr: `batch-dispatch:26`, `hc-observe:4`, `leaf-slices:177`, `leaf-stop:39`, `next:65,69,2800`, `reconcile.test:39`.
- `FAKE_HERDR_APP` (the strict fake herdr-app) in `tests/hc-fixture.ts`, `tests/e2e/watch-tier.ts`. `herdrapp` (herdr-setup's CLI) in `tests/e2e/tier.ts`, `window.e2e.ts`, `notices.e2e.ts`.
- Data: `tests/fixtures/status-envelope.json` slugs `herdr-panels`/`herdr-session`, and `skills/watch-issues/scripts/fixtures/claude-session.jsonl` (recorded transcript).
- `skills/chart-issues/SKILL.md:27,29` `herdr-consultant-column`: herdr-setup's current hc helper.

### C3: LESSONS

`git --no-pager diff 75f61f00 -- learnings/` on `6d6ef4bc`:

```diff
--- a/learnings/LESSONS.md
+++ b/learnings/LESSONS.md
@@ -8,7 +8,7 @@
-- process boundary: `retryable` in `src/next.ts` parses herdr stderr as JSON unguarded, so a non-JSON stderr surfaces as SyntaxError and the real body is lost; parse external stderr behind a guard and propagate the raw text. 2026-09-10. history/2026-09-10-stderr-json-parse.md
+- process boundary: an outside CLI's stderr may be plain text (a panic, usage error or socket failure) even when it normally writes JSON errors; herdr's `retryable` parsed it unguarded and lost the real body as a SyntaxError. Parse external stderr (`hc`, `gh`) behind a guard and keep the raw text. 2026-09-10. history/2026-09-10-stderr-json-parse.md
@@ -18,7 +18,6 @@
-- herdr plugin commands: startup and hooks run with the plugin directory as cwd, which for akrogon is inside a registered repo, so cwd-sensitive `--all` narrowed startup `pull --all` to akrogon; check a hook command's cwd behavior before trusting it to cover every repo. 2026-09-28. history/2026-09-28-plugin-cwd-pull.md
--- a/learnings/history/2026-09-10-stderr-json-parse.md
+Generalized 2026-11-08 by herdr-sweep: the herdr site (`retryable` in `src/shell.ts`) is deleted with old herdr; the class still applies to every outside CLI. `src/hc.ts` `errorKind` parses hc stderr with a `SyntaxError` guard and keeps the raw text on `HcError`; it has no dedicated test.
--- a/learnings/history/2026-09-28-plugin-cwd-pull.md
+Applied 2026-11-08 by src/install.ts (linkServices): akrogon ships no herdr plugin (`plugin/` removed by engine-on-hc) and install and deploy make no `herdr plugin link` or `herdr integration install` call, so no akrogon command runs as a herdr plugin hook.
```

The `headless-output-freezes-window` line (was 43) is unchanged. No seed was filed for line 11 (plan D10: the unguarded pattern is no longer reachable).

### C4: operator command list for removal steps 2 to 5 and the checkout step

These refine CHART.md `## Pending steps` removal items 1 to 5 from a read-only inventory on 2026-11-08 (`check c4-inventory: 143 .../check-c4-inventory-1794128877753-1525374.log`, stopped by `akrogon stop-run` after its sections up to Moshi; `check c4-inventory-2: 0 .../check-c4-inventory-2-1794128910931-3161096.log`; `check c4-inventory-3: 0 .../check-c4-inventory-3-1794128924784-3166364.log`). Nothing on the machine was changed. Run them after herdr-sweep merges and deploys. The deploy itself removes `~/.config/herdr-app/mods/tasks`.

**Step (2), Pending 1: unregister from old herdr while the binary exists.**
- Found: `herdr plugin list` shows only `herdr-file-viewer`. akrogon's plugin is already gone (engine-on-hc).
- Found: `herdr integration status` lists installed integrations: claude (v11), codex (v8), pi (v9), antigravity-cli (v3), copilot (v3), kimi (v7), opencode (v13), hermes (v5), grok (v3).
- Commands:

  ```
  herdr plugin list                        # check: no line for akrogon (already true)
  herdr plugin unlink herdr-file-viewer    # only if you also drop this third-party plugin
  for k in claude codex pi antigravity-cli copilot kimi opencode hermes grok; do herdr integration uninstall "$k"; done
  herdr integration status                 # check: every kind "not installed"
  ```
- In `~/.claude/settings.json`, remove the dead permission lines 36-44 and 47 (`Bash(herdr agent ...)`, `Bash(herdr pane run *)`, `Bash(herdr agent:*)`), the `herdr agent start` entries in `autoMode.allow` (lines 252-254, 286-287 name herdr), and the hook at line 166 (`bash '/home/ivan/.claude/hooks/herdr-agent-state.sh' session`; `integration uninstall claude` should remove it). Check: `grep -n -i herdr ~/.claude/settings.json` prints nothing you still want.

**Step (3), Pending 2: patch units, hooks, folders.**
- Commands:

  ```
  systemctl --user disable --now herdr-patches.path herdr-patches.timer herdr-claude-rules.path
  rm ~/.config/systemd/user/herdr-patches.{path,timer,service} ~/.config/systemd/user/herdr-patches-failed.service ~/.config/systemd/user/herdr-claude-rules.{path,service}
  systemctl --user daemon-reload
  systemctl --user list-units 'herdr*' --all --no-legend   # check: empty
  rm ~/.config/omarchy/hooks/theme-set.d/apply-omarchy-theme ~/.config/omarchy/hooks/post-update.d/ensure-herdr-after-omarchy-update
  rm -r ~/.local/share/herdr-patches ~/.cache/herdr-patches
  ```
- Keep `~/.config/omarchy/hooks/theme-set.d/apply-herdr-app-theme`, which is herdr-app's.
- `~/Work/omarchy-customizations/herdr/` (unregistered repo, operator edit): remove the folder and the old-herdr lines in `install.sh` (288-293 `omarchy pkg add herdr`, the herdr `config.toml` backup, `apply-omarchy-theme`, `install-patches`; 388 the "Herdr: Ctrl+B prefix" echo). Keep 295-305 (herdr-setup and herdr-app settings) and 389.
- Checks: `ls -d ~/.local/share/herdr-patches ~/.cache/herdr-patches` fails; `grep -n 'herdr/' ~/Work/omarchy-customizations/install.sh` shows no old-herdr lines.

**Step (4), Pending 3: Moshi.**
- Found: `~/.config/systemd/user/moshi-hook.service.d/herdr.conf` sets `Environment=MOSHI_HERDR_PATH=/home/ivan/.local/bin/herdr`, and `~/.local/bin/moshi` and `~/.local/bin/moshi-hook` read it.
- Commands: point Moshi at its herdr-app/hc replacement or drop the dependency, then `rm ~/.config/systemd/user/moshi-hook.service.d/herdr.conf && systemctl --user daemon-reload && systemctl --user restart moshi-hook.service`.
- Check: `grep -rn MOSHI_HERDR_PATH ~/.config/systemd/user ~/.local/bin` prints nothing.

**Step (5), Pending 4: stop old herdr, remove binaries and config.**
- Found running:
  - `herdr server` processes 11608 (handoff import), 13402, 25363, 3276503;
  - clients `herdr --session personal` (25324) and `herdr --session mdconsultingny` (3276379);
  - `herdr --session infra` (3563199) under mosh-server 3563198, which is a live operator session. Close it yourself.
- Commands: end each old session from inside it, or `kill <pid>` for each server listed by `ps -eo pid,args | grep -E '(^| |/)herdr( |$)'`, then:

  ```
  ps -eo pid,args | grep -E '(^| |/)herdr( |$)' | grep -v grep   # check: empty
  rm ~/.local/bin/herdr                                           # 31 MB patched build
  sudo pacman -R herdr                                            # owns /usr/bin/herdr (herdr 0.9.1-2)
  pacman -Q herdr                                                 # check: "was not found"
  rm -r ~/.config/herdr
  rm ~/.config/herdr-app-sessions/infra/mods/tasks
  test ! -e ~/.config/herdr-app-sessions/infra/mods/tasks && test ! -L ~/.config/herdr-app-sessions/infra/mods/tasks && echo gone
  test ! -L ~/.config/herdr-app/mods/tasks && echo gone            # removed by the herdr-sweep deploy
  ls ~/.local/bin/herdr /usr/bin/herdr ~/.config/herdr             # check: all "No such file"
  ```
- The infra link points at `~/.config/herdr-app/mods/tasks` (link to a link), so it dangles once the deploy prunes the target.
- Desktop shortcut: only `~/.local/share/applications/herdr-app.desktop` exists (herdr-app's, keep). No old herdr shortcut was found in `~/.local/share/applications` or `/usr/share/applications`, so nothing to remove.

**Checkout step, Pending 5: save, then delete `infra/herdrdev/` (5.5 GB) and `infra/herdr-plugins/` (44 KB).**

Listing commands (rerun right before deciding):

```
for d in ~/Work/infra/herdrdev/herdr ~/Work/infra/herdrdev/herdr-patched; do git -C "$d" status --short --branch | head -3; git -C "$d" stash list; git -C "$d" worktree list; git -C "$d" branch -vv; git -C "$d" log --branches --not --remotes --oneline; done
git -C ~/Work/infra/herdrdev/herdr-worktrees/focused-pane-border diff --stat
```

What exists only on disk, read on 2026-11-08:
- One repository (`origin https://github.com/herdrdev/herdr`, upstream) with four worktrees:
  - `herdr` on `master` (ahead 7, behind 508);
  - `herdr-patched` on `pi-registration-fixes`;
  - `herdr-worktrees/focused-pane-border` on `local/focused-pane-border`;
  - `herdr/issues/worktrees/herdr-registry-durability` on `worktree-herdr-registry-durability`.
- No stashes.
- 18 commits on no remote, among them:
  - `1b1470b6 add issues`;
  - `58e2009c` patched pi integration v9;
  - the `herdr-registry-durability` series (`7de84a04`, `2f5dd2e3`, `265e835b`, `548e7ff4`, `9527282b`, `0f79a405`, `d54b272e`, `0ece5c1c`, `baf3d937`, `7d25f092`, `16ed0de0`);
  - fixes `2edaac8c`, `d9d2ddb5`, `ec2dd703`, `d6a61d65`, `67cf9755`.
- Uncommitted:
  - `herdr` has 1,087 changed paths, `herdr-patched` 1,145 and `herdr-registry-durability` 1,094, none with a content change once CR at end of line is ignored (line-ending noise);
  - `focused-pane-border` has one real change (1 file, +82/-26).
- `infra/herdr-plugins/` is not a git repository: `herdr-file-viewer-winfix/` and `herdr-new-tab-winfix/` (each `herdr-plugin.toml` plus `scripts/`) and `herdr-registry-durability/REPORT.md`.

Save, after the operator picks a pushed fork branch or a bundle:

```
git -C ~/Work/infra/herdrdev/herdr-worktrees/focused-pane-border commit -am 'keep: focused pane border change'   # its one real uncommitted change
git -C ~/Work/infra/herdrdev/herdr bundle create ~/herdr-local-$(date +%F).bundle --branches --not --remotes=origin
git -C ~/Work/infra/herdrdev/herdr bundle verify ~/herdr-local-$(date +%F).bundle      # check: "is okay"
tar -czf ~/herdr-plugins-$(date +%F).tgz -C ~/Work/infra herdr-plugins
```

Delete only after the operator confirms the saved copy: `rm -rf ~/Work/infra/herdrdev ~/Work/infra/herdr-plugins`. Check: `ls -d ~/Work/infra/herdrdev ~/Work/infra/herdr-plugins` fails.

### C5: test duration

- The leaf's green verify `test` on head `f672fb78` took 57.9 s (`duration_ms` 57935, `issues/timings.jsonl`). The earlier red runs on `6d6ef4bc` took 60.4 s and 61.2 s.
- Baseline: median 75 s.
- Change: about 17 s faster, not slower, so no explanation is required. The drop matches the removed per-worker fake herdr bundle build and the fewer tests: 1135 on the rebased head, against 1167 on main before the sweep. The Tasks mod tests and the shell herdr cases are gone, and main added one.

## Wall times

| Command | Wall time |
| --- | --- |
| `akrogon verify` | 65 s (09:01:09Z to 09:02:14Z) |
| `test` check retry | about 61 s |
| debug suite run | about 62 s |
| c1 proof | about 2 s |
| inventory, first part | stopped after about 3 min, stuck on a home-wide grep |

## Known limitations

- The lesson 11 class on hc (`src/hc.ts` `errorKind`) has no dedicated test (D7 refined: implement writes no test).
- `akrogon status --json`'s `watch` field had only the Tasks mod as consumer and stays (not in the brief).
- `src/reconcile.ts:572,1322` still say "pane inventory" without naming herdr. Left as is.
- `tests/close-pack.test.ts` imports `procFixture` without using it, as it imported `fakeHerdr` before.
- The e2e tiers (`tests/e2e/*`) are attended runs and were not run. Typecheck covers the `watch-tier.ts` edit.

## Unverified criteria

None. C1 to C5 each have their evidence here, and verify is green on `f672fb78`.

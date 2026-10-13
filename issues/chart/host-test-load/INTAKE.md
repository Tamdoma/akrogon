# Intake: host-test-load

## Scope
Cap the host load that concurrent leaves, their in-process workers and the browsers their test runs launch can create, and give the operator a stop that reaches all of it. Destination akrogon (registered key `akrogon`). Framework, pi-extensions and blepsis parts are proposed as separate charts or exclusions pending forks.

## Provenance
- GitHub: Tamdoma/akrogon#88
- Operator: chart-issues open, 2026-10-13

## Source: Tamdoma/akrogon#88
# Six framework leaves ran full test_changed suites in worker worktrees at once: load 235 on 32 threads, ~1900 browsers, and Esc and pause did not stop the in-process workers

Source: Tamdoma/akrogon#88
URL: https://github.com/Tamdoma/akrogon/issues/88

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-10-13, between about 00:55 and 01:27 CEST, a single host was overloaded. It is an AMD Ryzen 9 9950X3D with 16 cores, 32 threads and 126 GB of RAM.

Host state during the incident:

| Metric | Value |
|---|---|
| 1-minute load average | 87, then 153, 172, 212 and a peak of 235 |
| CPU | 100% for many minutes |
| Temperature | 77 °C |
| Tasks | 2180 |
| Chrome/chromium processes | about 469 at first, then 1886 at the peak |

Seven framework leaves (repo `framework`, `/home/ivan/Work/infra/tamdoma/framework`) were live at once. Six were in `implement`:
- pass-two-review-notes
- pull-rebuild-scripts
- technical-pack-selection
- technical-page-inventory
- flaky-test-fixes
- test-changed-shared-files

The seventh, spec-path-open-categories, was in `plan.synthesis`. Each A seat was `pi --model devin/swe-2-max --thinking high`.

Their delegated workers each ran a full `bun run test:changed` in their own worktree under `~/.akrogon/worktrees/framework/<slug>-u<N>`, all at the same time. A process snapshot showed these top-level runs:

- pass-two-review-notes-u3 and -u2:
  - command: `bash -c AKROGON_BASE=92b9f313… bun run test:changed > /tmp/…`
  - chain: `run-test-changed.ts` → `framework:verify:core`
- technical-pack-selection-u1 and -u2, and pull-rebuild-scripts-u1:
  - command: `/bin/bash -c ( eval "$TAMDOMA_WORKER_COMMAND" )`
  - chain: `run-test-changed.ts` → `framework:verify:core`
- flaky-test-fixes-u1:
  - command: `akrogon run-check --name test_changed`
  - chain: `run-test-changed.ts` → `framework:verify:core`
- pull-rebuild-scripts-u1 alone used about 370% test CPU and had 11 headless browsers.

Browser suites reached by these runs:
- mpa-meta (playwright)
- motion-probe
- chrome-copy-e2e
- playback-probe
- mpa-navigation (astro)
- site-nav-e2e (dev-render-satellite)
- blepsis `cdp-core.mjs` page-measure Chrome, using `--user-data-dir=/tmp/akr-1000/…` and `/tmp/page-measure-*`

The operator tried to stop the runs in this order. None of steps 1–3 brought the load down.

1. **Pause.** `akrogon pause` marked framework paused. Running seats, workers and test runs continued.
2. **Esc.** The operator sent `esc` to the five non-selector implement seats. Within a minute their in-process subagent workers had started new test runs, for example:
   - pass-two-review-notes-u3 `/tmp/u3-run.sh`
   - technical-pack-selection-u2
   - flaky-test-fixes-u1 site-nav-e2e
3. **Killing test process groups.** The operator killed the worker test process groups. Browsers stayed alive. Chromium from site-nav-e2e runs kept running with their own process as root, in `/tmp/akr-1000/<hash>/…/site-nav-e2e-*` directories. Their runners had already exited:
   - flaky-test-fixes-u1: runner PID 1284959, about 10 browsers
   - technical-pack-selection-u2: runner PID 1307227, about 10 browsers
   - An astro dev server from `/tmp/akr-1000/…/site-*` and a `timeout 540 bun test --changed=…` also outlived their parents.
4. **Killing the seats and temp-dir processes.** This worked. It killed the five seat pi process trees (614 PIDs) and every process whose cwd was in those worktrees, `/tmp/akr-1000/` or `/tmp/page-measure-*` (809 PIDs). Within 20 seconds, CPU was 95% idle and 158 browser processes remained.

Failures that happened under load earlier the same day:
- an astro SIGSEGV
- a playback-probe flake

Each red costs a check.fix round.

## Location

- **akrogon implement workflow:**
  - worker waves: `skills/implement-issue/SKILL.md`, `worker-protocol.md`, `brief-template.md`
  - unit planning: `skills/plan-issue/SKILL.md`
- **akrogon runtime:** `src/run-check.ts`, `src/config.ts` (command resolution and `max_active`), `src/next.ts` (dispatch, `activeCount`, pause gates), `src/pause.ts`
- **pi subagent extension** used as the A seat's worker runner: `~/.pi/agent/extensions/tamdoma-subagents`
- **consumer selector:** framework `.claude/workflow/scripts/run-test-changed.ts`

## Reproduction

Not provided as a minimal recipe. The conditions seen:
1. Several leaves of one repo are in `implement` with delegated waves at once.
2. Their diffs touch a path outside every owned test folder, so `test:changed` selects everything.
3. Each worker and each lane pick runs that command.

Frequency: the incident built up over about 30 minutes. A smaller overload, load 53 and 87 with 5 concurrent full runs, was seen earlier the same evening.

## Expected behavior

- Total concurrent test, suite and browser load from all leaves and their workers on one host should stay within the host's capacity.
- `akrogon pause`, or stopping a seat, should be able to stop the work that seat started, including in-process workers and the browsers they launched.

## Urgency

High. The host became unusable: CPU pinned, loud, and the operator's own work was affected. Load-induced reds also add check.fix rounds of about 40–60 minutes each, so the overload slows merges instead of speeding them.

Workaround in place, operator-local and temporary:
- Framework `issues/config.yaml` wraps `test_changed`, `cheap` and merge `verify` in `flock /home/ivan/.akrogon/framework-tests.lock`, so at most one config-resolved heavy run executes at a time. Ad-hoc worker scripts and criterion proofs still bypass the lock.
- Framework is paused, and only the selector leaf test-changed-shared-files is left running.
- Stopping a runaway leaf currently needs the seat's pi process tree killed, plus processes whose cwd is in `/tmp/akr-<uid>/`.

## Suspected cause

**Main condition.** Nothing counts or caps heavy test runs across leaves and their workers on one host. The limits that exist cover other things:

| Limit | Scope | Evidence |
|---|---|---|
| `max_active` | Active leaves with a live pane, checked only when allocating a new tab. It is 20 in the live global config, and in-process workers have no pane, so they are not counted. | `src/config.ts:25`, `config.yaml:1`, `src/next.ts:411-421,440-442` |
| Waves | Up to 3 workers per wave, per leaf. Each worker gets the resolved `test_changed` command, and A runs lane changed tests after every pick. | `skills/plan-issue/SKILL.md:59`, `skills/implement-issue/SKILL.md:55`, `worker-protocol.md:11,25`, `brief-template.md:37` |
| pi `concurrency = 3` | Per parent manager, so per seat. | `tamdoma-subagents/manager.ts:288`, `index.ts:99` |
| `batch_limit` | Merge batching only. | `src/config.ts:47`, `src/next.ts:1068` |
| `run-check` | Has no lock, queue or capacity check before spawning. | `src/run-check.ts:96-130`, `src/shell.ts:38-45` |
| Install flock | Wraps only setup. The check runs after `&&`, outside it. | `src/config.ts:315` |

`/proc/pressure` is recorded as merge telemetry but never used to admit work (`src/next.ts:1063,1084`, `src/attempts.ts:82`). These limits multiply rather than share one budget: leaves × 3 workers × A's lane and final runs. Each run can be a full-suite selection.

**Contributing conditions.**
1. **Consumer selector breadth.** Any changed path outside an owned folder selects all leaf scripts and runs `framework:verify:core` (framework `run-test-changed.ts:120-122,201-202`). Core itself launches parallel branches, including motion and playback probes (`package.json:165`).
   - The selector-replay figures recorded in framework `issues/open/test-changed-breadth/test-changed-shared-files/brief.md` were not re-checked here:
     - 125 of 143 merged leaves since Oct 1 selected everything.
     - Top triggers: `package.json` in 48 leaves, `.claude/hooks/checksums.json` in 30.
   - That open framework leaf targets this breadth.
2. **Wave planning ignores machine load.** Planning separates units by paths and shared test resources such as fixtures, accounts or sites, but never by CPU, browsers or the shared suite (`plan-issue/SKILL.md:59`).
3. **The resolved command is only prompt text.** Workers can run `bun run test:changed` or their own scripts directly, as seen with `/tmp/u3-run.sh`, which bypasses `run-check` and any wrapper.
4. **Stopping does not reach workers.** Pause is read only at dispatch and merge points (`src/pause.ts`, `src/next.ts:688,789`). The pi manager's own test shows that aborting a waiter leaves the child running (`tamdoma-subagents/manager.test.ts:1652`). This fits the observed restarts after `esc`.
5. **No reaper for descendants.** `run-check` and the selector track only their direct child, so killed runners leave browsers behind.
6. **Load creates more load.** A red check gets one retry and then a base run of the same full command (`implement-issue/SKILL.md:38`). Under load-induced flakes, this adds two more full runs at the worst moment.

**Whose view:** both. The reporter and agent saw the incident. Two helper agents (codex and pi muse-wonder) verified the citations by reading files only.

**Files read:**
- akrogon:
  - `skills/implement-issue/SKILL.md`, `worker-protocol.md`, `brief-template.md`
  - `skills/plan-issue/SKILL.md`
  - `src/run-check.ts`, `src/config.ts`, `src/next.ts`, `src/pause.ts`, `src/shell.ts`, `src/attempts.ts`
  - `config.yaml`
- framework:
  - `issues/config.yaml`, `.claude/workflow/scripts/run-test-changed.ts`, `package.json`
  - the test-changed-shared-files brief
- `~/.pi/agent/extensions/tamdoma-subagents/{manager.ts,index.ts,manager.test.ts}`

These are installed and working copies. The pi extension source of record is the pi-extensions workspace, not this repo.

**Not inspected, or what would disprove this:**
1. Pi core's Esc wiring, and whether the pi bash tool kills its process group on abort. If it does, the orphan browsers would point at the test harnesses detaching browsers.
2. Whether `git rev-parse --git-path akrogon-install.lock` resolves per worktree in `<slug>-u<N>`. If it does, even setup is not serialized.
3. How much CPU one full run uses on its own. One run used about 370%, so a single run may oversubscribe cores, and concurrency would then be an amplifier rather than the only cause.
4. Per-leaf wave sizes at incident time.
5. Whether the astro SIGSEGV and playback flake were load-induced. They are not proven.

**Related reports:**
- Tamdoma/akrogon#53 (closed): whole-repo merge_checks timed out under concurrent seat load, and the report states "nothing limiting how many heavy runs overlap". It was closed by framework `2cb00d537` (capture hang) and akrogon `c27cb1f`/`d5db49d` (base-run verdict). The overlap condition was not addressed there, and this incident shows it at the worker level.
- Tamdoma/akrogon#87 (closed): framework `test_changed` selector wiring. This incident is the first load with the selector active.
- Tamdoma/akrogon#51: why units exist (wall-clock parallelism).
- The lookups searched Tamdoma/akrogon in all states:
  - `--author @me created:>=2026-10-11`, limit 40
  - `"test_changed concurrency"`, limit 10
  - `"worker test runs load"`, limit 10

## Source: operator 2026-10-13 chart open
I just pulled an issue that is a huge issue. My PC almost exploded. We need to make this work without running so many browser processes at the same time. Consult with slot b and c, they're both active in your herdr tab.

## Agent findings
Opening maps by A, B and C: slots/map-A.md, slots/map-B.md, slots/map-C.md. Merged map: slots/map-merged.md.

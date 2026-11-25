# Plan: caller-display

Slot A synthesis, 2026-11-25. Brief and design read from this folder; live surfaces inspected in the worktree at 99552b73 (base; origin/main 8d0df9dd is one commit ahead and touches no leaf surface — `git log HEAD..origin/main -- <leaf paths>` empty).

## Read-first

- `issues/open/run-check-display/caller-display/brief.md`, `design.md` (this leaf)
- `issues/chart/run-check-display/forks/display-env.md` — the display-env fork with binding decisions and the P0–P3 / A-S1–A-S4 probe records
- `issues/open/run-check-display/caller-display/readiness.yaml` — the two recorded free probes (headed Chromium, systemd-run env semantics); no grants, no inputs, no produces
- `src/run-check.ts` — `copied` and `constructedEnv` (the copy is `value !== undefined`, already blank-correct); `checkedRun` passes `env.XDG_RUNTIME_DIR` to `runUnitArgv`
- `src/verify.ts` — `passForwarded` and `launchPass` (names filter on `sessionBusEnv()`, which copies `process.env` and normalizes only bus/runtime)
- `src/land.ts` — `launchLand` (the `AKROGON_*` flatMap only-if-defined pattern to mirror)
- `src/scope.ts` — `runUnitArgv` (`-u XDG_RUNTIME_DIR` when undefined, `XDG_RUNTIME_DIR=<value>` otherwise, empty included); `runtimeDir()`, `sessionBusEnv()`
- `src/config.ts` — the `constructed` reserved-name set (the four display names stay out, binding decision 3)
- `tests/isolation.ts` — the preload (pins `XDG_RUNTIME_DIR` to the suite runtime; display-name unset added by the test commit)
- `tests/run-check.test.ts` — the env allow-list test whose expectation changes (see D5)
- `tests/helpers.ts` — `cli` merges `process.env` then the passed env last, so passing `NAME: undefined` drops a name from the CLI child; `fixture`, `leafWorktree` patterns
- `tests/fake-systemd-run.sh` — the systemd-run seam: logs `$*` one line per call to `FAKE_SYSTEMD_RUN_LOG`, execs scope payloads and `verify-pass` in the caller's place, exits 0 for service submissions
- `tests/session-routing.test.ts` line ~312 — the proven merge-leaf/`akrogon next`/`FAKE_SYSTEMD_RUN_LOG` land-launch fixture pattern
- `tests/run-units.test.ts` — `a verify places its scope under the resolved leaf slice by default` (verify launch through the real CLI with the fake log)
- `docs/reference/checks.md` — the "The command runs with a clean environment" paragraph (check-environment paragraph)
- `docs/reference/config.md` — the `pass_env` row and the environment-variables paragraph after the table
- `learnings/history/2026-11-24-run-check-drops-display.md` — the lesson history to append `Applied` to
- `learnings/LESSONS.md` — the `run-check drops DISPLAY` line to remove

## Decisions

- D1. One exported list (binding decision 6): `export const displayEnv: readonly string[] = ['DISPLAY', 'XAUTHORITY', 'WAYLAND_DISPLAY', 'XDG_RUNTIME_DIR']` in `src/run-check.ts`, spread into `copied`. `constructedEnv` already copies a `copied` name exactly when `process.env[key] !== undefined`, so an empty value is copied and an undefined one is not — no constructedEnv change (binding decisions 1, 2).
- D2. `src/verify.ts`: `passForwarded` takes `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` from the shared list (spread of `displayEnv` minus `XDG_RUNTIME_DIR`, which `passForwarded` already lists separately — design: "the display names from the shared list", with `XDG_RUNTIME_DIR` in both services staying as today per binding decision 7). `launchPass` adds `-p`, `UnsetEnvironment=<name>` argument pairs for each of the three non-runtime display names undefined in its `env` (which is `sessionBusEnv()` = `process.env` plus normalized bus/runtime), after the `--setenv` spread. The generic loop already emits `--setenv` only for defined names, so a name gets one form or the other, empty values carried as `--setenv=NAME=` (binding decision 2), including when a repo lists the name in `pass_env` (the names set is deduped, so `pass_env` adds nothing).
- D3. `src/land.ts`: `launchLand` adds the three non-runtime display names to the existing `flatMap` only-if-defined list (currently `['AKROGON_HOME', 'AKROGON_LEAF_TEMP_ROOT', 'AKROGON_RETIRED_TEMP_ROOT']`), in the same `--setenv=<name>=<value>` form. Never `UnsetEnvironment` (excluded by the design); the one existing `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}` stays exactly once.
- D4. `tests/isolation.ts`: unset `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` beside the `XDG_RUNTIME_DIR` pin — both `delete process.env[name]` and libc `unsetenv` (the preload already notes process.env writes alone do not reach libc getenv) — so every suite caller lacks the three whoever launched the suite. A test needing one passes it explicitly in the CLI env it hands `cli()`/`spawnReal`.
- D5. The env allow-list test in `tests/run-check.test.ts` changes expectations (the design's "Open for the plan" answer): the suite caller always holds the pinned `XDG_RUNTIME_DIR` and never the other three (D4), so the payload gains exactly `XDG_RUNTIME_DIR`; the `allowed` set gains the four display names by spreading the exported `displayEnv` list imported from `src/run-check.ts` (standing-design: no hand-copied copy). This edit is impossible at planning (the export does not exist yet) and is implementation-owned expectation maintenance: the design names it, it is one expectation corrected under a cited brief outcome (criterion 1), in implementation's own commit with the `Test-Change:` trailer naming the path and the criterion. Recorded here so the correction is pre-authorized and review-visible.
- D6. Proof harness: criterion 1/2 proofs run the real CLI (`tests/helpers.ts` `cli` → `process.execPath src/akrogon.ts`, the leaf worktree's own code) in temp fixture repos; criterion 3 proofs read the argv lines the real `verify`/`next` CLIs hand the fake `systemd-run` through `FAKE_SYSTEMD_RUN_LOG`, splitting the logged `$*` line on spaces into words. No new machinery — all exist at base.
- D7. Docs: extend `docs/reference/checks.md`'s "The command runs with a clean environment" paragraph to name `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR` as copied from the caller only (never synthesized), and state that a verify payload always carries `XDG_RUNTIME_DIR` (the pass service sets it from `runtimeDir()`). Extend `docs/reference/config.md`'s `pass_env` row or the paragraph after the table to state the four display variables reach check commands without being listed and that listing them in `pass_env` stays valid. One fresh line in `tests/AREA.md`'s isolation entry (the preload's display-state pinning); `src/AREA.md` needs no line — its `launchLand` mention already covers `XDG_RUNTIME_DIR` and states no exhaustion of env names.
- D8. Lesson retirement (criterion 5): remove the line starting `- run-check drops DISPLAY` from `learnings/LESSONS.md` and append `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` to `learnings/history/2026-11-24-run-check-drops-display.md` in the leaf's diff — the implementer resolves the final citation to the commit or file:line that copies the four names. The mechanism is stopped on every reachable path because `constructedEnv` is the only env construction for check commands and every door (run-check directly, verify through the pass unit, land through the verify pass) reaches the caller's values (Retire clause satisfied by removal of the cause, not a guard).
- D9. Nothing is added to `src/config.ts`'s `constructed` reserved set (binding decision 3); `XDG_SESSION_TYPE` and `WAYLAND_SOCKET` are never added to any copy list (binding decision 5). The bus cut line `env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent'` stays assigned after the copy loops unchanged (binding decision 4).

No conflict found between brief and design. No `Open for the plan:` question besides the allow-list one (answered in D5). No credentials: design names no credential variables, `akrogon status caller-display` shows `env_names: []` and no `Missing:` lines. No paid launch, no live run, no outside call during implementation — all proofs are free local commands.

## Needed interfaces

- `export const displayEnv: readonly string[]` in `src/run-check.ts` — consumed by `copied` (same file), by `passForwarded` in `src/verify.ts`, by the `launchLand` flatMap list in `src/land.ts` (both derive the three non-runtime names from it), and by the allow-list test import (D5). No other interface changes.

## Units and waves

The test commit (already on the leaf branch, see below) is excluded — it is planning output. Implementation units:

- Wave 1, two units:
  - U1 product code: owns `src/run-check.ts` (the `displayEnv` export and `copied` spread), `src/verify.ts` (`passForwarded` + `UnsetEnvironment` emission), `src/land.ts` (`launchLand` flatMap). One unit because D2/D3 import D1's export and the edit surface is small and single-mechanism. Targeted proof while working: `bun test --timeout=120000 tests/display-env.test.ts` (compile and early signal only; criterion proof commands are A's, below).
  - U2 docs and lesson: owns `docs/reference/checks.md`, `docs/reference/config.md`, `learnings/LESSONS.md`, `learnings/history/2026-11-24-run-check-drops-display.md`, `tests/AREA.md` (isolation line). Disjoint from U1's paths. Note: U2's lesson retirement cites the stopping mechanism at file:line of U1's worktree edit — the wave workers share the leaf branch tip as their base, so U2 writes the citation as `src/run-check.ts` `displayEnv`/`copied` by name, and A's final commit resolves the exact line or commit reference if the trailer form needs it.
  - The two units are independent: disjoint owned paths, no shared test resource (fixture repos are per-process temp dirs; FAKE_SYSTEMD_RUN_LOG files are per-test), no output dependency (docs do not import code).
- The D5 allow-list correction in `tests/run-check.test.ts` is not a unit: workers write and edit no test. A makes it itself in its own commit with the `Test-Change:` trailer (one wrong expectation in a planned test, cited to criterion 1), after U1 lands the export.

Affected docs checklist: `docs/reference/checks.md` (check-environment paragraph), `docs/reference/config.md` (`pass_env` row/paragraph), `tests/AREA.md` (isolation preload line) — one line each in U2. `docs/reference/commands.md`, `docs/reference/files.md`, `src/AREA.md`, `README.md`, `skills/*`: inspected, no line affected (nothing in them enumerates the copied env names or claims their absence).

## Done-criteria proofs, conditions and red evidence

Runner semantics follow the repo: `bun test --timeout=120000` on the leaf's own test file. All free, seconds-to-minutes; no paid launch (no `AKROGON_SESSIONS` budget applies — nothing paid). Rerun trigger for every test proof: any change to the leaf diff's product code or the test file itself since the last green run on the current head (all proofs are mechanical; no model-facing inputs, no recordings, no outside consumers).

### Criterion 1 — display variables reach the run-check command as the caller holds them

Test: `run-check copies each display variable the caller holds, empty included, and none the caller lacks` in the new `tests/display-env.test.ts` (real CLI in a fixture repo with empty `env`/`pass_env`; the fixture default config declares only `checks`/`grounding`). Proof command: `akrogon run-check --name crit1-display -- bun test --timeout=120000 tests/display-env.test.ts -t "run-check copies each display"`. Size: seconds. The real boundary: the payload process env observed inside the run unit; product failure it catches: the dropped display variables of Tamdoma/akrogon#155. State before: display names absent; after: caller values present exactly, empty included, absent names absent, bus still cut, `XDG_SESSION_TYPE`/`WAYLAND_SOCKET` absent.

Red on base (missing behavior): `check crit-display-red2: 1 implementation/check-crit-display-red2-1795592810396-1697074.log` — the test fails at `disp` (Expected `:66`, received `<unset>`), the exact dropped-variable failure.

Conditions traced (each against the decision that can reach it):

- C1a empty stays empty (D1/copy loop): the copy is `value !== undefined`, empty string included, and `runUnitArgv` passes `XDG_RUNTIME_DIR=<value>` verbatim; nothing rewrites a blank. Case present in T1 (`xauth=`). Red on base: same run as above (the copy does not exist).
- C1b caller-lacking names absent (D1): case present in T1 (`xdg` held undefined) and T2 (`xauth`/`wly` unset). Red on base: same run.
- C1c bus cut survives (D9, binding decision 4): adding display names to `copied` cannot break it — the bus assignment runs after the copy loops and overwrites unconditionally; no decision proposes touching it. The violation red was still demonstrated by temporary edit (bus assignment removed, reverted after the run): `check crit-viol-bus: 1 implementation/check-crit-viol-bus-1795592820524-1698134.log` — the test fails at the `bus` assertion itself, before any display assertion. The pre-existing test `run-check cuts the session bus even when the caller has one` in `tests/run-check.test.ts` is a second pin.
- C1d `XDG_SESSION_TYPE` never passed (D9, binding decision 5): no decision adds it to any list — the traced reason the decision cannot break it is that the copy surface is exactly the shared display list plus pre-existing entries, and the decision names the exclusion. Violation red demonstrated by temporary edit (`XDG_SESSION_TYPE` added to `copied`, reverted): `check crit-viol-sess: 1 implementation/check-crit-viol-sess-1795592824878-1699426.log` — fails at the `sess` assertion with `wayland` received.
- C1e `WAYLAND_SOCKET` never passed (D9, binding decision 5): same trace. Violation red demonstrated by temporary edit (added to `copied`, reverted): `check crit-viol-wsock: 1 implementation/check-crit-viol-wsock-1795592830197-1701970.log` — fails at the `wsock` assertion with `41` received.
- C1f suite caller display-state determinism (D4): without the preload unset, a suite launched from a desktop seat leaks `DISPLAY`/`WAYLAND_DISPLAY` into CLI children through `cli()`'s `process.env` spread (the installed run-check never copies them, so the test runner itself stays clean) and negative assertions become host-dependent. Violation red demonstrated by temporary edit (preload unset removed, reverted) plus `env WAYLAND_DISPLAY=wayland-1` inside the run-check command: `check crit-viol-preload: 1 implementation/check-crit-viol-preload-1795592866871-1703908.log` — the pass_env negative case fails at `wly` with `wayland-1` received.

### Criterion 2 — pass_env listing the display names still loads and forwards identically

Test: `a repo listing the display names in pass_env still loads and its run-check copies the same caller values` in `tests/display-env.test.ts`. Proof command: `akrogon run-check --name crit2-passenv -- bun test --timeout=120000 tests/display-env.test.ts -t "pass_env"`. Size: seconds. Product failure it catches: the reserved-list collision the design warns against (a config that framework already uses failing to load).

Red on base: none for the criterion — pass_env already forwards, so this test is green on the unmodified base (`check crit-display-red2` shows `(pass)`); its role is the regression pin for the leaf's re-routing. The binding-condition violation is demonstrable and was shown: temporary edit adding `DISPLAY` to `src/config.ts`'s `constructed` reserved set (reverted) turns the test red at the config load with ZodError `Reserved pass_env entry: DISPLAY` — `check crit-viol-reserved: 1 implementation/check-crit-viol-reserved-1795592834279-1702523.log`. The criterion's positive copy values are proven by the same assertions as criterion 1, which is red on base.

### Criterion 3 — verify pass and land unit argv

Tests in `tests/display-env.test.ts`:

- `the verify pass unit is launched with every held display value, empty included, and no UnsetEnvironment` (real CLI `verify` in a leaf worktree, fake systemd-run log; run twice — without and with the names in `pass_env` — in one test; distinct check names per round so no receipt reuse). Proof command: `akrogon run-check --name crit3-verify-held -- bun test --timeout=120000 tests/display-env.test.ts -t "verify pass unit is launched with every held"`. Red on base: `check crit-display-red2` — fails at `--setenv=DISPLAY=:66` (not forwarded today), and the pass_env variant is green-then-red-in-one since base already forwards pass_env names: the violation for the never-both-including-pass_env condition is impossible to construct without the feature and is covered by the same red (the unconditionally-emitted UnsetEnvironment variant was demonstrated instead, see C3c).
- `the verify pass unit launched by a caller lacking the display names unsets each and sets none`. Proof command: `akrogon run-check --name crit3-verify-unset -- bun test --timeout=120000 tests/display-env.test.ts -t "lacking the display names unsets"`. Red on base (the standing-design's named case): `check crit-display-red2` — `one UnsetEnvironment=DISPLAY` received length 0.
- `the land unit is launched with every held display value, empty included, one XDG_RUNTIME_DIR and no UnsetEnvironment` (merge leaf, `akrogon next <slug>` claims the batch and launches the land unit through the fake, the proven session-routing fixture pattern). Proof command: `akrogon run-check --name crit3-land-held -- bun test --timeout=120000 tests/display-env.test.ts -t "land unit is launched with every held"`. Red on base: `check crit-display-red2` — fails at `--setenv=DISPLAY=:66` absent.
- `the land unit launched by a caller lacking the display names carries neither form for them and one XDG_RUNTIME_DIR`. Proof command: `akrogon run-check --name crit3-land-lacking -- bun test --timeout=120000 tests/display-env.test.ts -t "land unit launched by a caller lacking"`. Green on base (the base never emits either form — regression pin), shown green in `check crit-display-red2`.

Size: seconds each. Boundary: the argv handed to `systemd-run`, which is the exact point where a real user service would hide the caller/manager divergence (design binding decision 8).

Conditions traced:

- C3a empty value emitted as `--setenv=NAME=` on both units (D2/D3, binding decision 2): the emit is `env[name] !== undefined` → `--setenv=${name}=${env[name]}`, empty string interpolating to nothing after `=`. Case present in both held tests (`XAUTHORITY=`). Red on base: the missing-behavior red above.
- C3b undefined name gets exactly one `-p UnsetEnvironment=<name>` pair on the verify pass and no `--setenv` (D2): case present in the lacking-verify test, including the `-p` adjacency assertion. Red on base: the missing-behavior red above.
- C3c never both forms for one name on the verify pass, including with `pass_env` listing the name (D2, binding decision 2): traced — the `--setenv` emission is the pre-existing only-if-defined loop and the unset emission is the if-undefined branch of the same names; one name cannot be both defined and undefined. The wrong-shape violation (unconditional UnsetEnvironment emission) was demonstrated on the land side where it is constructible on base, see C3d. On the verify side the positive form is red on base and the never-both assertion rides the same tests.
- C3d land never emits UnsetEnvironment (D3, the design's land exclusion): the base already satisfies it, so the violation was demonstrated by temporary edit (`-p UnsetEnvironment=DISPLAY` added unconditionally to `launchLand`, reverted): `check crit-viol-landunset2: 1 implementation/check-crit-viol-landunset2-1795592847172-1703148.log` — the land-lacking test fails at the `UnsetEnvironment=DISPLAY` negative assertion. (The same edit against the land-held test, `check crit-viol-landunset`, fails at the missing `--setenv=DISPLAY` first — recorded as the non-discriminating control.)
- C3e exactly one `XDG_RUNTIME_DIR` on the land unit (D3): traced — the launch emits the one pre-existing `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}` and no decision adds another. Violation demonstrated by temporary edit (line duplicated, reverted): `check crit-viol-landxdg: 1 implementation/check-crit-viol-landxdg-1795592853359-1703431.log` — fails at the length-1 assertion with 2 received.
- C3f run-check `XDG_RUNTIME_DIR` end-to-end (D1/binding decision 7): the payload carries it only when the caller does — caller-held case in T2 (pass_env, explicit `/run/user/4242` → payload `/run/user/4242`), caller-lacking case in T1 (`xdg=<unset>` through `runUnitArgv`'s `-u`). Blank-caller case: traced — `runtimeDir()` normalizes the *wrapper and service* envs (pre-existing, unchanged) while the payload receives `XDG_RUNTIME_DIR=` verbatim from the `env` argv prefix; covered on base by the existing `run-units.test.ts` blank/missing test which still passes since the declared-`env` path it exercises is behaviorally unchanged.

### Criterion 4 — docs

No test; the proof is the reviewer reading the two edited paragraphs against the criterion's four required statements. Mechanical observation before review: `akrogon run-check --name crit4-docs -- sh -c 'grep -c "DISPLAY" docs/reference/checks.md docs/reference/config.md'` plus the full-file `akrogon run-check --name crit4-docs-links -- bun test --timeout=120000 tests/docs-links.test.ts` (existing suite member covering anchors and links). Size: seconds. Product failure it catches: seats and operators reproducing #155 by re-adding per-repo pass_env entries because the docs never said the names are already forwarded, or wrongly unsetting them.

### Criterion 5 — lesson retirement

No test; the proof is the leaf diff itself: `git diff $AKROGON_BASE...HEAD -- learnings/LESSONS.md` shows the one line removed and `git diff $AKROGON_BASE...HEAD -- learnings/history/2026-11-24-run-check-drops-display.md` shows the appended `Applied` line. Size: seconds. The land gates' re-removal machinery (`retiredLessonsPresent`/`removeRetiredLessons`, proven in `tests/lessons.test.ts`) is the consumer that would re-delete a union-resurrected line, so the retirement must be complete in this diff — half-retired lessons are exactly what that machinery flags.

### Test-Change trailer

The test commit adds the new file `tests/display-env.test.ts` and edits the existing `tests/isolation.ts`; per the trailer rule it carries `Test-Change: tests/isolation.ts <reason>`. The D5 implementation-time edit of `tests/run-check.test.ts` carries its own trailer at that commit.

## Real open limitation

The leaf proves the variables reach the command at every door; it does not prove a window opens through the fixed CLI on this host (the held disagreement in the design, C's standing dissent, kept by A under full autopilot, unanswered by the operator). The charting probes P0–P3 prove the pre-existing display mechanics of the host, and criterion 1–3 proofs prove the forwarding; nothing in the leaf exercises a real headed browser.

## Implementation notes

- 2026-11-25. Extend the criterion 1 CLI proof with held nonempty and held empty `XDG_RUNTIME_DIR` values in the fixture with empty `env` and `pass_env`, as required by brief criterion 1 and design binding decisions 1 and 2.

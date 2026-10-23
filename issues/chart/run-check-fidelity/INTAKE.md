# Intake: run-check-fidelity

## Scope

A checked command run by `akrogon run-check` gets its arguments unchanged, a UTF-8 locale, and the documented gh credential route. Grouped: #110, #111, #112 (one command, constructedEnv and runUnitArgv).

## Provenance

- GitHub: Tamdoma/akrogon#110
- GitHub: Tamdoma/akrogon#111
- GitHub: Tamdoma/akrogon#112
- Operator: door session f254b4d3 pane w8:pNP, 2026-10-22

## Source: Tamdoma/akrogon#110

# `akrogon run-check -- gh api` on a private repo hung in the mise gh shim, and the real gh under the run-check env gets 404

Source: Tamdoma/akrogon#110
URL: https://github.com/Tamdoma/akrogon/issues/110

Origin repo: CastrumS/gljive
Lesson history: /home/rudi/Work/akrogon/learnings/history/2026-10-21-run-check-gh-keyring.md

Unverified intake.

## Observation

- On 2026-10-21, the Gljive leaf `map-cut-action` was at plan.synthesis in worktree `issues/worktrees/map-cut-action` (consumer CastrumS/gljive). From there, `akrogon run-check --name gh-auth-probe -- gh api repos/CastrumS/gljive --jq .visibility` did not finish within the seat's 120 s tool limit. It was still running as `mise x gh -- gh api repos/CastrumS/gljive --jq .visibility` (38% CPU) when the seat killed it. No run-check log was kept.
- On the same machine, outside akrogon, with `env -i HOME=$HOME PATH=$PATH TMPDIR=<dir> DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`:
  - `timeout 25 ~/.local/bin/gh --version` exited 124. The shim runs `mise use -g --quiet "gh"` and then `exec mise x "gh" -- "gh" "$@"`.
  - The real binary, `~/.local/share/mise/installs/gh/2.102.1/gh_2.102.1_linux_amd64/bin/gh api repos/CastrumS/gljive --jq .visibility`, printed `{"message":"Not Found",...,"status":"404"}gh: Not Found (HTTP 404)` and exited 1.
- In the seat's normal shell, `gh api repos/CastrumS/gljive` returns the repo, and `gh auth status` shows "Logged in to github.com account CastrumS (keyring)".

## Location

- akrogon `run-check`, installed release 92dddada7b2d0a1b37fcb3b1bce9993d535bb62b: `src/run-check.ts` `constructedEnv` (lines 56-67) and `src/scope.ts` `runUnitArgv` (lines 43-60).
- Consumer leaf proof commands that need authenticated GitHub reads, such as a run's status or its logs.

## Reproduction

1. Log in to gh with keyring storage.
2. From a registered leaf worktree, run `akrogon run-check --name probe -- gh api repos/<owner>/<private-repo> --jq .visibility`.
3. With a mise shim as `gh`, the command hung and was killed after more than 120 s, seen once.
4. With the real gh binary under the same minimal env (env -i reproduction, not through run-check itself), it got HTTP 404.

## Expected behavior

Not provided.

## Urgency

- Leaves whose done-criteria name a GitHub Actions run on a private repo cannot keep the run's status or logs as run-check evidence. In Gljive these are map-cut-action, rain-grid-action and web-pages.
- A shimmed gh blocks the seat, with no deadline, until someone kills it.
- Workaround: run authenticated gh reads outside run-check as coordination commands and quote their results. Keep run-check for public HTTP reads, tests and scans that load values with `bun --env-file`.

## Suspected cause

Hypothesis, supported by the files read:
- `constructedEnv` (`src/run-check.ts:56-67`) copies only HOME, PATH, XDG_CACHE_HOME and a few other names, and sets TMPDIR to the run root.
- It also sets `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`. `runUnitArgv` (`src/scope.ts:43-60`) passes that value into the unit as `env DBUS_SESSION_BUS_ADDRESS=<cutBus> <argv>`.
- gh keeps its keyring token in the Secret Service, which it reaches over the D-Bus session bus. Inside the unit, gh therefore runs unauthenticated, and GitHub answers 404 for a private repo.

Contributing condition: this machine's `~/.local/bin/gh` is a mise shim that runs `mise use -g` first. Under the same minimal env it did not return within 25 s, and run-check sets no deadline of its own. Why mise stalls there was not established.

Whose view: agent.

Files read:
- `~/.akrogon/releases/92dddada7b2d0a1b37fcb3b1bce9993d535bb62b/src/run-check.ts`
- `~/.akrogon/releases/92dddada7b2d0a1b37fcb3b1bce9993d535bb62b/src/scope.ts`, lines 43-60
- `~/.local/bin/gh`

The akrogon files are the installed release copy, found with `readlink -f "$(command -v akrogon)"`. They are not the Tamdoma/akrogon source checkout. A comment at `src/reconcile.ts:118` reads "The manager's bus address is pinned because callers inside a run-check cut", which suggests the bus cut is deliberate. Only that line was seen.

Not inspected:
- why `mise use -g` or `mise x` stalls under the minimal env;
- whether gh authenticates inside run-check when `GH_TOKEN` is passed through `pass_env`.

What would disprove this: gh authenticating inside run-check with keyring storage.

Related reports: none cover this failure.
- Tamdoma/akrogon#52 (closed) is about leaves stopping on missing credentials, token scopes and external inputs, a different mechanism.
- Tamdoma/akrogon#76 (closed) is about a red main and is unrelated.

Searched Tamdoma/akrogon, state all, with `--author @me --search "created:>=2026-10-20" --limit 30` (none) and `--search "run-check gh" --limit 10` (the two above).

## Source: Tamdoma/akrogon#111

# Under akrogon run-check, Maestro stops before any step on a non-ASCII flow name (InvalidPathException)

Source: Tamdoma/akrogon#111
URL: https://github.com/Tamdoma/akrogon/issues/111

Origin repo: CastrumS/gljive
Lesson history: learnings/history/2026-10-22-run-check-locale.md

Unverified intake.

## Observation

On 2026-10-22, in the Gljive leaf klobuk-rename, `akrogon run-check --name c1-smoke -- env EXPO_NO_DOTENV=1 bun --no-env-file run e2e smoke` built and installed the debug app. Maestro 2.11.0, running on JDK 17, then stopped before the flow's first step with `java.nio.file.InvalidPathException: Malformed input or input contains unmappable characters: ?etiri kartice`, at `maestro.cli.report.TestDebugReporter.resolveFlowDir(TestDebugReporter.kt:91)`. The flow is named `Četiri kartice`.

- The run-check processes had no `LANG`, `LC_ALL` or `LC_CTYPE` in `/proc/<pid>/environ`. The calling shell had `LANG=en_US.UTF-8`.
- `akrogon run-check --name locale-probe-default -- bash -c "<jdk-17>/bin/java -XshowSettings:properties -version 2>&1 | grep -E 'sun.jnu.encoding|file.encoding ='"` printed `file.encoding = ANSI_X3.4-1968` and `sun.jnu.encoding = ANSI_X3.4-1968`. With `env LANG=C.UTF-8` before `bash`, both printed `UTF-8`.
- Flows with ASCII names (`Kopija nalaza`, `v1-import`) ran their steps under the same run-check environment.

## Location

`akrogon run-check`: `src/run-check.ts` `constructedEnv` (lines 34-43 and 56-67, installed release 92dddada7b2d0a1b37fcb3b1bce9993d535bb62b). The consumer command was the Gljive E2E runner, `bun run e2e <flow>`.

## Reproduction

1. `akrogon run-check --name probe -- bash -c 'java -XshowSettings:properties -version 2>&1 | grep sun.jnu.encoding'` prints `ANSI_X3.4-1968`.
2. Run any Maestro flow whose `name:` has a non-ASCII letter through `akrogon run-check`. It stops in `createFlowDir` before the first step.

Frequency: every run.

## Expected behavior

A checked command can create files with non-ASCII names, as it can in the caller's shell.

## Urgency

A non-ASCII test name makes a check red before any step runs, and the red reads like a product failure. In Gljive, 3 of the 36 flows have such names (`Četiri kartice`, `Kiša na karti`, `Početak pješice`). Workaround: put the locale in the checked command (`akrogon run-check --name c1-smoke -- env LANG=C.UTF-8 EXPO_NO_DOTENV=1 bun --no-env-file run e2e smoke`), or list `LANG` in the repo's `pass_env`.

## Suspected cause

Suspected: `constructedEnv` builds the command environment from HOME, PATH, XDG_CACHE_HOME, NODE_DISABLE_COMPILE_CACHE, FAKE_SYSTEMD_RUN_LOG and AKROGON_HOME, plus TMPDIR and the repo's `env` and `pass_env` names. It sets no locale variable. Without `LANG`, JDK 17 takes the POSIX locale, so `sun.jnu.encoding` (file paths) and `file.encoding` are `ANSI_X3.4-1968`, and Maestro cannot create its per-flow report directory from a non-ASCII flow name. The consumer config here has `pass_env: []`. `docs/guide/setup.md:63` describes `pass_env` as the way to pass session variables such as `DISPLAY`.

Whose view: agent.

Files read: `src/run-check.ts` (lines 1-80 and 196-215) in the akrogon workspace, and the installed release 92dddada (lines 1-70, identical); `src/config.ts` (the `env` and `pass_env` schema, lines 50-90); `docs/guide/setup.md:63`; Gljive `scripts/android-env.ts` (`run` merges `childEnv()`, which inherits the process environment).

Not inspected: Maestro source for other uses of the default charset. Would disprove: the same `InvalidPathException` with a UTF-8 `LANG` in the command environment.

Related reports: Tamdoma/akrogon#110 (open) concerns the same `constructedEnv` but a different variable (`DBUS_SESSION_BUS_ADDRESS` and keyring `gh`), so it is not this failure. Searched Tamdoma/akrogon, all states: `--author @me --search "created:>=2026-10-20"` (limit 30) and `--search "run-check locale LANG"` (limit 10, none).

## Source: Tamdoma/akrogon#112

# Under akrogon run-check, `${…}` in command arguments becomes an empty string, so `bun -e` template literals are lost

Source: Tamdoma/akrogon#112
URL: https://github.com/Tamdoma/akrogon/issues/112

Origin repo: CastrumS/gljive
Lesson history: /home/rudi/Work/akrogon/learnings/history/2026-10-22-run-check-systemd-expansion.md

Unverified intake.

## Observation

- On 2026-10-22, in the Gljive leaf worktree `/home/rudi/Work/Privatni/Gljive/issues/worktrees/map-cut-action`, `akrogon run-check --name c1-live -- bun --env-file=<holder .env> -e '<script>'` exited 1 before any request.
- Every JS template literal in the inline script (`${base}/maps/manifest.json`, `${file.key}`, `${encodeURI(key)}`, `${manifest.assets.sprite}`) had become an empty string, so ``fetch(`/maps/manifest.json`)`` threw `TypeError: fetch() URL is invalid`.
- stderr carried `Referenced but unset environment variable evaluates to an empty string: base` and `Invalid environment variable name evaluates to an empty string: encodeURI(key), file.key, manifest.assets.sprite`.
- The same script with string concatenation in place of the template literals ran green under run-check.

## Location

`akrogon run-check` (non-nested runs), release `92dddada`: `src/scope.ts` `runUnitArgv` (lines 43-60) and its caller `src/run-check.ts:236`. Host systemd 262.

## Reproduction

Outside akrogon, on systemd 262:

```sh
systemd-run --user --scope --quiet -- printf '[%s]\n' 'a ${base} b' '${file.key}' '$HOME' 'x $HOME y' '$${base}'
```

This printed `[a  b]`, `[]`, `[/home/rudi]`, `[x $HOME y]` and `[${base}]`, with the two messages above. With `--expand-environment=no` added, the arguments stayed literal (`[a ${base} b]`, `[$HOME]`). Every run-check command whose arguments contain `${` hits it.

## Expected behavior

The arguments after `--` reach the command unchanged.

## Urgency

Any run-check command with `${` in its arguments is rewritten before it starts. That covers inline `bun -e` or `node -e` scripts with template literals and `sh -c` with `${VAR}`. Only a systemd warning on stderr shows it, and the failure reads like a bug in the script. Here it turned a live proof red. Workaround: keep `${` out of run-check arguments (string concatenation), or escape it as `$${`.

## Suspected cause

- Supported hypothesis: `runUnitArgv` (`src/scope.ts:43-60`) runs the command as `systemd-run --user --scope --quiet --unit=… --slice=… -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed -- env DBUS_SESSION_BUS_ADDRESS=… <argv>` and passes no `--expand-environment=no`. systemd-run 262 in scope mode then expands `${NAME}` anywhere in an argument, and `$NAME` when it is the whole argument, from its own environment. It replaces an unset or invalid name with an empty string, and `$$` with `$`. Contributing condition: run-check forwards the caller's argv as given, and seats pass whole scripts as one argument.
- Whose view: both. The reporter supplied the failing run and the reproduction, and the agent read the code.
- Files read: `/home/rudi/Work/akrogon` at `92dddada`, `src/scope.ts:43-60` and `src/run-check.ts:225-245`. The installed release `~/.akrogon/releases/92dddada7b2d0a1b37fcb3b1bce9993d535bb62b` is the same commit. `docs/guide/setup.md:66` says each run lives in its own `akrogon-run-<id>.scope`.
- Not inspected: nested runs (`admission.kind === 'nested'`), which `src/run-check.ts:231` spawns directly without systemd-run and which were not tested, and systemd versions before 262.
- Related reports: Tamdoma/akrogon#110 and Tamdoma/akrogon#111 (both open) report run-check's constructed environment (D-Bus address, missing locale), a different mechanism in the same command. Searched Tamdoma/akrogon, state all: `--author @me --search "created:>=2026-10-20"` (limit 40) returned #110 and #111, and `--search "systemd-run expand"` (limit 10) found none.

## Source: operator 2026-10-22 door start

I pulled another series of issues. Consolidate them and categorize them. Use slot b and slot c (active panes in your herdr tab) to consult. Come up with solutions and chart them out. Best, simplest, most elegant solutions. Always see if you can reduce code first rather than just cramming new complex code on. Keep the code lean. Full autopilot mode, I give you all the permissions. watch-akrogon is the watcher agent tab in this herdr workspace.

## Agent findings

Opening maps (A,B,C): slots/map-A.md, slots/map-B.md, slots/map-C.md. Proofs: see forks.

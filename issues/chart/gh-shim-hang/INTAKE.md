# Intake: gh-shim-hang

## Scope

The part of #110 that check-env-fidelity left open: `akrogon run-check -- gh ...` hung for more than 120 s in a mise `gh` shim, and run-check sets no deadline of its own.

## Provenance

- GitHub: Tamdoma/akrogon#110 (seed issues/seeds/110-akrogon-run-check-gh-api-on-a-private.md)
- Operator: door session 691ac448 pane w8:pNP, 2026-10-23
- Earlier partial match: issues/chart/run-check-fidelity (credential half delivered as docs by bd996a7a, docs/guide/setup.md `pass_env`)

## Operator words (verbatim)

I still have one issue pulled. What is it all about? Discuss it with slot B consultant and then fix it on autopilot. First chart it, then nude the watcher to start the process.

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

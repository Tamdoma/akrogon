# Map B: #164 agy tool-entry on PATH

## Findings

- F1 Cause confirmed by run. `PATH="$HOME/.akrogon/tool-entry:$PATH" bun test tests/tool-entry.test.ts -t "exactly once"` is red at the `r` assertion with the intake's exact message. Without the prefix it is green (51 expects).
- F2 Mechanism. `startSeat` (src/seat.ts, `agyPath`) puts the entry dir first on PATH. `scopeScript()` exports `AKROGON_SEAT_CGROUP="$root"` and runs `r` as bare `bash`. The host wrapper (`placementShell`) sees a matching seat cgroup and places `r`. The wrapper is inert everywhere else: it needs `AKROGON_SEAT_CGROUP` set and equal to the shell's own cgroup.
- F3 One function builds the env of every checked command: `constructedEnv` (src/run-check.ts). run-check calls it directly. verify reaches it through `launchPass` -> `verify-pass` -> `checkedRun`. land reaches it through `verify()` (src/land.ts). Setup reaches it in src/next.ts. Its `copied` allowlist drops `AKROGON_SEAT_CGROUP`, `AKROGON_SEAT_PID` and `BASH_ENV`. PATH is the only seat wiring that crosses it.
- F4 land has the same hole. `launchLand` (src/land.ts) forwards `process.env.PATH` verbatim and is called from `akrogon next` (src/next.ts). A land started by an agy seat's `next` would hit the same red test. The intake's green land runs came from non-agy callers.
- F5 Second leak in the same run: `realBash` (src/tool-cgroup.ts) only skips the entry dir of the home it is given. With the host dir on PATH and a test home, `refreshToolEntry` bakes `#!/home/ivan/.akrogon/tool-entry/bash` as the "real" bash (checked by run). Every test-rendered wrapper then chains through the host wrapper. It passes today, but it is not what the tests claim to test.
- F6 Same class through `BASH_ENV`, direct runs only. `BASH_ENV="$HOME/.akrogon/tool-entry/bash-env" bun test tests/tool-entry.test.ts -t "exactly once"` is red at the same line (checked by run). A pi or codex seat that runs `bun test` directly hits this. Checked runs do not, because F3 drops `BASH_ENV`.
- F7 No other test is red today (intake: 1548 of 1549). Latent exposure: tests/tool-entry-tracing.test.ts (F5 chain, inert because it sets `AKROGON_SEAT_CGROUP=`), the "outside" spawn at the end of the failing test (bare `bash`, inert only because the cgroup differs), and every test that starts a real seat scope through `cli(f, ['seat', ...])` (tool-entry, tool-kill): a bare `bash` forked at a claude- or agy-kind scope root would be placed by the host wrapper. tests/tool-kill.test.ts mints its own `t-` and never sets `AKROGON_SEAT_CGROUP`, so it is not exposed.

## Options

- O1 (a) Test env. Give `scopeScript()`'s spawn a PATH without the entry dir (and no `BASH_ENV`).
  - Class: not removed. Checks in every repo still get the seat PATH. F4 and F5 stay.
  - Breaks: nothing. Covers direct `bun test` and checks for this one test.
  - Cost: about 3 lines. Proof: F1 command goes green.
- O2 (b) tests/isolation.ts. Strip the entry dir from PATH and unset `BASH_ENV`, next to the existing `DISPLAY` block (same reason: the suite must see the same env whoever launched it).
  - Class: removed for akrogon's own suite on every route, including F6. Not removed for other repos' checks or for F4's akrogon process.
  - Breaks: nothing. Catch: the preload overwrites `HOME`, so the host entry dir must be computed from `AKROGON_HOME ?? HOME/.akrogon` before `setEnv('HOME')`.
  - Cost: about 8 lines. Proof: F1 and F6 commands go green.
- O3 (c) `constructedEnv` drops entry-dir entries from the PATH it copies, using the filter `realBash` already has (extract it, do not duplicate).
  - Class: removed. One function, every checked command in every repo, including run-check, verify, land (F4) and setup. Also fixes F5 under checks. Restores the rule the allowlist already states: a checked run carries no seat identity.
  - Breaks: no legitimate use. The wrapper is inert in a checked run (F2, F3), and checked commands run in run units (`runUnitArgv`), not at a seat scope root. Claude, pi and codex seats: no-op, their PATH has no entry dir. `launchPass` and `launchLand` need no change: their children still pass through `constructedEnv`.
  - Does not cover: direct `bun test` from a seat shell (F6).
  - Cost: about 10 lines plus one test. Proof: a tests/run-check.test.ts case that puts `<home>/tool-entry` first on the CLI PATH, runs a check that prints `$PATH`, and asserts the dir is absent. Red before, green after. End-to-end: `PATH="$HOME/.akrogon/tool-entry:$PATH" akrogon run-check test` goes green.
- O4 (d) Seat wiring.
  - O4a Another channel for agy: closed. issues/closed/seat-shell-kill/tool-cgroup-kill/design.md rejected `BASH_ENV` because it does not reach agy's PATH spawn. PATH is the only proven channel.
  - O4b The wrapper removes its own dir from PATH before it execs real bash. Children do not need the wrapper: they inherit the `t-` cgroup and re-entry is already a no-op (case `d`).
    - Class: removed at the source for everything under an agy tool shell: checks, direct runs, land, other repos.
    - Breaks or invites: it edits the script every claude and agy tool shell runs through, so a bug there breaks live seats. The edit must stay inside the untraced block or cases `x` and `w` go red. A shell whose placement failed stops retrying in its children. It assumes every agy command goes through bare `bash`. It needs a live agy proof like P-entry-agy. F6 stays.
    - Cost: about 6 shell lines, one new assertion on case `c`, one live agy check.

## Risks

- R1 O1 or O2 alone leaves F4: the next agy-seated leaf on another repo, or an agy slot that triggers land, still runs checks with a seat-only PATH.
- R2 O3 alone leaves F6: an agent that runs `bun test` directly from a pi, codex or agy shell still sees the red test. Agents are meant to use `akrogon run-check`, so this is a separate, smaller report.
- R3 O4b has the widest reach and the highest blast radius, and its proof needs a paid live agy run.

## Recommendation

O3. It is the only option that removes the stated class (seat-only wrapper reaching child checks) in one place that already exists for that purpose, with no live-harness proof and no change to seat wiring. Cost: one extracted filter in src/tool-cgroup.ts, one line in `constructedEnv`, one run-check test. Seed F6 as its own issue (O2 is its fix) instead of widening this one.

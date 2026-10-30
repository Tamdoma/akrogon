# Close on the environment fix, or add a missing-tool message

## Question

Q1. Is the destination met by the environment fix already on this host (`~/.local/bin/gh` linking to the stable mise shim), so the chart closes with no code, or must akrogon add a concise missing-tool message for callers whose PATH has no working gh?

### Carries

- Intake: [INTAKE.md](../INTAKE.md), both operator sources and the 2026-10-24 agent findings.
- Shared opening map, written blind by each slot: [A](../../peer-session/slots/map-2026-10-29-A.md) `## pull-gh-path`, [B](../../peer-session/slots/map-2026-10-29-B.md) `## pull-gh-path`. These serve as the fork's independent notes, since both answer this exact question from the same intake.
- Operator values for every pick this run (2026-10-29T07:29Z): "Systems thinking, less code is always better, function over form, simplicity, clarity and elegance."
- No locks and no operator corrections on this chart.

## Findings

- Cause, 2026-10-24 (intake): the door's long-lived Claude Code parent (started 2026-10-21) carried a mise versioned dir `.../gh/latest/gh_2.102.1_linux_amd64/bin` in PATH. `latest` moved to 2.103.0 on 2026-10-23, the versioned dir vanished, and `retryCommand` in `src/shell.ts` threw Bun's ENOENT trace from `src/pull.ts` `pullRepo`. (A,B)
- Environment fix, better-than-training, inspected 2026-10-29: `~/.local/bin/gh -> ~/.local/share/mise/shims/gh`, symlink mtime 2026-10-24T16:03Z. `~/.local/bin` is on PATH in this door and in every running herdr server process. The shim path does not change when mise upgrades gh. (A,B)
- Live proof, 2026-10-29T07:48Z, this door (A session 73561c9a), cwd the registered root, installed akrogon: PATH still lists the deleted `.../gh/latest/gh_2.103.0_linux_amd64/bin` (`ls` says no such file), `command -v gh` gives `/home/ivan/.local/bin/gh`, and `akrogon pull` printed `akrogon: 0 open issues pulled`, exit 0. Read-only against GitHub, seed mirror unchanged. Limit: proves this host's stale-PATH case, not a caller whose PATH has neither `~/.local/bin` nor the shims dir. (A)
- Same proof by B, 2026-10-29: a child with PATH `.../gh_2.102.1_linux_amd64/bin:/usr/bin:/home/ivan/.local/bin` ran `gh --version` 2.103.3, and the exact `gh api ... issues?state=open ... --paginate --slurp` call pull uses succeeded as `ivanjuras`. (B)
- Missing-tool case today: with PATH `/usr/bin` only, the first error line is `error: Executable not found in $PATH: "gh"`, followed by Bun's source excerpt and stack (`code: ENOENT`, `path: gh`). The tool is already named. `src/akrogon.ts` has no top-level error formatter, so every uncaught error in the CLI prints this way. (A,B)
- gh is the only mise-managed tool akrogon spawns directly. git, bun, herdr, systemd-run, flock and the rest resolve under `/usr/bin`. `plugin/pull.sh` adds no PATH policy and `src/land.ts` forwards the caller PATH, which now carries the stable gh address. (A,B)
- Outside primary source, B 2026-10-29: mise [Shims](https://mise.jdx.dev/dev-tools/shims.html) and [Troubleshooting](https://mise.jdx.dev/troubleshooting.html) recommend stable shims for long-lived programs and IDEs, since interactive activation does not update an already running process's environment. That is the fix this host now has. No stronger practitioner case was found. (B)

Options, with slot tags:

- 1a close with no code (A,B). The stable shim removes the cause for every long-lived parent, the proof shows the stale-PATH case works, and the missing-tool error already names gh. Cost: no portability promise for a caller that drops both stable paths.
- 1b wrap ENOENT in `spawnFiles` with a one-line message naming the tool and the PATH (A as rejected option, B O9). Rejected (A,B): adds code for one error kind in a CLI where every other error prints a trace, and it would not have made the 2026-10-24 run work.
- 1c a top-level CLI error formatter (A). Rejected (A): cross-cutting change nobody asked for.
- 1d akrogon calls mise or rebuilds PATH for tool spawns (B O10). Rejected (A,B): host-specific runtime dependency that can change selected tool versions, and the shim already solves it outside akrogon.

Where slots differ: B asks who keeps the `~/.local/bin/gh` link in place (B Q8). A treats it as the operator's environment, recorded under Off route. No other difference.

## Taken

A's pick under autopilot, 2026-10-29: 1a, close with no code.

Reason: the reported failure is gone on every running process, proven by a real `akrogon pull` under this door's own stale PATH. The missing-tool case already names gh in its first line. Each code option adds a part that would not have prevented the incident, against the operator's "less code is always better". Rejected: 1b (code for one error kind, no prevention), 1c (unrequested cross-cutting change), 1d (host-specific dependency). Standing consultant dissent: none. B's rebuttal ([slots/close-or-message-rebuttal-B.md](../slots/close-or-message-rebuttal-B.md)): "I disagree with nothing."

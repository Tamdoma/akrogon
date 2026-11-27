# Merged notes: fork seat-root (how the entry tells the seat's own process from a tool shell)

Sources: map-A.md, map-b.md, map-c.md, map-d.md (blind). Lock: the closed seat-shell-kill design (issues/closed/seat-shell-kill/tool-cgroup-kill/design.md), including Q5 "no process is read to decide" and "Rejected narrow entry: a parent test at spawn is a selection rule again".

## Cause (A,B,C,D)

The codex launcher (mise -> `#!/bin/bash` omarchy-agent-account-exec, exec in the same pid) sources BASH_ENV in the seat's own pid. placementShell moves the seat into `tools/t-<seat pid>`. There are two failure modes (B,C,D):
- early: scopeEntry reads `outside`, ends the seat and throws, and after 3 losses the leaf fails (observed);
- late: if scopeEntry wins the race, the seat lives in `tools/t-`, and the next phase-move sweep kills it or defers a helper on it (B,C,D, from sweepScope/toolKillHelper).
claude uses the same wrapper but gets no BASH_ENV. pi runs `#!/bin/sh`. agy is an ELF with the PATH wrapper. The test stand-in is `#!/bin/sh`, which is why the suite missed it (C,D).

## Options

- **O1 parent outside the scope (A,B).** placementShell skips a shell whose `/proc/$PPID/cgroup` is outside the scope. B: the boundary-aware prefix, and an unreadable parent fails toward moving. No launch change. Cost: it is a parent test at spawn, which the closed design's Q5 rejected by name (D). A,B read it as one exempt process, not a selection among tools.
- **O2 seat pid marker (C; A as alternative).** startSeat runs the harness through `sh -c 'export AKROGON_SEAT_PID=$$; exec "$0" "$@"'` inside the scope (sh ignores BASH_ENV). placementShell skips `$$ = AKROGON_SEAT_PID`. spawnHelper scrubs the name. Unset means place as today, so seats already running keep tool kill (C). C proved it in a real delegated scope: the seat stayed at the root and a forked bash minted a `t-`. It reads no process, and the pid alone is enough while the seat lives (C 3A). Cost: one sh exec hop in the launch argv and one more env name. C would apply it to every kind (2A), with agy's PATH folded into the same trampoline.
- **O3 arm after start (D).** A per-seat arm file in the leaf temp, created by startSeat after firstTask confirms. placementShell returns until the file exists, and unset means armed. It reads no process and covers fork-and-wait wrappers too. Cost: tool shells spawned before the first-task proof are never placed and escape the phase-move kill until leaf close. D records that as a residual.
- **Rejected by all who weighed them:** relaxing scopeEntry (the seat is then killed by the sweep, A,B,C,D); dropping BASH_ENV for codex or a PATH wrapper (loses tool kill or misses absolute-path shells, A,B,C,D); a wrapper path allowlist (C); moving the seat back at scopeEntry (B,D); a seat/ sub-cgroup (C); deferred BASH_ENV file (B).

## Evidence

- A: probe of `env BASH_ENV=<probe> sh -c 'exec codex --version'`, sourced in the same pid by omarchy-agent-account-exec. pi sources nothing.
- B: real throwaway scope. The payload's parent is outside the scope and a nested bash's parent is inside. The startSeat wiring reproduces `tools/t-<pid>`.
- C: real delegated scope. The O2 patch keeps the seat at the root and a forked bash minted a `t-`. `--expand-environment=no` passes `$$`. Real `codex --version` stayed at the root.
- D: codex-cli 0.172.0 probe agrees. The closed design's F5 saw BASH_ENV only in codex tool shells.

## Pitfalls and what removes each

- Already-running seats get the refreshed entry file. The new test must treat an unset marker as "place as today" (C,D). Removed by the predicate's form and a pinned test.
- The proof must use a `#!/bin/bash` stand-in that execs the fake harness, or it proves nothing (C,D). It is a real-scope test in tests/tool-entry.test.ts, red on base.
- bash's last-command exec optimization makes a "child" share the seat pid in tests. Force a real fork (C).
- A short-lived wrapper child (omarchy-agent-account-home) mints one empty `t-`, which the next sweep removes. This is benign noise (A,B,C).
- Fork-and-wait wrappers: O1/O2 strand the agent in the supervisor's `t-`, and scopeEntry refuses loudly (B,C). O3 covers them (D).
- Keep scopeEntry strict. It is the net for the residual (A,B).
- Release: the fix reaches seats only after self-update installs it. origin/main 9a7cf416 is not installed yet (A,C). Recovering the two framework leaves is needs row N2.
- Seats that won the race and now sit in `t-`: none are live (A scan). A census before landing folds into N2 (D).

## Open questions

- Does Q5's "parent test at spawn" lock forbid O1 (D) or not (A,B)?
- Is O3's startup-window escape acceptable (D) or a regression of tool kill (implied by B: "the kill set is unchanged" is a requirement)?
- Should O2 apply to every kind (C 2A) or only to BASH_ENV kinds?
- Should a live codex seat start after deploy (N2 recovery) count as the live confirmation, with no paid probe (C,D)?

## Where slots differ

O1 (A,B) vs O2 (C) vs O3 (D). A's current lean is O2: it reads no process, so it honors Q5 as written, and C proved it in a real scope.

## Addendum: slot F (Fable 5.2 high, added by operator request 2026-11-25, blind, slots/seat-root-F.md)

- F picks the seat pid marker (merged O2) and every kind (C 2A) on its own, which makes it (A,B,C,F) for O2 and (C,F) for every kind.
- New evidence: F's real-scope probes E1 to E5 match C's. E5 shows that a seat with no marker is placed as today. E7: grok also goes through the bash launcher, and pi is one shebang change away.
- New pitfall: the red test can pass on the base by the race. Assert state after the start (seat pid at the scope root, no `tools/t-<seat pid>`), not start success (F R2).
- Fork-and-wait residual: F agrees it is silent at start and loud only when the seat is lost (F R1, matching C and D).
- Rejected extra: codex-native `shell_environment_policy` delivery. It fixes one kind and is unproven for interactive seats (F O4).

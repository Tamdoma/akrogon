# Merged opening map (A, B, C, D)

Sources: map-A.md, map-B.md, map-C.md, map-D.md in this folder. Tags name the slots whose own map holds the point. A checked four disputed facts after reading all maps; those lines say "A check".

## Split
- Three independent charts, no dependency between them (A,B,C,D).
  - `peer-wait-harness` (#91): skills/chart-issues/scripts/peer-wait.ts and tests.
  - `check-evidence` (#92): run-check/verify log form and location, readers, existing backlog.
  - `worktree-cleanup` (#93): reconcile removal rules, worker-protocol text.
- verify.ts is touched by #92 and #93 on different lines; file overlap is not a dependency (A,B,C).

## #91 peer-wait-harness

Facts
- `turnOpen` is false for every kind but claude (peer-wait.ts:130-131), so idle/done + 10 s grace + no file = `failure` (A,B,C,D).
- Same rule covers codex and pi (A,C). #44 was the codex symptom (A).
- Trigger found: agy parks its parent invocation while subagents run, its TUI then shows `● Agent(...)` with no spinner, and herdr's agy manifest (herdr src/detect/manifests/antigravity.toml:19-33) matches only a braille spinner + `-ing` word or `· N task` footer, so herdr says idle for minutes (C,D). Also non-`-ing` spinner labels such as `⣟ Investigation of...` read idle (D).
- Incident had more false failures than reported: 4 in the first exchange, more in later ones (C).
- agy's parent transcript is silent during subagent waits and has no turn-closed row; subagent `state` stays ALIVE after finishing (C). D proposes subagent tracking via `Created the following subagents:` GENERIC steps matched to `SYSTEM_MESSAGE sender=<id>`.
- Live today: slot D (agy) ran ~37 min with herdr `working` on every 5 s sample and no false failure; this map did not use subagents (A, measurement).
- Herdr changes were Off route in chart peer-wait (issues/chart/peer-wait/CHART.md Off route) (C; A check confirms). That is a past scope line, not a lock against a new chart.

Q1. When herdr says idle for a non-Claude peer and no return file exists, what does peer-wait report?
- a) No `failure` from idle for any harness without a proven turn-end signal; keep waiting (report `budget`/continue), `failure` only on an affirmative end signal (Claude transcript today); unknown kinds default to no signal (A,C pick). Cost: a peer that ended its turn without writing is not caught by peer-wait; A waits until the operator sees it. B: this removes the failure signal and changes peer-turn.md:20-24, needs explicit acceptance.
- b) agy transcript reader with subagent tracking, like claudeTurnOpen (D pick). Cost: undocumented, protobuf-backed CLI format; parser breaks on agy updates; one reader per harness (A,B,C reject as default).
- c) Use a proven turn-end signal per harness only where its meaning is established, else unknown is never "ended" (B pick, conditional on proof). Close to a) in effect until a signal is proven.
- d) Fix herdr's agy manifest upstream (`● Agent(` and non-`-ing` spinner) (D option, C "file upstream"). Cost: herdr release dependency, screen scraping, scrollback false-match risk (D).
- e) Longer grace. Rejected: first gap was over 5 min (A,B,C,D).
- Atomic return-file write (temp then rename) in every peer brief (A,B,C).

Q2. Scope: agy only, or every non-Claude harness? Every harness (A,C,B implied); agy (D).

## #92 check-evidence

Facts
- run-check copies every run's full `out.log` into `<leaf>/implementation/check-<name>-<ms>-<pid>.log` (run-check.ts:207-209) (A,B,C,D).
- Framework 944.9 MiB in 4,462 tracked logs. run-check copies are about half the bytes (B 496 MB, C 424 MB, D 455 MB by different patterns).
- A check: since 2026-10-12 framework added 443 MiB of `check-*` logs (1,272 files) and 122 MiB of seat-written logs (471 files: merge-verify.log, repair-B-*-red/green.log, merge-range-diff.log). Seat-written logs are still produced today, about a fifth of new bytes. D's "historical only" does not hold.
- Git already compresses: pack 173.6 MiB for the whole repo. The cost is working-tree size in the main checkout and clones (A,B,C). Akrogon leaf/verify/batch worktrees are sparse without /issues/ (next.ts:279-305) (A,B,C); worker worktrees are not (A,B).
- Readers: flaky reads a red run's log by path, open or closed (flaky.ts:10-17); greenRun never reads logs (D). Seats read printed log paths during the pass (D).
- Whole-checkout target of a couple hundred MB is unreachable through logs: node_modules 972 MB, .git 459 MB (A,B,C).
- test-runs lock base-red-rule.md:27 says "keep logs" for an incomplete base run (C; A check confirms it is about killed runs, not location).
- Single-file zstd -3 on a 1.5 MB verify.log: 1,501,189 -> 177,521 bytes, byte-identical round trip (B).
- Reporter wants evidence kept losslessly (seed #92).

Q1. Where does full check evidence live after a leaf closes?
- a) In the repo, losslessly compressed: per command file (B pick) or one archive per closed owner (A pick). Keeps the reporter's lossless rule. Cost: reader changes (flaky, humans), compressed blobs defeat git delta; needs a measurement of pack growth.
- b) Outside the repo: host store `~/.akrogon/evidence/...` (C pick) or leaf temp reaped at leaf end (D pick), with a short failure excerpt kept in the repo (verify-runs.jsonl or tree). Removes per-run growth entirely. Cost: full logs gone from clones (C) or gone after the leaf (D); contradicts the reporter's lossless request; reopens test-runs "keep logs".
- c) Keep only red logs / dedupe. Lossy (A,B,C,D reject as main fix).

Q2. Do seat-written logs get covered? Yes for every log in the leaf folder at completion (A); make run-check the single writer and stop seats writing logs by hand (C); skills cite verify receipts instead (D).

Q3. Existing backlog: lossless forward migration of tracked logs, no history rewrite (A,B); git rm + ignore (D); no history rewrite (A,B,C,D).

## #93 worktree-cleanup

Facts
- `worktreeRemovable` keeps any HEAD with commits outside `--branches --remotes` (reconcile.ts:53-60) (A,B,C,D).
- The six verify leftovers have records with no `end` and `commands: []` (framework issues/verify-runs.jsonl) (B,C,D): their verify process died before `finally` (verify.ts:173-189).
- Cause of the kills: the leaf's own framework test (`browser-owner.test.ts`, "SIGKILL of the direct browser owner") killed the verify parent; not akrogon (C, from the implementer transcript). Framework-side, out of scope.
- Unreachability comes from the merge moving the leaf branch to rebased commits (batch.ts:161-174), not from reconcile's `branch -d` (A,B; C,D also cite the branch delete).
- Worker commits are unreachable the moment A cherry-picks them (new SHAs) (D,A); patch equivalence fails for workers after repair commits (A,B,C,D).
- Killed `batch-*` builds hit the same guard (D).
- `prose-asserts-u1-cmdlogs` came from a since-fixed bug: reconcile removed a running worker's worktree before a77c260, pi recreated its log folder and the worker renamed it (D).
- Kept reasons show only in `akrogon status <slug>`; plain status never prints them (C,D).
- Stacked members: `move()` on a dirty member worktree only updates the ref, leaving the worktree at its pre-rebase HEAD (batch.ts:164-166, phase.ts:629-632) (D; A check confirms the code path). D also claims stacked members' tabs are never closed after a batch push (unverified by A).
- `git worktree remove --force` on the real u2/u3 leftovers exited 0 (D, from session 4f3f2eb7).

Q1. When may reconcile remove a `verify-*` (and `batch-*`) worktree?
- a) When its run ended or its owner is dead, force-remove regardless of reachability, since it never commits (A,C,D pick). C and B add: only when HEAD equals the record's sha; otherwise keep the guard. D: force also clears setup/test artifacts that make it dirty.
- b) Patch equivalence. Rejected (A,B,C,D).

Q2. When may reconcile remove a `<slug>-u<N>` worker worktree?
- a) Once the owner is merged, force-remove; failed owner keeps today's guard (A pick).
- b) Once the owner is merged or failed (C), or failed with its tab closed (D), force-remove.
- c) Only after a recorded acceptance/supersession of the worker's output; no blanket name-based deletion (B pick, rejects a and b as O12).
- d) Pin HEAD to `refs/akrogon/kept/<name>`, then remove (A,C option). Refs accumulate.
- Also: worker-protocol.md removal without `--force` fails on `__pycache__` (D).

Q3. Extras in scope or not?
- Unknown directories: keep, report only (A,B,C); remove `<slug>-*` of finished leaves (D).
- Plain `akrogon status` prints Kept lines (C,D).
- Stacked-member dirty-ref worktrees and tabs (D).

## Fog after merge
- #91: none material; the trigger is known (C,D).
- #92: per-codec measurement of pack growth if Q1 a wins (A,B).
- #93: none material for the akrogon fix; the framework kill is a separate report (C).

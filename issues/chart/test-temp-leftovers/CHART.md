# Chart: test-temp-leftovers

## Destination

A test run of akrogon's own suite leaves no `<hash4>/<hash8>` dir under the real leaf temp root (`/var/tmp/akr-<uid>`): a nested akrogon call inside a checked command shares its caller's leaf temp root. Narrowed from the intake by A's pick (forks/nested-temp-root.md Q2): the worktree-store clause is Off route.

Route: lifecycle

## Forks taken

- [Signposts](forks/signposts.md): session signposts (original in seat-turn-idle), A's picks
- [Nested temp root](forks/nested-temp-root.md): forward the two temp-root names in run-check, store clause Off route, one CLI boundary test (A's picks)

## Open forks

none

## Fog

none

## Off route

- Worktree-store leak (`~/.akrogon/worktrees/akrogon-XXXXXX`): not reproduced by A, B, C or D on HEAD 64681915 (four full suite runs, about 30 single-file runs, a git-shim trap on `worktree add`); HOME forwarding in land and verify predates the pileup. Reopen trigger: an `akrogon-??????` dir appears under `~/.akrogon/worktrees` after nested-temp-root lands. Reason: no current path to fix (forks/nested-temp-root.md Q2, B dissenting).
- `src/land.ts` empty `--setenv=HOME=` when HOME is unset, the preload not setting `AKROGON_HOME`, `tests/hc-fixture.ts` `cleanEnv` dropping the temp-root names, in-process `process.env` mutation in batch tests: no live leak on current code (slots/map-merged.md). Reason: removing a live failure only.
- Product host sweep deleting unregistered dirs: the sweep keeps them by design because the root is shared across homes (#151, dc426cd7).
- Existing host leftovers: an operator removal, not a leaf's.

## Pending steps

none

## Mode record

- mode 2026-11-25T11:14:50Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/c50ea560-71af-4450-8734-dc2cd89a61d7.jsonl: on full autopilot; handed list fresh-worktree-setup (Tamdoma/akrogon#158), then the test-suite temp leftovers (operator note); consultants B t3qb pi devin/swe-2-1-max high, C t3qc agy neon high, D t3qd pi meta/muse-wonder-full-1.0 high (door-created, carried); signposts issues/chart/seat-turn-idle/forks/signposts.md (same door session, A's picks); hand off to watcher w-akrogon (t346); words in INTAKE.md "Source: operator door message 2026-11-25"
- handover 2026-11-25T12:01:48Z /home/ivan/Work/infra/akrogon/issues/chart/test-temp-leftovers/door-reset.log: handed test-temp-leftovers (fresh-worktree-setup handed off 2026-11-25); consultants B t3rc pi devin/swe-2-1-max high, C t3rd agy neon high, D t3rf pi meta/muse-wonder-full-1.0 high (door-created, restarted at fresh-worktree-setup entry; restart again at this chart's entry); signposts issues/chart/test-temp-leftovers/forks/signposts.md (copy of issues/chart/seat-turn-idle/forks/signposts.md); instructions: operator 2026-11-25 door t126, scope this handed list: "yes, fix it all the best way you can. Use the active consultants to chart and hand off to to the w-akrogon watcher. Full autopilot mode. I have to go. Be autonomous. Do your best." (after each handoff, send the handed leaf to watcher t346 with hc send); operator 2026-11-24 door t126, scope the session: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."; operator standing, scope all work: never signal, move or stop processes or terminals that akrogon or the door did not create; never add a co-author to a commit; do not commit unless asked
- mode 2026-11-25T12:03:00Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/fa54cbd9-3365-4924-9cc8-4d9e0baea1a7.jsonl: continue autopilot (handover 2026-11-25T12:01:48Z)
- mode 2026-11-25T12:50:07Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/fa54cbd9-3365-4924-9cc8-4d9e0baea1a7.jsonl: off (every handed chart handed off: fresh-worktree-setup, test-temp-leftovers)

## Autopilot

- switch-on: INTAKE.md "## Source: operator door message 2026-11-25"
- signposts: A, original in issues/chart/seat-turn-idle/forks/signposts.md (same door session). Needs: none foreseen (local tests, no account, key or paid call).
- route: lifecycle
- consultant: B t3rz pi devin/swe-2-1-max high, C t3s0 agy neon high, D t3s1 pi meta/muse-wonder-full-1.0 high, door-created, restarted at this chart's entry 2026-11-25T12:03Z; none lost
- handed off: akrogon issues/open/test-temp-leftovers/nested-temp-root (plan.synthesis), sent to watcher w-akrogon t346
- usage: test-temp-leftovers, A=48902, D=34434, B and C unmeasured output, 46.4 working min, outcome partial (USAGE.md)

Handed off 2026-11-25

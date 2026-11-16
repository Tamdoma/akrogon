# Report: door-reads-live-address

Base 8532a1f7 → head f7748167 (`docs: define the door's address as the live HC_TERMINAL_ID read`). Serial-solo per plan D5; no workers, no sub-briefs. Refresh: branch already on current origin/main, no movement.

## Changed files

- `skills/chart-issues/SKILL.md` — `## Open`: appended the door-address definition (`$HC_TERMINAL_ID` read at the moment of each use; recorded addresses in summary/seats.yaml/Mode record are history, never routing; A writes the resolved literal, never the variable name; every rule in the three files uses the definition, enumerating column-helper calls, brief report steps, `transcript.ts` lookup, Mode/seat entries, door-reset.ts argument, handover start prompt). Not-in-a-tab rule kept `recorded once … round continues` and added the precondition `when the helper was called with the live address`. `## Handover`: `the prompt names its address` → `the prompt names the live address it reads per the \`## Open\` door-address definition`.
- `skills/chart-issues/assets/questions.md` — the brief report step's `hc send <door address>` now names its source: `where A writes the door's live address as the literal under the \`## Open\` door-address rule`.
- `skills/chart-issues/assets/handover.md` — `door-reset.ts <A address>` now defines the argument as `the literal A resolves live under the \`## Open\` door-address rule since door-reset.ts runs in a helper terminal where \`$HC_TERMINAL_ID\` is unset or different`.

## Done-criteria → proof

All probes run in the worktree on head f7748167, seconds each, through `akrogon run-check`.

1. C1 (`## Open` states live-read definition, history-not-routing, resolved literal): `check c1-definition: 0 implementation/check-c1-definition-1794844365742-476379.log`. Green at head; red on base at planning (`check-c1-definition-1794844293765-472181.log`). Criterion substance judged by reading the diff at review.
2. C2 (every door/A-address use points to the definition; no rule names a recorded source): `check c2-use-sites: 0 implementation/check-c2-use-sites-1794844372024-476621.log`. Green at head; red on base (`check-c2-use-sites-1794844299779-472766.log`). Observational listing `check c2-source-candidates: 0 implementation/check-c2-source-candidates-1794844372226-476752.log`: at head it prints the new definition plus SKILL.md:29 and :39 (seats.yaml record entries) and handover.md:5 (Mode record entry) — all record writes, none claiming source status; judged by review read.
3. C3 (not-in-a-tab keeps recorded-once/continue plus live-address precondition): `check c3-not-in-tab: 0 implementation/check-c3-not-in-tab-1794844372114-476686.log`. Green at head; red on base (`check-c3-not-in-tab-1794844306939-473007.log`).

## Checks

- `akrogon verify` on f7748167: `green` — format, test (1183 pass / 0 fail, 56.7 s), typecheck. Receipt under implementation/check-test-1794844438467-476971.log and the verify run's own logs.

## Known limitations

- `direct-route.md`, `autopilot.md` and `shapes.md` are outside the owned surfaces (plan D6); `direct-route.md`'s `hc send <door address>` inherits the `## Open` binding through the placeholder term and was deliberately not edited.
- Changed skill text reaches running doors only at the next release link; briefs already written with an old address are not edited mid-exchange (design stated limits).

## Operator blockers

None.

# Slot B timer design

All evidence below was inspected on 2026-11-20. “Operator” refers to the intake or the signed-off signposts. “Source” denotes the better-than-training tier.

## Q1. Where do checks run?

- Pick **a**. The invoking conversation already has the selected harness, permissions, retry counts, and record of which seats it has corrected. The cost is sharing input with the operator.
- Reject **b**. A second agent adds a launch configuration, a second conversation to inspect, and a new lifetime to reconcile with stop and exit.
- Evidence: operator, INTAKE.md and signposts, Taken. Source, `skills/watch-issues/SKILL.md`, Judge and Reply.
- Pitfall: an idle watcher can still have an unfinished draft. Exercise delivery while the operator is typing in that same conversation.
- Unasked: can the operator stop it from a second terminal while the first is blocked? Cover this through Q5.

## Q2. What binds delivery to the watcher?

- Pick **a for timer ownership only**. Run one parent-bound Bun child with notifications disabled. Pin the harness pid and process start time. This costs an identity lookup and covers a shell-launched agent returning to the same shell.
- Reject **b** because the parent terminal’s program may be the surviving shell. Reject **c** because a pid file adds stale-owner recovery and does not bind a send to its receiver.
- Evidence: operator, signposts lock 2a. Source, `src/hc.ts` functions `hcEnv`, `run`, `send`; `src/transcript.ts` functions `procStart`, `seatPids`; hc’s `terminal.send` and `terminal.attach` schemas. The former accepts status and address and may wait for a draft. The latter documents stream termination on program loss.
- Pitfall: checking the pid before sending cannot enforce lock 2a if the process exits during delivery. Test with a held draft and replace the agent before releasing it. A client timeout or killing the timer does not establish that hc cancelled a pending send. Also, `hcEnv` clears the caller’s terminal ID, so pass the watcher parent explicitly when using that helper.
- Unasked: what existing transport binds delivery to the original program through submission? Investigate a loss-bound attachment only if it also preserves blocked-dialog and draft behavior. Until demonstrated, the strict guarantee remains open.

## Q3. How is reset detected?

- Pick **b**, retaining the first-prompt stop as secondary evidence. Comparing the original conversation to the current one catches a visible reset even when the operator types before the next tick. The cost is resolving identity on each delivery.
- Reject **a** because one intervening prompt defeats it. The current skill documents that failure.
- Evidence: source, `src/transcript.ts` functions `claudeTranscript`, `fromProcess`, `transcriptFor`; `skills/chart-issues/scripts/transcript.ts` reads Pi’s tool-local `PI_SESSION_FILE`. The resolver can return an old label when no live process identifies a transcript.
- Pitfall: a missing path is ambiguous, and a stored label alone cannot establish continuity. Measure reset, compaction and delayed transcript creation on all four harnesses. Pin the initial conversation before arming wherever supported.
- Unasked: when a previously readable identity becomes temporarily unavailable, how long may the watch defer delivery before reporting it stopped? Keep the accepted Pi reset limit explicit.

## Q4. What happens while busy?

- Pick **d**, preserving one check per due tick and letting the timer count dues until the watcher can take each as a separate turn. The cost is a backlog after a long check. Stop, reset and owner loss discard the pending dues for that watch.
- Reject **a** and **c** because both lose checks. Reject **b** as a cross-harness contract because a prompt delivered while working can steer the active turn. Adopt native queuing only if all four show distinct turns and checks.
- Evidence: operator, lock 6a. Source, `skills/watch-issues/SKILL.md`, Invocations; `tests/e2e/watch-check.e2e.ts` checks two queued ticks; `src/hc.ts` function `send` reports that a turn started, with nullable status, rather than completion of a check.
- Pitfall: a draft can outlast hc’s draft wait, and repeating an ambiguous send can double-check. Verify two real dues during a long check, a blocked dialog, and stop with dues pending. Count status calls in distinct turns.
- Unasked: what observable receipt lets the timer release the next due when hc cannot tell whether the previous send started a tick?

## Q5. How is one watch found and stopped?

- Pick **a**, amended. Use the unique live timer name for atomic admission before the immediate check. Use the repo label to verify the winner. Stop from any terminal in the resolved session by the timer’s immutable address. Cost is one visible hc child.
- Reject **b**. hc already enforces live-name uniqueness and parent cleanup. A file would still need owner discovery and safe stop after a restart.
- Evidence: source, `src/config.ts` function `repoPrefix`, `src/hc.ts` functions `resolveSpace`, `run`, `terminals`; hc run documents unique live names and `--rm`. The skill’s Never section currently forbids killing or removing any hc terminal.
- Pitfall: a repo/parent match also accepts an old tick after restart in the same terminal. Include the unique timer address in each tick and validate it against the live timer and parent before Observe. Permit stop to end only the verified timer child, use `--rm` for cleanup, and leave ambiguous matches untouched.
- Unasked: on a simultaneous start, how does the loser report the winner? Handle the name collision by reading and verifying the winning timer. An unrelated program occupying that name is an explicit conflict.

## Q6. What does the timer send?

- Pick **a** with Q5’s timer address as an argument. One ordinary text instruction avoids four command parsers. Its cost is that activation depends on the agent loading the skill.
- Reject **b** as the default. CLI command spelling and argv wrappers introduce four routing cases without proving the skill ran.
- Evidence: source, `src/next.ts` function `promptFor` uses plain skill names, while `tests/e2e/watch-check.e2e.ts` exercises only Claude slash syntax. The seat precedent supports a trial, not a four-harness result.
- Pitfall: a model may merely acknowledge a prompt. Prove real timer delivery by observing the status action for the intended repo in each harness. Include a root with spaces and verify the full root arrives as one value.
- Unasked: if a harness receives the text but misses discovery, does one shared instruction naming the installed SKILL.md work on all four?

## Q7. How does agy find the skill?

- Pick **neither pending discovery**. First try the ordinary installed setup in a clean repo with no project link. If it works, there is no install change. If it fails, try one explicit installed skill path, including for the first user invocation. Cost is an agy discovery probe and potentially a longer start instruction.
- Reject **a as scoped**. Adding a global root in `planSkillLinks` installs every skill and includes that root in stale-link cleanup, beyond lock 5a. Reject **b** as the default because a hand-made link makes normal installs machine-dependent.
- Evidence: operator, lock 5a. Source, `src/install.ts` function `planSkillLinks`. The four managed roots establish what install writes. They do not establish which roots agy reads.
- Pitfall: tests can pass solely because they created their own link, as today’s Claude E2E does. Record the path agy actually loaded in a normal registered repo.
- Unasked: if automatic discovery genuinely requires an installer edit, will the operator allow one link for watch-issues only? Record a scope exception before treating it as part of the contract.

## Q8. What about an existing Claude cron?

- Pick **a only with Q5’s timer-address check**. Ignore legacy ticks without the live timer address before any status call or first-prompt stop. Cost is possible no-op Claude turns until the old job expires or its session ends.
- Reject **unamended a** because old and new ticks match the same repo and parent when the operator restarts there. Reject **b** because it restores Claude-only scheduler operations, covers only sessions starting the new watch, and cannot recall ticks already queued.
- Evidence: source, `skills/watch-issues/SKILL.md`, Invocations, defines the legacy tick as exactly `/watch-issues tick <root>`. Commit `3fdf8cd2` records that the cron survives clear.
- Pitfall: stale ticks can both run an extra check and stop a new watch if first-prompt handling comes first. Validate the timer address before either action. Exercise each with an old cron and a new timer in the same conversation.
- Unasked: does an already-open Claude session reload the changed skill on its next tick? Observe an actual upgrade before promising that legacy ticks reach the new guard.

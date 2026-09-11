# Plan: seat-guards

Direct synthesis by slot B. State declares `debate: no`, so no positions or rebuttals are required. The locked design governs implementation.

## Read first

- This leaf's `brief.md` and `design.md`.
- `REFERENCE.md`, `docs/next.html`, `docs/merge.html`, `docs/limits.html` for dispatch and recovery context. Live code and the locked design settle behavior where prose differs.
- `src/next.ts`: `allocate`, `busy`, `seatFor`, `dispatchSlot`, `dispatchLeaf`.
- `src/phase.ts`: `recoverMerge` and `requireClean`, read only.
- `src/state.ts`: optional recorded panes and prompted sessions, read only.
- `src/shell.ts`: pane schema and process interfaces, read only.
- `tests/next.test.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts`: real CLI fixture, Git repositories, Herdr database and command log.
- `learnings/LESSONS.md`: available context, especially verification by executing command scenarios. No history claim is needed for these decisions.

## Decisions

- **D1 — Session guard.** Keep the live-agent condition and skip an idle/done agent for a previously prompted session only when `state.prompted[slot] !== undefined && pane.agent_session?.value === state.prompted[slot]`. Null or omitted session data must not make an absent prompted value count as a match. Preserve busy-agent waiting, retry counters, seat switching and the existing `slot` field write.
- **D2 — Merge guard.** Before `recoverMerge`, retain `seatFor(state, 'A')` and the live-agent condition, but use `busy(pane)` for that recorded seat. Both working and blocked mergers prevent all recovery work, including fetch and the clean check. An unrelated busy pane does not own the merge.
- **D3 — Authoritative seats.** Resolve A and B independently by their recorded IDs among members of the selected tab. Keep both live recorded seats regardless of member order or extra panes. If one recorded seat survives, split from it to replace the other and preserve its slot identity. Never adopt an extra pane as a replacement.
- **D4 — Allocation edges.** Only zero members triggers the member-count error. Preserve fresh-tab and interrupted-initial-creation bootstrapping when neither seat has ever been recorded: use the initial member as A and create B by splitting, ignoring other members. When recorded seats have both vanished but the tab has members, use a member only as a split anchor, create A, then split B from A. Neither replacement adopts the anchor. A newly created tab's root can bootstrap A even if state retains stale IDs from a vanished tab. Keep placement arguments and existing allocation persistence. No new schema or pane-cleanup behavior.
- **D5 — Start deadline.** Change only `agent start --timeout` to `30000`; retain `agent prompt --wait --until working --timeout 5000`. The brief's “does not burn an attempt on a slow agent start” is satisfied within the longer startup window. The locked architecture does not authorize changing accounting or guaranteeing success beyond 30 seconds.
- **D6 — Scope and verification.** Edit only `src/next.ts` and `tests/next.test.ts`. Reuse the existing CLI fixtures and Herdr call log. No dependencies or ordering on sibling leaves are required. Stall detection, notifications, dispatch error boundaries and dead-field removal remain excluded.

## Acceptance criteria

- **AC1 — Missing session.** Through a real `next` CLI invocation, a recorded live idle agent with `agent_session: null` and no prompted value receives the phase prompt. Cover omitted session data too. A matching defined session still suppresses duplicate prompts and a changed session still prompts, as existing tests establish.
- **AC2 — Blocked merger.** Test both the normal A merge seat and the B seat selected after A exhausts its own attempts. A blocked live merger leaves phase, attempts and prompts unchanged. A fixture-local Git wrapper logs calls and delegates to the real Git executable; assert the invocation performs neither `fetch` nor the `status --porcelain` clean probe. Include dirty worktree content so the case represents a merger paused during work. Retain existing working-merge and idle-recovery coverage.
- **AC3 — Extra member.** With recorded A and B both live and a third operator pane listed before them, dispatch succeeds, IDs stay fixed, and no split, start or prompt targets the operator pane.
- **AC4 — Lost member.** Remove recorded A while B and an extra pane remain. Dispatch creates one new split from B, preserves B, assigns the new pane to A, and never starts or prompts the extra pane. Exercise the symmetric missing-B case. Keep the existing exited-hook test passing.
- **AC5 — Allocation edges.** Fresh creation and interrupted split recovery still pass. Both stale recorded seats with an extra surviving member cause two new seats without adopting that member. A selected empty tab reports an error. Recreated tabs can bootstrap their new root without assigning stale IDs.
- **AC6 — Timeouts.** Assert recorded start arguments contain `--timeout 30000` and prompt arguments retain `--wait`, `--until working`, and `--timeout 5000`. Use command arguments rather than a 30-second sleep. Leave the existing blocked-agent wait test unchanged.
- **AC7 — Checks and evidence.** The focused suite and configured format, typecheck and full test commands pass. Capture the focused CLI integration suite output as an artifact and record its absolute path in the implementation report. Tests invoke the actual `src/akrogon.ts` entrypoint against isolated state and real Git repositories, with Herdr represented by the existing process fixture.

## Ordered file and criterion checklist

1. **A1 — `tests/next.test.ts`.** Add the AC1–AC6 regression scenarios with existing helpers. Keep any Git-call probe local to the fixture and resolve the real Git executable before installing the wrapper. Run focused new cases against the current code to establish the defects. Do not modify the blocked-agent wait test.
2. **A2 — `src/next.ts`.** Apply D1, D2 and D5, then implement D3–D4 in `allocate`. Keep the change within the named functions and preserve the `slot` write. Check all AC1–AC6 cases through the CLI.
3. **A3 — Verification.** Run `bun run format`, `bun run typecheck`, and `bun test`. Also run `bash -o pipefail -c 'bun test tests/next.test.ts 2>&1 | tee /tmp/seat-guards-next-verification.log'` for AC7. Inspect `git --no-pager diff` and `git status --short` for scope, saved changes and unintended formatter edits. Record actual results and the artifact path in the implementation report, retaining normal implementation commit/handoff requirements.

## Open limitations

- **R1 — Sessionless deduplication.** Without a session identifier, another later idle event cannot be reliably identified as already prompted. D1 prevents the initial prompt from being skipped but does not add a replacement identity mechanism.
- **R2 — Startup ceiling.** Starts exceeding 30 seconds still follow existing retry and attempt behavior. This leaf does not change that contract.
- **R3 — External timing.** The CLI integration artifact verifies dispatch decisions and exact Herdr arguments, not actual cold-start timing in a live harness. No browser or human-only prerequisite applies.

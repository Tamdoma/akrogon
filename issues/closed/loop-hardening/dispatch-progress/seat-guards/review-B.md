# Review B: seat-guards

Verdict: ready.

Base: `9dc1055a0a1ba3682335622d81f41873de966f11`.
Reviewed head: `572a624b9b1a141072f6a1f32454a9282482fd57`.
The reviewed head is one commit ahead of base. `git status --porcelain` is empty. Only `src/next.ts` and `tests/next.test.ts` differ from base.

## Findings

No Fixes or Nits found. Reviewed the complete diff against plan D1–D6, AC1–AC7, the implementation brief and report, and the live pane/state/process contracts. Followed REFERENCE.md and the affected dispatch/merge documentation. No new interface or documentation pointer requires an update.

- F1: The session guard requires a defined prompted value before comparing it with the live session. Null and omitted sessions no longer suppress initial dispatch. Existing defined-session deduplication and blocked-agent waiting remain intact.
- F2: The merge guard uses the existing busy predicate on the recorded seat selected by seatFor, before recoverMerge. CLI regressions for A and retry B verify no fetch or clean probe, no prompts or starts, and unchanged state and dirty content.
- F3: Allocation resolves recorded A/B independently and splits missing seats. Tests cover an extra pane listed first, either or both recorded seats missing, interrupted bootstrap, empty tabs and recreated tabs. Surviving slot identity and operator-pane isolation match D3–D4. Startup uses 30000 ms and prompt wait remains 5000 ms.

## Verification evidence

Reviewed the existing CLI test implementations and retained artifacts. They invoke the real command entrypoint with real isolated Git repositories, replacing Herdr at its external process boundary. The Git wrapper delegates to the real executable. Assertions check behavior, state and literal command arguments rather than prose or a mocked unit under test.

- V1: `/tmp/seat-guards-changed-red.log` records 38 pass and 10 fail before source edits. `/tmp/seat-guards-changed-verification.log` records the resolved changed-test command passing after the final typing repair: 48 pass, 0 fail, 338 assertions.
- V2: `/tmp/seat-guards-next-verification.log` records `bun test tests/next.test.ts`: 48 pass, 0 fail, 338 assertions. The existing blocked-agent wait test is unchanged in the reviewed diff.
- V3: `/tmp/seat-guards-full-verification.log` records the final `bun test`: 104 pass, 0 fail, 1051 assertions. The implementation pass in this session also established successful `bun run format`, `bun run typecheck`, and `git diff --check` before committing this unchanged code. No advisory checks are configured.

No checks were rerun in this review because the reviewed code is unchanged and the successful evidence is available. The implementation report has no material verification gap.

Plan limitations R1–R3 remain explicit: absent sessions cannot support reliable later deduplication, starts beyond 30 seconds retain existing retry behavior, and fixture evidence does not establish live harness cold-start timing. None contradicts the locked acceptance criteria.

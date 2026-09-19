# Review B: watch-issues-skill

Base: `e7d74ae70bb8a412c9f7f25e4f31c5aa6486a901` — Reviewed head: `391bc82` (ahead of base, `git status` clean).

## Verification evidence

- `bun test` (root): 270 pass, 0 fail — run by B at handoff; diff unchanged since.
- `bun run typecheck` (root): exit 0.
- `bun run format`: all files unchanged.
- `cd skills/watch-issues && bun run test`: 20 pass, 0 fail, 53 expects.
- `cd skills/watch-issues && bun run typecheck`: exit 0.
- `bun install --cwd skills/watch-issues --frozen-lockfile`: clean.
- `bun test tests/install.test.ts`: 15 pass with `expect(skills).toContain('watch-issues')`.
- `implementation/walkthrough.md`: all 8 criterion-5 scenarios with pasted outputs, `.calls` excerpts, genuine `attempts@check.review` recovery (§1b), self-contained fake-herdr appendix.

## Criteria check

1. Fixture trees and error cases all covered by `observe.test.ts` (waiting, mixed, busy ±notified, failed blocked/attempts/legacy, merged-under-open, missing pane `-`, unreadable/invalid/wrong-repo state, non-zero and non-JSON herdr, empty open). Tests spawn the real script and assert exact lines — output format is a fixed reference, so wording assertions are legitimate.
2. Skill typecheck/test/frozen-install verified above.
3. SKILL.md carries every required element: three invocations with zero/one/several behavior, all Judge rules including the stop-and-resteer sequence with pane read before prompting, once-per-seat bound, subagents through the parent, all harnesses, command error, log-based recovery bound, notification evidence rule, quiescence with fresh read, stop rule, Claude Code refusal, Bash timeout rule, never list.
4. Install test extended; `src/install.ts` enumerates `skills/` dynamically — no code change needed.
5. Walkthrough covers all eight scenarios with real commands.

## Findings

No Fix findings. `observe.ts` mirrors `src/state.ts` field names and legacy-key stripping, fails loudly on every error class, writes nothing. SKILL.md is faithful to the locked design including the foreclosed options.

- N1 (nit): SKILL.md's Busy rule never defines which observe statuses count as busy. `src/next.ts` treats `working`, `blocked` and `unknown` as busy; herdr's `agent wait` settles on `blocked`, so an agent could read `blocked` as settled and skip the read. The safe reading (busy = not `idle`/`done`) is natural but unstated.
- N2 (nit): the post-esc confirmation requires "the same session" but SKILL.md does not say where the session id comes from (`agent list`/`agent get` `agent_session.value`, compared against the pre-esc value or state `prompted`). Implementable, but the agent must invent the mechanism.
- N3 (nit): the Stop section covers one and several exact-prompt job matches but not zero (job expired or already deleted). Inferable — nothing to delete — but the other invocation sections spell out all three counts.

## Verdict

`nits` — no defect, broken contract or failed check; three prose gaps worth a line each in SKILL.md, none blocking.

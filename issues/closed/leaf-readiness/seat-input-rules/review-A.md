# Review A: seat-input-rules

Base `7c1567d`, reviewed head `5fff7dc`, 4 commits, clean worktree, base is ancestor. Evidence below is from `git diff 7c1567d..HEAD`, greps, and the demo transcripts under `implementation/`.

## Criterion check

1. Env rule appears once in each of the four skills beside its operator-blocker stop (`grep Missing: skills/` → plan-issue:31, implement-issue:45, check-issue:31, merge-issue:29); `Missing:` replaces `present`/`absent` everywhere; `skills/AREA.md:24` names the rule once. plan-issue `plan.synthesis` credential check (line 67) uses `akrogon status` `Missing:` lines — the `bun -e` one-liner is gone. **Met.**
2. Rule placement: `produces[].save` and `grants[]` in plan-issue + implement-issue; `grants[]` reuse and extended blocker record (name/ID, operation, identity, error, owner, next action, never a value) in all four; `fixtures[].cleanup` + `absence_check` + `retained[]` in check-issue + merge-issue. **Met.**
3. check-issue:71 routing (`required live runs`, `Handed to A`): zero diff hits, byte-identical. **Met.**
4. Demo: per-harness leaf `seat-demo-{claude,codex,pi}` in scratch `AKROGON_HOME`/repo; each transcript shows the `Missing:` line, a `blocker.md` write (name, operation, identity, error, owner, next action, no values), `akrogon phase ... failed` exit 0 → `moved failed`, and `state.yaml` `failure.reason` naming the input and `.env`. No `.env` opened or written anywhere; scratch deleted. **Met.**

## Findings

### N1 (Nit) — AREA.md invariant line dropped the "every phase skill" scope

Old line: "Env-file rule is an invariant of every phase skill". New line states the rule unconditionally but no longer says it binds every phase skill. Source: criterion 1 says AREA.md names it "as the phase-skill invariant". Consequence today: none — the section it lives in is `Non-obvious patterns` of the skills area, and the four skills each carry the rule. Deferred because no reader is misled into missing coverage today; promote to Fix if a future skill ships without it while citing AREA.md.

## Checks run

`bun test --changed=$AKROGON_BASE` → 0 tests (markdown-only diff). `bun run format` → unchanged. `bun run typecheck` → exit 0. Full suite green at implement end (383 pass, report.md).

## Verdict

`nits` — all four done-criteria met, one wording-scope nit.

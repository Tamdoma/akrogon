# Review A: seat-exit-rules

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`. Reviewed head: `708f85e2492eda4ac38f2d5d07f2b1f7d87fd607` (ahead of base, `git status --porcelain` empty). No peer review read. No debate artifacts expected (`debate: no`).

## Diff checked

Two files only: `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`. No AREA.md in diff, no `src/`, no `issues/` paths, none of the design-excluded areas touched.

## Criteria

- C1: SKILL.md:34 names implement and check.fix, reuses the failed exit with the full literal command, names `"<criterion> red: <cause>"`, and forbids pre-existing/base red/modulo handoff. check.fix has the one cross-ref sentence. Fixed-string grep confirms the D3 command byte-exact, count 1.
- C2: worker-protocol.md:17-21 covers error-text recognition with the pi-retried list and quota/billing/overflow exclusion, relaunch only after the old worker ended, retained-worktree spawn cwd, original brief plus the added line (fixed-string grep confirms byte-exact, count 1), one relaunch, second-failure `failed` exit naming provider/error/both transcripts with the standalone report. `never the original brief again` occurs once, in the budget/limit branch only.
- C3: report pastes green changed-tests (0/0, prose-only), full suite 339 pass, typecheck exit 0, format unchanged. No rerun: prose-only diff, no code changed, evidence complete.

Changed behavior lives in the skill files themselves, which were read. Stale-copy sweep over `docs/`, `skills/`, `src/` hits only the two new rule sentences. No documented behavior outside those files changed.

## Findings

- N1 (Nit): worker-protocol.md says standalone "makes no phase calls" where the brief cites "no phase, state or log calls (SKILL.md:66)". Concern: a reader could infer standalone makes state/log calls. Deferred: the operative content (standalone reports instead of phasing failed) is intact, the narrowing is still true, and the standalone section one file away states the full rule. Promotion evidence: a real misread by an agent traceable to this sentence.

## Verdict

`nits`. One precision nit, no Fix. Mergable.

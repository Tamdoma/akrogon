# Review A: operation-proof

Base: `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`
Reviewed head: `f984c8ae83156b31aaa5502abab4b02a0c96f360` (3 commits, worktree clean, diff = 3 skill files, 7 insertions, 5 deletions, no `issues/` or src/test diff).

## Criteria walk

- C1 (brief 1, 5): SKILL.md:53 holds the single canonical rule with all D1 elements — one real call with leaf identity before handoff, all record fields including "limits stating what the call does not prove", smallest reversible write on a throwaway target with checked cleanup, dry-run credited only for the provider-documented property, decline holds, no sufficient probe holds without narrowing scope, "no waiver". Handoff (SKILL.md:63), shapes.md:166 and questions.md:54 all reference "the Take operation-proof rule" without restating fields. Confirmed: `grep -rn "cleanup result|identity reference without|smallest reversible" skills/chart-issues/assets/` exits 1.
- C2 (brief 2): credential sentence now ends "names the ones absent from the consumer repo's gitignored `.env` before handoff so the probes can run". `grep -rn "before dispatch" skills/chart-issues/` finds no remaining pre-dispatch credential timing.
- C3 (brief 3): shapes.md:166 appends "Refuse the handoff when a brief names an external operation with no recorded proof under the Take operation-proof rule"; the implementer-audit paragraph gains "The audit checks that operation-proof refusal." Additive only; the preflight collision sentences untouched, so the base-preflight rebase stays sentence-level (R1).
- C4 (brief 4): questions.md Optional measurement ends "covers exploration only and never replaces required operation proof. Declining a required probe holds the handoff under the Take operation-proof rule." Sandbox sentences intact.
- C5 (brief 6): report walks I2 (proceed), I3 (partial credit, write scope still needs its own record), I4 (hold, no waiver — the #20 case) against the edited prose; each reaches the required outcome. Link check: the three asset links at SKILL.md:19 all resolve; questions.md has no links; shapes.md placeholders are exempt shape examples. Verified independently.
- C6: `bun run format` clean, `bun run typecheck` exit 0, `bun test` 306 pass 0 fail (14 files, 119.82s), `git diff --check` clean, `git status --porcelain` empty. No new test file, no src diff.

## AREA.md check

`skills/AREA.md` is the only area file covering the diff. Verified from repo root: `bun src/akrogon.ts` (exists), `tests/install.test.ts`, `tests/phase.test.ts` (exist), `skills/implement-issue/worker-protocol.md`, `src/routing.ts`, `docs/reference-index.md` (all exist). No missing paths. AREA.md needs no update: the diff changes skill prose, not commands or patterns.

## Documented-behavior check

Opened `docs/guide/chart.md` Handoff section (~line 199): it says credentials are "named, not pasted" with no timing statement and no preflight restatement, so it remains accurate after this leaf. `docs/guide/setup.md` "before dispatching work" hits are unrelated. No documented behavior contradicts the diff.

## Findings

None. The rule lands at Take as decided, cross-refs stay referential, the audit and link check in the report match my own verification, and the three-case audit reaches the required outcomes.

## Verdict: ready

## Merge evidence (slot A)

- Rebase target: `origin/main` at `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`; branch already up to date, no-op rebase, no conflicts. `AKROGON_BASE` unchanged at `1607ee7`.
- Checks in worktree post-rebase: `bun run format` clean (worktree untouched), `bun run typecheck` exit 0, `bun test` 306 pass 0 fail (14 files, 116.20s), `test_changed` 3 changed files / no test files affected, exit 0.
- Push: `git push origin HEAD:main` fast-forwarded `1607ee7..f984c8a`; `git merge-base --is-ancestor f984c8a origin/main` confirms the reviewed head landed. Pushed head equals reviewed head `f984c8ae83156b31aaa5502abab4b02a0c96f360`.

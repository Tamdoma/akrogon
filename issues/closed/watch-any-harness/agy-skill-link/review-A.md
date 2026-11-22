# Review A: agy-skill-link

Base: `4defba1e7d8ef20df3b2ce6b039fd598b33ea0fc`. Reviewed head: `7c6ab78339102109625966100b2c0454bc6ae6cf` (2 commits: `8a0d6692` tests, `7c6ab783` product+doc). Worktree clean; branch already on current `origin/main`.

## Diff judgment

- `src/install.ts`: `'.gemini/config/skills'` added to `planSkillLinks` `roots`. Verified the single list drives all four planned behaviors — `planned` links (create/repoint), the `staleIn` scan (line 77 loops `roots`), and the conflicts loop — for both consumers `install()` (src/install.ts:154) and the deploy `links` step (src/self-update.ts:258, with `listRoot` at the new release). Matches plan D1 and locked design; the "same pattern" operator wording is satisfied literally — no per-root special-casing exists to copy.
- `within()` (src/config.ts:264) is path-relative, so `.gemini/config/skills` entries can't collide with sibling-prefix paths; the `sibling-prefix` test seed covers the analogous case.
- `docs/start/install.md:72`: root list updated, the only doc enumerating roots (grep over docs/, skills/, src/AREA.md, tests/AREA.md — seed-issue's `~/.claude/skills/check-issue` mention is an example path, not a root list).
- `tests/install.test.ts`: file `roots` extended (all generated per-root cases now cover agy: refusal ×2, repoint, prune sweep); literal `.gemini/config/skills` assertions added per B L11/design; `release-link` seed proves old-release pruning at the new root. `tests/deploy-fixture.ts` `roots` extended; no test asserts the absence of a fifth root.
- Exclusions held: no agy config edits, no skill text changes, no watch-issues changes, no changes to which skills exist.
- Live surface: `~/.gemini/config/skills` currently holds 8 foreign symlinks (omarchy/herdr tools); none names an akrogon skill, so install on this host keeps them (foreign links, distinct names). Collision-with-foreign-dir behavior is design-correct: refused before writes.

## Criteria

1. Empty-home link creation + parent dirs + idempotent second install — proven by the absent-roots test over 5 roots, literal agy assertions in checkout and listener-release paths. `check c1-install: 0` (33 pass) log `check-c1-install-1795182884550-3409261.log` on head `7c6ab783`.
2. Prune/refuse/repoint ordering at the agy root — same run plus `check c2-deploy: 0` (23 pass) log `check-c2-deploy-1795182894785-3412309.log` covering deploy links step and rollback. Deliberate-break reds recorded in plan.md.

## Checks and known-red judgment

`akrogon verify` first run on head: format/typecheck green, `test` red on `agy: the reset helper runs its stages in order ...` — `git diff 4defba1e...HEAD` holds no plausible cause (install roots/doc/test constants only; door-reset untouched). Retry `bun test tests/door-reset.test.ts` green in isolation (16 pass) → `inconsistent`. A second full-suite run-check red on two different names (`hc-identity` stale-socket, `next.test.ts` 15s timeout), both green isolated, third run green 1233/1233 → `inconsistent`; mechanism matches learnings/history/2026-11-08-hc-shutdown-unit-leak.md (varying red names per run, each file green alone; base `4defba1e`'s own leaf receipt `cbccd26b` is whole-green). `akrogon verify` rerun on unchanged head: green (`verify leaf 7c6ab783...: green`).

## Report / artifacts

report.md matches kept logs; count audit clean (no grants, no paid ops). AREA.md files: none in diff. Documented-behavior page `docs/start/install.md` reviewed; one stale test title noted below.

## Findings

- Nit — `tests/install.test.ts` test title still reads "install creates all four absent harness roots" while the case now asserts five roots. No behavioral or doc consequence today (test names are labels, not contracts); deferred: title text fails nothing; promoting evidence would be a harness that grep-asserts root counts from the title.
- Nit — the same `roots` constant is duplicated in three places (`src/install.ts`, `tests/install.test.ts`, `tests/deploy-fixture.ts`), each updated identically. Pre-existing pattern; tests deliberately enumerate destinations so the red under the deliberate break is real. No consequence today.

## Verdict

nits — implementation matches plan and locked design; both criteria proven green on head; only wording-level nits.

`akrogon phase agy-skill-link merge --slot A --verdict nits`

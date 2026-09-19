# Review A: skills-env-file-rule

Base: 92eb1cf4c2ba293f87234facc2643ddf8d79e090
Reviewed head: 0469b58 skills-env-file-rule: state env-file rule in phase skills, by-name .env check in plan
Debate: off — no positions-A/rebuttal-A expected or present.

## Diff shape

Five files, prose only, +10/−1: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/AREA.md`. Matches the plan's owned-file list exactly; no code, no tests, no new files.

## Criteria

1. **Rule sentence per skill, next to the missing-value stop — pass.** plan-issue:31 after the :29 stop, implement-issue:33 after :31, check-issue:27 after :25, merge-issue:27 after :25. Each is one sentence carrying all four required elements: never open/print/append/write `.env`/`.env.*` with a tool; `bun --env-file=<file> <script>`; results not values; presence by name printing `present`/`absent`; absent required value ends the pass via the stop above. `skills/AREA.md:23` names the rule once under Non-obvious patterns; file is 29 lines with exactly Commands / Key files / Non-obvious patterns / See also.
2. **plan-issue by-name rewrite — pass.** :59 no longer says "checked in the registered repo's gitignored `.env`"; it embeds the verified `bun --env-file=.env -e '<script>'` form with "the design names in the list". The rest of the stop (blocker in `plan.md`, `add <VAR> to .env` action, `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see plan.md>" --slot B`) is verbatim per D3.
3. **No seat instructed to open/read/edit/append `.env` — pass.** `grep -rn '\.env' skills/` yields 10 matches, identical to the report's list: 7 owned (prohibition sentences, the by-name check, the `add <VAR> to .env` operator action at implement-issue:43 and plan-issue:59) and 3 out-of-scope unchanged (broadcast-issue test:94, chart-issues:47, standing-design.md:11). `grep -rn 'gitignored' skills/` hits only the two out-of-scope chart-issues files.
4. **Checks — pass per report evidence.** `bun test` 244/0, `bun run format` exit 0, `bun run typecheck` exit 0, `bun test --changed` 0/0. Diff is prose-only; `tests/command-reference.test.ts` reads README.md and `src/akrogon.ts`, neither touched. No rerun needed.

## AREA.md path check

All five paths named in the diff exist from the repository root (verified with one `[ -f ]` loop).

## Live verification

Concrete scenario run this pass: synthetic `.env` with `VAR_A=secret`, `VAR_B=` → `VAR_A: present`, `VAR_B: present`, `VAR_C: absent`. Missing `.env` file → `VAR_A: absent`, exit 0. No value printed either way.

## Design exclusions

Confirmed: no akrogon code, no new tests, no broadcast-issue/chart-issues/pi-extensions changes.

## Findings

None. No fixes, no nits.

## Verdict

ready

## Merge evidence (slot A)

- Rebase target: `origin/main` = 92eb1cf4c2ba293f87234facc2643ddf8d79e090 — already the base; rebase a no-op, no conflicts.
- Checks post-rebase: `bun run format` clean; `bun test` 244 pass / 0 fail; `bun run typecheck` (`tsc --noEmit`) exit 0; `bun test --changed` 0/0 (no test files affected).
- Push: `git push origin HEAD:main` → `92eb1cf..0469b58 HEAD -> main`; post-push `origin/main` = 0469b5886ef1f781321a9270240517f526a9d47f.

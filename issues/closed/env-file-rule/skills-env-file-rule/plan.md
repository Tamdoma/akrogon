# Plan: skills-env-file-rule

Debate off; synthesized directly from brief and design. Prose-only leaf: five owned files, no code, no new files, no new tests.

## Decisions

- **D1 — One rule sentence per phase skill, placed after the shared-context missing-value stop.** The brief lists two stop positions for plan (:29, :57) and implement (:31, :41) but requires one sentence per skill. The shared-context stop is the seat-wide "env value it cannot obtain" sentence present in all four skills, so the rule goes there uniformly: plan-issue after :29, implement-issue after :31, check-issue after :25, merge-issue after :25. plan-issue :57 gets the rewrite (D3), not a second rule sentence; implement-issue :41 stays verbatim.
- **D2 — Rule substance is fixed; wording stays in each skill's voice.** Per the design's literal interface, the one sentence carries: (1) the env file (`.env`, `.env.*`) is never opened, printed, appended to or written by a tool; (2) a script needing values runs as `bun --env-file=<file> <script>` and prints results, never values; (3) presence is checked by name with such a script printing `present`/`absent` per name; (4) an absent required value ends the pass with the existing stop. The `VAR=` → `present` edge may be stated or omitted; it is not required.
- **D3 — plan-issue :57 rewrite.** Replace "is checked in the registered repo's gitignored `.env`" with the by-name presence check: the seat checks each named credential with `bun --env-file=.env -e '<script printing present/absent per name>'` (or equivalent file script). The rest of the sentence is verbatim: blocker recorded in `plan.md` with the `add <VAR> to .env` operator action, then `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see plan.md>" --slot B`.
- **D4 — AREA.md names the rule once.** One bullet under "Non-obvious patterns" stating the env-file rule as an invariant of every phase skill. File stays ≤40 lines with exactly Commands / Key files / Non-obvious patterns / See also sections.
- **D5 — Criterion-3 reading.** The negative check targets sentences telling a seat to open/read/edit/append `.env`. The rule's own prohibition sentence and the operator action `add <VAR> to .env` are compliant and stay. The implementation report lists every literal `.env` match under `skills/` and marks hits outside the five owned files.
- **D6 — Out of scope, unchanged.** `skills/chart-issues/SKILL.md:47`, `skills/chart-issues/assets/standing-design.md:11`, `skills/broadcast-issue/` (`~/.config/akrogon/env` is the sender's file), the pi-extensions guard, all akrogon code and tests.

## Read-first

- `skills/plan-issue/SKILL.md` — :29 shared stop, :57 credential check to rewrite.
- `skills/implement-issue/SKILL.md` — :31 shared stop, :41 credential stop (unchanged).
- `skills/check-issue/SKILL.md` — :25 shared stop.
- `skills/merge-issue/SKILL.md` — :25 shared stop.
- `skills/AREA.md` — Non-obvious patterns section.
- `skills/chart-issues/assets/standing-design.md:11` — context: agents may read `.env`; the rule removes the tool opening it. Unchanged.
- `learnings/LESSONS.md` — 2026-09-11 lock-vs-criterion (grep criterion vs verbatim text), 2026-09-14 bun-eval-argv (`bun -e` argv shift, irrelevant here: script uses no argv), 2026-09-11 stale-rule-in-docs (swept `docs/` — no `.env` prose hits).

## Interfaces

Verified presence-check form (bun 1.4.2, synthetic file, re-verified this pass):

```bash
bun --env-file=.env -e 'console.log(["VAR_A","VAR_B"].map(k => k + ": " + (process.env[k] === undefined ? "absent" : "present")).join("\n"))'
```

`VAR=` reports `present`; a missing name reports `absent`. No value is printed.

## Checklist

1. `skills/plan-issue/SKILL.md` — append the rule sentence after the :29 stop; rewrite :57 per D3. → criteria 1, 2.
2. `skills/implement-issue/SKILL.md` — append the rule sentence after the :31 stop. → criterion 1.
3. `skills/check-issue/SKILL.md` — append the rule sentence after the :25 stop. → criterion 1.
4. `skills/merge-issue/SKILL.md` — append the rule sentence after the :25 stop. → criterion 1.
5. `skills/AREA.md` — one Non-obvious patterns bullet per D4. → criterion 1.
6. `grep -rn '\.env' skills/` — confirm no sentence in the five files instructs a seat to open/read/edit/append the env file; record every match and its disposition in the report. → criterion 3.
7. Run `bun test`, `bun run format`, `bun run typecheck`. → criterion 4.

## Verification

- Diff shows exactly five files changed, each gaining one sentence (plan-issue also rewrites :57); no other prose touched.
- `grep -rn 'gitignored' skills/` shows plan-issue no longer says "checked in the registered repo's gitignored `.env`"; remaining hits are chart-issues:47 and standing-design.md:11, both out of scope.
- `grep -rn '\.env' skills/` output pasted in the report with each match marked owned/out-of-scope.
- Concrete scenario: a seat needing `DISCORD_WEBHOOK_URL` presence runs the D-interface script and gets `present`/`absent` without opening the file — verified live this pass.
- All `checks` commands pass unchanged; `tests/command-reference.test.ts` untouched.

## Open limitation

Prose only. The hard enforcement is the pi-extensions guard (leaf `env-guard-hooks`, Tamdoma/akrogon#22), unmerged; until it lands a seat can still open the file, but no refusal will surprise it.

## Notes for review

- Brief done-criteria tail is garbled (criterion numbering merges the exclusions list); the design's exclusions govern, per design-wins.
- No credentials named by the design; the by-name `.env` check is not triggered this pass.

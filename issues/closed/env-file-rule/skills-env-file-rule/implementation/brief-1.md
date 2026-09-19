# Brief 1: env-file rule in five skill files

## 1. Goal

Add the env-file rule to the four phase skills and `skills/AREA.md`, and rewrite the plan-issue credential check to the by-name presence script. Plan decisions D1–D6.

## 2. Numbered acceptance criteria

1. Each of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` contains exactly one new sentence stating the rule, placed immediately after that skill's shared-context missing-value stop sentence (plan :29, implement :31, check :25, merge :25 on the current base). `skills/AREA.md` names the rule once as a bullet under "Non-obvious patterns".
2. `skills/plan-issue/SKILL.md` no longer says a credential "is checked in the registered repo's gitignored `.env`"; it names the by-name presence script `bun --env-file=.env -e '<script printing present/absent per name>'` or an equivalent file script.
3. Within the five owned files, no sentence tells a seat to `cat`, read, open, edit or append to `.env`. The rule's own prohibition sentence and the operator action `add <VAR> to .env` are compliant and stay.
4. `bun test`, `bun run format`, `bun run typecheck` pass.

## 3. Read-first list

- `skills/plan-issue/SKILL.md` — :29 shared stop, :57 credential check to rewrite.
- `skills/implement-issue/SKILL.md` — :31 shared stop, :41 credential stop (unchanged).
- `skills/check-issue/SKILL.md` — :25 shared stop.
- `skills/merge-issue/SKILL.md` — :25 shared stop.
- `skills/AREA.md` — Non-obvious patterns section; file must stay ≤40 lines with exactly Commands / Key files / Non-obvious patterns / See also sections.
- `skills/implement-issue/ponytail.md` — shortest working diff.

## 4. Change list and needed interfaces

Rule substance (fixed; wording in each skill's own voice, one sentence): (1) the env file (`.env`, `.env.*`) is never opened, printed, appended to or written by a tool; (2) a script that needs values runs as `bun --env-file=<file> <script>` and prints results, never values; (3) presence is checked by name with such a script printing `present`/`absent` per name; (4) an absent required value ends the pass with the existing stop. The `VAR=` → `present` edge may be stated or omitted.

Verified presence-check form (bun 1.4.2):

```bash
bun --env-file=.env -e 'console.log(["VAR_A","VAR_B"].map(k => k + " : " + (process.env[k] === undefined ? "absent" : "present")).join("\n"))'
```

Changes:

- `skills/plan-issue/SKILL.md`: append the rule sentence after the :29 stop paragraph. Rewrite :57 so the check is the by-name script: replace "is checked in the registered repo's gitignored `.env`" with the `bun --env-file=.env -e '<script printing present/absent per name>'` check; keep the rest verbatim (blocker in `plan.md` with `add <VAR> to .env` action, then `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see plan.md>" --slot B`).
- `skills/implement-issue/SKILL.md`: append the rule sentence after the :31 stop paragraph. :41 stays verbatim.
- `skills/check-issue/SKILL.md`: append the rule sentence after the :25 stop paragraph.
- `skills/merge-issue/SKILL.md`: append the rule sentence after the :25 stop paragraph.
- `skills/AREA.md`: one bullet under "Non-obvious patterns" naming the env-file rule as an invariant of every phase skill.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/standing-design.md`, `skills/broadcast-issue/` (`~/.config/akrogon/env` is the sender's file), any code or test file — design exclusions; out-of-scope edits fail review.
- Do not add a second rule sentence to any skill, do not reword the existing stop sentences, do not add files — the brief requires one sentence per skill and no other prose.
- Do not weaken or remove the `add <VAR> to .env` operator action — it is the operator's action, not a seat opening the file.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Reasons restated: exclusions keep the diff to the five owned files; one sentence per skill is the acceptance shape; the operator action is required by the unchanged stop.

## 6. Ordered steps

1. `skills/plan-issue/SKILL.md` — rule sentence after :29; :57 rewrite. → criteria 1, 2.
2. `skills/implement-issue/SKILL.md` — rule sentence after :31. → criterion 1.
3. `skills/check-issue/SKILL.md` — rule sentence after :25. → criterion 1.
4. `skills/merge-issue/SKILL.md` — rule sentence after :25. → criterion 1.
5. `skills/AREA.md` — one Non-obvious patterns bullet. → criterion 1.
6. `grep -rn '\.env' skills/` — paste output; confirm no owned-file sentence instructs a seat to open/read/edit/append `.env`. → criterion 3.
7. Run the changed-test command in section 7. → criterion 4 evidence for B.

Advisory size: 5 files, under 25 turns.

## 7. Commands

```bash
AKROGON_BASE=92eb1cf4c2ba293f87234facc2643ddf8d79e090
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

## 8. Done-when, evidence and report

All five files edited, grep output pasted, changed-test output pasted. Prose leaf: no new tests; the existing suite must pass unchanged.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Brief 3 — U3: skill and guide text (wave 2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/known-red-leaf-u3

## 1. Goal

Replace the retired pre-merge base-red stop in the three skills, the skills AREA line and the guide with the retry/compare/record/`--compare` rule. Plan decision D8. This is text work only.

## 2. Acceptance criteria

`bun test tests/red-docs.test.ts` passes: both `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md` contain `--compare`, `base-run`, a retry rule, `known-red` and `incomplete base run`, and neither contains `failed --reason "<command> red on base`; `check-issue`'s `Failed `checks` commands always block` sentence carries the known-red exception on the same line; `plan.synthesis` in `skills/plan-issue/SKILL.md` contains `--compare` and a `never|not ... compar` sentence; `docs/guide/phases.md` matches `--compare|known-red`; no file under `skills/` or `docs/guide/` matches `/failed --reason "<command> red on base/`, `/one base run at \`AKROGON_BASE\`/` or `/still ends the pass \`failed\`/`.

## 3. Read-first

- `tests/red-docs.test.ts` — the committed contract.
- `skills/implement-issue/SKILL.md` :38 (the paragraph to replace), :61 and :74 (pointer lines).
- `skills/check-issue/SKILL.md` :59 (blocking sentence), :65 (the paragraph), :85-87 (pointer line).
- `skills/plan-issue/SKILL.md` `## plan.synthesis` section.
- `skills/AREA.md` :27.
- `docs/guide/phases.md` :94 and :102.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list

Owns: the seven files above only. Replace the two long base-red paragraphs (today `implement-issue` :38 and `check-issue` :65) with this wording adapted to each seat — keep the judgment-gate parenthetical, the cwd rule and the incomplete-run stop verbatim:

> During implement end and check.fix, a red test or check with no cause in the leaf's diff (failing output plus `git diff "$AKROGON_BASE"...HEAD` shows no touched file or plausible cause; a judgment gate, never automatic) gets one retry of that same command, args and whole-folder or single-file scope in the corresponding working directory; before retrying, the seat writes one comparison record file per red check under the `leaf=` folder holding the first run, so a replaced session that finds it retries no further, and each record holds at most one retry. The first-run and retry logs go under `<leaf>/implementation/` beside the `base-<id>.log` `base-run` writes. A green retry marks the check `inconsistent` and no base run happens. A red retry runs the command once without the change as `akrogon base-run --base "$AKROGON_BASE" -- <command>` from the matching directory of the leaf worktree (the verb runs a printed `setup` under `git rev-parse --git-path akrogon-install.lock` inside the checkout, writes child output to the `log:` path it prints, and removes the checkout) under the same material conditions as the leaf run, keeping each run's own exit status and terminal result before any reporting pipeline such as `echo`, `grep` or `head`. The record lists command, args, cwd, scope, material conditions, leaf and counterpart revisions, completeness per run, both log paths, and per failing unit its runner or stage, file or suite, full name and outcome on each run with a log reference: `known-red` fails in both with-change runs and without the change with no cause in the diff, `new` passes without the change and `unverified` is missing, crashed, timed out, skipped or unreadable on either side or blocked by a failed setup or build stage. Only `known-red` units let the leaf continue; `new` and `unverified` units keep the existing repair or incomplete-verification path, and a unit of the leaf's own done-criteria is never `known-red` — a wrong expectation there is A's correction under `test-proof-rules`. The seat passes each record on its phase move with repeatable `--compare <file>`; the command validates each record, opens or joins one repo red entry per `known-red` unit, resolves entries whose unit passes on the base run's revision or a descendant, and sends the operator one notice per new entry, with `akrogon status` listing active entries. The base run uses the active harness's longest run mode, and a base run still killed, interrupted or crashed before its terminal result is incomplete: the seat keeps its logs and termination cause and ends with `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot A` with no automatic rerun and no base-defect claim.

For `check-issue` :65 the same paragraph with the lead changed to `During check.review, a red test or check ...` and `--slot <A|B>` on the incomplete stop; the check.review paragraph keeps its `no seat commits during check.review` clause and the wrong-expectation Fix routed to A. `check-issue` :87 becomes `A red test or check with no cause in the leaf's diff takes the same comparison disposition as the check.review paragraph beginning "During check.review, a red test or check".`

`check-issue` :59 — extend the blocking sentence to: `Failed `checks` commands always block unless every failing unit is known-red in a validated comparison record, and scenarios a done-criterion names always block ...` (keep the rest of the sentence intact).

`implement-issue` :61 stays pointing at the rule with the word `base-run` replaced by `comparison`; :74 the same.

`skills/plan-issue/SKILL.md`, in the `## plan.synthesis` section, append one sentence after the `With plan.md written` paragraph: `At plan.synthesis a planned test's intended red is never compared; any other failing check takes the retry/compare/`--compare` rule implement-issue states.` Then adjust so the section carries `--compare` — the sentence above does that.

`skills/AREA.md` :27 — replace `stops with one base run at `AKROGON_BASE`` with `gets one same-command retry, then one `base-run` comparison and a `--compare` record passed to `akrogon phase`; only `known-red` units let the leaf continue`.

`docs/guide/phases.md` :94 — replace from `When a red test or check` with: `When a red test or check has no cause in the leaf's diff, A retries the same command once; a green retry is `inconsistent`, and a red retry runs `akrogon base-run` at `AKROGON_BASE` and the seat records the comparison, passes it as `--compare` on the phase move, and continues only when every failing unit is `known-red` on base, with a wrong expectation in its own criteria corrected by A.`
`:102` — replace its trailing `When a red test or check ...` clause with: `When a red test or check has no cause in the leaf's diff, the reviewing seat retries it once and compares against `AKROGON_BASE`; a test still red on both sides is `known-red` and does not stop the review, while a wrong expectation in the leaf's own criteria becomes a fix routed to A.`

`tests/AREA.md` — add `tests/compare.test.ts` and `tests/red-docs.test.ts` to Key files.

`README.md` — untouched (U2 owns it).

## 5. Do-not

- Do not touch `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, or any merge `--red-on-base`/`hold` text — `known-red-merge` owns them (locked exclusion).
- Do not drop the `incomplete base run` stops; do not reintroduce `failed --reason "<command> red on base <sha>"` anywhere.
- Do not edit code or tests; text-only commits.
- Return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read the three target paragraphs and `tests/red-docs.test.ts`.
2. Edit the files per section 4.
3. `bun test tests/red-docs.test.ts` — all four cases green.
4. Commit as `docs: replace pre-merge base-red stop with comparison record flow` on the detached HEAD.

Advisory size: about 7 files, under 30 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=64f27d0e3c4ae254a6aafd49ea393033dc677606` — `tests/red-docs.test.ts` must go fully green; `tests/compare.test.ts` and `command-reference.test.ts` failures belong to U2.

## 8. Done-when, evidence and report

Fill these lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

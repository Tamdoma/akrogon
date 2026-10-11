# Plan: cheap-check-placement

## Decisions

- D1: The rule lands as prose in the three owned places, one addition each. No new config key, command, check, or section; enforcement stays with the agents that write and review configs, per the locked design.
- D2: `skills/init-akrogon/SKILL.md`, "Inspect and propose" paragraph. After the sentence ending "…replays the exact rejected command:", extend it so the paragraph also says: when proposing `checks` and `merge_checks`, inspect the scripts each proposed merge command runs and place their cheap checks (typecheck, lint, validators and the like) in `checks`, naming an existing cheap group command when the repo has one; a merge command may rerun cheap checks on the integrated candidate but is never the only place they run.
- D3: `docs/guide/setup.md`, the `**merge_checks**` bullet (~line 54). Append: a cheap check never runs only at merge, even when a merge command also runs it — a check cheap enough for the leaf's own checks belongs in `checks`, and a merge command may rerun it on the integrated candidate but is never the only place it runs.
- D4: `skills/check-issue/SKILL.md`, `## check.review`, as a new sentence after the paragraph beginning "Start from the changed behavior": when a leaf's diff changes a script that a `merge_checks` command runs and leaves a cheap check reachable only at merge, it is a Fix when a script edit within the leaf can route that check through a command `checks` already runs, and otherwise an `Operator actions` item naming the config line to add, which gates no done-criterion. This matches the design note: a leaf never changes `issues/config.yaml`, so the operator case is exactly when only a config line can fix placement.
- D5: Criterion 4's by-meaning sweep covers every `skills/` and `docs/` hit for merge-check placement, not only edited lines. Pre-edit sweep found one implying line — the `setup.md` `merge_checks` bullet, fixed by D3 — and no other line permitting a cheap check to run only at merge. Out-of-scope hits the sweep surfaces are listed in the report, per the brief.
- D6: No new committed tests. The standing design resolves this leaf as "skill and doc text only, so there is no code test; proof is the report's quoted edited lines and the by-meaning sweep." Existing suites already cover the only mechanical risks here: `tests/docs-links.test.ts` (broken links across guide and skills) and `tests/red-docs.test.ts` (literal contract tokens, explicit policy "Rule wording is reviewed by the seats, never asserted here"). A prose-assertion test would repeat the retired anti-pattern.
- D7: Parallel leaf plan-not-cap edits the same three files at different lines (`init-akrogon` :26, `setup.md` :60, `check-issue` :93). Overlap does not order this leaf's work; the merge resolves by line.

## Read-first paths

- `skills/init-akrogon/SKILL.md` — "Inspect and propose" paragraph (D2 site).
- `docs/guide/setup.md` — "Repo config" bullets (D3 site).
- `skills/check-issue/SKILL.md` — `## check.review`, the "Start from the changed behavior" paragraph and surrounding verdict rules (D4 site).
- `docs/guide/merge.md` and `skills/AREA.md` — existing merge-check wording the D5 sweep must stay consistent with.

## Needed interfaces

None. Text edits only.

## Checklist

### Wave 1

- U1 — place the rule in the three files.
  - Owns: `skills/init-akrogon/SKILL.md`, `docs/guide/setup.md`, `skills/check-issue/SKILL.md`.
  - Shared test resources: none. Lands first: nothing.
  - Apply D2, D3, D4 verbatim intent; keep each file's existing sentence style and the `check.fix` replay clause untouched.
  - Run the D5 sweep after the edits and record every hit classified in-scope or out-of-scope.

Doc impact: the three owned files are the only affected docs (agent-facing `init-akrogon` and `check-issue`; operator-facing `setup.md`). No `AREA.md` or other guide file changes.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1. init-akrogon tells setup to inspect scripts behind each merge command and place cheap checks in `checks` | `grep -n "merge command runs" skills/init-akrogon/SKILL.md` plus quoting the edited paragraph into `implementation/report.md` | Rule absent or placed outside the propose paragraph | seconds | Any edit to the file |
| 2. setup.md states a cheap check never runs only at merge | `grep -n "never runs only at merge" docs/guide/setup.md` plus the quoted bullet in the report | Missing or weakened statement | seconds | Any edit to the file |
| 3. check-issue tells B the Fix/Operator-actions routing | `grep -n "reachable only at merge" skills/check-issue/SKILL.md` plus the quoted sentence in the report | Missing routing or a `checks`-config Fix that cannot be repaired (C F5) | seconds | Any edit to the file |
| 4. No edited place claims code enforcement; no `skills/` or `docs/` line permits a cheap check only at merge | `grep -rniE "merge_checks|merge check|only at merge" skills/ docs/`, every hit classified in-scope or out-of-scope in the report; confirm no edited line names akrogon code as enforcer | A contradicting line left behind; out-of-scope hits go in the report | minutes | Any edit under `skills/` or `docs/` |
| Repo checks stay green | `checks.format`, `checks.test`, `checks.typecheck`, `checks.test_changed` as printed by `akrogon config` | Broken links (`docs-links`), literal contract regressions (`red-docs`), format/type drift | minutes (test ~110 s) | Any commit on the leaf |

No `merge_checks` or whole-suite requirement beyond the brief. Not a slow-run leaf; no restart boundaries.

## Planned tests

None committed (D6). Synthesis ran all four `checks` commands green on the clean base, so no intended-red exists to record beside criteria; proof is the grep existence checks above, the quoted edited lines, and the classified sweep.

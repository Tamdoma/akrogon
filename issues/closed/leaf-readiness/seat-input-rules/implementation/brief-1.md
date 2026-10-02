# Brief: U1 — skills/plan-issue/SKILL.md

## 1. Goal

Update `skills/plan-issue/SKILL.md` to the leaf's new seat-input rules. Plan decisions D1, D2, D3, D5.

## 2. Numbered acceptance criteria

1. The file states the env rule once, directly beside the Shared-context operator-blocker stop paragraph: `.env`/`.env.*` are never opened, printed, appended to or written by any tool; declared checks and live operations consume values only inside a run process such as `bun --env-file=<holder file> <script>` printing results, never values; presence is checked with the `Missing:` lines of `akrogon status <slug>`, where absent or empty counts as missing.
2. The `plan.synthesis` credential check uses `akrogon status <slug>` `Missing:` lines instead of any `bun -e` / `bun --env-file` one-liner; a `bun --env-file=.env -e` or `bun -e` presence-check one-liner does not appear anywhere in the file. Missing names still produce the same human-only blocker: recorded in `plan.md` with the `add <name>` action, what the value is and where the operator obtains it, ending with the `failed` phase command.
3. The producer-save rule appears once in Shared context: a producer's key is saved only through the operation recorded in `produces[].save` (entry point, inspected revision, non-secret `args`, key `name`, `holder` repo's real file, private `value_source`); the value passes privately, writes the holder repo's real `.env` file and never the worktree link, never returns through seat arguments, output or artifacts, and the new key is revoked when saving fails.
4. The grant-reuse rule appears once in Shared context: a seat reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking again; before mutating it compares operation, target and identity with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule.
5. Every operator-blocker stop sentence in the file (`akrogon phase <slug> failed --reason`) records in the artifact: name or ID, attempted operation, identity reference, error, owner and next action; never a value. Extend the existing stop sentences; do not add a second stop mechanism.
6. No other rules, sections or sentences change. Frontmatter, `plan.positions`, `plan.rebuttal` and the printed footer are untouched except the minimal additions above in Shared context and `plan.synthesis`.

## 3. Read-first list

- `skills/plan-issue/SKILL.md` — the file under edit; existing paragraphs named below are the anchors.
- `skills/implement-issue/ponytail.md` — the seat folder's guidance file (under `skills/implement-issue/`); read it for style only.

Do not open `issues/` artifacts, `design.md`, or `plan.md`; everything needed is in this brief.

## 4. Change list and needed interfaces

Files owned by this unit: `skills/plan-issue/SKILL.md` only.

Anchor text in the current file:

- Shared context env paragraph starts "This seat puts no questions to anyone" then the `.env` paragraph starts "This seat never opens, prints, appends to, or writes `.env`". Replace that `.env` paragraph's presence-check clause ("checking presence by name with such a script printing `present`/`absent` per name") with the `akrogon status <slug>` `Missing:` rule; keep the `bun --env-file` process-consumption clause. Keep it next to the operator-blocker stop paragraph ("When a step physically requires the operator…").
- `plan.synthesis` paragraph "Every credential the design names by variable name is checked by name with `bun --env-file=.env -e 'console.log(...)'` …" — replace the `bun --env-file=.env -e` machinery with: names are checked via `akrogon status <slug>` `Missing:` lines; each name absent there and unobtainable by this seat is the human-only blocker already described (recorded in `plan.md` with the `add <VAR>` action, what the value is, where the operator obtains it), ending with the same `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see plan.md>" --slot A`.
- Add the producer-save and grant-reuse rules (criteria 3 and 4) as their own sentences in Shared context, beside the env rule.
- Extend the operator-blocker stop sentence(s) with the artifact fields from criterion 5.

Interfaces: `akrogon status <slug>` prints `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` per absent input. `readiness.yaml` fields named in rules: `produces[].save`, `grants[]`.

## 5. Do-not, reasons and exceptions

- Do not write any file other than `skills/plan-issue/SKILL.md`; other skills belong to sibling units.
- Do not paraphrase away required field names (`produces[].save`, `grants[]`, `Missing:`); review compares sentences against the binding design.
- Do not keep any `bun -e` presence one-liner; that mechanism is removed by the locked design.
- Do not add test files; prose skill text has no tests by repo convention.
- If an anchor paragraph differs enough that the change cannot be made cleanly, return a mismatch naming the paragraph instead of restructuring.
- Restating: return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief authorizing it.

## 6. Ordered steps

1. Read `skills/plan-issue/SKILL.md` fully. (all criteria)
2. Apply the Shared-context edits: env rule (criterion 1), producer-save (3), grant-reuse (4), blocker artifact fields (5).
3. Apply the `plan.synthesis` credential-check replacement (criterion 2).
4. Verify: `grep -n 'env-file=.env -e\|bun -e' skills/plan-issue/SKILL.md` prints nothing for a presence check; `grep -n 'akrogon status\|produces\[\].save\|grants\[\]' skills/plan-issue/SKILL.md` shows the new lines. Re-read the file top to bottom once for coherence.
5. Commit only this file with a message naming the unit, e.g. `docs: take seat-input rules in plan-issue`.

Advisory size: 1 file, under 10 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408`. Run `bun install` once first if `node_modules` is absent. A markdown-only diff may run zero tests; that result is acceptable and must be reported.

## 8. Done-when, evidence and report

Done when all six criteria hold in the committed file, verified by the grep/read checks in step 4, and the changed-test command has been run with its output pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

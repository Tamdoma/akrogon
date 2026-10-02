# Brief: U3 — skills/check-issue/SKILL.md + skills/merge-issue/SKILL.md

## 1. Goal

Update `skills/check-issue/SKILL.md` and `skills/merge-issue/SKILL.md` to the leaf's new seat-input rules. Plan decisions D1, D3, D4, D5.

## 2. Numbered acceptance criteria

1. Each file states the env rule once in Shared context: the seat never opens, prints, appends to or writes `.env`/`.env.*` with any tool; declared checks and live operations consume values only inside a run process such as `bun --env-file=<holder file> <script>` printing results, never values; presence is checked with the `Missing:` lines of `akrogon status <slug>`, where absent or empty counts as missing. In each file replace only the presence-check clause of the existing env paragraph (it currently ends "…checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent").
2. In merge-issue, the `.env.example` exception clause ("except that configured merge checks may read the committed non-secret template `.env.example`") stays verbatim — remove nothing.
3. The grant-reuse rule appears once in each file's Shared context: a seat reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking again; before mutating it compares operation, target and identity with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule.
4. The fixture-cleanup rule appears once in each file's Shared context: proof fixtures are cleaned up on success and failure with the cleanup identities in `grants[].fixtures[].cleanup`; absence is proven by `absence_check`, an authenticated read-back, never by a delete reply; leftovers are a blocker recorded with IDs, error, owner and next step; resources in `retained[]` are labelled apart from still-to-delete ones.
5. Each file's operator-blocker stop sentence records in the artifact: name or ID, attempted operation, identity reference, error, owner and next action; never a value. Extend existing stop sentences; add no second stop mechanism.
6. check-issue's `check.repair` routing is byte-identical: the sentences "B repairs every Fix except plan or design changes, missing planned units, required live runs, and work B judges too large for its pass. Each of those goes under a `Handed to A` heading…" and the surrounding paragraph are not touched.
7. No other rules or sentences change. Frontmatter, review verdict rules, base-run rules, footers untouched.

## 3. Read-first list

- `skills/check-issue/SKILL.md` — under edit.
- `skills/merge-issue/SKILL.md` — under edit.
- `skills/implement-issue/ponytail.md` — style guidance only.

Do not open `issues/` artifacts, `design.md`, or `plan.md`; everything needed is in this brief.

## 4. Change list and needed interfaces

Files owned by this unit: `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`.

Anchors:

- check-issue Shared context: paragraph starting "Each review seat never opens, prints, appends to, or writes `.env`".
- merge-issue Shared context: paragraph starting "The merge seat never opens, prints, appends to, or writes `.env`" — this one contains the `.env.example` exception clause that stays verbatim.
- Both: the operator stop paragraph in Shared context ("When a step physically requires the operator…") is where the artifact fields extend (criterion 5), and the new grant-reuse/fixture-cleanup sentences go beside the env paragraph.

Interfaces: `akrogon status <slug>` prints `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` per absent input. `readiness.yaml` fields named in rules: `grants[]`, `grants[].fixtures[].cleanup`, `absence_check`, `retained[]`.

## 5. Do-not, reasons and exceptions

- Do not write any file other than the two SKILL.md files.
- Do not touch the `check.repair` "Handed to A" routing text in check-issue (criterion 3 of the leaf brief locks it).
- Do not paraphrase away required field names (`grants[]`, `fixtures[].cleanup`, `absence_check`, `retained[]`, `Missing:`).
- Do not add test files; prose skill text has no tests by repo convention.
- If an anchor paragraph differs enough that the change cannot be made cleanly, return a mismatch naming the paragraph instead of restructuring.
- Restating: return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief authorizing it.

## 6. Ordered steps

1. Read both files fully.
2. Apply check-issue edits: env clause (1), grant-reuse (3), fixture-cleanup (4), stop fields (5); leave `check.repair` routing untouched (6).
3. Apply merge-issue edits: env clause keeping `.env.example` (1, 2), grant-reuse (3), fixture-cleanup (4), stop fields (5).
4. Verify: `grep -n 'akrogon status\|absence_check\|retained\|grants\[\]' skills/check-issue/SKILL.md skills/merge-issue/SKILL.md`; `grep -n 'present`/`absent'` on both files prints nothing; `grep -n 'required live runs' skills/check-issue/SKILL.md` still shows the routing sentence.
5. Commit both files in one commit, message e.g. `docs: take seat-input rules in check-issue and merge-issue`.

Advisory size: 2 files, under 14 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408`. Run `bun install` once first if `node_modules` is absent. A markdown-only diff may run zero tests; report that.

## 8. Done-when, evidence and report

Done when all seven criteria hold in the committed files, verified by the checks in step 4, and the changed-test command has been run with output pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

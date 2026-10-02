# Brief: U2 — skills/implement-issue/SKILL.md

## 1. Goal

Update `skills/implement-issue/SKILL.md` to the leaf's new seat-input rules. Plan decisions D1, D2, D3, D5.

## 2. Numbered acceptance criteria

1. The file states the env rule once in Shared context: `A never opens, prints, appends to, or writes` `.env`/`.env.*` with any tool; declared checks and live operations consume values only inside a run process such as `bun --env-file=<holder file> <script>` printing results, never values; presence is checked with the `Missing:` lines of `akrogon status <slug>`, where absent or empty counts as missing. Replace only the presence-check clause of the existing paragraph (it currently ends "…checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent"); keep the paragraph's tool ban and `bun --env-file` consumption clauses.
2. The producer-save rule appears once in Shared context: a producer's key is saved only through the operation recorded in `produces[].save` (entry point, inspected revision, non-secret `args`, key `name`, `holder` repo's real file, private `value_source`); the value passes privately, writes the holder repo's real `.env` file and never the worktree link, never returns through seat arguments, output or artifacts, and the new key is revoked when saving fails.
3. The grant-reuse rule appears once in Shared context: a seat reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking again; before mutating it compares operation, target and identity with the grant, records the grant reference, results and created IDs in its pass artifact, never widens it, and treats anything outside it as an operator blocker under the stop rule.
4. The `## implement` paragraph "A credential still absent from `.env` at implement is never requested as a pasted value…" keeps its `add <VAR> to .env` operator action, its `report.md` recording and its `failed` exit, but the absence source becomes the leaf's `Missing:` lines from `akrogon status <slug>` rather than implying a direct `.env` read. Minimal edit to that paragraph.
5. Every operator-blocker stop sentence in the file records in the artifact: name or ID, attempted operation, identity reference, error, owner and next action; never a value. Extend the existing stop sentences (Shared context stop and the implement/check.fix stop variants); do not add a second stop mechanism.
6. No other rules, sections or sentences change. Proof order, base-run rule, wave/delegation rules, standalone section and footer are untouched.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` — the file under edit.
- `skills/implement-issue/ponytail.md` — style guidance only.

Do not open `issues/` artifacts, `design.md`, or `plan.md`; everything needed is in this brief.

## 4. Change list and needed interfaces

Files owned by this unit: `skills/implement-issue/SKILL.md` only.

Anchors:

- Shared context paragraph starting "A never opens, prints, appends to, or writes `.env`" — replace per criteria 1–3 (env clause replacement, then producer-save and grant-reuse sentences added beside it).
- `## implement` paragraph starting "A credential still absent from `.env`" — edit per criterion 4.
- Stop sentences: the Shared context sentence running `akrogon phase <slug> failed --reason "<blocker plus artifact>" --slot A`, and the two `## implement`/`## check.fix` variants (`"<criterion> red: <cause>"`, the naming-a-locked-decision one). Extend each with the artifact fields from criterion 5 where a blocker artifact is written — one extension covering the shared phrasing is enough; don't duplicate identical field lists three times.

Interfaces: `akrogon status <slug>` prints `Missing: <repo>/<slug> <kind> <name> in <holder>: <steps>` per absent input. `readiness.yaml` fields named in rules: `produces[].save`, `grants[]`.

## 5. Do-not, reasons and exceptions

- Do not write any file other than `skills/implement-issue/SKILL.md`.
- Do not paraphrase away required field names (`produces[].save`, `grants[]`, `Missing:`); review compares sentences against the binding design.
- Do not remove the `bun --env-file` consumption clause; it is the allowed route.
- Do not add test files; prose skill text has no tests by repo convention.
- If an anchor paragraph differs enough that the change cannot be made cleanly, return a mismatch naming the paragraph instead of restructuring.
- Restating: return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief authorizing it.

## 6. Ordered steps

1. Read `skills/implement-issue/SKILL.md` fully.
2. Apply the Shared-context edits (criteria 1–3) and the stop-field extensions (criterion 5).
3. Apply the `## implement` credential paragraph edit (criterion 4).
4. Verify: `grep -n 'akrogon status\|produces\[\].save\|grants\[\]' skills/implement-issue/SKILL.md` shows the new lines; `grep -n 'present`/`absent`' skills/implement-issue/SKILL.md` prints nothing. Re-read the file once for coherence.
5. Commit only this file, message e.g. `docs: take seat-input rules in implement-issue`.

Advisory size: 1 file, under 10 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=7c1567dbed492608e8cc104999c401b85d6db408`. Run `bun install` once first if `node_modules` is absent. A markdown-only diff may run zero tests; report that.

## 8. Done-when, evidence and report

Done when all six criteria hold in the committed file, verified by the checks in step 4, and the changed-test command has been run with output pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

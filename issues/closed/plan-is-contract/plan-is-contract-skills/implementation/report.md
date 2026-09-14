# Report: plan-is-contract-skills

## Changed files and reasons

- `skills/implement-issue/SKILL.md` — description names eight-section worker sub-briefs; leaf read list uses `plan.md`/`design.md`; implement step appends conditional dated `## Implementation notes` then delegates one sub-brief per unit or runs inline; report step commits code then writes `implementation/report.md` with the five contents; check.fix revises plan notes and affected sub-briefs and appends repair commits to `report.md`.
- `skills/implement-issue/brief-template.md` — read-when clause covers worker sub-briefs and standalone task briefs; opening rule makes `plan.md` the leaf contract with per-unit `implementation/brief-N.md` files; eight sections and four fill-in lines unchanged.
- `skills/check-issue/SKILL.md` — read list names `plan.md` including implementation notes, `design.md`, `implementation/report.md` and ponytail; judgment sentence names the plan's decisions, criteria, change list and checklist, the design's exclusions, the report and live contracts.
- `skills/merge-issue/SKILL.md` — shared context reads `implementation/report.md`.
- `skills/AREA.md` — template gives the eight-section worker sub-brief.
- `docs/guide/phases.html` — implement entry writes `implementation/report.md`.
- `docs/guide/files.html` — file table row names `implementation/report.md`.

Delegated as one unit (`implementation/brief-1.md`) per plan D5; worker return folded in above.

## Commands run

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427` (worker):

```text
bun test v1.4.0 (34cbb9a40)
--changed: 7 changed files, but no test files are affected

 0 pass
 0 fail
Ran 0 tests across 0 files. [7.00ms]
```

`bun test` (B, full suite): 223 pass, 0 fail, 2913 expect() calls across 12 files.

`bun run typecheck` (B): `tsc --noEmit`, clean.

`bun run format` (B): all files unchanged, exit 0.

Verification artifact (criterion 9): `bash -o pipefail -c 'grep -rn "implementation/brief.md\|implementation/report.md" skills/ docs/guide/ 2>&1 | tee /tmp/akrogon-plan-is-contract-skills-grep.log'` exited 0. `implementation/brief.md` appears only at `skills/implement-issue/SKILL.md:55` (the standalone sentence); `implementation/report.md` appears in all five required files. Log: `/tmp/akrogon-plan-is-contract-skills-grep.log`.

## Base and committed head

- Base (`AKROGON_BASE`): `26a7bc2613af4a2c9d579351bc66e87cd1af1427`
- Committed head: `76c04115427c351bc280c8cf64a12186f65eb298` on branch `plan-is-contract-skills`

## Known limitations

The grep artifact proves file contents, not that a future agent follows the new contract; that judgment belongs to check.review reading the changed sections as a fresh implementer.

## Unverified criteria

None. Criterion 8 ran as the blocking checks above; all other criteria are verified by the grep artifact and the diff.

# Implementation report: lifecycle-rules-source

Base: 81c6bc8338846fb397c55fd46988bcd03d945573. Initial implementation head: e8eaaf8d30aacbfc1fab78132a88d49fa20f9f66. Current repair head is recorded in the check.repair entry below.
Refresh at pass start: prior base c3e368c7, prior head cb402fdb → rebased onto origin/main as c49650bb; no conflicts. Second refresh at implement end: already up to date.

## Changed files and reasons

- `skills/lifecycle-rules.md` (new): the four families stated once — grant reuse and count lines, `.env` and producer key save (named for plan-issue and implement-issue seats), kept command output, the red-check judgment with each seat's command form and scope named. No relative links.
- `skills/{plan,implement,check,merge}-issue/lifecycle-rules.md` (new, git links mode 120000 → `../lifecycle-rules.md`).
- `skills/plan-issue/SKILL.md`: grant/`.env`/producer paragraphs replaced by the link block naming `plan.md` as record file; the shorter `plan.synthesis` command-output copy removed; its pointer now names `lifecycle-rules.md`.
- `skills/implement-issue/SKILL.md`: opening sentence fixed to name the conditional reads (criterion 4); the three end-of-context family paragraphs removed; the mid-file red paragraph now names the shared file with A's forms; link block names `implementation/report.md`, `akrogon verify --known-red`, the `gh`-filing clause, the excerpt clause and the standalone exception.
- `skills/check-issue/SKILL.md`: command-output/`.env`/grant paragraphs replaced by the link block naming `review-<slot>.md`, no covered operation in check.review, excerpt clause, setup flock and fixture cleanup; `check.review`'s red paragraph becomes a stub keeping its opening words and the `merge_checks` refusal (check.repair's borrow resolves unchanged — plan note).
- `skills/merge-issue/SKILL.md`: command-output/`.env`/grant paragraphs replaced by the link block naming `review-B.md`, the `.env.example` exception, `akrogon verify --attempt <id>`/`--known-red`, excerpt clause, fixture cleanup; `### Shared endings`' red paragraph now names the shared file plus merge's endings.
- `tests/docs-links.test.ts`: `seat skills name the known-red command` reads `lifecycle-rules.md` and `merge-issue/SKILL.md` (criterion 6).
- `tests/run-units.test.ts`: `skills name the run-check keeping rule…` reads `lifecycle-rules.md` plus the two worker-facing files (worker copies stay local by design).
- `docs/reference/checks.md`: the two "seat rule" sentences now name `lifecycle-rules.md` first, keeping skill links for seat parts.
- `skills/AREA.md`: Key files gains `skills/lifecycle-rules.md`; the `.env` and retry bullets link it.

## Clause table (old place → new place → seats)

This trace compares base `81c6bc8338846fb397c55fd46988bcd03d945573` with the repaired branch. Every row is one semantic clause from one old copy. Repeated clause IDs identify the same meaning in different old copies, not a merged evidence row. Source references below are base-revision paths and line numbers. Destination references are repository paths and line numbers at the repaired head. The shared paragraph and the local line together supply the rule, record file, command form and ownership. G8/G12 name each copy's record-file substitution. K7 excludes plan. E6 is merge-only. P rows exclude check/merge. S rows retain the fixture/setup/launch restrictions.

For applicability, local standalone/direct overrides remain authoritative: ordinary standalone implement excludes registered command-output capture and leaf/config/state reads; direct implement uses <chart>/direct/plan.md and report.md with --holder <chart>/direct. Direct check writes out= and uses the chart holder, not a leaf review file. Those route overrides are unchanged from the base. Check repair borrows the review retry disposition, so its judging seat remains B. Plan's pointer inherits A-owned implement judgment, not B-owned check judgment.

| Clause from this old copy | Old place at base | New place | Seats holding it |
|---|---|---|---|
| G1. Reuse grants only for covered operations within bounds | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G2. Before every covered operation, including paid model launches, compare operation, target, identity and bounds | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G3. Record the grant reference, results and created IDs in the pass artifact | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G4. Never widen a grant; an uncovered operation takes the operator-blocker stop | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G5. Every covered launch uses akrogon run-check | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G6. Reaching the paid/live stage consumes the bound unit regardless of outcome or bound wording | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G7. Known-good does not narrow a bound | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G8. Before each launch record the grant entry, bound, count so far and unit in the seat record file | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` + `skills/plan-issue/SKILL.md:31` (`plan.md`) | A, plan.synthesis |
| G9. After each launch complete its line with outcome, IDs, sessions and cost when known | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G10. Before the first launch read prior count lines from the leaf artifacts | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G11. Unestablished prior use is unknown, never a fabricated number | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G12. Past a paid repeat-count bound, warn in the record file and visible reply, then continue | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` + `skills/plan-issue/SKILL.md:31` (`plan.md`) | A, plan.synthesis |
| G13. Live-change repeat bounds, spend caps, operation, target, identity, effects, expiry and stop_line keep their stop | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G14. A stop-type bound wins when both warning and stop apply | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G15. Unknown prior use warns for a repeat-count bound | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G16. Unknown prior use that prevents establishing a stop-type bound takes the operator-blocker stop | `skills/plan-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A, plan.synthesis |
| G1. Reuse grants only for covered operations within bounds | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G2. Before every covered operation, including paid model launches, compare operation, target, identity and bounds | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G3. Record the grant reference, results and created IDs in the pass artifact | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G4. Never widen a grant; an uncovered operation takes the operator-blocker stop | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G5. Every covered launch uses akrogon run-check | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G6. Reaching the paid/live stage consumes the bound unit regardless of outcome or bound wording | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G7. Known-good does not narrow a bound | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G8. Before each launch record the grant entry, bound, count so far and unit in the seat record file | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` + `skills/implement-issue/SKILL.md:27` (`implementation/report.md`) | A, implement/check.fix; standalone/direct under their local exceptions |
| G9. After each launch complete its line with outcome, IDs, sessions and cost when known | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G10. Before the first launch read prior count lines from the leaf artifacts | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G11. Unestablished prior use is unknown, never a fabricated number | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G12. Past a paid repeat-count bound, warn in the record file and visible reply, then continue | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` + `skills/implement-issue/SKILL.md:27` (`implementation/report.md`) | A, implement/check.fix; standalone/direct under their local exceptions |
| G13. Live-change repeat bounds, spend caps, operation, target, identity, effects, expiry and stop_line keep their stop | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G14. A stop-type bound wins when both warning and stop apply | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G15. Unknown prior use warns for a repeat-count bound | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G16. Unknown prior use that prevents establishing a stop-type bound takes the operator-blocker stop | `skills/implement-issue/SKILL.md:54` | `skills/lifecycle-rules.md:7` | A, implement/check.fix; standalone/direct under their local exceptions |
| G1. Reuse grants only for covered operations within bounds | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G2. Before every covered operation, including paid model launches, compare operation, target, identity and bounds | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G3. Record the grant reference, results and created IDs in the pass artifact | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G4. Never widen a grant; an uncovered operation takes the operator-blocker stop | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G5. Every covered launch uses akrogon run-check | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G6. Reaching the paid/live stage consumes the bound unit regardless of outcome or bound wording | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G7. Known-good does not narrow a bound | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G8. Before each launch record the grant entry, bound, count so far and unit in the seat record file | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` + `skills/check-issue/SKILL.md:20` (`review-<slot>.md`) | A/B, check.review; B, check.repair/direct review |
| G9. After each launch complete its line with outcome, IDs, sessions and cost when known | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G10. Before the first launch read prior count lines from the leaf artifacts | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G11. Unestablished prior use is unknown, never a fabricated number | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G12. Past a paid repeat-count bound, warn in the record file and visible reply, then continue | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` + `skills/check-issue/SKILL.md:20` (`review-<slot>.md`) | A/B, check.review; B, check.repair/direct review |
| G13. Live-change repeat bounds, spend caps, operation, target, identity, effects, expiry and stop_line keep their stop | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G14. A stop-type bound wins when both warning and stop apply | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G15. Unknown prior use warns for a repeat-count bound | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G16. Unknown prior use that prevents establishing a stop-type bound takes the operator-blocker stop | `skills/check-issue/SKILL.md:35` | `skills/lifecycle-rules.md:7` | A/B, check.review; B, check.repair/direct review |
| G1. Reuse grants only for covered operations within bounds | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G2. Before every covered operation, including paid model launches, compare operation, target, identity and bounds | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G3. Record the grant reference, results and created IDs in the pass artifact | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G4. Never widen a grant; an uncovered operation takes the operator-blocker stop | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G5. Every covered launch uses akrogon run-check | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G6. Reaching the paid/live stage consumes the bound unit regardless of outcome or bound wording | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G7. Known-good does not narrow a bound | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G8. Before each launch record the grant entry, bound, count so far and unit in the seat record file | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` + `skills/merge-issue/SKILL.md:20` (`review-B.md`) | B, merge |
| G9. After each launch complete its line with outcome, IDs, sessions and cost when known | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G10. Before the first launch read prior count lines from the leaf artifacts | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G11. Unestablished prior use is unknown, never a fabricated number | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G12. Past a paid repeat-count bound, warn in the record file and visible reply, then continue | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` + `skills/merge-issue/SKILL.md:20` (`review-B.md`) | B, merge |
| G13. Live-change repeat bounds, spend caps, operation, target, identity, effects, expiry and stop_line keep their stop | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G14. A stop-type bound wins when both warning and stop apply | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G15. Unknown prior use warns for a repeat-count bound | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| G16. Unknown prior use that prevents establishing a stop-type bound takes the operator-blocker stop | `skills/merge-issue/SKILL.md:33` | `skills/lifecycle-rules.md:7` | B, merge |
| E1. Never open, print, append to or write .env or .env.* with any tool | `skills/plan-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | A, plan.synthesis |
| E2. Consume needed values only in a run process such as bun --env-file=<file> <script>, printing results and never values | `skills/plan-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | A, plan.synthesis |
| E3. Check presence through Missing: lines of akrogon status <slug> | `skills/plan-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | A, plan.synthesis |
| E4. Both absent and empty values count as missing | `skills/plan-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | A, plan.synthesis |
| E5. A missing required value ends the pass through the seat operator-blocker stop | `skills/plan-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | A, plan.synthesis |
| E1. Never open, print, append to or write .env or .env.* with any tool | `skills/implement-issue/SKILL.md:50` | `skills/lifecycle-rules.md:11` | A, implement/check.fix; standalone/direct under their local exceptions |
| E2. Consume needed values only in a run process such as bun --env-file=<file> <script>, printing results and never values | `skills/implement-issue/SKILL.md:50` | `skills/lifecycle-rules.md:11` | A, implement/check.fix; standalone/direct under their local exceptions |
| E3. Check presence through Missing: lines of akrogon status <slug> | `skills/implement-issue/SKILL.md:50` | `skills/lifecycle-rules.md:11` | A, implement/check.fix; standalone/direct under their local exceptions |
| E4. Both absent and empty values count as missing | `skills/implement-issue/SKILL.md:50` | `skills/lifecycle-rules.md:11` | A, implement/check.fix; standalone/direct under their local exceptions |
| E5. A missing required value ends the pass through the seat operator-blocker stop | `skills/implement-issue/SKILL.md:50` | `skills/lifecycle-rules.md:11` | A, implement/check.fix; standalone/direct under their local exceptions |
| E1. Never open, print, append to or write .env or .env.* with any tool | `skills/check-issue/SKILL.md:33` | `skills/lifecycle-rules.md:11` | A/B, check.review; B, check.repair/direct review |
| E2. Consume needed values only in a run process such as bun --env-file=<file> <script>, printing results and never values | `skills/check-issue/SKILL.md:33` | `skills/lifecycle-rules.md:11` | A/B, check.review; B, check.repair/direct review |
| E3. Check presence through Missing: lines of akrogon status <slug> | `skills/check-issue/SKILL.md:33` | `skills/lifecycle-rules.md:11` | A/B, check.review; B, check.repair/direct review |
| E4. Both absent and empty values count as missing | `skills/check-issue/SKILL.md:33` | `skills/lifecycle-rules.md:11` | A/B, check.review; B, check.repair/direct review |
| E5. A missing required value ends the pass through the seat operator-blocker stop | `skills/check-issue/SKILL.md:33` | `skills/lifecycle-rules.md:11` | A/B, check.review; B, check.repair/direct review |
| E1. Never open, print, append to or write .env or .env.* with any tool | `skills/merge-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | B, merge |
| E2. Consume needed values only in a run process such as bun --env-file=<file> <script>, printing results and never values | `skills/merge-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | B, merge |
| E3. Check presence through Missing: lines of akrogon status <slug> | `skills/merge-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | B, merge |
| E4. Both absent and empty values count as missing | `skills/merge-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | B, merge |
| E5. A missing required value ends the pass through the seat operator-blocker stop | `skills/merge-issue/SKILL.md:31` | `skills/lifecycle-rules.md:11` | B, merge |
| E6. Configured merge checks may read the committed non-secret .env.example template | `skills/merge-issue/SKILL.md:31` | `skills/merge-issue/SKILL.md:20` | B, merge only; no shared duplicate |
| P1. Save a producer key only through the operation recorded in produces[].save | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P2. The save record names the entry point and inspected revision | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P3. The save record holds non-secret args and the key name | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P4. The save record names the holder repo real file and private value_source | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P5. The value passes privately to the save operation | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P6. Write the holder repo real .env, never the worktree .env | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P7. The value never returns through seat arguments, output or artifacts | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P8. Revoke the new key if saving fails | `skills/plan-issue/SKILL.md:33` | `skills/lifecycle-rules.md:13` | A, plan.synthesis; producer-save rule excluded from check/merge |
| P1. Save a producer key only through the operation recorded in produces[].save | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| P2. The save record names the entry point and inspected revision | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| P3. The save record holds non-secret args and the key name | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| P4. The save record names the holder repo real file and private value_source | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| P5. The value passes privately to the save operation | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| P6. Write the holder repo real .env, never the worktree .env | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| P7. The value never returns through seat arguments, output or artifacts | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| P8. Revoke the new key if saving fails | `skills/implement-issue/SKILL.md:52` | `skills/lifecycle-rules.md:13` | A, implement/check.fix; standalone/direct under their local exceptions; producer-save rule excluded from check/merge |
| K1. Keep command output only through akrogon run-check --name <label> -- <cmd> | `skills/plan-issue/SKILL.md:57` | `skills/lifecycle-rules.md:17` | A, plan.synthesis |
| K2. Cite the stderr check <label>: <exit> <path> line | `skills/plan-issue/SKILL.md:57` | `skills/lifecycle-rules.md:17` | A, plan.synthesis |
| K3. Read a cited log with akrogon log <path> | `skills/plan-issue/SKILL.md:57` | `skills/lifecycle-rules.md:17` | A, plan.synthesis |
| K4. Exempt the printed checks commands and akrogon verify, which already retain logs | `skills/plan-issue/SKILL.md:57` | `skills/lifecycle-rules.md:17` | A, plan.synthesis |
| K5. Exempt akrogon phase ... merged, which moves its owner | `skills/plan-issue/SKILL.md:57` | `skills/lifecycle-rules.md:17` | A, plan.synthesis |
| K6. Exempt coordination fetch/push; quote their errors as text in the report | `skills/plan-issue/SKILL.md:57` | `skills/lifecycle-rules.md:17` | A, plan.synthesis |
| K1. Keep command output only through akrogon run-check --name <label> -- <cmd> | `skills/implement-issue/SKILL.md:27` | `skills/lifecycle-rules.md:17` | A, implement/check.fix; standalone/direct under their local exceptions |
| K2. Cite the stderr check <label>: <exit> <path> line | `skills/implement-issue/SKILL.md:27` | `skills/lifecycle-rules.md:17` | A, implement/check.fix; standalone/direct under their local exceptions |
| K3. Read a cited log with akrogon log <path> | `skills/implement-issue/SKILL.md:27` | `skills/lifecycle-rules.md:17` | A, implement/check.fix; standalone/direct under their local exceptions |
| K4. Exempt the printed checks commands and akrogon verify, which already retain logs | `skills/implement-issue/SKILL.md:27` | `skills/lifecycle-rules.md:17` | A, implement/check.fix; standalone/direct under their local exceptions |
| K5. Exempt akrogon phase ... merged, which moves its owner | `skills/implement-issue/SKILL.md:27` | `skills/lifecycle-rules.md:17` | A, implement/check.fix; standalone/direct under their local exceptions |
| K6. Exempt coordination fetch/push; quote their errors as text in the report | `skills/implement-issue/SKILL.md:27` | `skills/lifecycle-rules.md:17` | A, implement/check.fix; standalone/direct under their local exceptions |
| K7. Paste at most a short excerpt into Markdown | `skills/implement-issue/SKILL.md:27` | `skills/implement-issue/SKILL.md:27` | A, implement/check.fix; standalone/direct under their local exceptions; plan does not hold this duty |
| K1. Keep command output only through akrogon run-check --name <label> -- <cmd> | `skills/check-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | A/B, check.review; B, check.repair/direct review |
| K2. Cite the stderr check <label>: <exit> <path> line | `skills/check-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | A/B, check.review; B, check.repair/direct review |
| K3. Read a cited log with akrogon log <path> | `skills/check-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | A/B, check.review; B, check.repair/direct review |
| K4. Exempt the printed checks commands and akrogon verify, which already retain logs | `skills/check-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | A/B, check.review; B, check.repair/direct review |
| K5. Exempt akrogon phase ... merged, which moves its owner | `skills/check-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | A/B, check.review; B, check.repair/direct review |
| K6. Exempt coordination fetch/push; quote their errors as text in the report | `skills/check-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | A/B, check.review; B, check.repair/direct review |
| K7. Paste at most a short excerpt into Markdown | `skills/check-issue/SKILL.md:20` | `skills/check-issue/SKILL.md:20` | A/B, check.review; B, check.repair/direct review; plan does not hold this duty |
| K1. Keep command output only through akrogon run-check --name <label> -- <cmd> | `skills/merge-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | B, merge |
| K2. Cite the stderr check <label>: <exit> <path> line | `skills/merge-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | B, merge |
| K3. Read a cited log with akrogon log <path> | `skills/merge-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | B, merge |
| K4. Exempt the printed checks commands and akrogon verify, which already retain logs | `skills/merge-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | B, merge |
| K5. Exempt akrogon phase ... merged, which moves its owner | `skills/merge-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | B, merge |
| K6. Exempt coordination fetch/push; quote their errors as text in the report | `skills/merge-issue/SKILL.md:20` | `skills/lifecycle-rules.md:17` | B, merge |
| K7. Paste at most a short excerpt into Markdown | `skills/merge-issue/SKILL.md:20` | `skills/merge-issue/SKILL.md:20` | B, merge; plan does not hold this duty |
| K8. Standalone implement has no registered repo and is outside the command-output keeping rule | `skills/implement-issue/SKILL.md:27` | `skills/implement-issue/SKILL.md:27` | A, ordinary standalone implement; direct retains its explicit holder override |
| R1. Apply retry/known-red handling to a red with no cause in the leaf diff after judging the cause | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R2. Retry once, preserving the command, arguments, scope and working directory; plan/implement/check use run-check | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` + `skills/implement-issue/SKILL.md:40` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R3. For run-check retries preserve the command exit before reporting pipelines | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R4. A green retry is inconsistent and records both kept logs | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R5. A red retry keeps the repair/blocking path until known-red clears it | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R6. Run the seat known-red command on the same head (committed head for implement/check.fix) | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` + `skills/implement-issue/SKILL.md:40` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R7. Known-red reruns the head when no completed red head run exists | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R8. Compare at the head merge-base with the tracked default branch | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R9. Skip a whole-green base tree and judge fail because green base cannot cover red head | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R10. The designated judgment owner reads head/base logs for runner completeness and causal fit | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A in implement/check.fix; A in plan via its retry pointer |
| R11. Named-test evidence must show a real failed test name also failing on the base | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R12. Nameless evidence needs nameless logs on both sides read whole, with no extra head failure, judged in substance | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A in implement/check.fix; A in plan via its retry pointer |
| R13. Nameless evidence must end by its own verdict, never killed, timed out or crashed | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R14. Nameless evidence must have no plausible cause in the leaf diff | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R15. Ordinary errors, missing inputs and load diagnostics are not excluded merely for naming no tests | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R16. If the logs cannot establish a cause, the designated judgment owner withholds agreement and blocking applies | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A in implement/check.fix; A in plan via its retry pointer |
| R17. The leaf own done-criteria must pass independently; a cover never substitutes | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R18. A blocked receipt entry did not run; fix its named blocker first | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R19. Exception: a named/nameless blocker covered by an agreed known-red judgment | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R20. Under that exception record blocked as not run, never passing, and do not independently block on it | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R21. A blocked criterion proof cannot show its result and still stops the leaf | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R22. Neither the seat nor known-red runs blocked commands | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R23. Known-red exit 0 counts only with judgment agreement recorded beside the logs | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R24. A failing exit or disagreeing judgment takes the seat repair/blocking ending | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R25. Agreement for a configured command requires base-red filing | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R26. For a command outside checks, an owned completed same-command base run failing the same tests requires filing | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R27. File through seed-issue Lifecycle filing within this pass | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R28. Record the created/found URL or failing filing command and error in the seat record | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R29. Do not file green inconsistent retries, disagreeing judgments, killed bases or incomplete bases as base reds | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R30. Filing changes no verification status, so a red criterion remains blocking | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions; plan A inherits the retry rule through its pointer, excluding intended reds |
| R1. Apply retry/known-red handling to a red with no cause in the leaf diff after judging the cause | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R2. Retry once, preserving the command, arguments, scope and working directory; plan/implement/check use run-check | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` + `skills/check-issue/SKILL.md:65` | A/B, check.review; B, check.repair/direct review |
| R3. For run-check retries preserve the command exit before reporting pipelines | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R4. A green retry is inconsistent and records both kept logs | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R5. A red retry keeps the repair/blocking path until known-red clears it | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R6. Run the seat known-red command on the same head (committed head for implement/check.fix) | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` + `skills/check-issue/SKILL.md:65` | A/B, check.review; B, check.repair/direct review |
| R7. Known-red reruns the head when no completed red head run exists | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R8. Compare at the head merge-base with the tracked default branch | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R9. Skip a whole-green base tree and judge fail because green base cannot cover red head | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R10. The designated judgment owner reads head/base logs for runner completeness and causal fit | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` + `skills/check-issue/SKILL.md:65`; judging-seat definition at `skills/lifecycle-rules.md:21` | B only for head/base log judgment in review/repair/direct; A gains no judgment duty |
| R11. Named-test evidence must show a real failed test name also failing on the base | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R12. Nameless evidence needs nameless logs on both sides read whole, with no extra head failure, judged in substance | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` + `skills/check-issue/SKILL.md:65`; judging-seat definition at `skills/lifecycle-rules.md:21` | B only for head/base log judgment in review/repair/direct; A gains no judgment duty |
| R13. Nameless evidence must end by its own verdict, never killed, timed out or crashed | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R14. Nameless evidence must have no plausible cause in the leaf diff | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R15. Ordinary errors, missing inputs and load diagnostics are not excluded merely for naming no tests | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R16. If the logs cannot establish a cause, the designated judgment owner withholds agreement and blocking applies | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` + `skills/check-issue/SKILL.md:65`; judging-seat definition at `skills/lifecycle-rules.md:21` | B only for head/base log judgment in review/repair/direct; A gains no judgment duty |
| R17. The leaf own done-criteria must pass independently; a cover never substitutes | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R18. A blocked receipt entry did not run; fix its named blocker first | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R19. Exception: a named/nameless blocker covered by an agreed known-red judgment | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R20. Under that exception record blocked as not run, never passing, and do not independently block on it | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R21. A blocked criterion proof cannot show its result and still stops the leaf | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R22. Neither the seat nor known-red runs blocked commands | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R23. Known-red exit 0 counts only with judgment agreement recorded beside the logs | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R24. A failing exit or disagreeing judgment takes the seat repair/blocking ending | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R25. Agreement for a configured command requires base-red filing | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R26. For a command outside checks, an owned completed same-command base run failing the same tests requires filing | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R27. File through seed-issue Lifecycle filing within this pass | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R28. Record the created/found URL or failing filing command and error in the seat record | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R29. Do not file green inconsistent retries, disagreeing judgments, killed bases or incomplete bases as base reds | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R30. Filing changes no verification status, so a red criterion remains blocking | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R1. Apply retry/known-red handling to a red with no cause in the leaf diff after judging the cause | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R2. Retry once, preserving the command, arguments, scope and working directory; merge uses verify --attempt <id> on the unchanged head | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` + `skills/merge-issue/SKILL.md:75` | B, merge |
| R4. A green retry is inconsistent and records both kept logs | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R5. A red retry keeps the repair/blocking path until known-red clears it | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R6. Run the seat known-red command on the same head (committed head for implement/check.fix); merge uses verify --attempt <id> --known-red | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` + `skills/merge-issue/SKILL.md:75` | B, merge |
| R7. Known-red reruns the head when no completed red head run exists | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R8. Compare at the head merge-base with the tracked default branch | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R9. Skip a whole-green base tree and judge fail because green base cannot cover red head | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R10. The designated judgment owner reads head/base logs for runner completeness and causal fit | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B in merge |
| R11. Named-test evidence must show a real failed test name also failing on the base | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R12. Nameless evidence needs nameless logs on both sides read whole, with no extra head failure, judged in substance | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B in merge |
| R13. Nameless evidence must end by its own verdict, never killed, timed out or crashed | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R14. Nameless evidence must have no plausible cause in the leaf diff | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R15. Ordinary errors, missing inputs and load diagnostics are not excluded merely for naming no tests | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R16. If the logs cannot establish a cause, the designated judgment owner withholds agreement and blocking applies | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B in merge |
| R17. The leaf own done-criteria must pass independently; a cover never substitutes | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R18. A blocked receipt entry did not run; fix its named blocker first | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R19. Exception: a named/nameless blocker covered by an agreed known-red judgment | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R20. Under that exception record blocked as not run, never passing, and do not independently block on it | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R21. A blocked criterion proof cannot show its result and still stops the leaf | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R22. Neither the seat nor known-red runs blocked commands | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R23. Known-red exit 0 counts only with judgment agreement recorded beside the logs | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R24. A failing exit or disagreeing judgment takes the seat repair/blocking ending | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R25. Agreement for a configured command requires base-red filing | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R26. For a command outside checks, an owned completed same-command base run failing the same tests requires filing | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R27. File through seed-issue Lifecycle filing within this pass | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R28. Record the created/found URL or failing filing command and error in the seat record | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R29. Do not file green inconsistent retries, disagreeing judgments, killed bases or incomplete bases as base reds | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R30. Filing changes no verification status, so a red criterion remains blocking | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge |
| R31. No-cause classification uses failing output plus git diff "$AKROGON_BASE"...HEAD, with no touched file or plausible cause; a judgment gate, never automatic | `skills/implement-issue/SKILL.md:40` | `skills/lifecycle-rules.md:23` | A, implement/check.fix; standalone/direct under their local exceptions |
| R31. No-cause classification uses failing output plus git diff "$AKROGON_BASE"...HEAD, with no touched file or plausible cause; a judgment gate, never automatic | `skills/check-issue/SKILL.md:69` | `skills/lifecycle-rules.md:23` | A/B, check.review; B, check.repair/direct review |
| R32. A gh failure while filing is not an operator blocker | `skills/implement-issue/SKILL.md:40` | `skills/implement-issue/SKILL.md:27` | A, implement/check.fix; plan inherits the referenced retry disposition |
| R33. A wrong criterion unit is corrected through plan.synthesis proof-command correction; an unshowable criterion takes failed | `skills/implement-issue/SKILL.md:40` | `skills/implement-issue/SKILL.md:40` | A, implement/check.fix |
| R34. Reproduce a red merge with the narrowest failing command; run-check refuses the whole configured merge suite | `skills/check-issue/SKILL.md:69` | `skills/check-issue/SKILL.md:65` | A/B, review; B repair inherits the stub |
| R35. A wrong criterion unit is a Fix routed to A through plan.synthesis; no review seat commits on the shared head | `skills/check-issue/SKILL.md:69` | `skills/check-issue/SKILL.md:65` | A/B, check.review; repair has its own commit rules |
| R36. Green inconsistent reruns and agreed known-red passes continue to merged --check | `skills/merge-issue/SKILL.md:79` | `skills/merge-issue/SKILL.md:75` | B, merge only |
| R37. Filing adds no proof run | `skills/merge-issue/SKILL.md:79` | `skills/lifecycle-rules.md:23` | B, merge; describes filing, supplies no new proof requirement to another seat |
| R38. Before check.fix, append each exact failing command/arguments, failing output, rebase target and tested head | `skills/merge-issue/SKILL.md:79` | `skills/merge-issue/SKILL.md:75` | B, merge only |
| R39. Dispatch check.fix --slot B --attempt <id>; A reproduces with the narrowest run-check command, corrects wrong expectations/proof commands, then actual-result repair footer | `skills/merge-issue/SKILL.md:79` | `skills/merge-issue/SKILL.md:75` | B merge dispatches; A check.fix repairs |
| R40. Plan never compares the intended red of a planned test | `skills/plan-issue/SKILL.md:57` | `skills/plan-issue/SKILL.md:53` | A, plan.synthesis only |
| R41. Plan other failing checks take the referenced retry rule (formerly implement, now shared) | `skills/plan-issue/SKILL.md:57` | `skills/plan-issue/SKILL.md:53` -> `skills/lifecycle-rules.md:23` | A, plan.synthesis; inherits A-owned implement retry clauses, not B-owned review judgment |
| S1. Clean proof fixtures on success and failure using grants[].fixtures[].cleanup identities | `skills/check-issue/SKILL.md:35` | `skills/check-issue/SKILL.md:20` | A/B, check.review; B, check.repair/direct review; plan/implement gain no fixture duty |
| S2. Prove absence by absence_check authenticated read-back, never by a delete reply | `skills/check-issue/SKILL.md:35` | `skills/check-issue/SKILL.md:20` | A/B, check.review; B, check.repair/direct review; plan/implement gain no fixture duty |
| S3. Leftovers are blockers recorded with IDs, error, owner and next step | `skills/check-issue/SKILL.md:35` | `skills/check-issue/SKILL.md:20` | A/B, check.review; B, check.repair/direct review; plan/implement gain no fixture duty |
| S4. Label retained resources separately from resources still to delete | `skills/check-issue/SKILL.md:35` | `skills/check-issue/SKILL.md:20` | A/B, check.review; B, check.repair/direct review; plan/implement gain no fixture duty |
| S1. Clean proof fixtures on success and failure using grants[].fixtures[].cleanup identities | `skills/merge-issue/SKILL.md:33` | `skills/merge-issue/SKILL.md:20` | B, merge; plan/implement gain no fixture duty |
| S2. Prove absence by absence_check authenticated read-back, never by a delete reply | `skills/merge-issue/SKILL.md:33` | `skills/merge-issue/SKILL.md:20` | B, merge; plan/implement gain no fixture duty |
| S3. Leftovers are blockers recorded with IDs, error, owner and next step | `skills/merge-issue/SKILL.md:33` | `skills/merge-issue/SKILL.md:20` | B, merge; plan/implement gain no fixture duty |
| S4. Label retained resources separately from resources still to delete | `skills/merge-issue/SKILL.md:33` | `skills/merge-issue/SKILL.md:20` | B, merge; plan/implement gain no fixture duty |
| S5. With configured setup, dependency proofs outside printed commands first flock the git-path akrogon-install.lock and run quoted setup | `skills/check-issue/SKILL.md:35` | `skills/check-issue/SKILL.md:20` | A/B, check.review; B, check.repair/direct review |
| S5. Same setup flock stays in implement Effective settings | `skills/implement-issue/SKILL.md:29` | `skills/implement-issue/SKILL.md:29` | A, implement/check.fix; standalone/direct under their local exceptions; plan/merge gain no flock duty |
| S6. check.review launches no covered operation; planned live proofs remain implement/repair duties | `skills/check-issue/SKILL.md:73` | `skills/check-issue/SKILL.md:20` | A/B review prohibited; A implement and B repair retain their own planned grants |

### Phase and route reading paths

| Reading path | Reach and seat limits after repair |
|---|---|
| plan.synthesis | Local Shared context link supplies G/E/P/K and record plan.md. Its synthesis pointer supplies R through the common section with A as judging seat; intended reds remain exempt. No fixture/setup/excerpt duty is imported. |
| implement | Shared context link supplies G/E/P/K/R; A judges. Effective settings still owns its flock. Implementation/report.md remains the record. |
| check.review A | Shared context and review stub reach G/E/K/R. The stub assigns head/base log judgment to B. A gains no producer-save or judgment duty and launches no covered operation. |
| check.review B | Same path, with B owning head/base log judgment. Local setup, cleanup/absence and excerpt duties remain. |
| check.repair B | Its existing borrow of the paragraph beginning During check.review reaches the stub and shared rule; B judges. Planned proofs/grants and local cleanup/setup rules remain. |
| check.fix A | Implement Shared context and its local red paragraph reach the shared rules with A as judging seat and implementation/report.md as record. |
| merge B | Shared context and Shared endings reach shared G/E/K/R. B judges; only the local merge line grants .env.example. Attempt forms, merged --check continuations and check.fix ending remain local. |
| ordinary standalone implement A | Same skill and conditional references, with the unchanged no-config/no-leaf and command-output exemptions. No registered-leaf duties are newly imposed. |
| direct implement A | Direct form retains its chart draft brief/design, chart plan/report and --holder overrides. It returns to the door without a phase call. |
| standalone/direct check B | The direct-form section substitutes chart plan/report/base and out=, borrows review judgment and shared run-check with --holder. It reads no leaf config/state, commits nothing and returns to the door. |

B followed each row from the source clause through its destination and the route above. The previous coarse trace hid the B-only judgment ownership; repair B-F1 restores it. No other changed duty or permission was identified by this clause audit. A-F1 removes the second copy of merge's environment exception. All three review Fixes are addressed without changing a test expectation, live action, brief or design.

## Word counts (criterion 7)

| File | Before | After |
|---|---|---|
| plan-issue/SKILL.md | 1938 | 1587 |
| implement-issue/SKILL.md | 4948 | 4105 |
| check-issue/SKILL.md | 4373 | 3566 |
| merge-issue/SKILL.md | 3052 | 2324 |
| skills/lifecycle-rules.md | — | 1316 |

Family copies now: `reuses grants[]`, `opens, prints, appends`, `produces[].save`, `keeps command output` each appear once, in `lifecycle-rules.md`; zero in the four SKILL.md files (`grep` verified).

## Docs sweep (criterion 8)

Checked matches and dispositions:
- `docs/reference/checks.md` lines 54, 93 — updated to name `lifecycle-rules.md` first (the moved families' home); skill links kept for seat parts. Line 118 (test-change rule) unchanged — that rule did not move.
- `skills/AREA.md` — Key files line added; two pattern bullets link the shared file.
- `docs/reference/files.md`, `state-and-phases.md`, `commands.md`, `config.md`, `skills.md`, `limits.md`, `docs/examples/autopilot-story.md`, `quick-fix-story.md`, `docs/start/one-change.md`, `docs/use/when-work-fails.md`, `autopilot.md`, `plan-work.md` — checked: each SKILL.md link names a skill's role/phase/artifact, not where a moved rule lives; `.env`/`run-check` mentions are operator facts or command docs. Unchanged.
- `src/akrogon.ts:24` — the retired-hold message names `skills/merge-issue/SKILL.md`; `### Shared endings` still answers it (merge endings section, command forms, check.fix ending). Unchanged.
- `skills/implement-issue/brief-template.md`, `worker-protocol.md` — their "implement-issue rule" references name non-moved rules; worker-facing run-check copies stay local by design. Unchanged.

## Commands run (all kept output via run-check)

- `check known-red-literals-red: 1` — planning red for criterion 6 (ENOENT, shared file absent).
- `check link-check-red: 1` — planning red for criterion 5 (link followed, target absent).
- `check link-check: 0` — link check green on the real files (criterion 5 proof).
- `check known-red-literals: 0` — literal test green (criterion 6 proof).
- `check docs-links-full: 0` — all 11 docs-links tests pass on head.
- `check word-counts: 0` — criterion 7 counts above.
- `check run-check-rule-test: 1` then `check run-check-rule-test: 0` — first run lacked installed deps (setup not yet run in worktree); after `bun install`, green.
- `akrogon verify` on head e8eaaf8d: first run red on `door-reset` timing flake (`verify test: 1`, log `check-test-1794393981361-2778738.log`); retry green (`verify test: 0`, log `check-test-1794394102627-3121571.log`) — recorded `inconsistent`; diff touches only skill/doc text and two doc-literal tests, no door-reset code path, so no known-red judgment needed.

## Proof results per done-criterion

1. One statement per family + in-folder links: `grep` shows each family phrase once in `lifecycle-rules.md`, none in SKILL.md files; `ls -l` shows four git links to `../lifecycle-rules.md`; clause table above lists every clause. Green.
2. No rule lost, no seat changed: clause table + reading-path list above; reviewers follow it. Judged complete.
3. Differences survive: the per-seat list above names each, each verified present in its owning SKILL.md by grep during drafting. Green.
4. implement's opening sentence now names the conditional reads; `grep 'its references'` is empty. Green.
5. `check link-check: 0` and `check docs-links-full: 0`. Green.
6. `check known-red-literals: 0`; `lifecycle-rules.md` holds `akrogon verify --known-red`, `merge-issue/SKILL.md` holds `akrogon verify --attempt <id> --known-red`. Green.
7. Counts above. Green.
8. Sweep table above lists every match checked. Green.

## Known limitations / unverified

- Installed-layout reach of the new link files is supported by the sibling leaf's recorded proof (ponytail.md link file opens on all four roots); the link check proves the committed layout. No re-verification of installed roots in this pass.
- Judgment criteria (2, 3) rest on the clause table; mechanical checks only bound the families' marker phrases.
- `check-test-…-1794393895666` verify log (first head run) is red for the run-check-rule literal test — superseded by the fix commit e8eaaf8d and the green verify after it.

## 2026-11-11 check.repair

Initial reviewed head: `e8eaaf8d30aacbfc1fab78132a88d49fa20f9f66`. Repaired head: `085b541307c74cc0dbf78dbc7af09cb63328db18`. Base stays `81c6bc8338846fb397c55fd46988bcd03d945573`; no branch refresh occurred in this repair.

A-F1 is repaired in `9384c589`, B-F1 in `1f471950`, and B-F2 is recorded by artifact-only commit `085b5413`. The clause trace and counts above describe the repaired state. Per-finding before/after evidence and command logs are in `review-B.md`, dated check.repair entry. No test, helper, fixture, runner or live authorization changed.

The exact planned link and known-red-literal proofs both pass after the text repairs. `akrogon verify` exited 0 on the repaired head. Receipt `42fdb760-a8f0-4217-a0c3-614155736f93` records setup, format, typecheck and test all 0, with 1163 tests passing and none failing. Current test log: `implementation/check-test-1794394800132-165774.log`. No item is handed to A and no operator action is open.

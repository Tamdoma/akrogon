# Plan: lifecycle-rules-source

Serial-solo run: every wave holds one unit (U1 must land before U2 because U2's doc pointers name the shared file and sections U1 creates). A implements.

## Decisions

- **D1. Shared file shape.** New `skills/lifecycle-rules.md`, plain file (not a link), one `## ` section per family: `## Grant reuse and count lines`, `## Environment files and producer keys`, `## Kept command output`, `## Red check with no cause in the leaf's diff`. No relative markdown links; other files are named in words only (as today: "seed-issue's `## Lifecycle filing` section").
- **D2. Shared text form.** The shared text is the common rule written over a seat placeholder: "a seat", "its record file" (the file its own skill names) and "its operator-blocker stop" (the seat's own local stop paragraph, named in words). `akrogon verify --known-red` appears verbatim as the seat-form command.
- **D3. Per-seat rules form.** Seat-only rules named in criterion 3 stay as one short local line each in the owning skill, not seat-named clauses inside the shared file. The shared file states only what all four seats share, except the producer-save sentences, which the shared file holds once with their seats named ("the plan-issue and implement-issue seats") per the design's either/or.
- **D4. Link files.** `skills/plan-issue/lifecycle-rules.md`, `skills/implement-issue/lifecycle-rules.md`, `skills/check-issue/lifecycle-rules.md`, `skills/merge-issue/lifecycle-rules.md` are git links (mode 120000) with target `../lifecycle-rules.md`, same form as `lesson-rule.md`. Each `SKILL.md` links it by in-folder path: `[lifecycle rules](lifecycle-rules.md)`.
- **D5. plan-issue local content.** Shared context: link line plus "This seat's grant count lines and kept-output records go in `plan.md`." In `plan.synthesis`, the command-output sentence becomes the same link line (record file `plan.md` covered by the shared-context line); the last sentence "any other failing check takes the retry rule implement-issue states" becomes "any other failing check takes the retry rule in [lifecycle-rules.md](lifecycle-rules.md)".
- **D6. implement-issue local content.** Opening sentence reworded so it agrees with the conditional reads: "At every phase prompt, re-read this file and the leaf's `brief.md` and `design.md` from disk before acting; read `ponytail.md` before editing, `brief-template.md` when writing a brief, `worker-protocol.md` when delegating or validating a worker return (a delegated repair included), even when read earlier in this thread. After compaction, standalone re-reads its task brief instead of a leaf." Shared context keeps the conditional read line with its links, and gains the link line plus "A's grant count lines and kept-output records go in `implementation/report.md`; a red check takes the shared rule with `akrogon verify --known-red`; at most a short excerpt of kept output is pasted into Markdown. Standalone implement-issue has no registered repo and is outside the command-output rule." The standalone exception, `merge_checks`-only-at-merge clauses, "the implement-issue overlap rule", the setup flock sentence in "Effective settings", and other non-family text stay untouched. The plan.synthesis pointer and "Shared context retry and known-red rules" references resolve to the shared file because the link file sits inside the folder.
- **D7. check-issue local content.** Link line plus "Each review seat's grant count lines and kept-output records go in `review-<slot>.md`; a red check takes the shared rule with `akrogon verify --known-red`; at most a short excerpt of kept output is pasted into Markdown. `check.review` launches no covered operation. When `akrogon config` prints `setup`, a dependency-using proof outside the printed commands runs `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup>` first. Proof fixtures are cleaned up on success and failure with the cleanup identities in `grants[].fixtures[].cleanup`; absence is proven by `absence_check`, an authenticated read-back, never by a delete reply; leftovers are a blocker recorded with IDs, error, owner and next step; resources in `retained[]` are labelled apart from still-to-delete ones." `check.repair`'s borrow "the check.review paragraph beginning 'During check.review, a red test or check'" becomes "the paragraph beginning 'During check.review, a red test or check' in [lifecycle-rules.md](lifecycle-rules.md)" — the shared section's first paragraph begins with those words. The `merge_checks`-refusal clause inside the moved paragraph stays local to `check.review`.
- **D8. merge-issue local content.** Link line plus "The merge seat's grant count lines and kept-output records go in `review-B.md`; configured merge checks may read the committed non-secret template `.env.example`; at most a short excerpt of kept output is pasted into Markdown; every run and rerun is `akrogon verify --attempt <id>`, and the known-red form is `akrogon verify --attempt <id> --known-red`." — this keeps the pinned literal in `merge-issue/SKILL.md` for criterion 6. `### Shared endings` keeps its merge-only machinery (`merged --check` continuations, `check.fix` ending, failing-command append to `review-B.md`) and its red paragraph becomes the shared link plus the local lines; the fixture-cleanup sentences stay local after it as in D7.
- **D9. Clause table.** `implementation/report.md` carries one row per clause: for each old copy (grant paragraphs of the four; `.env` sentences of the four; producer save in plan+implement; command output in implement/check/merge plus plan's `plan.synthesis` copy; red check in implement's Shared context, check's `check.review`, merge's `### Shared endings`; plan's pointer), the row gives old place, new place (shared section or local line), and the seats that hold it. Reading paths the reviewer follows: `plan.synthesis`, `implement`, `check.review`, `check.repair`, `check.fix`, `merge`, standalone implement/check, direct implement/check.
- **D10. Test change.** The `seat skills name the known-red command` test follows the text: `skills/lifecycle-rules.md` must contain `akrogon verify --known-red`; `skills/merge-issue/SKILL.md` must contain `akrogon verify --attempt <id> --known-red`. The implement/check loops are removed. Committed at plan with a `Test-Change:` trailer ("criterion 6: the command literals moved to the shared file; no seat's named command changed").
- **D11. src/akrogon.ts unchanged.** The retired-merge-hold message names `skills/merge-issue/SKILL.md`; `### Shared endings` still answers it (entry section, merge command forms, check.fix ending) after the move, so no edit.
- **D12. Doc pointers.** `docs/reference/checks.md` line ~54 adds `[lifecycle-rules.md](../../skills/lifecycle-rules.md)` as the owner for the kept-output seat rule, keeping the three skill links; line ~93 does the same for the retry/known-red rules, keeping plan-issue/implement-issue links for the proof-command rule. `skills/AREA.md` Key files gains `skills/lifecycle-rules.md`, and its `.env` and retry bullets link it. `docs/reference/files.md`, `commands.md`, `config.md`, `state-and-phases.md`, `docs/use/when-work-fails.md`, `autopilot.md`, `plan-work.md`, `quick-fix-story.md` mention `.env`/`run-check`/`known-red` as operator facts or command docs, not as "where the seat rule lives" — checked and left unchanged; the report lists each.
- **D13. Worker files unchanged.** `brief-template.md` and `worker-protocol.md` name `implement-issue` rules in words ("the implement-issue overlap rule", "the implement-issue rule") that are not among the moved families; no sentence points at a moving paragraph. Unchanged.

No `Open for the plan:` question beyond those resolved in D11, D12, D13. Design names no credentials (`env_names: []`), so no `Missing:` check is owed.

## Read-first paths

- `docs/reference-index.md` — grounding index.
- `skills/AREA.md` — key-files line and Non-obvious patterns bullets that describe moved rules (owned surface).
- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` — old copies (owned).
- `skills/lesson-rule.md` + `skills/*/lesson-rule.md`, `skills/check-issue/ponytail.md` — the in-folder link-file form to mirror.
- `tests/docs-links.test.ts` — link check and known-red test (owned).
- `docs/reference/checks.md` — the two "a seat rule" pointer lines (owned).
- `src/akrogon.ts:24` — message judged in D11 (read only).
- `learnings/LESSONS.md` — read; no cited lesson bears on this move.

## Needed interfaces

- Git link mode 120000 target `../lifecycle-rules.md` (existing convention).
- `tests/docs-links.test.ts` `brokenLinks` bound rule and `diskResolver` gitlink deref (existing, delivered by `skill-links-in-folder`).
- `src/test-files.ts` `Test-Change:` trailer rule for the `tests/docs-links.test.ts` edit.
- `akrogon run-check` for kept command output.

## Checklist / waves

Affected docs: `skills/AREA.md`, `docs/reference/checks.md`. No other agent or human doc affected (D12, D13).

### Wave 1 — U1 (A, solo)

Owns: `skills/lifecycle-rules.md`, `skills/{plan-issue,implement-issue,check-issue,merge-issue}/lifecycle-rules.md` (git links), the four `SKILL.md` files.

Steps:
1. Write `skills/lifecycle-rules.md` with the four sections in D1 wording per D2/D3.
2. `git update-index --add --cacheinfo 120000,<blob>,skills/<skill>/lifecycle-rules.md` or `ln -s ../lifecycle-rules.md` + `git add` for the four link files.
3. Edit each `SKILL.md`: replace family paragraphs with the link line and the local lines in D5–D8; reword implement's opening sentence (D6); retarget check.repair's borrow and plan.synthesis's pointer (D7, D5).
4. Commit ("skill: state shared lifecycle rules once").

### Wave 2 — U2 (A, solo)

Owns: `docs/reference/checks.md`, `skills/AREA.md`, `implementation/report.md` (leaf artifact). Depends on U1 (pointers name the shared file's sections).

Steps:
1. Apply D12 edits.
2. Grep sweep for stale pointers: `grep -rn "seat rule\|retry and known-red\|\.env rule" docs/ skills/AREA.md`; record each checked match in the report.
3. `wc -w` before/after on the four `SKILL.md` and `skills/lifecycle-rules.md` into the report (D9 table + criterion-7 counts + criterion-2 seats-per-clause column).

## Done-criteria → proof

| # | Criterion | Proof command and boundary | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | Each family stated once; skills link the shared file in-folder | `wc -w skills/lifecycle-rules.md skills/*/SKILL.md`; `grep -c 'grants\[\]' skills/lifecycle-rules.md` (1) vs `grep -l 'reuses `grants\[\]`' skills/*/SKILL.md` (none); `ls -l skills/*/lifecycle-rules.md` (links to `../lifecycle-rules.md`); report table lists every clause | A second copy left behind; a missing link file | seconds | Any text change to the five files |
| 2 | No rule lost, no seat changed | The clause table in `implementation/report.md`, followed by the reviewer along the nine reading paths in D9 | A dropped or widened clause | minutes | Re-verify when U1's diff changes |
| 3 | Seat differences survive, each named in the table | Table rows for: record files; `.env.example`; `check.review` no covered op; command forms (`--attempt <id>`); producer save for plan+implement; fixture cleanup/absence for check+merge; setup flock in check + implement's Effective settings; excerpt clause for implement/check/merge only — verified by `grep` for each literal line in its owning `SKILL.md` | A seat silently gaining or losing a duty | minutes | U1 diff changes |
| 4 | implement's opening sentence agrees with conditional reads | Read the first line of `skills/implement-issue/SKILL.md` + the Shared context read line; `grep -n 'its references' skills/implement-issue/SKILL.md` (gone); judgment: `ponytail.md` before editing, `brief-template.md` when writing a brief, `worker-protocol.md` when delegating or validating a worker return; blanket re-read of SKILL/brief/design stays | The contradiction stays, another unneeded read | seconds | U1 diff changes |
| 5 | Seat opens the shared file on the installed layout | `bun test tests/docs-links.test.ts -t 'README, docs and skill links resolve'` inside `akrogon run-check` (existing runner at base): each skill's markdown link resolves through its gitlink to the shared file; the shared file passes the bound check (no relative links); the four link files are accepted | A link leaving its folder, a dangling link, a relative link in the shared file | seconds | Any rename of the five files or link targets |
| 6 | Seat finds the known-red command where it reads | `bun test tests/docs-links.test.ts -t 'seat skills name the known-red command'` inside `akrogon run-check` (existing runner at base, test file updated in D10) | The literal lost from the file a seat reads; merge's `--attempt` form lost | seconds | Wording change touching the literals |
| 7 | Word counts | `wc -w` on the four `SKILL.md` and `skills/lifecycle-rules.md`, before/after in the report | Silent loss (also covered by criterion 2's table) | seconds | Final text |
| 8 | Docs point at the new place | `grep -rn 'skills/.*-issue/SKILL.md' docs/ skills/AREA.md` plus per-match review; each match either updated or listed in the report as a non-pointer mention | A stale pointer telling seats/rules live in a moved spot | seconds | U2 edits |

### Condition checks (planning)

- C5-bound: D1's "no relative links in the shared file" is checkable — the link test would report a `../` link inside it (bound `skills/`), so a violating draft is red under the criterion-5 command. Covered by the criterion test rather than a separate case; the traced reason for the other criteria: they have no executable boundary — seat behavior and prose — so each gets the clause table / judgment proof above, not a forced mechanical case.
- C4's "fresh read stays": grep above shows the blanket sentence survives minus "its references"; the conditional-read agreement is reviewer judgment, no executable boundary exists.

## Tests to write

None new — criterion 5 uses the existing link check and criterion 6 uses the existing command-literal test updated in place (D10). The D10 test edit is committed on the leaf branch at plan time with `Test-Change: tests/docs-links.test.ts criterion 6: command literals moved to skills/lifecycle-rules.md`.

## Red-run evidence

- Criterion 6: `check known-red-literals-red: 1` — `skills/lifecycle-rules.md` does not exist; the edited test fails `ENOENT` before asserting the literals. Goes green when U1 lands. Log: `implementation/check-known-red-literals-red-1794393703340-2311672.log`.
- Criterion 5: `check link-check-red: 1` — with a temporary `skills/plan-issue/lifecycle-rules.md` gitlink present and a temporary `lifecycle-rules.md` link in `plan-issue/SKILL.md`, the link check reported `skills/plan-issue/SKILL.md: missing file lifecycle-rules.md` (it followed the in-folder link to the absent shared file). Temporary edits discarded before the test commit. Log: `implementation/check-link-check-red-1794393705165-2313886.log`.

No other check was run at planning; the test file edit is the only change on the branch so far.

## Implementation notes

- 2026-11-11 — D7 refined: `check.review`'s red paragraph keeps its opening words as a stub naming the shared file plus the `merge_checks`-refusal clause, so `check.repair`'s borrow ("the check.review paragraph beginning 'During check.review, a red test or check'") resolves unchanged instead of pointing at `lifecycle-rules.md`. Refines D7; no locked decision touched.
- 2026-11-11 — D6 refined: implement's `gh`-failure-while-filing clause moved to its local line; merge's "adds no proof run" clause is inside the shared paragraph because it constrains what filing does for every seat, not a seat duty. Refines D3/D6/D8.
- 2026-11-11 — Found during verify: `tests/run-units.test.ts`'s `skills name the run-check keeping rule…` pinned the moved literals inside each SKILL.md; updated to read `skills/lifecycle-rules.md` and the two worker-facing files, same fix as D10. Plan gap: that test's loop was not named in D10.

- 2026-11-11 — B-F1 repair: preserve B's ownership of check.review/check.repair head/base log-completeness and causal-fit judgment through the local check stub and shared judging-seat definition. Required by brief criterion 2 (no seat gains or loses a rule); adds the omitted ownership step to D7 without changing a locked decision.

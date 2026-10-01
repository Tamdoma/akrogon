# Brief 2: worker-protocol and brief-template delegation boundary

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/check-scheduling-u2`. Edit only inside that worktree. Base: `9ea5dd0ae720970b37e0175d7b109c913d29a242`.

## 1. Goal

Rewrite `skills/implement-issue/worker-protocol.md` and `skills/implement-issue/brief-template.md` to the Q2 2a delegation boundary. Plan D2, D4-part, D5, D8, D9. Workers get only the resolved changed-test command; A owns criterion proof plus every `checks` command after the final worker. Undefined `full suite` is gone except the kept `brief-template.md:39` sentence.

## 2. Numbered acceptance criteria

1. `worker-protocol.md:11` tail no longer names `full suite`; it reads `before criterion proof, checks and akrogon phase` or equivalent naming criterion proof plus `checks`.
2. `worker-protocol.md:25` states the full suite equivalent as: criterion proof and every `checks` command belong to A after the final worker.
3. `worker-protocol.md:27` states: a red criterion proof or `checks` command becomes one more sub-brief with failing output pasted, worker repairs with changed tests, A reruns that proof and `checks`.
4. `brief-template.md:37` states A runs criterion proof and every `checks` command separately (not `the full suite`).
5. `brief-template.md:39` (`rather than substituting the full suite or inventing a command`) stays with the same meaning.
6. No other `full suite` / `full-suite` string remains in these two files.

## 3. Read-first list

- `skills/implement-issue/worker-protocol.md` (owned, full file, 31 lines).
- `skills/implement-issue/brief-template.md` lines 33-42 (owned section 7).
- `skills/merge-issue/SKILL.md` lines 33-35 (pattern to copy: `checks` then `merge_checks` ordering language).
- `skills/implement-issue/ponytail.md` (read before editing).
- `docs/reference-index.md` only on a gap.

## 4. Change list and needed interfaces

- Files: `skills/implement-issue/worker-protocol.md` and `skills/implement-issue/brief-template.md` only. Owned paths: those two files.
- Change A (criterion 1): in the long `Launch and return` paragraph tail, replace `before the full suite, checks and akrogon phase` with `before criterion proof, checks and akrogon phase`.
- Change B (criterion 2): replace `the full suite belongs to A after the final worker` with `criterion proof and every checks command belong to A after the final worker` (keep backtick style for `checks`).
- Change C (criterion 3): replace the `A red full suite becomes...` sentence with the criterion-proof / `checks` sub-brief wording from criterion 3.
- Change D (criterion 4): replace `A runs the full suite separately` with `A runs criterion proof and every checks command separately`.
- Change E (criterion 5): leave the `brief-template.md:39` sentence unchanged in meaning.
- Needed interfaces: none.
- Prerequisites: none. Independent of brief-1 and brief-3 (disjoint paths).
- Shared test resource: none. Prose-only.

## 5. Do-not, reasons and exceptions

- Do not touch any other file; reason: brief-1 and brief-3 own disjoint paths and parallel picks conflict on overlap; exception: none, return a mismatch instead.
- Do not add a test asserting wording; reason: design D9 vanity-test ban; exception: none.
- Do not reword `brief-template.md:39` into a new requirement; reason: the brief names it a correct use that may stay; exception: none.
- Do not change `src/`, `tests/`, or anything under `issues/`; reason: design excludes them; exception: none.
- Do not change scope or an interface on mismatch; reason: A owns the plan; exception: return a mismatch naming the conflict, evidence, and smallest brief correction.
- Restated: other files untouched because parallel units own them (no exception); no wording tests because vanity tests are banned (no exception); keep :39 meaning because the brief allows it (no exception); no `src/`/`tests/`/`issues/` because excluded (no exception); on conflict return a mismatch (exception: a revised brief from A).

## 6. Ordered steps

1. Read both owned files and the merge-issue pattern (criteria 1-6). No code yet.
2. No test to write: D9 forbids wording tests; proof is grep plus diff read plus the changed-test command.
3. Edit `skills/implement-issue/worker-protocol.md` Changes A, B, C (criteria 1-3).
4. Edit `skills/implement-issue/brief-template.md` Change D, verify Change E untouched (criteria 4-5).
5. Verify: `grep -rn "full suite\\|full-suite" skills/implement-issue/worker-protocol.md skills/implement-issue/brief-template.md` shows only the :39 line (criterion 6); read `git --no-pager diff` for the new wording (criteria 1-4).
6. Run `bun install` once, then the section-7 command; paste output.
7. Commit only the two owned files with message `check-scheduling u2: worker delegation boundary`. Record the commit ID.

Advisory size: about 2 files and under 10 turns.

## 7. Commands

`AKROGON_BASE=9ea5dd0ae720970b37e0175d7b109c913d29a242 bun test --changed="$AKROGON_BASE"` only. A runs the full suite separately.

## 8. Done-when, evidence and report

Done when criteria 1-6 hold, the section-7 command passes, and the chunk is committed. Paste the grep output, the diff, and the changed-test output. Link leaf plan criterion 2 (delegation part) to this diff. No end-to-end artifact (prose-only).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

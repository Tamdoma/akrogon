# Brief 1: freshness rule + report fields in implement-issue

Leaf: fresh-test-proof. Worktree: /home/ivan/.akrogon/worktrees/akrogon/fresh-test-proof-u1

## 1. Goal

Apply plan decisions D1 and D2 to `skills/implement-issue/SKILL.md`: define "reuse
unchanged evidence" as a freshness rule and add the per-proof commit record to the
implementation report's contents.

## 2. Numbered acceptance criteria

1. Both proof-step paragraphs that say `reuse unchanged evidence` (one under
   `## implement`, one under `## check.fix`) state that earlier evidence for a test
   is reused only when it ran after the latest change to that test and to every
   helper or fixture it uses.
2. The report-contents clause in the `## implement` paragraph requires, for each
   proof result, the command, the commit it ran on and the result.
3. No other rule changes: no run count, no rerun requirement, no new phase step, no
   change to `checks`/`merge_checks` scheduling, the rejected-command replay, the
   unattributed-red retry or the `Test-Change:` trailer rules.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` — the two target paragraphs (around :65 and :86).
- `skills/implement-issue/ponytail.md` in this skill folder.
- Existing pattern to copy: the sentence style of the surrounding paragraph — one
  flowing rule, semicolons, no new headings or bullets.

## 4. Change list and needed interfaces

Owns only `skills/implement-issue/SKILL.md`. Two edits:

- In both occurrences, expand `reuse unchanged evidence` into the freshness rule:
  `reuse earlier evidence for a test only when it ran after the latest change to that
  test and to every helper or fixture it uses` (equivalent wording acceptable; it
  must name the test, the latest change, and helper/fixture coverage). Keep the
  semicolon flow of the sentence.
- In the `## implement` paragraph's report clause, after `commands run with pasted
  results and artifact paths` (or the nearest equivalent), add that for each proof
  result the report records the command, the commit it ran on and the result. The
  existing `the base and committed head` stays.

No prerequisites, no shared test resource, no interfaces.

## 5. Do-not, reasons and exceptions

- Do not edit any other file; the unit owns only this path. Reason: sibling units own
  check-issue and phases.md. Exception: none.
- Do not add a run count, rerun step, new command, or scheduling rule. Reason:
  foreclosed by the locked design (proof-rule 1a). Exception: none.
- Do not restate the B-side rejection rule here; it lives in check-issue only.
  Reason: one rule per place. Exception: none.
- Return a mismatch with evidence instead of changing scope or inventing a different
  rule. Exception: a revised brief from A authorizing it.

Restated: keep every exclusion above unless a revised brief authorizes otherwise.

## 6. Ordered steps

1. Read the two target paragraphs; edit both `reuse unchanged evidence` occurrences
   (criterion 1).
2. Edit the report-contents clause (criterion 2).
3. Run `grep -n "latest change" skills/implement-issue/SKILL.md` and
   `grep -n "commit it ran on" skills/implement-issue/SKILL.md` — both must hit.
4. Run the changed-test command in section 7.
5. Commit with a message like
   `implement-issue: reuse test evidence only after the test's latest change`.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Changed-test command only:

```sh
sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

with `AKROGON_BASE=fe7d558c255305f897fe66c8e2c625d3724e46e7` exported first.
A markdown-only change will select no or few tests; that is expected.

## 8. Done-when, evidence and report

Done when both greps hit, the changed-test command exits 0, and the commit lands on
the detached HEAD in this worktree. Report the commit ID and paste command outputs.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

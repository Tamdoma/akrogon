# Brief 2: stale-proof rejection in check-issue

Leaf: fresh-test-proof. Worktree: /home/ivan/.akrogon/worktrees/akrogon/fresh-test-proof-u2

## 1. Goal

Apply plan decision D3 to `skills/check-issue/SKILL.md`: B rejects proof for an added
or changed test that ran before the latest change to that test or a helper or fixture
it uses, and asks for the missing current run.

## 2. Numbered acceptance criteria

1. The paragraph where B checks that the implementation report ran the planned tests
   (around :55, currently `B checks that the implementation report runs the planned
   tests through the commands `plan.md` names ...`) also tells B to reject proof for
   an added or changed test that ran before the latest change to that test or a
   helper or fixture it uses, and to ask for the missing current run.
2. The rule carries the brief's example or an equivalent concrete case, e.g. green
   runs of a test file taken before a new case was added to it do not prove the new
   case.
3. No other rule changes: no new run count, no new review step beyond this
   paragraph, no change to when `checks`/`merge_checks` run or to the
   rejected-command replay.

## 3. Read-first list

- `skills/check-issue/SKILL.md` — the target paragraph (around :55).
- `skills/implement-issue/ponytail.md` (same folder under implement-issue) for style.
- Existing pattern to copy: the surrounding single-sentence rule style of B's
  checklist paragraphs.

## 4. Change list and needed interfaces

Owns only `skills/check-issue/SKILL.md`. One edit: extend the paragraph named above
so it covers the rejection and the ask for the current run, keeping the paragraph's
existing claims intact (planned tests through `plan.md` commands, nothing skipped,
filtered or disabled).

No prerequisites, no shared test resource, no interfaces.

## 5. Do-not, reasons and exceptions

- Do not edit any other file. Reason: sibling units own implement-issue and
  phases.md. Exception: none.
- Do not add the reuse-side rule or the report-fields clause; they live in
  implement-issue. Reason: one rule per place. Exception: none.
- Do not make stale proof a retryable matter or add a count; the rule is reject and
  ask. Reason: locked design (proof-rule 1a). Exception: none.
- Return a mismatch with evidence instead of changing scope. Exception: a revised
  brief from A authorizing it.

Restated: keep every exclusion above unless a revised brief authorizes otherwise.

## 6. Ordered steps

1. Read the target paragraph; extend it with the rejection and the example
   (criteria 1-2).
2. Run `grep -n "ran before the latest change" skills/check-issue/SKILL.md` — must hit.
3. Run the changed-test command in section 7.
4. Commit with a message like
   `check-issue: reject proof run before a test's latest change`.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Changed-test command only:

```sh
sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

with `AKROGON_BASE=fe7d558c255305f897fe66c8e2c625d3724e46e7` exported first.
A markdown-only change will select no or few tests; that is expected.

## 8. Done-when, evidence and report

Done when the grep hits, the changed-test command exits 0, and the commit lands on
the detached HEAD in this worktree. Report the commit ID and paste command outputs.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

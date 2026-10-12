# Brief 3: rule described in phases.md

Leaf: fresh-test-proof. Worktree: /home/ivan/.akrogon/worktrees/akrogon/fresh-test-proof-u3

## 1. Goal

Apply plan decision D4 to `docs/guide/phases.md`: describe the freshness rule in the
implementation paragraph and the rejection in the review paragraph, in guide voice,
without restating the rules in full.

## 2. Numbered acceptance criteria

1. In the `## implement-issue` paragraph (around :94), where it says `reusing
   unchanged evidence`, the text now says earlier evidence for a test counts only
   when it ran after the latest change to that test and to every helper or fixture
   it uses (equivalent wording acceptable).
2. In the `## check-issue` paragraph (around :104), the text notes that review
   rejects proof for an added or changed test that ran before the latest change to
   that test or a helper or fixture it uses (one clause or sentence, not the full
   rule).
3. No other change: no run count, no new phase step, no change to when `checks`
   and `merge_checks` run, and the rejected-command replay after a red merge stays
   as written.

## 3. Read-first list

- `docs/guide/phases.md` — the `## implement-issue` and `## check-issue` sections.
- `skills/implement-issue/ponytail.md` for style.
- Existing pattern to copy: the guide's summary voice — it describes what a phase
  does and points at outcomes, it does not restate skill rules in full.

## 4. Change list and needed interfaces

Owns only `docs/guide/phases.md`. Two small edits inside the two named paragraphs.

No prerequisites, no shared test resource, no interfaces.

## 5. Do-not, reasons and exceptions

- Do not edit any other file. Reason: sibling units own the two SKILL.md files.
  Exception: none.
- Do not restate the full rules; the guide describes, the skills state. Reason:
  design, "the guide describes and does not restate them in full". Exception: none.
- Do not touch the merge/check.fix replay sentence or scheduling text. Reason:
  done-criterion 5. Exception: none.
- Return a mismatch with evidence instead of changing scope. Exception: a revised
  brief from A authorizing it.

Restated: keep every exclusion above unless a revised brief authorizes otherwise.

## 6. Ordered steps

1. Read both paragraphs; edit the implementation one (criterion 1).
2. Edit the review one (criterion 2).
3. Run `grep -n "latest change" docs/guide/phases.md` — must hit in both paragraphs.
4. Run the changed-test command in section 7.
5. Commit with a message like
   `guide: describe the test-evidence freshness rule in phases`.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Changed-test command only:

```sh
sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

with `AKROGON_BASE=fe7d558c255305f897fe66c8e2c625d3724e46e7` exported first.
A markdown-only change will select no or few tests; that is expected.

## 8. Done-when, evidence and report

Done when the grep hits in both paragraphs, the changed-test command exits 0, and
the commit lands on the detached HEAD in this worktree. Report the commit ID and
paste command outputs.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

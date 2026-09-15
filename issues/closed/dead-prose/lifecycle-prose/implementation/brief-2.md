# Brief 2: lifecycle-prose guide edits

## 1. Goal

Apply the plan's guide-side edits: delete the `questions/<id>.md` files-table row, delete the "Blind positions cannot ask the peer" limits card, and rewrite the two failed-phase sentences. Plan decisions D1 and D3.

## 2. Numbered acceptance criteria

1. `grep -rn "questions/" docs/guide/` is empty.
2. `grep -rn "diagnosis paragraph\|A's diagnosis" docs/guide/` is empty (create.html:61 keeps its intake-exclusion "diagnosis").
3. docs/guide/phases.html:66 reads exactly the after-HTML below.
4. docs/guide/problems.html:61 third cell reads exactly the after-HTML below.

## 3. Read-first list

- `docs/guide/files.html` around line 106
- `docs/guide/limits.html` around line 66
- `docs/guide/phases.html` around line 66
- `docs/guide/problems.html` around line 61
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (lazy senior dev mode)

## 4. Change list and needed interfaces

Line numbers are origin/main at 735cd63, verified live.

Deletions:

- `docs/guide/files.html` line 106: the whole `<tr>` row for `questions/<id>.md`.
- `docs/guide/limits.html` line 66: the whole `<div class="card">` for "Blind positions cannot ask the peer" (one line).

Verbatim replacements:

- `docs/guide/phases.html` line 66 becomes:
  `<li class="phase"><span class="pn">failed</span><span class="who">you</span><p>Waits. Read the reviews, then send it back with <code>akrogon phase &lt;slug&gt; implement</code>.</p></li>`
- `docs/guide/problems.html` line 61 third cell becomes:
  `Read the reviews. Fix the brief if needed. <code>akrogon phase &lt;slug&gt; &lt;phase&gt;</code>.`
  (Replace only the third `<td>` content on that line; the first two cells stay.)

## 5. Do-not, reasons and exceptions

- Do not touch `docs/guide/learn.html` lines 57-58 or `docs/guide/phases.html` line 64; the design keeps "A writes lessons at merge" prose.
- Do not touch `docs/guide/files.html` lines 58-60 or 95; the issues-on-leaf-branch rule is unrelated.
- Do not touch `docs/guide/create.html` line 61; its "diagnosis" is an intake exclusion the design keeps.
- Do not touch `skills/`, `src/`, `tests/`, `issues/`; brief-1 owns the skills and nothing owns code.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: the exclusions exist because the design locks exact line scope and sibling ownership; the only exception is a revised brief from B.

## 6. Ordered steps

1. Delete the files.html:106 row (criterion 1).
2. Delete the limits.html:66 card (criterion 1).
3. Rewrite phases.html:66 (criterion 3).
4. Rewrite problems.html:61 third cell (criterion 4).
5. Run every criterion's grep command and paste results (all criteria).

Advisory size: about 4 files and under 16 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=735cd630afe03fe21b773aafeabdddddc88ca612`.

## 8. Done-when, evidence and report

All four criteria verified with pasted command output. No tests are added; the changed-tests run is the evidence that nothing executable moved.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

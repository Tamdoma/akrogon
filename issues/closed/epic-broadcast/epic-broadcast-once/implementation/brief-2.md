# Brief 2: skill wording

## 1. Goal

Implement plan decisions D5, D6 (scope D1) for the two agent docs.

Binding facts: `merge-issue` gathers the completion owner's briefs before the folder may move (every leaf brief under the epic when the leaf has one), runs `akrogon phase <slug> merged --slot B`, and runs `broadcast-issue` in the same session only when that invocation prints `issue complete` or `epic complete`. `broadcast-issue` is the merge slot's own terminal task after either line; one completed standalone issue or one completed epic produces one message. Never a broadcast per inner issue or per leaf.

## 2. Numbered acceptance criteria

- **AC1.** `skills/merge-issue/SKILL.md` (frontmatter description ~line 3 and trigger sentence ~line 47) runs `broadcast-issue` only when the `merged` invocation prints `issue complete` or `epic complete`, and gathers the completion owner's briefs (every leaf brief under the epic when the leaf has one) before the move. Verified by `grep -n "issue complete\|epic complete\|briefs" skills/merge-issue/SKILL.md` plus a read.
- **AC2.** `skills/broadcast-issue/SKILL.md` (frontmatter ~line 3, terminal-task sentence ~line 10, context sentence ~line 14) describes one factual message per completed standalone issue or completed epic, after either completion line. Verified by read plus grep.
- **AC3.** No line in either skill claims an inner issue triggers a broadcast. Verified by `grep -rn "issue complete" skills/`.

The literal `issue complete` / `epic complete` line names are fixed references, so grep is the meaningful verification; no behavior test applies to wording.

## 3. Read-first list

- `skills/merge-issue/SKILL.md` (description ~line 3, trigger sentence ~line 47).
- `skills/broadcast-issue/SKILL.md` (lines 3, 10, 14).
- `src/phase.ts` print lines (to match the literal line names; read only, do not edit).
- Pattern to copy: the current line-47 sentence structure in `merge-issue` (gather, run, trigger condition, same-session reason).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `skills/merge-issue/SKILL.md`: wording only, description plus trigger/briefs sentence.
- `skills/broadcast-issue/SKILL.md`: wording only, frontmatter plus terminal-task and context sentences. Other lines in the same file may change only if they claim an inner issue triggers a broadcast.
- Interface: none; this unit consumes the stdout line names as fixed references.
- Chunks that must land first: none. This unit is wave 1.
- Paths owned: `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`. No other files.
- Shared test resource: none. Consumes no other worker output. Unit 3 owns human docs.

## 5. Do-not, reasons and exceptions

- Wording only; do not change merge or broadcast procedure beyond the trigger and briefs rule, because D1 scopes this unit to wording. Exception: none.
- Do not touch `docs/`, `README.md`, `src/`, or `tests/`; unit 3 and unit 1 own them. Exception: none.
- Do not rename the skill or its frontmatter `name`; dispatch keys on it. Exception: none.
- Do not write under `issues/`; lifecycle artifacts live only in the registered checkout. Exception: none.
- Do not change scope or an interface; return a mismatch with evidence naming the conflict and smallest brief fix. Exception: a revised brief from A authorizing that change.

Reasons restated: wording scope, unit ownership, stable dispatch keys, and artifact placement keep this leaf reviewable. Exceptions restated: none, except a revised brief from A for scope or interface changes.

## 6. Ordered steps

1. In the worktree, run `bun install --frozen-lockfile` (covers the section 7 run).
2. Read both skill files fully (AC1, AC2).
3. Edit `skills/merge-issue/SKILL.md` (AC1): description plus the gather/trigger sentence per section 1.
4. Edit `skills/broadcast-issue/SKILL.md` (AC2): frontmatter plus terminal-task and context sentences per section 1.
5. Verify (AC1-AC3): run `grep -n "issue complete\|epic complete\|briefs" skills/merge-issue/SKILL.md`, `grep -n "issue complete\|epic complete" skills/broadcast-issue/SKILL.md`, and `grep -rn "issue complete" skills/`; read the changed lines and confirm no inner-issue broadcast claim remains.
6. Run the section 7 command (expect no matching tests, exit 0). Repair failures inside this brief.
7. Commit only this chunk (the two skill files) on the worker worktree and record the commit ID.

Advisory size: 2 files, under 8 turns. Work clearly beyond it returns a mismatch with evidence.

## 7. Commands

Run in the worktree, this command only:

```sh
AKROGON_BASE=147dcb33c8c5ae826cff3b74be212d120e0ba913 bun test --changed="147dcb33c8c5ae826cff3b74be212d120e0ba913"
```

A runs the full suite separately.

## 8. Done-when, evidence and report

Done when AC1-AC3 hold with pasted grep output, the section 7 command passes, and only the owned paths are committed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

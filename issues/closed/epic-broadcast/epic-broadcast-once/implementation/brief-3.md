# Brief 3: guide and README wording

## 1. Goal

Implement plan decision D6 (scope D1) for the four human docs: one broadcast per completed standalone issue or completed epic, never per inner issue or per leaf.

Binding facts: `docs/guide/merge.md` shows both completion lines (`issue complete <issue>` for a standalone issue, `epic complete <epic>` once when the last leaf of an epic merges) and the silent inner-issue case; its broadcast section (~line 36) and broadcast-issue section (~line 69) state one completion update per standalone issue or epic. `docs/guide/cheat.md:125`, `docs/guide/idea.md:89`, and `README.md:188` read as a completed-issue-or-epic update. Current texts: merge.md "When all leaves in an issue are merged, the command can report: `issue complete`"; line 36 "sends a completion update when the issue completes"; line 69 "It runs when the whole issue completes, not after every leaf"; cheat.md "A factual issue update."; idea.md "broadcast: report the completed issue, when configured"; README.md "Send a completed-issue update to Discord."

## 2. Numbered acceptance criteria

- **AC1.** `docs/guide/merge.md` shows both completion lines with the silent inner case and states one broadcast per completed standalone issue or completed epic. Verified by read plus grep.
- **AC2.** `docs/guide/cheat.md`, `docs/guide/idea.md`, and `README.md` rows describe a completed-issue-or-epic update. Verified by read plus grep.
- **AC3.** `grep -rn "issue complete" docs skills README.md` shows no line claiming an inner issue triggers a broadcast. Verified by pasted grep output.

The literal `issue complete` / `epic complete` line names are fixed references, so grep is the meaningful verification; no behavior test applies to wording.

## 3. Read-first list

- `docs/guide/merge.md` (completion example ~lines 19-23, broadcast section ~line 36, broadcast-issue section ~line 69).
- `docs/guide/cheat.md` (~line 125), `docs/guide/idea.md` (~line 89), `README.md` (~line 188).
- Pattern to copy: the existing merge.md completion example block (fenced `text` output under a lead sentence).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `docs/guide/merge.md`: wording only, completion example plus the two broadcast sentences.
- `docs/guide/cheat.md`, `docs/guide/idea.md`, `README.md`: wording only, one row each.
- Interface: none; this unit consumes the stdout line names as fixed references.
- Chunks that must land first: none. This unit is wave 1.
- Paths owned: `docs/guide/merge.md`, `docs/guide/cheat.md`, `docs/guide/idea.md`, `README.md`. No other files.
- Shared test resource: none. Consumes no other worker output. Unit 2 owns skills.

## 5. Do-not, reasons and exceptions

- Wording only; do not change headings or anchors, because `tests/docs-links.test.ts` checks them. Exception: none.
- Do not touch `skills/`, `src/`, or `tests/`; units 2 and 1 own them. Exception: none.
- Do not touch `docs/guide/chart.md:203` ("close when the delivering issue completes"); it is about GitHub source closure, not broadcasts. Exception: none.
- Do not write under `issues/`; lifecycle artifacts live only in the registered checkout. Exception: none.
- Do not change scope or an interface; return a mismatch with evidence naming the conflict and smallest brief fix. Exception: a revised brief from A authorizing that change.

Reasons restated: stable anchors, unit ownership, source-closure prose that is out of scope, and artifact placement keep this leaf reviewable. Exceptions restated: none, except a revised brief from A for scope or interface changes.

## 6. Ordered steps

1. In the worktree, run `bun install --frozen-lockfile` (covers the section 7 run).
2. Read the four files at the listed locations (AC1, AC2).
3. Edit `docs/guide/merge.md` (AC1): completion example plus the two broadcast sentences per section 1.
4. Edit `docs/guide/cheat.md`, `docs/guide/idea.md`, `README.md` (AC2): one row each per section 1.
5. Verify (AC1-AC3): run `grep -rn "issue complete" docs skills README.md` and `grep -rn "epic complete" docs skills README.md`; read the changed lines and confirm no inner-issue broadcast claim remains. Note: `skills/` hits belong to unit 2 and may still show old text in this worktree; judge only `docs/` and `README.md` hits here.
6. Run the section 7 command (expect no matching tests, exit 0). Repair failures inside this brief.
7. Commit only this chunk (the four doc files) on the worker worktree and record the commit ID.

Advisory size: 4 files, under 16 turns. Work clearly beyond it returns a mismatch with evidence.

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

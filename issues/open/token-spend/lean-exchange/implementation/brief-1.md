# Sub-brief U1: lean-exchange skill text — reading rule, chained waits, seat records

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/lean-exchange-u1`

## 1. Goal

Implement plan decisions D1, D2 and D5 in `skills/chart-issues/` prose only: the consultant reading rule, the chained pre-prompt `herdr agent wait` rule, and the seat-record append rule from outcome/restart lines. No code changes. The contract these texts describe is already implemented in parallel by another unit; your text must describe that contract exactly as written below.

## 2. Acceptance criteria

- A1 `skills/chart-issues/assets/questions.md` `## Blind peer exchange` contains the reading rule: a consultant reads process text by named section for the step it is answering, locates a section before reading it, batches independent reads with bounded output, and reads content it already holds at most once per session; unread sections, content changed since it was read, and content lost to compaction may be read, and the full source stays allowed when it is the subject of the work. Named sections only, never line ranges. The rule binds consultants; A is not its subject (SKILL.md:6 already covers A).
- A2 The same section replaces the current "Every wait before the prompt, for the peer's pane to go idle, is `herdr agent wait <pane> --timeout <T>` with T below the command timeout the harness gives that call, run again whenever it fails with code `timeout`." with the chained rule: every pre-prompt idle wait runs chained before `peer-ask.ts` in the same shell call (`herdr agent wait <paneB> --timeout <T> && herdr agent wait <paneC> --timeout <T> && bun <skill-folder>/scripts/peer-ask.ts …`), no prompt is sent unless all waits passed, a timed-out wait exits non-zero and the whole chain is rerun; `T`, the sequential 5-second `agent prompt` timeouts and the collection budget together fit under the command timeout the harness gives that call.
- A3 `skills/chart-issues/SKILL.md` Open paragraph about restarts: "A restarted seat's new seats.yaml entry keeps its letter and is appended when `herdr agent list` shows its new session (pi at start, codex after its first exchange), never with a null session" becomes "appended from the `restarted` line's `session` when it is not `none` (pi shows its session at start; codex shows `none` until its first exchange), never with a null session" or equivalent wording carrying the same rule.
- A4 SKILL.md seat-record paragraph: "Each time the door re-reads `herdr agent list` for a peer exchange or a chart write and a seat's session id has changed, it appends a seat entry with the same seat letter" becomes the rule that the door appends a seat entry from the `session` field of each exchange step's outcome lines and each `restarted` restart line when it shows a session it has not recorded for that seat — no separate `herdr agent list` read for seat records. The rest of that paragraph (open time, spans, outside-herdr) is unchanged.
- A5 `docs/guide/chart.md` checked by grep: `git grep -n 'agent list\|peer-ask\|peer-wait\|peer-restart\|re-read\|reads\|idle' docs/guide/chart.md` — edit only if existing prose contradicts the new contract; report the line and decision either way.
- A6 No prompt text that peers receive verbatim (the prompt is a one-line pointer naming the brief's absolute path and the peer's slot letter) is altered; that pointer shape stays byte-stable.

## 3. Read-first list

- `skills/chart-issues/assets/questions.md` — full `## Blind peer exchange` section; the two sentences named in A1/A2.
- `skills/chart-issues/SKILL.md` — Open rule's restart paragraph and seat-record paragraph.
- `docs/guide/chart.md` — consultant/exchange paragraphs.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Plan contract for the script-side field names (copy these verbatim, do not re-derive): outcome line `{outcome, pane, file, status, signal, exchange, session}`; restart seat line `{seat, pane, kind, state, session}` where `session` is a string or `'none'`.

## 4. Change list and needed interfaces

- `skills/chart-issues/assets/questions.md` — A1 insert (one paragraph, placed where the exchange protocol is defined, near the peer-ask/wait rules so the reading rule travels with the same section), A2 replace.
- `skills/chart-issues/SKILL.md` — A3, A4 sentence replacements inside existing paragraphs.
- `docs/guide/chart.md` — A5 sweep; edit only on contradiction.
- Owns: those three files. Shared test resource: none. Prerequisite: none.

## 5. Do-not, reasons and exceptions

- Do not touch any `.ts` file: scripts and tests belong to another unit.
- Do not change SKILL.md's post-compaction instruction (line ~6), `## Autopilot`, `## Handoff` or footer text: locked scope.
- Do not add dollar figures, line ranges or a "skip re-reading" absolute: the design forbids them; content may be re-read when it changed or was lost.
- Do not weaken "a prompt is never sent before every wait passed": it is a lock.
- A contradiction between this brief and the live text (e.g. a sentence already different) returns a mismatch with the actual text, not a rewrite of scope; the exception is a revised brief from A.

Reasons and exceptions restated: prose only in the named files; locked scope everywhere else; conflicts come back as a mismatch for a revised brief.

## 6. Ordered steps

1. Read the read-first list.
2. Edit `questions.md`: insert the reading-rule paragraph (A1) inside `## Blind peer exchange` where a prompted consultant picks up protocol rules, and replace the pre-prompt-wait sentence with the chain rule (A2).
3. Edit `SKILL.md` restart sentence (A3) and seat-record append sentence (A4).
4. Run the A5 grep; edit `docs/guide/chart.md` only on contradiction.
5. Commit one commit on the leaf branch in your worktree.

Advisory size: about 2–3 files, under 12 turns.

## 7. Commands

No test commands: this unit is prose. Your verification is the A5 grep plus a re-read of the edited sentences against the A1–A4 wording.

## 8. Done-when, evidence and report

Done when A1–A6 hold on your committed HEAD, your commit contains no `.ts` or test changes, and the four lines below are filled.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

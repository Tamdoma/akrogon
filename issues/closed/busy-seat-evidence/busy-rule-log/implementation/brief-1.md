# Worker brief 1: SKILL.md busy-rule log evidence (unit 1 of wave 1)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/busy-rule-log-u1

## 1. Goal

Update `skills/watch-issues/SKILL.md` so the watch judges a working seat from its session log tail instead of a refused pane read. Plan decisions D1, D2, D3, D4, D7.

## 2. Numbered acceptance criteria

1. Line 30's read command reads a working seat with `herdr agent read <pane> --source visible`; `--lines 80` no longer applies to a working seat anywhere in the file (a non-working seat may still be read with `--lines 80` only if the sentence keeps it conditional on the seat not working — D1's wording resolves this: the closer-look command is `--source visible` for a working seat, `--lines 80` otherwise).
2. The Busy bullet (`:40`) states all of: per busy seat, `log<seat>=<path>` in the observe line runs `bun <skill-folder>/scripts/log-tail.ts <path>` and the existing loop bar is judged on those lines with `herdr agent read <pane> --source visible` as secondary context; `log<seat>=-` means judge from `--source visible` and report "no log" for that seat; a non-zero `log-tail.ts` exit means judge that seat from `--source visible` and report "log unreadable: <message>"; a read failure alone never justifies a steer; every other seat is still judged this fire.
3. The Busy bullet states the identity use: `#<hash>` marks the same command; `old#`/`new#` mark an edit's old and new text, so an edit whose `old#`/`new#` swap is the undo; `#-` never counts as the same command.
4. The loop bar sentence, all resteer/action sentences, and the "Insufficient evidence" sentence are unchanged verbatim. No elapsed limit is added. No other line of the file changes.

## 3. Read-first list

- `skills/watch-issues/SKILL.md` — the file itself; lines 28, 30, 40 are the live surface.
- `skills/watch-issues/scripts/log-tail.ts` — the output contract the new rule consumes (`<ts> <tool> <target> <identity> -> <status>: <excerpt>`, `#`/`old#`/`new#`/`#-` identities, non-zero on read/parse/unknown-format errors).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — posture.

## 4. Change list and needed interfaces

- Owns: `skills/watch-issues/SKILL.md` only. Two prose changes:
  - Line 30: replace `run `herdr agent read <pane> --lines 80`` with a working-seat conditional read (`--source visible` while the seat's observe status is `working`, `--lines 80` otherwise).
  - Line 40 Busy bullet: replace the opening `run `herdr agent read <pane> --lines 80` for every busy seat` with the log-tail evidence rule per criteria 2–3; keep every sentence from the loop bar onward verbatim.
- Consumed interfaces (already landed, do not touch): observe prints ` logA=<path|->` / ` logB=<path|->` only for seats whose herdr status is `working`; `log-tail.ts <path>` prints up to 20 one-line call summaries oldest-first, non-zero with a stderr message on read/parse/unknown-format failure.
- No shared test resource. No prerequisite units.

## 5. Do-not, reasons and exceptions

- Do not edit any other file or section of SKILL.md: the loop bar is owned once here, the `:28` line-format text belongs to seat-log-path.
- Do not add an elapsed limit, a numeric size gate, or judgment rules to `log-tail.ts`: locked design decisions.
- Do not weaken the resteer steps or the "insufficient evidence" outcome: brief item 4 keeps them as is.
- Return a mismatch with evidence to A instead of changing scope; exception is a revised brief from A.
- Restated: only the two named lines change; locked scope and verbatim sentences are preserved; conflicts come back as a mismatch, not an edit.

## 6. Ordered steps

1. Read `SKILL.md` lines 25–45 and `log-tail.ts` `render`/`main` (criteria 1–4).
2. Edit line 30's read command (criterion 1).
3. Rewrite the Busy bullet's evidence clauses only, preserving verbatim sentences (criteria 2–4).
4. Proof: `grep -n "lines 80\|source visible\|log-tail\|no log\|log unreadable" skills/watch-issues/SKILL.md` shows exactly the intended result; diff shows only the two lines changed.
5. Commit the change on the worktree's detached HEAD with a conventional message.

Advisory size: 1 file, under 8 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=bf88de02b3d4541accb6045e9bced3feb45355b4`, run at the worktree root. A markdown-only change may run zero tests; record that output as the result.

## 8. Done-when, evidence and report

All four criteria hold, the file diff touches only lines 30 and 40, the commit exists, and the changed-test command output (even "no tests matched") is pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

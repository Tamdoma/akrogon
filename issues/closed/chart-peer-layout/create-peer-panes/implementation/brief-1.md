# Brief-1: peer-pane creation prose + live layout evidence

## 1. Goal

Add the peer-pane creation rule to the chart-issues door's two owned files so an operator who asks for chart peers without naming panes gets them created in herdr, and capture live layout evidence. Implements plan D1–D8, acceptance C1–C6.

## 2. Numbered acceptance criteria

- C1: Both edited files state the trigger (operator asks for B, optionally C, without naming panes AND the door's own environment has `HERDR_ENV=1`) and the single ask at open for each created peer's harness kind and arguments.
- C2: Both files name the exact sequence: `herdr pane split <A pane> --direction right --ratio 0.5 --cwd <root> --no-focus` for B, then only when C is asked for `herdr pane split <B pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, reading each new ID from `.result.pane.pane_id`, then `herdr agent start <name> --kind <kind> --pane <id> -- <args>` per peer, with peers then addressed by pane ID.
- C3: Both files state supplied panes are used as given and never moved or resized, the door moves no pane it did not create, and the requested halves hold only when A's pane fills its tab (otherwise only A's area is split).
- C4: Both files state the outside-herdr fallback: the door says so and continues single slot or with supplied panes.
- C5: A layout capture file under `/tmp` from the section 6 procedure exists, shows three panes (root full-height left, B top right, C bottom right), and no agent was started; only the created tab was closed.
- C6: `git status --porcelain` in the worktree shows changes only in the two owned files. A `docs/` grep for the changed rule is recorded with its hits judged (no human doc edit expected).
- No unit test: this is a prose change; per the design, evidence is the C5 live capture, not a vanity test.

## 3. Read-first list

All paths relative to your worktree root:

- `skills/chart-issues/SKILL.md` (Open section; the first paragraph is the edit site)
- `skills/chart-issues/assets/questions.md` (blind peer exchange paragraph at :44; the edit site)
- `skills/chart-issues/assets/standing-design.md` (standing rules; reference only)
- `docs/reference-index.md`, `skills/AREA.md` (orientation; open only on a gap)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (edit discipline)
- Pattern to copy: the existing Open-section prose style — dense single-paragraph rules, literal commands in backticks, one paragraph per rule.

## 4. Change list and needed interfaces

Owned paths (this unit's only edits):

- `skills/chart-issues/SKILL.md`: extend the Open section's first paragraph (or add one paragraph right after it) with the C1–C4 rule. Keep every existing sentence.
- `skills/chart-issues/assets/questions.md`: extend the blind peer exchange paragraph (`Named peer panes are supplied...`) with the creation path: trigger, single ask, exact sequence, supplied-pane guarantee, fallback. Keep the existing wait/`agent wait`/return-file and path-assignment prose intact.

Needed interfaces (verified live 2026-09-28; shapes, not guesses):

- `herdr pane split [PANE_ID] --direction right|down --ratio 0.5 --cwd <root> --no-focus` → new pane ID at `.result.pane.pane_id`.
- `herdr agent start <name> --kind <kind> --pane <id> -- <args>` → starts peer in created pane.
- `herdr tab create --no-focus` → `.result.root_pane.pane_id` and `.result.tab.tab_id`.
- `herdr pane layout --pane <root pane>` → panes with rects.
- `herdr tab close <tab_id>` → removes only that tab.

Prerequisites: none (single unit, first and only wave). Shared resources: none.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `issues/`, other skills, or any other chart-issues rule: the contract limits this leaf to two files, and `akrogon phase` rejects `issues/` diffs. Exception: none; return a mismatch instead.
- Do not edit any human doc (`docs/`): creation is additive and existing supplied-pane prose stays accurate. Exception: none; record the grep and any contradicting hit as evidence.
- Do not write `pane move` or temporary-tab rearrangement prose: the design forecloses it. Exception: none.
- Do not add unit tests for the prose: the design calls them vanity tests and names the live capture as evidence. Exception: none.
- Do not start any agent during verification and do not close any tab you did not create. Exception: none.
- Do not change scope or an interface on your own: return a mismatch naming the conflicting requirement, the actual code or evidence, and the smallest brief correction. Exception: a revised brief from B authorizing that change.
- Restated: the exclusions above hold because the leaf contract owns exactly two prose files with live-capture evidence; every one of them bends only for a revised brief from B, and anything else is a mismatch return with evidence.

## 6. Ordered steps

1. Read the section 3 files and the installed brief/design at `/home/ivan/Work/infra/akrogon/issues/open/chart-peer-layout/create-peer-panes/brief.md` and `design.md` (reference only; edit nothing there). (C1–C4)
2. Edit `skills/chart-issues/SKILL.md` Open section for C1–C4, matching existing paragraph style (long single-line paragraphs, literal commands in backticks).
3. Edit `skills/chart-issues/assets/questions.md` blind peer exchange paragraph for C1–C4, preserving the existing sentences.
4. Run `git status --porcelain` (expect only the two files) and `grep -rn -i "peer\|pane" docs/ skills/chart-issues/`; judge each `docs/` hit in one line (expected: `docs/guide/chart.md` supplied-pane prose stays accurate, no edit). (C6)
5. Run `bun install` in the worktree if `node_modules` is absent, then the section 7 changed-test command; paste the result. A prose-only diff is expected to run zero tests — that is the passing result, not a gap.
6. Run the C5 live verification (requires `HERDR_ENV=1`; check with `echo $HERDR_ENV` first — if absent or any herdr command fails, stop and report C5 unverified with the pasted error; never fabricate the file):
   `herdr tab create --no-focus` → read `.result.root_pane.pane_id` and `.result.tab.tab_id`; split root right at 0.5 with `--cwd <your worktree root> --no-focus`; split B down at 0.5 the same way; `herdr pane layout --pane <root>` saved with `tee` to `/tmp/create-peer-panes-u1-layout.json`; confirm three panes with the expected rects; `herdr tab close <tab_id>`; confirm the tab is gone. Start no agent.
7. Commit only your two edited files on the detached worktree with message `create-peer-panes: peer-pane creation prose`; return the commit ID.

Advisory size: 2 files, under 8 turns (each file costs a read, an edit and a check run). Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Only this changed-test command (base supplied; do not run the full suite):

```bash
AKROGON_BASE=d5b27353fd3ecd3fb59325fb94e6547c85e6893b bun test --changed="d5b27353fd3ecd3fb59325fb94e6547c85e6893b"
```

## 8. Done-when, evidence and report

Done when C1–C6 hold: both files carry the C1–C4 rule, only the two files changed, the docs grep is judged, changed tests ran with pasted output, and `/tmp/create-peer-panes-u1-layout.json` shows the three-pane arrangement with the created tab closed and no agent started.

Reread this section and fill its report before returning. Return the commit ID, pasted command results, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

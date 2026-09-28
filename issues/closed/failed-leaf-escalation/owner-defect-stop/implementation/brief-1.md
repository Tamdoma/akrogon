# Brief-1: SKILL.md rule edits (owner-defect-stop unit 1 of 2)

## 1. Goal

Edit `skills/watch-issues/SKILL.md` Judge Waiting bullet, Failed-on-human-prerequisite bullet, and Stop section per plan D1-D6. This unit owns all repo code changes; unit 2 (walkthrough) lands after.

## 2. Numbered acceptance criteria

- B1.1: Waiting bullet runs no `akrogon next <slug>` and excludes from `next --all` any leaf whose observer `blocked=` names an unmerged leaf; fire reports it as waiting on that prerequisite; unknown slug reported as gap. (Plan C2.)
- B1.2: Failed-on-human-prerequisite bullet covers reasons naming a defect in another leaf's merged work: owner slug resolved against readable `issues/open/*/*/state.yaml`; merged owner required; unmerged-owner attribution excluded from this class; missing/ambiguous reported unresolved, never assigned; merged never reopened; operator charts new fix leaf then resumes with `akrogon phase <slug> <failure.phase>` after fix merges and required seats idle/absent. (Plan C1.)
- B1.3: First recognizing fire sends one `herdr notification show` for a D1 failure naming failed leaf, failure phase, owner or unresolved candidates, waiting dependents, next step, stop/restart note; replaces generic notice for that failure; original `delivery=shown` does not satisfy it; no persistent state; other human-prerequisite notices unchanged with no fix-leaf instruction. (Plan C4.)
- B1.4: Stop section fires on plan D4 closure and lists blockers: unreadable inventory, unknown slug, runnable leaf, busy seat. (Plan C3.)
- B1.5: Never list, `src/`, `skills/watch-issues/scripts/`, observer line format byte-identical. (Plan C6.)

## 3. Read-first list

- `skills/watch-issues/SKILL.md` (full file; edit Judge Waiting, Failed-on-human-prerequisite, Stop only)
- `skills/watch-issues/scripts/observe.ts` lines 220-240 (line format; read-only reference)
- `src/next.ts` lines 534-540 (explicit `next` throws on unmerged blocked-by; read-only reference)
- `src/phase.ts` line 186 (merged terminal; read-only reference)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (minimal-diff discipline)
- Existing pattern to copy: current bullet style in SKILL.md Judge section (single `- ` bullet per rule, backticked commands, no new sections).

Open the grounding index only on a gap in this list.

## 4. Change list and needed interfaces

- Owns: `skills/watch-issues/SKILL.md` only. No prerequisite chunks. No shared test resource. Unit 2 consumes the edited rules for its walkthrough judgments.
- Waiting bullet: insert guard before the `next` sentence: when `blocked=` names an unmerged leaf (resolve via readable inventory), run no `next` for that leaf, exclude from `--all`, report `waiting on <prereq>`. Unknown slug: report gap, run no `next`.
- Failed bullet: extend the class definition with the merged-owner-defect case per B1.2; add the D1 notice body contents per B1.3; keep credential/permission/decision/external and `failed=unknown` handling unchanged.
- Stop section: replace "every remaining leaf is failed on a human prerequisite with shown evidence" with the D4 closure: failed-with-shown-evidence, or merged, or waiting whose every unmerged prerequisite/sibling chain leads through waiting leaves to such a failed leaf; add the four blockers. Keep CronList/CronDelete mechanics unchanged.
- Needed shapes: observer `blocked=<comma-list|empty>`, `failed=<cause>@<phase> delivery=<value|-> reason="<reason>"`; `state.yaml` `phase`, `blocked-by`, `failure.{reason,phase,delivery}`; `herdr notification show "<title>" --body "<body>" --sound request`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `skills/watch-issues/scripts/`, observer format, or the Never list: plan D6 freezes them and brief C6 verifies byte-identity. Exception: none; return mismatch with evidence instead.
- Do not add a `state.yaml` or failure-record field (no `--owner`): design excludes it; reason text plus inventory is the input. Exception: revised brief from B.
- Do not edit `docs/`: plan D6 verified `docs/guide/in-practice.md:89` still accurate. Exception: revised brief from B.
- Do not add tests or scripts: this is a skill-prose change; unit 2 holds the walkthrough evidence. Exception: revised brief from B.
- Do not change scope or an interface on mismatch: return a mismatch naming the conflicting requirement, actual code, and smallest brief correction. Exception: a revised brief from B authorizing that change.

Restated: exclusions above hold because the plan freezes scope to three SKILL.md rules; the only way past one is a revised brief from B.

## 6. Ordered steps

1. Read SKILL.md Judge and Stop plus the three reference snippets (B1.1-B1.5 context).
2. Edit the Waiting bullet in `skills/watch-issues/SKILL.md` (B1.1).
3. Edit the Failed-on-human-prerequisite bullet (B1.2, B1.3).
4. Edit the Stop section (B1.4).
5. Verify: `git --no-pager diff --stat` shows only `skills/watch-issues/SKILL.md`; `git --no-pager diff -- src skills/watch-issues/scripts` empty; Never section byte-identical via `git --no-pager diff` inspection (B1.5).
6. Run the section 7 command (changed tests; prose-only change expects no test files hit).

Advisory size: 1 file, under 6 turns.

## 7. Commands

`AKROGON_BASE=d5b27353fd3ecd3fb59325fb94e6547c85e6893b bun test --changed="d5b27353fd3ecd3fb59325fb94e6547c85e6893b"` run from the worker worktree root. No full suite; B runs it after landing.

## 8. Done-when, evidence and report

Done when B1.1-B1.5 hold with diff evidence and the section 7 command result pasted. No end-to-end artifact from this unit; unit 2 produces the walkthrough file.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

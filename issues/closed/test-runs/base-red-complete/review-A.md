# Review A: base-red-complete

Base `4b74a0870fa3243f6b79e658204ff0f7ff3b4716`, reviewed head `d5db49d` (commits `c27cb1f`, `d5db49d`). Worktree clean, `git status --porcelain` empty. Debate is off (`debate: "no"`), so no positions or rebuttals exist — expected, not a defect.

## Diff reviewed

Two single-paragraph replacements: `skills/implement-issue/SKILL.md:38` and `skills/check-issue/SKILL.md:59`. `git diff` is exactly 1 insertion / 1 deletion per file.

## Verification evidence

- Criterion 1 (implement-issue): each required rule appears exactly once in the new paragraph — completed-runs gate with "keeping each run's own exit status and terminal result before any reporting pipeline such as `echo`, `grep` or `head`"; same command, args, scope, install method and "the same material conditions as the leaf run"; recorded shared-cause judgment with "failing test names need not match"; `red on base <sha>` stop with `--slot A` only then; "a completed base result that does not establish that comparison takes the existing repair path"; incomplete-run stop `failed --reason "<command> incomplete base run <sha>: <cause>" --slot A` "with no automatic rerun and no base-defect claim"; "The base run uses the active harness's longest run mode". Preserved: trigger/judgment gate, single run, `mktemp -d` + `git worktree add --detach`, log redirection, `git worktree remove --force` before any outcome, report fields, "a stop, never a handoff, creating no path to check.review or merge".
- Criterion 2 (check-issue): identical rules once, keeping "the existing specific concern rerun case, not a new trigger", `--slot <A|B>` for the reviewing slot, `review-<slot>.md` fields, and "creating no repair or merge path".
- Criterion 3: `implementation/report.md` maps the killed 25-minute base run (no final counts) to the incomplete stop and the completed whole-file pair (leaf fixture `07-changed-js-file`, base fixture `13-wrong-sitemap-host`, both exit 1 / 238 pass / 1 fail, identical `setViewportSize` tail at `unchanged-output.ts:527`) to red on base — checked against framework `issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/report.md:175-215`, which matches, including that names differ and would have failed name matching.
- Criterion 4: `git diff "$AKROGON_BASE"...HEAD --stat` lists only the two SKILL.md files — ran it, confirmed.
- Reported evidence is consistent: 395 pass / 0 fail suite, typecheck exit 0, format unchanged, changed-tests matching 0 test files for prose-only diff. No code changed, so no checks rerun (rerun rule: code change, missing evidence or specific concern — none applies).
- Cross-references: `implement-issue`'s implement and check.fix sections both point at "the Shared context base-run rule"; `check-issue`'s check.repair points at "the same base-run disposition as the check.review paragraph" — all resolve to the rewritten paragraphs. Grep of `skills/`, `src/`, `tests/`, `docs/` finds no third copy of the base-run rule; `docs/` has no base-run prose to go stale.
- Design exclusions hold: no merge-issue change, no new state/slot/phase/retry, no TypeScript change, no heavy-run slot, no text-grep test added.
- Docs: `skills/AREA.md:25` summarises the mechanism generically ("one base run at `AKROGON_BASE`", "stops") and remains accurate; tightening it is out of this leaf's locked file list and already recorded as a limitation in `report.md`. No documented behavior page changed.

## Findings

None. No Fix, no Nit.

## Verdict

ready

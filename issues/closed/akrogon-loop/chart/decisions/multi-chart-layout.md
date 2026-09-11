# Multi Chart Layout

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Several charts may run at once. The skill assumes one CHART.md and one decisions folder under issues/chart. Simplest shape for charts side by side: one subfolder per chart with its own chart file, decisions and intake, and the handoff archives that subfolder? What changes in the skill and its installer.

## Findings

Carried from # Driver State 2026-09-08: an issue inside an epic is a nested folder, so `akrogon next <folder>` recurses and starts every unblocked leaf below it, bounded by `max_active`. The folder tree is the batch, no batch file, no list of slugs. Serial and parallel leaves are told apart by their `blocked-by` fields in state, not by folder name. This decision chooses the folder shape and where the epic index lives, knowing the command reads only folders and state files.

From # Skill Rewrite 2026-09-08: chart-issues may emit several unconnected charts from one drain of seeds or GitHub issues, one folder per destination, then stops; the operator picks one to work.

From # Bootstrap 2026-09-09: this chart's handoff marks its first one or two leaves hand-built; the leaf shape must be able to say so in one field or one brief line.

From # Repeat Safety 2026-09-09, operator rule: broadcast is once per issue, never per leaf: an epic is a group of issues, an issue holds one or more leaves, and the broadcast for an issue fires when its last leaf merges (operator, 2026-09-09). The word "category" is retired; the terms are series, issue, leaf. `akrogon phase <slug> merged` reports when the leaf's issue has no unmerged leaf left.

Slot A (Claude, blind): chart subfolders with no archive move; leaf = folder with state.yaml, issue = parent folder, epic = folder of issues; plain slugs, no July 28 markers; one index at the root; `hand_built` field. Slot B (Codex, blind): chart subfolders archived at handoff (intake 293 tier 2; Nygard 2011-11-15 tier 1); intake per chart; index per container (Nygard; Lin 2026-07-20 tier 1); issue from parent folder; leaf identity as path (Fowler bounded context 2014-01-15 tier 1); authoritative state in the registered checkout, worktree copies inert (git worktree docs tier 2); hand-built as a field since the command reads no prose; publish a handoff by one rename (rename(2) tier 2); keep merged leaves until the container finishes.

Merged 2026-09-09 into nine questions with tags. Rebuttal, slot B: Q4 the issue lock must cover the merged state write and the completion check together and a repeated transition must not report again (accepted into the wording); Q5 repo-wide unique slugs force charts to coordinate names; Q8 an attended handoff does not exclude a concurrent `next --all`.

Operator answers 2026-09-09: 1-A (subfolder, stays in place, one "Handed off" line). 2-A. 3-A with a rename: "series" is retired, the container is an "epic"; index per container. 4-A. 5-A (slug unique within the repo, bare slug in commands). 6-A. 7, "ok great", accepted with a rule: every skill pass ends with two standardized lines, "Last operation" and "Next", saying exactly what to do next, judged by the reader, never parsed (carried to # Handoff Location). 8-A after confirming the handoff is a one-off pass; the operator is present for the write and does not run `akrogon next` or restart herdr until it reports done. 9-A: finished issue or epic moves to issues/closed; one log file at issues/log.jsonl.

Operator vocabulary, locked 2026-09-09, verbatim in substance: "1 epic has potentially many issues, 1 issue has potentially many leaves. If the issue is only one then it's a simple issue, even if it has multiple leaves, and epic doesn't exist in this case. Broadcasts happen only on issue completions, not leaf completions." Corrected the same day: an epic has two or more issues; one issue is just an issue.

## Resolution

Charts live at `issues/chart/<chart-slug>/` with CHART.md, INTAKE.md (source text verbatim plus scope) and decisions/, always a subfolder, never moved; a handed-off chart gets one "Handed off <date>" line. The work tree is `issues/open/<epic>/<issue>/<leaf>/` or `issues/open/<issue>/<leaf>/`: a leaf is any folder holding state.yaml, an issue is the folder holding leaves, an epic is a folder holding two or more issues; a single issue has no epic. Plain slugs, unique within the repo, enforced at handoff; commands take the bare slug; no order or mode markers in names; order lives only in each leaf's blocked-by. An index file per container (EPIC.md listing issues, ISSUE.md listing leaves, one line each with purpose), written by the handoff, never read by the command. A leaf's issue is its parent folder; the merged transition holds `flock` on `<issue>/.lock` around the state write and the "every sibling merged" check and reports completion only from the transition that made it true, so one broadcast per issue. Authoritative state is the registered repo checkout from global `repos`; worktree copies of issues/ are inert. `hand_built: true` in leaf state makes `next` and `--all` skip the leaf. The handoff writes directly into issues/open in one attended pass; a leaf whose blocked-by names a missing folder is refused. A finished issue, or a finished epic as a whole, is moved by the command to `issues/closed/` under the issue lock right after the completion check; a failed move is retried by the next run. One log file, `issues/log.jsonl`. Why: every fact the command needs is a folder or a state field, every fact a person needs is one short index file beside the thing it describes, and one rename closes work. Forecloses: the term "series", July 28 markers and series-wide state, an explicit issue reference in state, a state copy in worktrees, per-leaf broadcasts, staged publishing, issue records that never close.

From # Status View 2026-09-09: operator dropped the `hand_built` marker from status rows ("useless"); the flag still skips `next`.

From # GitHub Intake 2026-09-09: `issues/seeds/` is a gitignored derived mirror of open GitHub issues, the one folder outside leaf folders, deletable at any time; leaf state.yaml gains `sources: [owner/repo#n]` written by the handoff; the transition that moves an owner issue or epic to issues/closed also closes those GitHub issues.

From # Lessons 2026-09-09: `learnings/LESSONS.md` and `learnings/history/` are per-repo tracked files beside issues/, the only prose read outside the leaf by plan-issue and chart-issues.

Handoff 2026-09-09 (operator 6-A): this chart moves once from issues/chart/ into issues/chart/akrogon-loop/ with a "Handed off 2026-09-09" line and every inbound link repaired.

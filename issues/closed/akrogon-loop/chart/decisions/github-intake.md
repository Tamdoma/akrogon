# GitHub Intake

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Colleagues file GitHub Issues, the operator pulls one into create-issue or chart-issues when ready. Does the seed report shape survive as an issue template, or does a plain issue plus the import grilling suffice? How is an issue tied to its local leaf so it is never imported twice, and what closes it?

From # Skill Rewrite 2026-09-08: broadcast-issue stays a skill (message rules for a cheap subagent, mechanical send script); reading GitHub issues as chart-issues drain input is decided here.

From # Distribution 2026-09-08: init-issues stays a skill that proposes and `akrogon init` writes; nothing GitHub-specific is installed, so any GitHub intake is a chart-issues door input, not an install step.

## Findings

Carry check 2026-09-09: the Skill Rewrite carry is partly stale (GitHub issues were already accepted as door input, skill-rewrite.md line 92); the Distribution carry holds; the create-issue route named in the question is superseded by the chart-issues door.

Slot A (Claude, blind): seed-issue posts its report as the GitHub issue body; source URL in the brief; merge-issue closes with the broadcast text; one `akrogon` label as the queue; FIXER script and file mode retired.

Slot B (Codex, blind): optional GitHub template; seed-issue publishes and returns the URL; explicit URLs first; snapshot body and comments at import; provenance in local artifacts, no registry; one completion owner (issue or epic) per report; merge closes explicitly with a state check before retry. Rebuttal: no automatic paste fallback; query mode is a separate option; keep the issue ID beside the URL; retry must check state first; one operator in several panes is not serial.

Operator 2026-09-09, after the first batch: "you can challenge me on this, I'm not locked. Is there a better, simpler model?" Slot A proposed GitHub as the only inbox, dropping seed-issue. Operator: colleagues also use agents, so the skill stays as the instructions the agent follows. Then: "I still want to get those issues in as seeded files automatically", two report flows: colleagues in client projects with the framework installed report framework bugs; direct products like lens get their own reports. Inspected on this machine: tamdoma/framework (50 file seeds in issues/open, GitHub issues empty), tamdoma/lens (direct product, GitHub issues empty), client projects carry the framework as an installed `.claude` folder with an update skill. Operator answers: 1 "is that deterministic enough? We can't mess up here", made deterministic by files. 2-A "but I need this to be a part of akrogon command", and "issues that were fixed must be auto closed as well somewhere, keep it simple". 3-A "but also the individual command". 4-A. Confirmed pull runs in the current repo, `--all` from the hook. "ok" on the close comment.

Codex final check, seven points, all taken: routing file must be one fixed location any harness reads; target choice fails visibly on a malformed file or missing or non-GitHub origin; the seeds mirror is an explicit exception to no-state, disposable, deleted only after a complete successful fetch; the door skips seeds already imported by checking `sources` in open, closed and chart intakes; closure fires when the completion owner (issue or epic) closes, not the first issue; `sources` is a list qualified by repository; the seed file is not the evidence copy, the door copies the text into the chart intake or brief at import.

## Resolution

Reports reach GitHub through seed-issue, which a colleague's agent runs. The target is fixed by files, never judged: when the installed framework's routing file names an upstream issues repo, seed-issue posts there with `gh issue create -R`; otherwise it posts to the current repo's GitHub origin; a malformed file, missing origin or non-GitHub origin is a visible failure. The file writer and the FIXER submission script are retired. The routing file's path and shipping belong to the framework repo.

`akrogon pull` runs inside a registered repo: it lists that repo's open GitHub issues and writes one file per issue into `issues/seeds/<number>-<slug>.md`, deleting seed files whose issue is closed only after a complete successful listing. The folder is a gitignored mirror, derived, never edited; it is the one explicit exception to "no state outside leaf folders" because it can be deleted and rebuilt at any time. `akrogon pull --all` does the same for every registered repo and is called by the herdr startup hook beside `next --all`. The chart-issues door runs `pull` when opened. No timer.

The door consolidates as locked in Skill Rewrite: it skips seeds whose `owner/repo#n` already appears in `sources` under issues/open, issues/closed or a chart intake, copies each imported seed's text into the chart intake or brief as the evidence of record, and maps each report to one completion owner, an issue or an epic. The handoff writes `sources: [owner/repo#n, ...]` into the state.yaml of every leaf under that owner.

Closing is the command's: when `akrogon phase <slug> merged` moves the completion owner to issues/closed, in that same step it runs `gh issue close -R owner/repo n --comment "merged <commit>"` for every entry in `sources`, checking the issue state first, one retry, failure printed, never reversing the merge. The next pull removes the seed file. The broadcast message stays with broadcast-issue.

Why: the operator wants the queue online where colleagues' agents already are, seeds on disk to chart from without moving anyone's files, and closure that needs no hand. Files fix the target, a mirror fixes the copy, the issue number fixes the duplicate check, and the command already owns the transition that means done.

Forecloses: a GitHub issue template as the intake shape, an import comment or label on GitHub, a label query in the door, a local import registry, closure by merge-issue or by commit keywords, a timer-driven pull, seed-issue asking where to post.

Operator rule 2026-09-09 (chat, recorded for handoff): the chart-issues door consolidates seeds by destination and by speed of resolution. Seeds that share a destination and no dependency become parallel leaves of one issue; independent issues are shaped to run side by side; only a planner-named dependency (see # Parallel Merge) puts leaves in order. The door proposes the split that finishes soonest, not the tidiest one, and shows it to the operator before writing.

Handoff 2026-09-09 (operator 3-A): the command moves only whole containers to issues/closed, a standalone issue when done or an epic when every issue is done, and that move closes every `sources` entry found in any leaf state under the moved folder; no owner field; a report owned by one issue inside an epic closes at epic end.

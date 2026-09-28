# Destination intake

## Question
- Q1 · Which repos should the chart step check for matching reports? A: the chart's source repo plus each selected handoff destination. B: every registered repo on every chart.
- Q2 · When should it check? A: when a destination is selected and again right before the handoff review, one check when both coincide. B: once at the handoff review. C: only at destination selection.
- Q3 · What happens to a matching destination report? A: a fully covered report with no other owner is copied verbatim into intake and put in `sources` of every leaf under the delivering completion owner, closing on delivery. B: close it as a duplicate during charting.

### Carries
- Intake expected behavior (Tamdoma/akrogon#38): "A report in the destination repo describing the handed-off work is visible to the chart before handoff, so it can enter leaf `sources` and close with the delivering issue."
- `shapes.md:162`: one GitHub report has exactly one completion owner.
- `SKILL.md` Open: a failed refresh blocks a drain relying on it.

## Findings
- (A,B) The door pulls and imports only its own repo at open and has no destination checkpoint (`skills/chart-issues/SKILL.md` Open, `assets/shapes.md:62,166`), while handoff can target any registered repo (stuck-seat-recovery handed off to pi-extensions).
- (A,B) Completion closes each leaf `sources` identity in its own repo with `gh issue close -R` (`src/pull.ts:107-123`, `src/phase.ts:149-167`). The merged pi-extensions leaves `same-repo-worktree-cwd` and `admission-fault-no-block` carried #32 and #35 only (B read their state.yaml), so #5 had no path to close.
- (A,B) Identity dedup (`shapes.md:62`) cannot spot two different identities describing one bug; the match is a judgment the door proposes and the operator confirms.
- (B) Q2: a check only at handoff surfaces scope changes after contracts are drafted; A adopted B's option A. No checkpoint covers reports filed after its last successful listing.
- (B) Q3 pitfalls: a partly covered report stays open for its uncovered part; a report already owned by another open issue or chart is shown to the operator, never reassigned silently.
- (B) Rebuttal on the merged outline asked for a full operator round; the round was re-presented in full. No disagreement on recommendations.
- Research tier for all: better-than-training (inspected repo files and live runs, 2026-09-28), plus operator intake text for Q3.

### Operation proof
- `akrogon pull` in a destination root. B, 2026-09-28, cwd `/home/ivan/.pi/agent/extensions`, identity: existing `gh` login `ivanjuras` (`gh api --hostname github.com user --jq .login`), gh 2.101.0, Bun 1.4.2. Result: exit 0, `pi-extensions: 0 open issues pulled`. Writes only the gitignored `issues/seeds/` mirror, no cleanup needed. Limits: proves read access to that destination today, not to every registered repo.
- `gh api repos/<owner>/<repo>/issues?state=open --paginate --slurp` for every registered repo. A, 2026-09-28, `akrogon pull --all` from `/tmp`, same identity: all 7 repos listed, exit 0 (akrogon 1, framework 51, others 0). Limits: read-only; says nothing about closing.
- Cross-repo `gh issue close -R` with comment. Observed, not re-run: `akrogon close Tamdoma/pi-extensions#5 --by "same-repo-worktree-cwd 3b478e9"` closed pi-extensions#5 on 2026-09-28 14:40:07Z with that comment (B read the issue and comments). Existing completion code, not changed by these leaves.

## Taken
Operator 2026-09-28: "1a | 2a | 3a |"

- Q1-A: check the source repo plus each selected destination. Reason: covers the miss in #38 without making every chart an all-repo import; an unrelated broken repo cannot block the chart. Forecloses: checking every registered repo.
- Q2-A: check at destination selection and again right before the handoff review, one check when both coincide. Reason: a match found early can still reshape forks cheaply. Forecloses: a single late check, a single early check.
- Q3-A: a fully covered report with no other owner goes verbatim into intake provenance and into `sources` of every leaf under the delivering completion owner, closing on delivery through existing completion. Reason: matches #38 expected behavior and keeps the report open until the fix lands. Forecloses: duplicate-closing an undelivered report during charting.

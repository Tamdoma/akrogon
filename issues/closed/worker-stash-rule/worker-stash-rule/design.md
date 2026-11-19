# Design: worker-stash-rule

## Binding decisions, verbatim

### Signposts (issues/chart/consumer-lesson-fixes/forks/signposts.md, Taken, verbatim) (A,B)

Chart: issues/chart/consumer-lesson-fixes (registered akrogon root). Consultants: B pi openai/gpt-6.2-astra high, C pi meta/muse-wonder-full-1.0 high, D claude claude-fable-5-2 medium. Options are listed in that file's ## Question.

A's picks under full autopilot (signposts: A), 2026-11-17, not operator words. The operator's words that handed the round to A, verbatim: "Full autopilot mode, even the signposts."

- 1a. Decided by the operator's "consolidate them" and by speed: one map, one consultant set, three issues that close independently. Rejected 1b (three handovers and restarts for no dependency), 1c (D M1 shows the other two do not depend on #143's wording once today's Retire is the bar; C's shared-file point orders nothing under the split rule).
- 2a. Decided by removing over adding and systems thinking. Rejected 2b (the lesson rule keeps prose-fixed lessons active forever, which is the #143 loop), 2c (two mechanisms for one failure).
- 3a. Decided by simplicity and price: a per-harness hook needs a paid launch per harness to prove (D M3).
- 4a. Decided by function over form: a fix that passes its own tests while the cited lessons stay stuck did not deliver the report's outcome (C M3). Reading is free. Rejected 4b (other repo's records), 4c.
- 5a. Carried from model-judgment's hard limits; removing over adding.
- 6a. Decided by price and the evidence: #142 already changed shape on inspection (C M1). Rejected 6b: no report needs a model run.

Ranked priorities: (1) each fix stops its failure where it happens, in every harness; (2) each change stays small and in existing files; (3) each completion says honestly which framework lessons can now leave.

Hard limits: akrogon repo only; no paid launches; no new script, registry, record kind or scanner for #143; never a second parser beside git's.

Account: the session fixes the three failures at their source in akrogon, checks each report reproduces before fixing it, and reports what the framework can now retire. It gives up framework-side edits and any harness-specific guard.

Chart order: consumer-lesson-fixes only (one chart). A dropped nothing.

### worker-stash (issues/chart/consumer-lesson-fixes/forks/worker-stash.md, Taken)

A's pick under full autopilot, 2026-11-17, not operator words: 1a prose, scope 2a.

- Two homes. skills/implement-issue/brief-template.md section 5 carries, for every sub-brief: never run any `git stash` subcommand, because every worktree of the repo shares one stash and a pop can lift a sibling's edit; to check behaviour on the base use a second worktree of the base. For a delegated leaf worker only (final checks B, C): set work aside as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work; section 4 records the commit A created the worker worktree at, which a relaunched worker reads from the same brief (C, D, B). skills/implement-issue/SKILL.md Shared context refresh: A never runs `git stash` in a leaf or worker worktree, at a refresh or any other time, since leaf worktrees of different leaves share the stash.
- Reason: signposts 2a. No one change removes the shared ref: a per-worker clone breaks `akrogon run-check` (probe), worker-protocol's cleanup and sparse checkout (C, D). Prose reaches every harness (signposts 3a).
- Rejected: 1b clone, 1c stash-list compare at integration (acts after the swap, false refusals; signposts 2a rejected two mechanisms), 1d `refs/stash/blocked` (blocks the operator's stash in every consumer repo), 1e reference-transaction hook (misses `stash apply`, no install owner), harness hook (signposts 3a). No worker-protocol copy (D: same reader chain).
- Standing dissent: C keeps 1c as an add-on.
- Retire: prose is not a stop; the framework lesson stays active, and the done record says so.

Excluded here: #142 and #143 decisions (their own leaves); `src/sync.ts` `rebase --autostash` on the registered checkout (it never touches `refs/stash` unless restoration conflicts, and is not a worker path).

/home/ivan/.akrogon/releases/39e203a79c5c4ebeef51d1e76a3d8ea43389debc/skills/chart-issues/assets/standing-design.md

Interpretation: no test is added, because no mechanical behaviour changes; criterion 1 and 2 are read by the reviewing seat, criterion 3 is an existing check. The rule is prose for model readers, so no wording is asserted.

## Leaf architecture

- Owned surfaces: brief-template.md sections 4 and 5; implement-issue SKILL.md Shared context refresh paragraph.
- Consumers: A writes each sub-brief from the template (worker-protocol `## Launch and return`); a relaunched worker reads its original brief (worker-protocol provider-error relaunch), so the creation commit in section 4 survives a relaunch. A fills it when it creates the worktree at its wave, never when it writes the sub-briefs, because later waves start after earlier cherry-picks (D). A integrates by cherry-picking the returned commit (worker-protocol `## Launch and return`) (D), which is why the delegated replacement ends in one commit on the creation commit.
- Standalone workers run in the current checkout with tests committed before code (brief-template section 2); their sub-briefs carry the never-stash rule and base-worktree replacement only, never the reset.
- Exclusions: worker-protocol.md is not edited (D); framework files are not edited (signposts 4a).

# Brief: direct-route

## What
Give the chart-issues door a second ending, the direct route, used only when the destination repo's `akrogon config`
prints `direct: true`, the chart is eligible, B is named, and the operator chooses it at the handoff review. On that
route the door (A) implements the single settled item on a branch worktree at `<worktree_root>/<slug>`, the chart's B
pane reviews it with the check-issue bar, and the door lands it, closes delivered sources, broadcasts when configured,
removes the branch and worktree, and appends `Closed <date>`; the pushed SHA is recorded in the chart's `Direct attempt` section. (A,C) No leaf `state.yaml` is written.

Owned skill and doc text:
- chart-issues SKILL.md and assets/shapes.md: eligibility refusals, the combined route question at the handoff review,
  the direct protocol (implement, review exchange, repair rounds, landing, completion, cleanup), the `Direct attempt`
  section shape (which also records the landed SHA), and the growth stop and its two continuations. (A,C)
- implement-issue SKILL.md Standalone: a direct form the door runs itself. Inputs: the chart's brief and design as the
  task (not rewritten as a new brief), the direct worktree as checkout, and `checks` and base from `akrogon config` in
  that worktree. Its plan and report go under `<chart>/direct/`. Delegation works as Standalone does today, with A owning
  the result. It returns to the door for B's review and repair rounds instead of finishing. The clauses that today say
  Standalone reads no config and writes artifacts in the checkout are edited to admit this form. (A,B)
- check-issue SKILL.md: a standalone-review section B follows when prompted by the door with no leaf: inputs are the
  chart's brief and design, the worktree, base and head; the existing Fix/Nit bar, base-run rule, verdicts and re-check
  scope apply by reference; the return file is the door's named path under `<chart>/slots/`.
- broadcast-issue SKILL.md: a direct trigger. After a direct landing the door is the sender, its context is the chart's
  brief plus the pushed SHA and closed sources, and the completion-owner and merge-slot clauses name this case. (A,B)
- One small script under skills/chart-issues/scripts/ that runs the existing exported phase guards from src/phase.ts
  (`requireClean`, `requireNoIssueFiles`, `requireTestChangeCitations`, `requireNonEmpty`) against the direct worktree,
  so the door applies the lifecycle's guard definitions instead of restating them.
- docs/guide/chart.md: the direct route in operator terms.

## Why
The operator wants small, fully charted single items finished in the same attended session, with A implementing and B
reviewing, without dispatching a leaf to fresh agents. Today the door can only hand off (SKILL.md:85).
This leaf consumes hand-built-removal's landed text of chart-issues SKILL.md:59 and shapes.md:259, with `hand_built`
already removed, and edits those lines on top of it. (A,C)

## Done-criteria
1. With `direct` absent or false in the destination's `akrogon config`, the door's handoff review is unchanged and says in
   one line that direct is unavailable when the repo has not opted in. When on and eligible, the review asks one combined
   route question (lifecycle with debate yes/no, or direct) with the door's recommendation, explicit direct authorization
   already given in the session counts as the answer, and the chosen route is recorded in CHART.md. (A,C)
2. chart-issues states the eligibility refusals verbatim from the eligibility fork: direct is not offered when the draft
   needs `inputs`, `grants`, `produces` or `retained`, when a done-criterion needs a live run or outside call during
   implementation (charting proofs do not count), when more (A,B)
   than one outcome or an unfinished dependency exists, when a human prerequisite is pending, or when B is not named.
3. chart-issues states the landing order: B ready/nits on a committed head, fetch and rebase, conflict fixes re-checked
   by B, `checks` then `merge_checks`, guard script green, push of the exact tested SHA with
   `git push <remote> <sha>:refs/heads/<default_branch>`, at most 2 push attempts, never force; then source close with
   `akrogon close <id> --by "<chart> direct <sha>"`, broadcast when configured, worktree removal verified by
   `git worktree list` and branch removal verified by an empty `git branch --list <slug>`, then `Closed <date>`. (A,B,C)
4. chart-issues states the repair bound (repo `fix_rounds`, round definition, exhaustion choices) and the growth stop
   (triggers, partial commit, `Direct attempt` section, lifecycle adoption by slug or abandon with `Held`), and that no
   new direct attempt starts while a chart names a live direct branch; shapes.md defines the `Direct attempt` section.
5. The guard script, run against a worktree with an `issues/` change, a dirty tree, an empty branch, or a changed test
   without a `Test-Change:` trailer, exits non-zero with the same error the matching `akrogon phase` guard prints, and
   exits zero on a clean, cited, non-empty code-only branch.
6. check-issue has the standalone-review section, implement-issue Standalone takes the artifact folder, broadcast-issue
   names the direct sender, and docs/guide/chart.md describes the route, each without restating rules owned elsewhere.

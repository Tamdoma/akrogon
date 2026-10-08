# Brief 2: chart-issues direct route text

## 1. Goal

Plan D3, D5–D11 (criteria 1–4). Give the chart-issues door a second ending, the direct route, in
`skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/shapes.md`. Skill prose only; no tests assert wording.

## 2. Numbered acceptance criteria

1. Handoff review: with `direct` absent or false in the destination's `akrogon config`, the review is unchanged except one
   line saying direct is unavailable because the repo has not opted in. When on and eligible, it asks one combined route
   question (lifecycle debate no / lifecycle debate yes / direct) with the door's recommendation; explicit direct
   authorization already given in the session counts as the answer; the chosen route is recorded in CHART.md; a later
   setting change does not alter an approved route. When on but ineligible, the review names the refusal in one line and
   asks the lifecycle questions as today.
2. Eligibility refusals, stated as a list: direct is not offered when the draft needs `inputs`, `grants`, `produces` or
   `retained`; when a done-criterion needs a live run or outside call during implementation (charting proofs do not
   count); when more than one outcome or an unfinished dependency exists (door judgment); when a human prerequisite is
   pending; or when B is not named. The door may still recommend lifecycle for a risky small job.
3. Landing order as a numbered list (D9 below, literal commands).
4. Repair bound (D10), growth stop with triggers, partial commit, `Direct attempt` section and its two continuations
   (D11), and the rule that no new direct attempt starts while a chart names a live direct branch. shapes.md defines the
   `Direct attempt` section and the `Route:` line.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` (whole; edit points lines 47, 59, 69, 85; new section after `## Handoff`)
- `skills/chart-issues/assets/shapes.md:5-35` (chart record tree and CHART.md example) and `:240-273`
- `skills/implement-issue/SKILL.md:86-90` (Standalone, which the door's implement step uses in its direct form)
- `skills/check-issue/SKILL.md` (Fix/Nit bar referenced by B's review)
- `src/phase.ts:275-278` (guard order the script runs)
- `docs/guide/setup.md:58` (`direct` setting)
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owned paths: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`. Must land first: nothing. Shared test
resource: none. Other units write, in parallel: the guard script (fixed interface below), and the direct forms in
implement-issue, check-issue and broadcast-issue (fixed prompt shapes below). Reference them, do not restate their rules.

Fixed interfaces (plan decisions, copy exactly):
- Guard script: `bun <skill-folder>/scripts/direct-guards.ts <worktree> <repo-key> <chart-folder>`, resolving
  `<skill-folder>` as chart-usage.ts does (line 69). It runs clean tree, no `issues/` diff, Test-Change citations,
  non-empty branch against `<remote>/<default_branch>`, so the door runs it only after fetch and rebase (D3). Exit 0 =
  green.
- Worktree `<worktree_root>/<slug>` on branch `<slug>`, slug chosen at attempt start and recorded in CHART.md (D4).
- Artifacts (D4): `<chart>/direct/plan.md`, `<chart>/direct/report.md` from implement-issue's direct form;
  `<chart>/slots/review-B-<n>.md` B's return per round (n = 1 initial review). The door names the exact path to B.
- Implement prompt (D12): `implement-issue direct chart=<chart-folder> worktree=<path>` run by the door itself.
- Review prompt to B (D13): `check-issue direct slot=B chart=<chart-folder> worktree=<path> base=<sha> head=<sha>
  out=<chart>/slots/<file>`, sent to the chart's B pane as chart exchanges already are.
- Broadcast (D14): door runs broadcast-issue as sender after a direct landing, context = chart brief, pushed SHA, closed
  sources.

SKILL.md changes (D6): one new `## Direct route` section after `## Handoff` and before `## Printed footer`, holding in
order: availability and eligibility refusals (criteria 1, 2), the route question, the protocol (attempt start writes the
`Direct attempt` section; implement; B review; repair rounds; landing; completion; cleanup), repair bound, growth stop,
one-live-branch rule. Edit existing lines only where they must admit the route:
- line 47: the direct single item proceeds to the handoff review, where the route is chosen.
- line 59: human prerequisite completion recorded before opening a leaf or starting a direct attempt.
- line 69: handoff review shows the route question or the one-line unavailable notice, and the combined route question
  replaces the separate debate question for that chart.
- line 85: on the direct route no leaf files or `state.yaml` are written; `Closed <date>` follows a direct landing after
  cleanup; `Held <date>` follows abandon.

Landing order (D9), numbered, after B returns ready or nits on a committed head:
1. fetch, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE` from `akrogon config` in the worktree;
2. conflict resolution sends B a focused re-check of the resolved range with the range-diff recorded; a clean rebase
   reruns checks only;
3. `checks` then `merge_checks` from `akrogon config`;
4. guard script green;
5. `git push <remote> <sha>:refs/heads/<default_branch>` of the exact tested SHA, never force; a rejected push keeps the
   branch; at most 2 push attempts, each with fresh rebase, checks and B conflict re-check; then stop with the branch kept;
6. per delivered source, after checking other owners' outstanding work, `akrogon close <id> --by "<chart> direct <sha>"`;
7. broadcast-issue when the repo configures broadcast; failure does not reopen;
8. `git worktree remove <path>` verified by `git worktree list`, `git branch -D <slug>` verified by empty
   `git branch --list <slug>`;
9. landed SHA into the `Direct attempt` section, then `Closed <date>`.
The root checkout is never reset; a failed local update is reported. Selecting direct includes the door's push authority;
push, source close and broadcast are coordination, not live calls under eligibility.

Repair bound (D10): one round = B `fix` (or a blocking landing-check failure) + one door repair pass over all Fixes + B
re-check of the repair diff. Bound = repo `fix_rounds` from `akrogon config`; count kept in `Direct attempt`, so it survives
session replacement. A passing last round lands. Exhaustion stops with open Fixes listed; operator chooses one more round,
lifecycle handoff, or abandon. Push attempts are not rounds.

Growth stop (D11): triggers = a locked decision must change, a need eligibility excludes, a criterion cannot pass in
scope after permitted repairs, a second outcome. Door stops coding and landing, commits existing work as one
partial-labelled commit for a clean tree, keeps the worktree, updates `Direct attempt`, opens the trigger as a new fork.
Continuations: lifecycle handoff (leaf slug equals the branch so the command's worktree setup adopts it; the leaf starts at
its normal planning phase; planner decides what to keep; lifecycle review covers the whole diff) or abandon (branch and
worktree removed, `Held <date>`). No new direct attempt starts while a chart names a live direct branch.

shapes.md changes (D5): add `direct/` to the chart record tree (`direct/plan.md`, `direct/report.md`, only on the direct
route) and note `slots/` also holds direct review returns. In the CHART.md example add a `Route: <lifecycle (debate
no|yes) | direct>` line and a `## Direct attempt` section with fields: branch, worktree, base, head, rounds used /
fix_rounds, push attempts, done, not done, trigger, review files, landed SHA. Near line 259 (state.yaml sample note) say a
direct-route chart writes no leaf files or state.yaml. Do not alter the `### readiness.yaml` block; `tests/chart-shapes.test.ts`
parses it.

## 5. Do-not, reasons and exceptions

- Do not restate check-issue's Fix/Nit bar, implement-issue's protocol, broadcast message rules or the guard definitions:
  the brief forbids restating rules owned elsewhere. Exception: name them by reference.
- Do not touch other skills, docs or src: other units own them. Exception: none.
- Do not change the `### readiness.yaml` example block: a test parses it.
- Keep each new rule stated once; match the file's dense paragraph style.
- A mismatch with the plan goes back to A with evidence; exception: a revised brief from A.

Reasons and exceptions restated: rules stay with their owners and are referenced, other files belong to other units, the
readiness block is test-parsed, and only a revised brief from A changes scope.

## 6. Ordered steps

1. shapes.md: tree, CHART.md example (`Route:`, `## Direct attempt`), state.yaml note (criteria 1, 4).
2. SKILL.md: edit lines 47, 59, 69, 85 (criterion 1).
3. SKILL.md: write `## Direct route` (criteria 1–4).
4. Run `bun test tests/chart-shapes.test.ts --timeout=30000` (shapes still parses) and commit once.

Advisory size: 2 files, under 12 turns.

## 7. Commands

`AKROGON_BASE=d17029e2b0a8c369ee366a91bf12346141fc508a bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Every criterion above maps to a SKILL.md or shapes.md passage you cite by line in the report; chart-shapes test green; one
commit, SHA returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
